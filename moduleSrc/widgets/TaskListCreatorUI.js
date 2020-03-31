import React from "react";
import {
    bodyOverflowAuto,
    Image,
    InputElem,
    ScrollView,
    showToast,
    stopBodyOverflow,
    Text,
    TextareaElemHackForPaste,
    View,
    WINDOW_INNER_HEIGHT
} from "../platform/Util";
import TouchableAnim from "../platform/TouchableAnim";
import {actionButton, spacer} from "../util/Util";
import {CHAT_FONT_FAMILY, TASK_LIST_ICON} from "../constants/Constants";
import cnsole from 'loglevel';
import {ConfigurableTopBar} from "../chat/messaging/TopBar";


export class TaskListCreatorUI extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            tasks: [defaultTask()],
        };
    }
    componentDidMount() {
        stopBodyOverflow();
    }
    componentWillUnmount() {
        bodyOverflowAuto();
    }

    submitFn = () => {
        const { submitFn } = this.props;
        const { tasks, title } = this.state;
        const payload = { title, tasks };
        cnsole.info('Submit: ', payload);
        showToast('Creating task');
        submitFn(payload);
    };

    onChangeFn = (elem) => {
        if (elem.target.value.length <= 50) {
            this.setState({ title: elem.target.value });
        }
    };
    onChangeTextFn = (title) => {
        if (title.length <= 50) {
            this.setState({ title });
        }
    };
    addTaskFn = () => {
        this.setState({ tasks: [...this.state.tasks, defaultTask()] });
    };

    renderOption = (option, idx, idx2) => {
        const onChangeFn = (elem) => {
            onChangeTextFn(elem.target.value);
        };
        const onChangeTextFn = (text) => {
            const tasks = this.state.tasks.slice();
            tasks[idx].options[idx2].text = text;
            this.setState({ tasks });
        };
        const removeOption = () => {
            const tasks = this.state.tasks.slice();
            tasks[idx].options.splice(idx2, 1);
            this.setState({ tasks });
        };

        const { text } = option;
        return (
            <View style={custom.task.options.ctr}>
                <View style={{ flex: 9 }}>
                    <InputElem type="text" style={custom.task.options.optionInput} placeholder={'  Option ' + (idx2 + 1) +  '...'}
                               value={text} onChange={onChangeFn} onChangeText={onChangeTextFn} />
                </View>
                <View style={{ flex: 1 }}>
                    <TouchableAnim onPress={removeOption}>
                        <Image src={MINUS_BTN_IMG} style={custom.task.options.minusBtn} />
                    </TouchableAnim>
                </View>
            </View>
        );
    };

    renderTask = (task, idx) => {
        const { title, desc, options, imageReq } = task;

        const titleOnChangeFn = (elem) => {
            titleOnChangeTextFn(elem.target.value);
        };
        const titleOnChangeTextFn = (text) => {
            const tasks = this.state.tasks.slice();
            tasks[idx].title = text;
            this.setState({ tasks });
        };
        const commentsOnChangeFn = (text) => {
            const tasks = this.state.tasks.slice();
            tasks[idx].desc = text;
            this.setState({ tasks });
        };
        const addOption = () => {
            const tasks = this.state.tasks.slice();
            tasks[idx].options.push({ text: '' });
            this.setState({ tasks });
        };
        const removeTask = () => {
            const tasks = this.state.tasks.slice();
            tasks.splice(idx, 1);
            this.setState({ tasks });
        };

        const optionList = options.map((option, idx2) => this.renderOption(option, idx, idx2));
        return (
            <View style={custom.task.ctr}>
                <View style={custom.task.subCtr}>
                    <View>
                        <InputElem type="text" style={custom.task.titleInput} placeholder={'  Task title ' + (idx + 1) + ' ...'}
                                   value={title} onChange={titleOnChangeFn} onChangeText={titleOnChangeTextFn} />

                    </View>

                    <TextareaElemHackForPaste style={custom.task.descriptionInput} placeholder="  Description ..." type="text"
                                              value={desc} onChangeText={commentsOnChangeFn} />

                    <View style={{ marginLeft: 30 }}>
                        <Text style={custom.task.options.heading}>Options</Text>
                        {optionList}
                        <TouchableAnim onPress={addOption}>
                            <Image src={PLUS_BTN_IMG} style={custom.task.options.plusBtn} />
                        </TouchableAnim>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <TouchableAnim onPress={removeTask}>
                        <Image src={MINUS_BTN_IMG} style={custom.task.minusBtn} />
                    </TouchableAnim>
                </View>
            </View>
        );
    };

    render() {
        const { closeFn, groupName } = this.props;
        const { title, tasks } = this.state;
        const taskList = tasks.map((task, idx) => this.renderTask(task, idx));

        const sections = [
            { float: 'left', name: ConfigurableTopBar.SECTION_BACK, displayProps: {}, data: {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_AVATAR, displayProps: {}, data: { avatar: TASK_LIST_ICON }, onClickFn: () => {} },
            { float: 'left', name: ConfigurableTopBar.SECTION_NAME, displayProps: {}, data: { name: 'Create task list', subheading: groupName, }, onClickFn: () => {} },
        ];

        return (
            <View style={custom.root}>
                <View style={custom.root2}>
                    <ConfigurableTopBar collection={null} sections={sections}
                                        location={this.props.location} history={this.props.history} />

                    <ScrollView style={{ height: '100%', width: '100%' }}>
                        <View style={{ marginTop: 10, paddingLeft: 20, paddingRight: 10, width: '100%' }}>
                            <InputElem style={custom.taskList.titleInput} placeholder="  Task list name ..." type="text"
                                       value={title} onChange={this.onChangeFn} onChangeText={this.onChangeTextFn} />
                            <Text style={custom.taskList.tasksText}>Tasks</Text>
                            {taskList}

                            <View>
                                <TouchableAnim onPress={this.addTaskFn}>
                                    <Image src={PLUS_BTN_IMG} style={custom.taskList.plusBtn} />
                                </TouchableAnim>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                {actionButton('DONE', this.submitFn, custom.taskList.doneBtn)}
                            </View>
                        </View>
                    </ScrollView>

                    {spacer(30)}
                </View>
            </View>
        );
    }
}

