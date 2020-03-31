import {
    AGE_OUT_OF_RANGE,
    ASK_INPUT,
    DIDNT_UNDERSTAND,
    GLOBAL_CONTEXT,
    INCORRECT_EXPERIENCE,
    INCORRECT_PHONE_NUMBER,
    IS_NAN_AGE,
    OPTION_NO,
    OPTION_YES,
    OPTIONS,
    OUTPUT_JOB_ACTIONABLE,
    OUTPUT_JOB_REFERENCE,
    OUTPUT_NONE,
    QUESTION_ADDRESS_ENTERED,
    QUESTION_AGE,
    QUESTION_AGE_CONFIRM,
    QUESTION_AREA,
    QUESTION_AREA_TYPE,
    QUESTION_CITY,
    QUESTION_CONT_SESSION_OR_NEW_1,
    QUESTION_CUISINES,
    QUESTION_EXPERIENCE,
    QUESTION_GENDER,
    QUESTION_GPS_ASK,
    QUESTION_HOMETOWN,
    QUESTION_JOB_ACTIONABLE_PREFIX,
    QUESTION_LATITUDE,
    QUESTION_LONGITUDE,
    QUESTION_NATIVE_CITY,
    QUESTION_NATIVE_STATE,
    QUESTION_PHONE,
    QUESTION_PHONE_CONFIRM,
    QUESTION_PHONE_SPACE_SEPARATED,
    QUESTION_RESTAURANT_SKILLS,
    QUESTION_RESTAURANT_SKILLS_CONFIRM,
    QUESTION_SEE_TODAYS_WORK,
    QUESTION_SHOW_ID_CARD_NO_MESSAGE,
    QUESTION_WHATSAPP_NUMBER,
    QUESTIONS,
    SAMPLE_JOBS,
    SENDER_HELO,
    SENDER_VISITOR,
    WELCOME_AUTO_START_AFTER,
    WELCOME_MSG_2,
    WELCOME_MSG_3_JOBS_DAILY,
    WELCOME_MSG_4
} from "../Questions";
import {
    adjucateStructureWithSupply,
    flattenSupply,
    genderPrefix,
    getJobs,
    getLastMessage,
    getSupplyCreationObj,
    isValidPhoneNumber,
    questionsAnswered,
    questionsNotAnswered,
    templateToQuestion,
    WHEN_NOT_TO_WAIT
} from "../Logic";
import assert from "assert";
import {BANGALORE_LAT, BANGALORE_LNG, CATEGORY_COOK, DESCRIPTOR_CHAT_DEVICES} from "../../constants/Constants";
import {
    applyForJob,
    chatBotMessageInteraction,
    crudsSearch,
    newSupplySignup,
    rejectJob,
    searchSupply,
    understandText
} from "../../util/Api";
import {BOT_FLOWS, getChatContext, getJobId} from "./ChatUtil";
import Mustache from "mustache";
import cnsole from 'loglevel';


// This code runs in the Node server.
// Bot that asks the mandatory questions, shows jobs and creates / updates Supply.
export class JobOnboardingBot {
    constructor(webSocketConnection, jobAttributesList) {
        this.chatContext = null;
        this.webSocketConnection = webSocketConnection;
        this.allAttributes = jobAttributesList;

        this.messageCount = 0;
    }

    close = () => {
        cnsole.info('Closing');
    };

