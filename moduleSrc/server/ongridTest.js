import fetch from "cross-fetch";


const base64Encode = (data) => Buffer.from(data).toString('base64');
const testOnGrid = async () => {
    const url = 'https://api-staging.ongrid.in/app/v1/community/69908/individuals';
    const username = 'heloprotocol';
    const password = 'FSDSViBM4dBosezk6e22ocLuaRIhGCS3lCIQmAM62EEEhP3frGtSPfxRT1bfAFba';
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + base64Encode(username + ":" + password));

    const body = {
        "name": "Gagandeep Singh",
        "professionId" : 7,
        "uid": "111122223333",
        "city": "Bangalore",
        "gender": "U",
        "phone": "9008781096",
        "hasConsent": "true",
        "consentText": "The Individual does not and will not have any objection to Helo Protocol sharing the Individual's personal information and/or documents, including but not limited to name, gender, date of birth, addresses, mobile number, email, education record, employment record, Aadhaar number, other government issued IDs such as Voter ID, PAN card, driving license etc. (collectively Proprietary Information) with OnGrid (Handy Online Solutions Private Limited) for the purpose of background checks and verification. The individual understands that OnGrid maintains Proprietary Information on its platform in a secure manner, and it will only be accessible to Helo Protocol and its associates/partners/affiliates, and will not be shared with any other individual or organisation without the Individual's explicit consent.",
        "otherIdentifiers": {
        }
    };

    await new Promise(resolve => {
        fetch(url, { method: 'POST', headers: headers, body })
            .then((response) => {
                console.log('Response: ', response);
                resolve();
            })
            .catch((ex) => {
                console.log('Exception: ', ex);
                resolve();
            });
    });
};
testOnGrid();
