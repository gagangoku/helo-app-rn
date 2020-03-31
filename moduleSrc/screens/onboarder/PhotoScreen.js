import React from 'react';
import {withStyles} from '../../platform/Util';
import {actionButton, getCtx, spacer} from "../../util/Util";
import {commonStyle, TEAL_COLOR_THEME} from "../../styles/common";
import SuperRoot from "../../widgets/SuperRoot";
import {API_URL} from "../../constants/Constants";
import {crudsRead, crudsUpdate} from "../../util/Api";
import cnsole from 'loglevel';


class PhotoScreen extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            uploading: false,
            finished: false,

            filesToUpload: [],
            filesUploaded: [],
            fileIdsUploaded: [],
            filesFailed: [],
        };
        this.photoRef = null;
        this.idProofsRef = null;
    }

    uploadFile = async (file) => {
        const data = new FormData();
        cnsole.log('file: ', file);

        data.append('file', file);
        cnsole.log(data);

        try {
            const response = await fetch(API_URL + '/v1/image/upload?', { method: 'POST', body: data });
            cnsole.log('response: ', response);
            const text = await response.text();
            cnsole.log('text response: ', text);
            return text.split('id=')[1];
        } catch (ex) {
            cnsole.log('Failed to upload: ', ex);
            return null;
        }
    };

    onSubmit = async () => {
        const filesUploaded = [];
        const fileIdsUploaded = [];
        const filesFailed = [];
        this.setState({ uploading: true, finished: false, filesUploaded, fileIdsUploaded, filesFailed });

        cnsole.log('this.photoRef.files: ', this.photoRef.files);
        cnsole.log('this.idProofsRef.files: ', this.idProofsRef.files);
        const idProofFiles = Array.from(this.idProofsRef.files);

        const filesToUpload = [];
        filesToUpload.push(this.photoRef.files && this.photoRef.files[0] ? this.photoRef.files[0] : null);
        idProofFiles.forEach(x => filesToUpload.push(x));

        let photoId = null, idProofs = [];
        this.setState({ filesToUpload });
        for (let i = 0; i < filesToUpload.length; i++) {
            const f = filesToUpload[i];
            if (f === null && i === 0) {
                continue;
            }
            const id = await this.uploadFile(f);

            if (id === null) {
                filesFailed.push(f);
            } else {
                filesUploaded.push(f);
                fileIdsUploaded.push(id);

                if (i === 0) {
                    photoId = id;
                } else {
                    idProofs.push(id);
                }
            }
            this.setState({ filesUploaded, fileIdsUploaded, filesFailed });
        }

        this.setState({ uploading: false, finished: true });

        const supplyId = this.contextObj.supplyId;
        await this.updateSupply({ supplyId, photoId, idProofs });
    };

    updateSupply = async ({ supplyId, photoId, idProofs }) => {
        cnsole.log('image id: ', photoId, idProofs);

        let supply = null;
        try {
            supply = await crudsRead('supply', supplyId);
        } catch (e) {
            cnsole.log('Error in getting supply: ', e);
            window.alert('Error in getting supply: ' + e);
            return;
        }

        if (photoId) {
            supply.person.image = 'id=' + photoId;
        }
        supply.person.documents = supply.person.documents || [];
        idProofs.forEach(uri => {
            supply.person.documents.push({ uri: 'id=' + uri });
        });
        cnsole.log('Updating supply: ', supply);

        try {
            await crudsUpdate('supply', supplyId, supply);
        } catch (e) {
            cnsole.log('Error in updating images: ', e);
            window.alert('Error in updating images: ' + e);
            return;
        }

        this.props.onSubmitFn();
    };

    render() {
        const {classes} = this.props;

        let numPending = this.state.filesToUpload.length - (this.state.filesUploaded.length + this.state.filesFailed.length);
        if (this.state.filesToUpload.length > 0 && this.state.filesToUpload[0] === null) {
            numPending--;
        }
        const supplyName = this.contextObj.supplyName;
        return (
            <SuperRoot>
                <div className={classes.root}>
                    <div className={classes.title}>Person photo &amp; ID proofs - {supplyName}</div>
                    <div className={classes.desc}>
                    </div>

                    <h2>Upload photo</h2>
                    <input ref={(ref) => { this.photoRef = ref; }} type="file" accept="image/*" />
                    {spacer(30)}

                    <h2>Upload ID proofs</h2>
                    <input ref={(ref) => { this.idProofsRef = ref; }} type="file" accept="image/*" multiple />
                    {spacer(30)}

                    <div style={commonStyle.actionBtnContainerForCenter}>
                        {actionButton('UPLOAD', this.onSubmit)}
                        <div style={{ width: 10 }} />
                        {actionButton('SKIP', this.props.onSkipFn)}
                    </div>
                    {spacer(30)}

                    <div>
                        Pending: {numPending}
                        <br/>
                        Uploaded successfully: {this.state.filesUploaded.length}
                        <br/>
                        Upload failed: {this.state.filesFailed.length}
                    </div>
                    <div>{this.state.uploading ? 'Uploading ...' : ''}</div>
                    <div>{this.state.finished ? 'FINISHED' : ''}</div>
                </div>
            </SuperRoot>
        );
    }
}

const styles = theme => ({
    root: {
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        color: TEAL_COLOR_THEME,
        marginTop: 30,
        marginBottom: 30,
    },
    desc: {
        marginBottom: 30,
        width: '80%',
        textAlign: 'center',
        lineHeight: 1.5,
    },

});
export default withStyles(styles)(PhotoScreen);