    onMessage = async (message) => {
        cnsole.log('onMessage: ', this.messageCount, message);
        if (this.messageCount++ === 0) {
            // First message of the session
            const { sessionInfo, flowName } = message;
            this.chatContext = getChatContext(BOT_FLOWS[flowName]);
            this.chatContext.sessionInfo = sessionInfo;

            // Lookup the saved structure
            const { deviceID } = sessionInfo;
            const chatDevices = await crudsSearch(DESCRIPTOR_CHAT_DEVICES, {deviceID});
            if (chatDevices && chatDevices.length > 0) {
                cnsole.log('Got chatDevices: ', chatDevices);
                const xxx = JSON.parse(chatDevices[0].payload);
                this.chatContext.structure = xxx.structure;
                this.chatContext.sessionInfo.lastJobsShownTs = xxx.sessionInfo.lastJobsShownTs || -1;
                this.chatContext.sessionInfo.numTimesSessionIdx = (xxx.sessionInfo.numTimesSessionIdx || 0) + 1;

                // Delete the session only questions
                this.chatContext.flow.sessionLocalQuestions.forEach(x => {
                    delete this.chatContext.structure[x];
                });
            } else {
                this.chatContext.sessionInfo.lastJobsShownTs = -1;
                this.chatContext.sessionInfo.numTimesSessionIdx = 1;
            }

            // In case of fresh session, show jobs
            this.chatContext.sessionInfo.showJobsThisSession = (new Date().getTime() - this.chatContext.sessionInfo.lastJobsShownTs) >= this.chatContext.flow.timeBetweenJobsMs;

            const phoneNumber = this.chatContext.structure[QUESTION_PHONE];
            if (phoneNumber) {
                // Lookup supply by phone
                const supplyList = await searchSupply({ phone: phoneNumber });
                cnsole.log('Got supplyList: ', supplyList.length, phoneNumber);
                if (supplyList && supplyList.length > 0) {
                    this.chatContext.supply = supplyList[0];
                    adjucateStructureWithSupply(supplyList[0], this.chatContext);
                }
            }
        } else {
            const { structure, errors } = await this.processAnswerFn(message.answer, this.chatContext, message);
            message = {...message, structure, errors};
            this.chatContext.messages.push({...message, sender: SENDER_VISITOR});
            await this.postProcessFn(this.chatContext);
        }

        const questionsToAsk = await this.askNextQuestionFn(this.chatContext);

        const msgToSend = { questionsToAsk };
        msgToSend.saveSupplyId = this.chatContext.supply ? this.chatContext.supply.person.id : -1;          // Save supply id on client
        this.webSocketConnection.sendUTF(JSON.stringify(msgToSend));

        questionsToAsk.forEach(q => this.chatContext.messages.push({...q, sender: SENDER_HELO}));

        await this.saveToServer();
    };

    postProcessFn = async (chatContext) => {
        // Create supply entry as soon as mandatoryQuestions are answered
        const mainQuestionsNotAnswered = questionsNotAnswered(chatContext.flow.mainQuestions, chatContext);
        if (mainQuestionsNotAnswered === 0 && (!chatContext.supply || chatContext.forceReset)) {
            await this.createOrUpdateSupplyId(chatContext, true);
        }

        // New information needs to be saved, update the supply details.
        const unanswered1 = questionsNotAnswered([...chatContext.flow.mainQuestions, ...chatContext.flow.optionalQuestions], chatContext);
        const unanswered2 = questionsNotAnswered([...chatContext.flow.mainQuestions, ...chatContext.flow.optionalQuestions], { structure: flattenSupply(chatContext.supply || {}) });
        if (unanswered2 > unanswered1 && chatContext.supply) {
            cnsole.log('Updating supply');
            await this.createOrUpdateSupplyId(chatContext, false);
        }
    };

    saveToServer = async () => {
        const { sessionInfo, structure } = this.chatContext;
        const { uuid, deviceID } = sessionInfo;

        // Save to server current session
        const payload = JSON.stringify({ sessionInfo, structure });
        await chatBotMessageInteraction(uuid, deviceID, { uuid, deviceID, payload, timestamp: new Date().getTime() });
    };

