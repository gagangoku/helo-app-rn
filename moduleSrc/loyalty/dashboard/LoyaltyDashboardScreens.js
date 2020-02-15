import React from "react";
import {actionButton, uploadBlob} from "../../util/Util";
import TouchableAnim from "../../platform/TouchableAnim";
import cnsole from 'loglevel';


export class LoyaltyEntryScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getStartedFn = () => (this.props.getStartedFn || (() => {}))();
    render() {
        return (
            <div style={custom.root}>
                <img src='/static/loyalty_dasboard/0.0-fresh-landing-get-started.png' style={{ width: '100%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                              width: '100%' }}>
                    <div style={{ color: '#811318', fontSize: 18, marginTop: 20, marginBottom: 20, letterSpacing: '0.72px' }}>
                        NRAI SUPPORT LOYALTY PROGRAM
                    </div>
                    <div style={{ fontSize: 16, marginTop: 20, marginBottom: 60, textAlign: 'center', color: '#412F21', letterSpacing: '0.72px' }}>
                        For restauraters, by restauraters
                        <br/>
                        of restauraters
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {actionButton('GET STARTED', this.getStartedFn, { width: '50%', height: 50, style: { maxWidth: 300, background: '#811318', borderRadius: 5 } })}
                    </div>
                </div>
            </div>
        );
    }
}

class PageTopTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { superScript, heading, subHeading } = this.props;
        const isNextBtnEnabled = this.props.isNextBtnEnabled || (() => true);
        const prevFn = this.props.prevFn || (() => {});
        const nextFn = this.props.nextFn || (() => {});

        const nextButtonEnabled = actionButton('NEXT', nextFn, { width: 80, height: 40, style: { borderRadius: 5, color: '#FFFFFF', background: FONT_COLOR_RED, border: `1px solid ${FONT_COLOR_RED}` } });
        const nextButtonDisabled = actionButton('NEXT', nextFn, { width: 80, height: 40, style: { borderRadius: 5, color: FONT_COLOR_RED, background: '#FFFFFF', border: `1px solid ${FONT_COLOR_RED}` } });
        const nextButton = isNextBtnEnabled() ? nextButtonEnabled : nextButtonDisabled;

        const superScriptDiv = <div style={{ fontSize: 12, color: FONT_COLOR_RED, opacity: 0.5, marginBottom: 5 }}>{superScript}</div>;
        const subheadingDiv = <div style={{ fontSize: 12, color: FONT_COLOR_RED, opacity: 0.5 }}>{subHeading}</div>;

        return (
            <div style={{...custom.root, height: 80, }}>
                <div style={{ position: 'relative', width: '100%', color: FONT_COLOR_RED }}>
                    <div style={{ position: 'absolute', left: 20, top: 20, opacity: 0.75, fontSize: 26 }}>
                        <TouchableAnim onPress={prevFn}>&#8592;</TouchableAnim>
                    </div>
                    <div style={{ position: 'absolute', top: 20, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {superScriptDiv ? superScriptDiv : ''}
                        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                            {heading}
                        </div>
                        {subHeading ? subheadingDiv : ''}
                    </div>
                    <div style={{ position: 'absolute', right: 20, top: 20, color: FONT_COLOR_RED }}>
                        {nextButton}
                    </div>
                </div>
            </div>
        );
    }
}

class ImageChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgLocalUrl: '',
        };
        this.imgFile = React.createRef();
    }

    onSelectFile = async () => {
        const files = this.imgFile.current.files;
        cnsole.log('Files: ', files);
        if (files.length >= 1) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                this.setState({ imgLocalUrl: e.target.result });
                this.props.onChooseFile(file);
            };

            reader.readAsDataURL(file);
        }
    };

    render() {
        const { height, width } = this.props;
        const { imgLocalUrl } = this.state;

        const imgTag = imgLocalUrl ? <img src={imgLocalUrl} style={{ maxHeight: height, maxWidth: width }} /> : '';
        return (
            <TouchableAnim onPress={() => this.imgFile.current.click()}>
                <div style={{ height, width, borderRadius: 5, border: `1px solid ${FONT_COLOR_RED_LIGHT}`,
                              display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <input type='file' accept='image/*' style={{ display: 'none' }} ref={this.imgFile} onChange={this.onSelectFile} />
                    {imgTag}
                </div>
            </TouchableAnim>
        );
    }
}

export class BrandInputScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
        };
        this.imgFile = null;
    }

    onChooseFile = (file) => {
        this.imgFile = file;
    };
    prevFn = () => {};
    nextFn = async () => {
        const imgUrl = await uploadBlob(this.imgFile);
        this.props.nextFn();
    };
    isNextBtnEnabled = () => {
        return this.state.name && this.imgFile;
    };
    render() {
        return (
            <div style={custom.root}>
                <div>
                    <PageTopTemplate heading='BRAND' subHeading='STEP 1/6'
                                     prevFn={this.prevFn} nextFn={this.nextFn} isNextBtnEnabled={this.isNextBtnEnabled} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                              color: FONT_COLOR_RED, letterSpacing: 0.5 }}>
                    <div style={{ marginTop: 40, marginBottom: 10 }}>BRAND LOGO</div>
                    <div style={{ }}>
                        <ImageChooser height={150} width={150} onChooseFile={this.onChooseFile} />
                    </div>
                    <div style={{ marginTop: 20, marginBottom: 10 }}>BRAND NAME</div>
                    <input style={{...custom.inputStyle}} type="string" value={this.state.name}
                           onChange={(ev) => this.setState({ name: ev.target.value })} />
                </div>

            </div>
        );
    }
}