const defaultTask = () => ({ title: '', desc: '', options: [] });
const PLUS_BTN_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAjVBMVEX///8AAADz8/P09PT+/v79/f319fX29vb6+vr8/Pz4+Pj39/f7+/sEBAT5+fk5OTl2dnaJiYmVlZVWVlZHR0fHx8fZ2dns7Ozk5OQZGRkfHx9sbGyrq6vR0dHAwMBBQUGhoaFaWlqamppwcHAoKCiKiooRERHCwsKAgIC0tLQxMTFiYmJOTk4lJSXV1dXw5HY2AAAZpUlEQVR4nNV9a2OivtN2QM4gWiyC9VBr263W/vf7f7xHIIfJCQKk+7sfX2xtd8LMFZLMJHMlQaj7eJ70Bem+/L6s3ce1nzjrfvXimH7p/sfP6BdfJyuJqGSRRpaIjJEdY2b3iZLuz16ed3/28wjLJVn3JUviCbL5oCx5HCIiVDYmstNUk+e2nyTs/uylYfdnP0y7R2RhjvWHkSSLtYQJEmUzIostIo+LiWzEHodlJdUqWUm1bGYmyLZPTRbdn71g0WmJF0FXMnJTXMDFjwgXuORigQ1xQ/xwIpu62KIAy/pENmOyCS9LVftEdaZQPcHMts1GGPfD6OGSrijrBoiXZQDdMQB1sgmRlVUvRNWymW3jjXHLZdXoWgXoMaMDLUBtZcgAA6ZabyZWHSYeeY+NIa4EMBRKBgwgaaLU6AlvMGQABdWZpJrVLZNFGoCsbtvHYa8B38r4NzgJoKKJygC1TXTYTKpaKGnQuP8/6YNEFmsZbqKz+iAi/gqRn3HiiaoN+qBsprYP8gD1Rs/rg0H7P1lQlbfDpbiu9/fN8+a+X1+Ly/l2rILHIzNc2KgPmpgp1m1XNXPchB4g8qv6eFnfvx3d5/u+Lsq6fVPjmqixmX7zw0t/xQ9W5fXnAyNZ4h9L8UuH8+eprHFtzwUoNFE/8psgL7TaB8NH4fC0fmEIJFzgCxV6WZ/CRoEe4IQ+GKetx88Hx98xfTB2t5dn+OJMAOIvz8VxYVC3Q2bSQTkOmv/x8DzEkps4XlfDuDQAm8/qc6t+g5O8WSuCPb6VUK0q6KAiWW8AEP/Pd1F7vqDaKKIUmygxk5TUVY1pE42/NnLXmwCw+Wy+Yr5ux4Rqopnkt1luwkfVZefIXW8SwPbn7lI9FIwP1YBsCAHO64Mhqq/qfqX2DmZ1sLz+RYLqKWa2VeIv5riJKN7e1UY7Ei75o3/Jj8+98ZKTQjVqZuvx/XCOm/C2ex0u8uVltVmfb6dyu91WQb6oHpHO1+l2Xm9W1GnqRtx9jdIJoRptolnUTBDzdMYoWq97X9zz++W4rRAuFOBoLsWFUbU9Xt6fuVcqIl3jaGdaT0objXE0/t1T2UJsbQDgpigrrwm/8eMUM/q2pj23LDY9bbXAqsebmQeNRo+svvX1QaGJEi2nnQ7gy9NJXLLQz+j99PGH8omL87hx9YRQXySjcxNUtbZqBvpg/QZCagjw9VKjKBK0GMzot8WrCuDj87b1dWbKoZq0+DcMUN1ED3AgZNX/UWybhjdlRh82ID8c5XPPU82kAMe6ifpZaci99FDfqhoanNF75Zuy6T/XE4cKTdX0Ne5G9qCq6eWnyxs9aVUt8qtiqerbBxSYuwnmzTotI0M1967oK6sz9goWVtXSw0oRAt6rYTNFgHHzH3E4snEfdzLAj5tLciM9AM0XfuPD/wSAj5+7o2DmYBONGlfoJ/k4gGd5tPtz8yPxrYxrouJ8MMz9wx8e4LIbcEz8IG2UrcfPSLbGLFRL9jLAosnCTEm+DIxvTTwhhAB7NxX6YI+bSJvFPOrxDd9gtZIAriuYm7C68Fu/OzzAx/y4HjJTXlkZA3DriAA//v5i8iXM/n5IGred7GAf1ADsa6IJOknqCqXRNpMvhdQZT8PeTA+wL1RL2jEGAHzEZ3U/QCvJlxrHckz12VsMhmoTmmjSTSQgwE9vNMAJyRfP/RQ7Y4G0ZooAvc4iI4CfIsAjlh3qg8OhWn/yJUFHqW5NAbbZUZrm7++DV74anU37Wqz3QbXR8UaIEq+9oRoF2HI1/CQa0qIC2DUUgybaQ1gYk5v4ZJ2x/XFFgTZUo6rTlnJCqDZjmqjjfJkCHOUm9ADz6MQBdJwnXzMvB3UbtJkncXnZYJBxlvUQwEmhWn/ypV5CgKQVmWT58G99oRrvJpzXagjgjFBNv6pWvfIzqjPqp/NwAPu18I7e2YQjANrM0Sc0b9DZcjJ/g2NCNWeDiOyvhGo9C79J+sZ3xm0+SCWQACqaaMUD3CON0f+AJ+OjPTfaODUzUw1Q4LUpw/SEm00460GAv8uTWcPlDWeVDACMOl5bb5i+H/kGf5sn884tb+xRXxMVeG0GM3qDPqhoolZ5MijbAIDNgNrDVwp4XptyHnJUAfxHoRri+iBt8eiNG23KXE/ICjW8NqDF3XF+0NhNTA3VdAA52fwVjja7SgtQzWvjq/HORTIVkbUaqhnxlbieVC1hGH6fA/DAxaJ2QrUeN2GcfNkyz79slopNACrXAuqpwbZdNyEnX1gYvuyqfuIbRM9w1vk5AeDv0CmbWJSb6zxnWoACr60nu4SH0X8wozdMvmxg+zojHiA1k/DaNPlBCND5nRm9OzlHH3PW1Zwsa86Y16ZZj3uDjzgOAPxtSrOcfCnhaPOmBJjxvDYphQ1H5E9jgNNm9Lxqo+RL9ARHm5MKIMdrk9vJDqSwXweWDSfN6GfxZHI3917BaLOjsrKZYkkVy8J84dfejB4NJl9qGFEWmRlAxpOBAAeW7v+hm+DfQwHdtW5lRQPQg0SgD/SLyZcpTZTK/g/0pCvizcSq2199qYlGWwDQ+WvPTZCF+ll0SmpmVkIza5WZccdrk5arYshVW9tzE5F7vB0XE0M1xaoaWjMzH5Nh2UzMayP7/BidcgsAPhq4pT6Yxi0JdXf2rW3QqZiZj5eYiqo7XlsWSSURpFMW1kI1/4ob1RVh2Tl9sFNdQK4GEs3keG2Q8VsDgH/65oOj+mBa0gipVBs9hidD6vYPXbYhsRswEz9OLgkZvzd5N8vEGX23EkjXjyaFavKq2gG4tavaTF6L2Lg/fBOWhYmbiEkM8vjnESON2fnSt3/F/QBjRmUGEF1A771F1kK1aEWfu4q8aaGavOiEbqBLXcwAxjtA5ZKMnh6qNQjxc1epfhQ1chNgwuuzinN2+UI00+ss4kp+geHpnNkL1R4IacVVZDgfH6pJazJgou6cRForz2vDJTdg2ZyS8SyEag1ChzQNPUDzPohVp0s2nG4EM3leG9naw1iBeG3G0ow+X9FhfRVpAI7hydDsEkuA4/ibmpmkbZY740sWwMHo+KJTZvTIXVFDOoQGm5QNEqB+WDF/0U6DmJnt5gCS5aYl2eYsvNZqaboUVGxXW4vQ2l7qLgTrJlLfnJlk0zFX8gg8aNkZbSf5skhWtKYbhFb6YNecS+DAt7FoplAyvjKA3x6y1QcbQ1p/2BnyQDgrVBNm/94HG06fon6AoQs2SBZKgJOTL9DjZ6OZ1z0Au8k+GcQCQVYoyc2btnZX1aDHDxY2mihVDfIYHTlT4rWxGOjCAL5a5slwHp8M5wqAxm4CLPyCrSgFZybmtYGSz6zTqoI8o1BNs+ik8PiTQzVONnP9CwXoPEMzk47XlrGSIRiV6mk7X7SraqnoD+30wVZ1zfyFEzIz29NbKK+tLXliAF9Q34x+Ak9G9IcW3ESnupF9YUunp4y+B47X1pVcw2HXbvJl4a5oU2oRzgrVxLp9Ykun75lgJlfypSdMn5l8CfMVbUoNwkkzem3jKZnhL4g3kysJo27ryZeIUY8eCO24Caaa+gscfasBNjVBJMV5yPzkS+cPscfP7QLM8x/myEuka6IIXVlNFDxA2U2M5sm0/hB7fHcxO1TjALo4k9QqeAJmEl4bLunTisBRt9XkC+fxI53s1KOnSuYvfkBEyfPaggqsW1VqgDN4MtDjB0R2lpuAQ0XFHOJ3QnOJHa8tJ9FJWjOAz551OmUoeXwbboKY6QHiyJacuMPx2pqZ5JECdN6t5+gzyePPDNWEwf6d+YsSYVnIa2tLXtibvlhPgEoe3/LpaHT1ZfkwnpMlWrw2oiEVcfSt73yJeI9vIVSDAKMvhzaRNWcmhHsHDOrAOp2S9/i23AQxE85s79BMWDL7pgBfqlzUMqWJckv30ONHqY1QDfakePFCB5HvjA0VHqzGgMVsK8RrsbHzhff4ViIZrieB1f3QI6o7XluIS1asr26I0ZNn9HIClPP4Y5Ivw020lf1hfawKsOqYO70Fgbz/mtNihycDPX7KGz2zD3aya+Au8KGMGcdry5Ibi9nOAkAbPBlpzdvSGySyZzZtuHX/w/PaMjc7UICtiGWeTC56fEtugsreHFqDByzb8doQNfpCATZEuHFugiyFEF4nyeNlC2xIHgRgzbupjwDbSmUjIku2uIw6yDYnCJfY5fOsqPa3goU05bhQLUVe9PjkbpU0P6O0cvP2S1i57c/IrTDCzh8GjwkiFkmJSFC5GZHN2rTYqHNek5ICxGvZqQiwmR2S4XwbjeHJ+OX+dTX8WdLhfGkg/br/8kcAXOBl4VbBVX6DbYNZg+g8GJF8obmO4Q8j2pl8njobDDfo1EzBWuC1kbF6zwzYxqxkB1DfB6OLYD1j3spfRKT9suf+N8gPFRV73B6peW13Ntzi7LaJmwjcnbnROqQakd1iBOOsYo+7k7N7eV4bolumHCfAVWNCBDqOMnqc7NGAr0TMXLCgc4M9RM7x2vLsmT08H2qiwA/efg+gc8vN6TypQ9/QDzaTO70ld/E7bLUsRiRfjr8HkIVfwzkiD6TzN9hMnteWwHR4NSJUC3a/BnA34uipsGZPuasBwt2i1Zjky5k0D9sA8XJEP51HWEdrn7JXA+zSMt3T63TEjN4394fjHOKT7g2qIkqYYVurAT5iGlqNx3TMqhoyjmnw841imvuXDqA6otyydnBlALulWlwS5Pvxw82nSx6NRbMAB5rZI74kQWna/B3OgLHIAsStQPbxSei+X1O+UsmaYIEIwKzjteGSFzbHP5F3b7yq5smziQX2Q2lnSCZnuTNpNhGSkTEQVQ+uT59YHyhyDDDveG2ESkNGjIfcTQdwxs4Xmdc2894PIUd0Y03wjD1+yvPa2BxfFxDO2vkiz/Ft3fuBZc+sCeI5fijw2jwQfin3WMzb+aLntZkmX3iArjAWIrDN58jXLf6N43dv7G9SDnKe12b7apoY5EgrGWCrJaAAnRWyvkkZ8by2uU1Uiig9lhZpJw4KgPyad2izD/bw2mb2QQowcV8owO9MDZCbIHbssJHJl36uGuS1LRYTVtX6WZ8gpLnDgKuzCGshfdUhfdWEJ2O880XFa7PUBxtZcILHmpmJbyXDWjKyb1Raj7OySVnBa7PVRBvVFxbSXHyiGp/eQppdCtbj3g0BjtikLPPapgEU3QSWfWdRdZliMzGvjYRJLgI7up49q30QqXhtFpsozuOTQYQEktytZM34m3wzf+H6VkI1lnyRstxWQjUqC+hcHwFvJinZaAEJqjK15ia6ygiFLLedUI3Klixm+1EC7LQ8sTdd+DqAUzcp81nuiaGabumIbit5PP9JCdAXK2IjGT3m2DEVT4bLcic2++BDdU5vV8C8NlUTRWwXfiOHjZ7hJoQEKJ/lthOqEdWLhBjeRaXUzM7jp7RxoxcmV/YDHL9JmfP45ukzoySYXzLDX+AA3vLa2K1kiy6q6Wr6yZabICOugtc2LVRTzQmemOFrAJC7lawteWKhz8s8NyHzZAItr83CeQYvzPATomZ2We7MA1pCsGy5DXuaqGmoxgBGCl7b7FAN4YYGDwEJQl415LWh7mgo4i/QFIBanozk8W2EakQ1CEqfI3Go6EqSdw/4b68iwHnnySQZ7/EtNlGEXlnTKyLBm/FV45HNeY38lgdo0gf76JRqXpuVY2+2YDG9m/cxMwUtiwVYCyiUACefJ8N5fP2JQONYn51quHct4s30pJLgILRvT7HzZfpZFhpe2xBPBoRqOoDeN+tbn0Q1Hl86Xht892D13ymj2aFaZ7TMa9MZPYl5TailDulaVDXPa8Mlv1mnffNtHDtGVtV6eG0T3QTJLr2xweObMzPrbiXLeS2gTTv0sMsZfVDPa5sbqpHzk2E0XXBm4tNbhJLwDKyi0zLHTTBZBa/NRhMNs08GsHknoCcRDgZf0gO3vC3TqTN6mU65CPg1b2tHT7l/GMCNykyxpP/F/IVzmBqqyXTKLOPWvCe6CRiqdarRgQF0vhQ9SQSYtGebUMcVhyaDjBGlmT+9xUKo1qn2WcU5O18e7FUlQZDnHPLBPmi68wWueSf6c33Gbg6AdJ4LkgB6nUX8ohM4ptf535jki7YPtkZ77OD/V4vH3vyPAVxWgQhQvJUMa7mCo+xauq2dC5/31B/exQF8kptoVcM77q6xqDrieG0UYP4XOJg/aK6boKtqNPQgRAiTUG1og84fEHRvyf4ZyrzmeG3AaOG8NjvHjqHAxyeOkvPa5vdB8bw2sW6FW8lA1QAyquPU+tt0x25SPrdn7lGm09QZPVMNGJc0IwjMxKpVJfeg5HsmlZy8h3dxvJUGXDUTN9FaBfZYkEsNZDNVANtTkmmv+TsaYM+RR6TX22ii6C80s+4HKFJDWLJ02Z5fOjFUs5p8kc38YDdB4M5t+AaRl8J4vQnAbRw7ZmtGT1UXAGA3D5LN9Lo/y8kXuvu7awCevSOPhgAa90E2C6LTIKAa8trorWT8qtoODKevbiJosblJGU3qg8gHd+o5Ow4gleV5bUKzO8GB+FMCaHOT8qRNcugJAGxjCBkg5rXFSoDtmezsCeItrlY3KY8O1ZpPCQG+KQGG6lvJ6IES7LTkBmlsrw/aOB0NuRCg03vhswCQGe2fAcDH7DmfFKr9Th9EOXefzkE1yARDAAPUHhpFZ4qfkc3zZOaEak066QkCfO5lfWqMbrXwd5SciOz4Jmoj+cIBvEGAjzZq3kSFdnIAewZwWDQlVLPcRD1uete00Z6IsuO1aW8lw9Mo/Cqb00z/D7gJL6mXEOC9b1aHeW3a5EtQ7RjAh+NPkv8+VPPS6hUC3Lm+PqLkbyVTJl/4W1w3KeFTWd2kbJB8YUaHyQYCfHhqfRMN+VvJ1MmXMwCIbzv5L0M1L8x4gGcZIKtb3a1k/Ix+z4027zzA3+qD2mYX5nsO4F4FUBgqBIDyQQHkUFrCTkX/Xaj2ALjmAK7cYHDSg7Xoky/wbKXm854FNqZLE5so/wadOjUE2J982cJn0pPc/n2o5qXCIOP8zXV9UGiiQ7fXneBo8xhucvSbbkIbqiWVAPCWafsrZUW1s4t0AKC0h/K1+i9Ctbx+5QFeMqpaS0zGt5INJl+8wuEevtxG/7yJZn+XPMAiHl6fFm8l0yZfFpigKoXh/25GLwTbj7mOP7z4x99KNpB8uUKAS7yu8e9m9PmTAPAai0tHilldax3htQ0mX64AYJtQjm2FaiYz+o0IMJUB6iY9/G/6MJ1f+Wk+JZkT//qMvhRVf8a0vgYXHgjAweRL4Be8Fsd58kYDHMOTocuGUt0Wvq6JyrO67jejnS8euUSeaXutLQLULvy+igAv0iiqb6Iep2Uw+XKCAHF2UX8HqJ0mSi/x63X0OoCtx/fDwT6oOt4dq/vAB03+UvLl74cE8K8EUJ8jyjhem0nyJa9XPMDHj3VlCNAoVONUV2uWPiOziVqKRXuY1x2vLRqVo0+4u9aXJDclnYtvI1QrHAng3k0HQzUWMnO3kpnzZM5SZ3T+HBZIfCvz+uBD9QGSEOiMXpoP9uWIIK9tDE+m3Imd8dEdb34/wFGhWoD8G+DJ0EUnxZqMweKfBmBP8iWv7jzAjqt2SFFoxU0kmXsAVC765e6qFp30i3/9b3BgZfsgAWza6qf2eqgxyRdUf/5xFAAPSLVsOLg+rQE4mHypnx1HANhWc+lxsuP7oPf1JngHnJuoYRhsTiXwOi0TeDLZWWmI811s8aLqlOTLtmCXMXHPPfT1JBVArFrktY3JD6L6TQGw+bxeag1AvZtoFNUXGp8Jz33rzQ/2NFH+VrLxPJnTTvJX+OfLU0kea9JEUZ6UTy/yY5z2+bsTGgyZ1Wbyt5JNytFzNz8Lr/KnKCsPgUPtZTfRvmSvKj8B81rq2zzLYhSdpzu9JRZKjuHJhFl1VQPEP5/fi6/tAr+mroxHOgWKPbc+Xt6fQcuUAV41PBkDN0HNFEuOTIDWe0fVVsFLeFn9rM+3W7mtq2qRVnVdb8vT7bz+Wb3QlqgBuNdRucakMfmSU3gyNckyygA5pOpPz3ltd5ltOMFMsWomJEBTVPNtte+QueHKICuWV4xvDvNaC3B8jr667IDxWoB9uDjZ3aUiSzEjtzkKZnrdn23wZPKTPCBOAdj8s/nyUWC68NDbRHle2zyezCJCVfGthmEO0GmiIn5rzxzWJ38rmRWezPaJ7t+aBHD1yW+vG8e8FptomvC8Nhs8mTgKtgXzcKYAu5/PxVHYASoH26PYLgKvzSJPJjy9v5gDbD8v61MQ4efP2cfJmQlypLZ5Mo9QsCqffr4Zgh6AHz9PLb091DaeWczr7vNLlOZkW17Wd4BT+Hzf15dyKxyYM3Evte5sLVLSKp2Sxa0t9CysytvhUlzX+/vmZ3Pfr69Fcb4dq2bDhz9M0Zm3OUAs+Ss8GY9cWoMyklzHSUuzGGOGN9Py2n6dTtnT7IbWp436INkNz99K9h/yZKacjmbQB32e12YH4KzbkyYeuaE1U7yVzIabmLLzxdZeatlMHa9tBsBJdMqJp6NpVOtIQ7YBjuDJGIyiswKuriTZYhiTxEdEBvgkIFFsQFaUQkmWrNYFhH+GqW8+kc2IbE5kU4UswrJkL6ukOpRVy2YKqruSCT6g30+x/izFBaKU0D0Sf1g2JiJYC5GNmSx5HJMVHhfLqlNj1SgRzex+y8hZURF+ph/hAjH5kuGTe7xIlI2ZLBbJcEayR5Y+jqj2DFRPMtNn/4Ivnu9JXwSRMbIqEW/E48bISmZ6/w8O9m/0ZL/8KgAAAABJRU5ErkJggg==';
const MINUS_BTN_IMG = 'data:image/png;base64,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';