    welcomeMessagesFn = (chatContext) => {
        const numQuestionsNotAnswered = questionsNotAnswered([...chatContext.flow.mainQuestions, ...chatContext.flow.optionalQuestions], chatContext);
        const numQuestionsAnswered = chatContext.flow.mainQuestions.length + chatContext.flow.optionalQuestions.length - numQuestionsNotAnswered;
        cnsole.log('numQuestionsAnswered, numQuestionsNotAnswered, numTimesSessionIdx: ', numQuestionsAnswered, numQuestionsNotAnswered, chatContext.sessionInfo.numTimesSessionIdx);

        // More than 3 times opened, don't show sample job
        const msgs = [];
        chatContext.flow.welcomeMessages.forEach(w => msgs.push(w));
        msgs.push(WELCOME_MSG_3_JOBS_DAILY);
        // TODO: Put an intro video here

        // If some questions answered, show ID card and ask if continue from there or not
        if (numQuestionsNotAnswered <= 2) {
        } else if (numQuestionsAnswered > 5) {
            msgs.push(WELCOME_MSG_2);
        } else {
            msgs.push(WELCOME_MSG_4);
        }

        // Add a pause so he can read
        msgs.push(WELCOME_AUTO_START_AFTER);
        return msgs;
    };

    populateQuestion = (question, structure) => {
        cnsole.log('question, structure: ', question, structure);
        if (typeof question === 'string') {
            return Mustache.render(question, {...GLOBAL_CONTEXT, ...structure});
        }
        return question;
    };

    isJobEnabledFn = (job, chatContext) => {
        const jobId = getJobId(job);
        return !(jobId in chatContext.sessionInfo.appliedJobs) && !(jobId in chatContext.sessionInfo.rejectedJobs);
    };

    enhanceQuestions = (questionsToAsk, chatContext) => {
        for (let i = 0; i < questionsToAsk.length; i++) {
            const q = questionsToAsk[i];
            if (q.type === OUTPUT_JOB_REFERENCE) {
                q.job = SAMPLE_JOBS[chatContext.sessionInfo.language];
            }
            if (q.type === OUTPUT_JOB_ACTIONABLE) {
                assert(this.jobs, 'Jobs must have been fetched');
                const applicableJobs = this.jobs.filter(x => this.isJobEnabledFn(x, chatContext));
                q.job = applicableJobs.length > 0 ? applicableJobs[0] : null;
            }
            if (q.questionKey === QUESTION_CUISINES) {
                q[OPTIONS] = this.allAttributes[CATEGORY_COOK];
            }
            if (q.questionKey === QUESTION_SHOW_ID_CARD_NO_MESSAGE) {
                q.structure = chatContext.structure;
            }

            // Populate template variables
            if (q.text) {
                Object.keys(q.text).forEach(k => {
                    q.text[k] = this.populateQuestion(q.text[k], chatContext.structure);
                });
            }
            if (q.speak) {
                Object.keys(q.speak).forEach(k => {
                    q.speak[k] = this.populateQuestion(q.speak[k], chatContext.structure);
                });
            }
        }
        return questionsToAsk;
    };

