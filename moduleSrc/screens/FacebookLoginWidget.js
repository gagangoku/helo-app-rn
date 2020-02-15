import React from "react";
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import cnsole from 'loglevel';


export class FacebookLoginWidget extends React.Component {
    static URL = '/supply/entry';
    constructor(props) {
        super(props);
        this.state = {
            fbResponse: null,
            googleResponse: null,
        };
    }

    responseFacebookCb = (fbResponse) => {
        cnsole.log('fbResponse: ', fbResponse);
        this.setState({ fbResponse });
    };
    responseGoogleCb = (googleResponse) => {
        cnsole.log('googleResponse: ', googleResponse);
        this.setState({ googleResponse });
    };

    render() {
        const { fbResponse, googleResponse } = this.state;
        if (fbResponse) {
            const { url, height, width } = fbResponse.picture.data;
            return (
                <div>
                    <div>Hi {fbResponse.name}</div>
                    <img src={url} style={{ height, width }} />
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems:'center' }}>
                <FacebookLogin
                    appId="2378906922391554"
                    autoLoad={true}
                    fields="name,email,picture"
                    scope="public_profile,user_posts"
                    callback={this.responseFacebookCb} />

                <div>
                    <GoogleLogin
                        clientId="1050580176860-l5il716rkhjur8qk9opd4u83t0o32uqe.apps.googleusercontent.com"
                        buttonText="Login"
                        onSuccess={this.responseGoogleCb}
                        onFailure={this.responseGoogleCb}
                        cookiePolicy={'single_host_origin'}
                    />
                </div>
            </div>
        );
    }
}