export class OutletInputScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
        };
    }

    prevFn = () => {};
    nextFn = async () => {
        this.props.nextFn();
    };
    isNextBtnEnabled = () => {
        return this.state.name && this.state.address;
    };

    render() {
        return (
            <div style={custom.root}>
                <div>
                    <PageTopTemplate heading='OUTLET' subHeading='STEP 2/6'
                                     prevFn={this.prevFn} nextFn={this.nextFn} isNextBtnEnabled={this.isNextBtnEnabled} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                              color: FONT_COLOR_RED, letterSpacing: 0.5 }}>
                    <div style={{ marginTop: 40, marginBottom: 10 }}>OUTLET NAME</div>
                    <input style={{...custom.inputStyle}} type="string" value={this.state.name}
                           onChange={(ev) => this.setState({ name: ev.target.value })} />

                    <div style={{ marginTop: 50, marginBottom: 10 }}>ADDRESS</div>
                    <textarea rows={3} value={this.state.address} placeholder=""
                              style={{...custom.inputStyle}} onChange={(ev) => this.setState({ address: ev.target.value })} />
                </div>
            </div>
        );
    }
}

export class MembershipsDisplayScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            memberships: this.props.memberships || [],
        };
    }

    prevFn = () => {};
    nextFn = async () => {
        this.props.nextFn();
    };
    isNextBtnEnabled = () => {
        return this.state.memberships.length > 0;
    };
    plusBtn = () => {};

    render() {
        return (
            <div style={custom.root}>
                <div>
                    <PageTopTemplate heading='MEMBERSHIPS' superScript='TOIT - INDIRA NAGAR' subHeading='STEP 3/6'
                                     prevFn={this.prevFn} nextFn={this.nextFn} isNextBtnEnabled={this.isNextBtnEnabled} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                              color: FONT_COLOR_RED, letterSpacing: 0.5 }}>
                    <div style={{ marginTop: 40 }}>
                        {}
                    </div>
                    <div style={{ marginTop: 10 }}>
                        {actionButton('+', this.plusBtn, { width: 400, height: 100, style: { fontSize: 36, fontWeight: 'bold', background: FONT_COLOR_RED_VERY_LIGHT, color: FONT_COLOR_RED, border: `1px dashed ${FONT_COLOR_RED}`, borderRadius: 10, } })}
                    </div>
                </div>
            </div>
        );
    }
}

export class MembershipEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            theme: '',
            visits: 0,
        };
        this.imgFile = null;
    }

    prevFn = () => {};
    nextFn = async () => {
        this.props.nextFn();
    };
    isNextBtnEnabled = () => {
        return this.imgFile && this.state.title && this.state.theme && this.state.visits > 0;
    };
    plusBtn = () => {};
    onChooseFile = (file) => {
        this.imgFile = file;
    };

    render() {
        return (
            <div style={custom.root}>
                <div>
                    <PageTopTemplate heading='Add Membership' superScript='TOIT - INDIRA NAGAR'
                                     prevFn={this.prevFn} nextFn={this.nextFn} isNextBtnEnabled={this.isNextBtnEnabled} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: FONT_COLOR_RED, letterSpacing: 0.5 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ flex: 2 }}>
                            <ImageChooser height={50} width={50} onChooseFile={this.onChooseFile} />
                        </div>
                        <div style={{ flex: 8 }}>
                            <div style={{}}>TITLE</div>
                            <input style={{...custom.inputStyle}} type="string" value={this.state.title}
                                   onChange={(ev) => this.setState({ title: ev.target.value })} />
                        </div>
                    </div>

                    <div style={{ marginTop: 40 }}>THEME</div>

                    <div style={{ marginTop: 10 }}>
                        {actionButton('+', this.plusBtn, { width: 400, height: 100, style: { fontSize: 36, fontWeight: 'bold', background: FONT_COLOR_RED_VERY_LIGHT, color: FONT_COLOR_RED, border: `1px dashed ${FONT_COLOR_RED}`, borderRadius: 10, } })}
                    </div>
                </div>
            </div>
        );
    }
}

const FONT_COLOR_RED = '#811318';
const FONT_COLOR_RED_LIGHT = '#81131850';
const FONT_COLOR_RED_VERY_LIGHT = '#81131810';

const custom = {
    root: {
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
        width: '100%',
        height: '100%',
    },

    inputStyle: {
        paddingLeft: 2,
        letterSpacing: 1,
        fontSize: 18,
        width: '60%',
        maxWidth: 400,
        height: 60,
        outline: 'none',
        border: `1px solid #000000`,
        borderRadius: 5,
        textAlign: 'center',
        color: FONT_COLOR_RED,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
};