    askNextQuestionFn = async (chatContext) => {
        cnsole.log('askNextQuestionFn: ', chatContext);

        const questionsToAsk = [];
        if (!chatContext.welcomeMessagesDisplayed) {
            chatContext.welcomeMessagesDisplayed = true;

            const qKeys = this.welcomeMessagesFn(chatContext);
            questionsToAsk.push(... qKeys.map(x => templateToQuestion(QUESTIONS[x], x, chatContext)));
        }

        cnsole.log('Welcome messages done');
        const showJobsThisSession = chatContext.sessionInfo.showJobsThisSession;
        const numJobsPerSession = chatContext.flow.numJobsPerSession;
        const numAllQuestions = chatContext.flow.mainQuestions.length + chatContext.flow.optionalQuestions.length;

        const allInitialQuestionsAnswered = questionsNotAnswered(chatContext.flow.initialQuestions, chatContext) === 0;
        const allMandatoryQuestionsAnswered = questionsNotAnswered(chatContext.flow.mandatoryQuestionsBeforeJobSearch, chatContext) === 0;
        const numQuestionsAnswered = questionsAnswered([...chatContext.flow.mainQuestions, ...chatContext.flow.optionalQuestions], chatContext);
        const numQuestionsBeforeShowingJob = chatContext.flow.numQuestionsBeforeShowingJob;
        const cond1 = allInitialQuestionsAnswered && allMandatoryQuestionsAnswered && showJobsThisSession;
        const cond2 = ((chatContext.sessionInfo.numJobsShown + 1) / numJobsPerSession) <= ((numQuestionsAnswered + 1) / numAllQuestions);
        const showJob = cond1 && cond2;
        cnsole.log('numAllQuestions, allInitialQuestionsAnswered, allMandatoryQuestionsAnswered, numQuestionsAnswered, numQuestionsBeforeShowingJob, showJobsThisSession: ',
                    numAllQuestions, allInitialQuestionsAnswered, allMandatoryQuestionsAnswered, numQuestionsAnswered, numQuestionsBeforeShowingJob, showJobsThisSession);
        cnsole.log('showJob, numJobsShown: ', showJob, chatContext.sessionInfo.numJobsShown);
        cnsole.log('cond1, cond2: ', cond1, cond2);

        const { messages } = chatContext;
        const lastMsg = messages[messages.length - 1];

        if ((lastMsg && lastMsg.errors && lastMsg.errors.length > 0) || !showJob) {
            questionsToAsk.push(... await this.processLastMessageAndGetNextQuestion(chatContext));
        } else {
            if (!this.jobs) {
                // Get jobs only once per session
                this.jobs = await getJobs(chatContext);
                if (chatContext.supply) {
                    chatContext.sessionInfo.lastJobsShownTs = new Date().getTime();
                }
            }

            const qKeys = [];
            if (chatContext.sessionInfo.numJobsShown === 0) {
                qKeys.push(QUESTION_SEE_TODAYS_WORK);
            }
            qKeys.push(QUESTION_JOB_ACTIONABLE_PREFIX + '' + Math.floor(numQuestionsAnswered / numQuestionsBeforeShowingJob));
            cnsole.log('qKeys: ', qKeys);
            questionsToAsk.push(... qKeys.map(x => templateToQuestion(QUESTIONS[x], x, chatContext)));
            chatContext.sessionInfo.numJobsShown++;
        }

        this.enhanceQuestions(questionsToAsk, chatContext);
        cnsole.log('questionsToAsk: ', questionsToAsk);

        return questionsToAsk;
    };

    processLastMessageAndGetNextQuestion = async (chatContext) => {
        cnsole.log('processLastMessageAndGetNextQuestion: ', chatContext);

        const { messages } = chatContext;
        const language = chatContext.sessionInfo.language;
        const lastQuestionAsked = getLastMessage(messages, SENDER_HELO);
        if (messages.length === 0 || !lastQuestionAsked || WHEN_NOT_TO_WAIT.includes(lastQuestionAsked.type)) {
            return this.nextQuestionToAsk(chatContext);
        }

        if (lastQuestionAsked.idx === messages.length - 1) {
            // Waiting for input. This shouldn't happen
            cnsole.log('BAD');
            return [];
        }

        const { questionKey } = lastQuestionAsked;
        const lastMsg = messages[messages.length - 1];
        const { structure, errors } = lastMsg;
        cnsole.log('lastMsg structure, errors: ', structure, errors);

        if (errors.length > 0) {
            // An error in what the user said
            return [
                textToQuestion(errors[0], language),
                lastQuestionAsked,
            ];
        }

        // Didn't understand a thing
        const didntUnderstandQuestion = textToQuestion(DIDNT_UNDERSTAND[language], language);
        if (Object.keys(structure).length === 0) {
            return [
                didntUnderstandQuestion,
                lastQuestionAsked,
            ];
        }

        if (questionKey in structure) {
            // User answered something about the question asked
            // Compute the next question to ask
            const nextQues = this.nextQuestionToAsk(chatContext);
            if (!nextQues || nextQues.length === 0) {
                cnsole.log('Reached the end of all questions');
                return [textToQuestion('Bye', language)];
            } else {
                return nextQues;
            }
        } else {
            // Something useful was said, but not related to the question asked
            // See if its about something already answered before, or new information
            return [
                didntUnderstandQuestion,
                lastQuestionAsked,
            ];
        }
    };