const custom = {
    root: {
        fontFamily: CHAT_FONT_FAMILY,
        fontSize: 14,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        height: WINDOW_INNER_HEIGHT,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'white',
    },
    root2: {
        width: '100%', maxWidth: 450, height: '100%',
        borderWidth: 0, borderStyle: 'solid', borderColor: '#a0a0a0',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start', alignItems: 'flex-start',
    },

    taskList: {
        titleInput: {
            height: 40,
            width: '80%',
            fontSize: 14,
            padding: 0,
            marginBottom: 10,
            outline: 'none',
            borderWidth: 0, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
        },
        tasksText: {
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 10, marginBottom: 10,
            textTransform: 'uppercase',
        },
        plusBtn: {
            height: 30, width: 30,
        },
        doneBtn: {
            width: 60, height: 40,
            style: { fontSize: 13, letterSpacing: 0.5 },
        },
    },
    task: {
        ctr: {
            width: '100%',
            display: 'flex', flexDirection: 'row',
            justifyContent: 'flex-start', alignItems: 'flex-start',
        },
        subCtr: {
            marginLeft: 15, paddingLeft: 10, marginBottom: 10, flex: 9,
            borderWidth: 1, borderStyle: 'solid', borderColor: '#e0e0e0',
        },
        titleInput: {
            height: 40,
            width: '80%',
            fontSize: 14,
            padding: 0,
            marginTop: 5, marginBottom: 5,
            outline: 'none',
            borderWidth: 0, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
        },
        descriptionInput: {
            height: 40,
            width: '80%',
            fontSize: 14,
            padding: 0,
            marginTop: 5, marginBottom: 5,
            outline: 'none',
            borderWidth: 0, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
        },
        minusBtn: {
            height: 30, width: 30,
            marginTop: 10,
            marginBottom: 10,
        },
        options: {
            ctr: {
                width: '100%',
                display: 'flex', flexDirection: 'row',
                justifyContent: 'flex-start', alignItems: 'flex-start',
            },
            heading: {
                fontSize: 14,
                fontWeight: 'bold',
                marginTop: 10, marginBottom: 10,
                textTransform: 'uppercase',
            },
            optionInput: {
                fontSize: 14,
                height: 40,
                width: '50%',
                padding: 0,
                marginTop: 5, marginBottom: 5,
                outline: 'none',
                borderWidth: 0, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: '#a0a0a0',
            },
            plusBtn: {
                height: 20, width: 20,
                marginTop: 10,
                marginBottom: 10,
            },
            minusBtn: {
                height: 20, width: 20,
                marginTop: 10,
                marginBottom: 10,
            },
        },
    },
};
