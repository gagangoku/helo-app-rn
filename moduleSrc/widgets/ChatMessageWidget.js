import React from "react";


export class Message extends React.Component {
    render() {
        const { authorName, isOwn, date } = this.props;
        const style = this.props.style || {};
        const timeDisplayDiv = !this.props.timeDisplay ? '' : <div style={custom.timeDisplayDiv}>{this.props.timeDisplay}</div>;
        return (
            <div style={{ ...custom.message, alignItems: isOwn ? 'flex-end' : 'flex-start', ...style }}>
                <div style={{ fontSize: 11, marginBottom: 1 }}>{authorName} {date}</div>
                {this.props.children}
                <div style={{ position: 'relative'}}>
                    {timeDisplayDiv}
                </div>
            </div>
        )
    }
}

export class MessageText extends React.Component {
    render() {
        const style = this.props.style || {};
        const timeDisplayDiv = !this.props.timeDisplay ? '' : (
            <div style={custom.timeDisplayDiv}>{this.props.timeDisplay}</div>
        );
        return (
            <div style={{ ...custom.messageText, ...style }}>
                {this.props.children}
                {timeDisplayDiv}
            </div>
        )
    }
}

export class Avatar extends React.Component {
    render() {
        const { size, imgUrl } = this.props;
        const height = parseInt(size);
        const width = parseInt(size);

        return (
            <div style={{ height, width, lineHeight: height, ...custom.avatarCtr }}>
                <img src={imgUrl} style={custom.avatarImg} />
            </div>
        )
    }
}

const custom = {
    message: {
        display: 'flex', flexDirection: 'column', margin: '0.3em', marginBottom: 1,
    },
    messageText: {
        position: 'relative',
        minWidth: 45,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    timeDisplayDiv: {
        position: 'absolute',
        right: 10,
        bottom: 5,
        fontSize: 9,
        opacity: 0.5,
    },
    avatarCtr: {
        borderRadius: '50%', border: '1px solid #ffffff', textAlign: 'center',
    },
    avatarImg: {
        height: '100%', width: '100%', borderRadius: 'inherit', objectFit: 'cover', display: 'block',
    },
};