    nextQuestionToAsk = (chatContext) => {
        const { structure } = chatContext;
        const questionsList = [...chatContext.flow.initialQuestions, ...chatContext.flow.mainQuestions, ...chatContext.flow.optionalQuestions, chatContext.flow.signoffQuestion];

        const nextQ = [];
        for (let i = 0; i < questionsList.length; i++) {
            const qKey = questionsList[i];
            if (!(qKey in structure) && (qKey in QUESTIONS)) {
                const q = QUESTIONS[qKey];
                nextQ.push(templateToQuestion(q, qKey, chatContext));
                if (q[ASK_INPUT]) {
                    break;
                }
            }
        }
        return nextQ;
    };

    processAnswerFn = async (answer, chatContext, messageObj) => {
        cnsole.log('chatContext.messages: ', chatContext.messages);
        const language = chatContext.sessionInfo.language;
        const lastQuestionAsked = getLastMessage(chatContext.messages, SENDER_HELO);
        assert(lastQuestionAsked);

        const questionKey = lastQuestionAsked.questionKey;
        cnsole.log('processAnswer: ', answer, lastQuestionAsked, language);

        const structure = await understandText(answer, questionKey);
        const errors = [];

        if (Object.keys(structure).length === 0) {
            // User didn't say anything meaningful. Idiot
        } else if (questionKey in structure) {
            // User answered something about the question asked
            if (Object.keys(structure).length > 1) {
                // And something else, which we'll ignore for now
                cnsole.log('Ignoring extra: ', questionKey, structure);
            }
            chatContext.structure[questionKey] = structure[questionKey];
        } else {
            // User answered something else. Either he's an idiot, or our bot is getting more humanoid
            // Ignore for now
        }


        // Process the answer and the understanding associated with it
        if (questionKey === QUESTION_CONT_SESSION_OR_NEW_1) {
            chatContext.structure[QUESTION_SHOW_ID_CARD_NO_MESSAGE] = answer;
        }
        if (questionKey === QUESTION_CONT_SESSION_OR_NEW_1 && answer === OPTION_NO) {
            // Reset the structure
            chatContext.structure = {
                [QUESTION_CONT_SESSION_OR_NEW_1]: answer,
                [QUESTION_SHOW_ID_CARD_NO_MESSAGE]: answer,
            };
            chatContext.forceReset = true;
            chatContext.supply = null;
        }

        if (questionKey === QUESTION_GENDER) {
            chatContext.structure.gender_prefix = genderPrefix(answer);
        }
        if (questionKey === QUESTION_PHONE) {
            answer = answer.replace(/ /g, '');          // Normalize spaces in phone number
            chatContext.structure[QUESTION_PHONE] = answer;

            if (!isValidPhoneNumber(answer)) {
                errors.push(INCORRECT_PHONE_NUMBER[language]);
                delete chatContext.structure[QUESTION_PHONE];
                delete chatContext.structure[QUESTION_PHONE_CONFIRM];
                delete chatContext.structure[QUESTION_PHONE_SPACE_SEPARATED];
            } else {
                chatContext.structure[QUESTION_PHONE_SPACE_SEPARATED] = answer.split('').join(' ');
            }
        }
        if (questionKey === QUESTION_WHATSAPP_NUMBER && !isValidPhoneNumber(answer)) {
            errors.push(INCORRECT_PHONE_NUMBER[language]);
            delete chatContext.structure[QUESTION_WHATSAPP_NUMBER];
        }
        if (questionKey === QUESTION_PHONE_CONFIRM && answer === OPTION_NO) {
            // Phone number is incorrect. Ask everything again.
            // NOTE: There is a horrible bug here. If we only delete the phone details but not the remaining,
            // there could be a supply looked up already
            chatContext.structure = {
                [QUESTION_CONT_SESSION_OR_NEW_1]: answer,
                [QUESTION_SHOW_ID_CARD_NO_MESSAGE]: answer,
            };
            chatContext.supply = null;
        }
        if (questionKey === QUESTION_PHONE_CONFIRM && answer === OPTION_YES) {
            const phone = chatContext.structure[QUESTION_PHONE];
            const supplyList = await searchSupply({ phone });

            if (supplyList && supplyList.length > 0) {
                chatContext.supply = supplyList[0];
                if (!chatContext.forceReset) {
                    adjucateStructureWithSupply(supplyList[0], chatContext);
                    delete chatContext.structure[QUESTION_CONT_SESSION_OR_NEW_1];
                    delete chatContext.structure[QUESTION_SHOW_ID_CARD_NO_MESSAGE];
                }
            }

            if (chatContext.sessionInfo.numTimesSessionIdx === 1) {
                chatContext.structure[QUESTION_CONT_SESSION_OR_NEW_1] = 'skipped';
                chatContext.structure[QUESTION_SHOW_ID_CARD_NO_MESSAGE] = 'skipped';
            }
        }

        if (questionKey === QUESTION_GPS_ASK && messageObj) {
            const { latitude, longitude, geocodeResult } = messageObj;
            if (geocodeResult) {
                chatContext.structure.gpsPosition = { latitude, longitude };
                chatContext.structure[QUESTION_LATITUDE] = latitude;
                chatContext.structure[QUESTION_LONGITUDE] = longitude;
                chatContext.structure[QUESTION_AREA_TYPE] = 'skipped';
                chatContext.structure[QUESTION_CITY] = geocodeResult.city;
                chatContext.structure[QUESTION_AREA] = geocodeResult.area;
                chatContext.structure[QUESTION_ADDRESS_ENTERED] = geocodeResult.address;
            } else {
                delete chatContext.structure[QUESTION_AREA_TYPE];
                delete chatContext.structure[QUESTION_LATITUDE];
                delete chatContext.structure[QUESTION_LONGITUDE];
                chatContext.structure.gpsPosition = null;
            }
        }
        if (questionKey === QUESTION_AREA_TYPE) {                                   // Means GPS location was not given
            chatContext.structure[QUESTION_LATITUDE] = BANGALORE_LAT;
            chatContext.structure[QUESTION_LONGITUDE] = BANGALORE_LNG;
            // chatContext.structure[QUESTION_AREA] = answer;
            delete chatContext.structure[QUESTION_AREA];                            // So that area is asked at the end
            chatContext.structure[QUESTION_ADDRESS_ENTERED] = answer;
        }
        if (questionKey === QUESTION_AREA) {
            chatContext.structure[QUESTION_LATITUDE] = answer.latitude;
            chatContext.structure[QUESTION_LONGITUDE] = answer.longitude;
            chatContext.structure[QUESTION_CITY] = answer.city;
            chatContext.structure[QUESTION_AREA] = answer.area;
            chatContext.structure[QUESTION_ADDRESS_ENTERED] = answer.address;
        }
        if (questionKey === QUESTION_HOMETOWN && messageObj) {
            const { geocodeResult } = messageObj;
            if (geocodeResult) {
                chatContext.structure[QUESTION_HOMETOWN] = geocodeResult.address;
                chatContext.structure[QUESTION_NATIVE_CITY] = geocodeResult.city;
                chatContext.structure[QUESTION_NATIVE_STATE] = geocodeResult.state;
            }
        }

        if (questionKey === QUESTION_AGE_CONFIRM && answer === OPTION_NO) {
            // Phone number is incorrect. Ask again
            delete chatContext.structure[QUESTION_AGE];
            delete chatContext.structure[QUESTION_AGE_CONFIRM];
        }
        if (questionKey === QUESTION_AGE) {
            const age = parseFloat(answer);
            if (isNaN(age)) {
                errors.push(IS_NAN_AGE[language]);
                delete chatContext.structure[QUESTION_AGE];
                delete chatContext.structure[QUESTION_AGE_CONFIRM];
            } else if (age <= 13 || age >= 80) {
                errors.push(AGE_OUT_OF_RANGE[language]);
                delete chatContext.structure[QUESTION_AGE];
                delete chatContext.structure[QUESTION_AGE_CONFIRM];
            } else {
                chatContext.structure[QUESTION_AGE] = Math.round(age);
            }
        }
        if (questionKey === QUESTION_EXPERIENCE) {
            const experience = parseFloat(answer);
            if (isNaN(experience) || experience <= 0 || experience >= 50) {
                errors.push(INCORRECT_EXPERIENCE[language]);
                delete chatContext.structure[QUESTION_EXPERIENCE];
            } else {
                chatContext.structure[QUESTION_EXPERIENCE] = Math.round(experience);
            }
        }
        if (questionKey === QUESTION_RESTAURANT_SKILLS_CONFIRM && answer === OPTION_NO) {
            chatContext.structure[QUESTION_RESTAURANT_SKILLS] = [];
        }
        if (questionKey.startsWith(QUESTION_JOB_ACTIONABLE_PREFIX)) {
            (answer === OPTION_YES ? chatContext.sessionInfo.appliedJobs : chatContext.sessionInfo.rejectedJobs)[messageObj.jobId] = true;
            if (chatContext.supply) {
                if (answer === OPTION_YES) {
                    await applyForJob(chatContext.supply.person.id, messageObj.jobId);
                } else {
                    await rejectJob(chatContext.supply.person.id, messageObj.jobId);
                }
            }
        }

        return { structure, errors };
    };

    createOrUpdateSupplyId = async (chatContext, applyRejectJobs) => {
        const phone = chatContext.structure[QUESTION_PHONE];
        let supplyList = await searchSupply({ phone });

        const details = getSupplyCreationObj(chatContext);
        cnsole.log('Supply creation object details: ', details);

        if (supplyList.length > 0) {
            const rsp = await newSupplySignup(details, 'true');
            cnsole.log('newSupplySignup Response (updation): ', rsp);
        } else {
            const rsp = await newSupplySignup(details, 'false');
            cnsole.log('newSupplySignup Response (creation): ', rsp);
        }

        supplyList = await searchSupply({phone: details[QUESTION_PHONE]});
        if (supplyList.length === 0) {
            cnsole.log('ERROR: Supply creation / updation failed');
            return;
        }

        chatContext.supply = supplyList[0];
        if (applyRejectJobs) {
            // Apply / Reject the jobs seen in this session
            const jobsAppliedThisSession = Object.keys(chatContext.sessionInfo.appliedJobs);
            for (let i = 0; i < jobsAppliedThisSession.length; i++) {
                const jobId = jobsAppliedThisSession[i];
                const rsp = await applyForJob(chatContext.supply.person.id, jobId);
                cnsole.log('applyForJob response: ', rsp);
            }
            const jobsRejectedThisSession = Object.keys(chatContext.sessionInfo.rejectedJobs);
            for (let i = 0; i < jobsRejectedThisSession.length; i++) {
                const jobId = jobsRejectedThisSession[i];
                const rsp = await rejectJob(chatContext.supply.person.id, jobId);
                cnsole.log('rejectJob response: ', rsp);
            }
        }
    };
}



export class CookOnboardingBot extends JobOnboardingBot {
    constructor(webSocketConnection, jobAttributesList) {
        super(webSocketConnection, jobAttributesList);
    }
}


const textToQuestion = (t, language) => ({text: {[language]: t}, speak: {[language]: t}, type: OUTPUT_NONE});


