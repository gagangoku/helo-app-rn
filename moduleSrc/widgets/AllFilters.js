import React from 'react';
import {withStyles} from '../platform/Util';
import {getKeysWhereValueIs} from "../util/Util";
import OptionPickerWidget from "../widgets/OptionPickerWidget";
import {GENDER_FEMALE, GENDER_MALE, GENDER_OTHER, LANGUAGES} from "../constants/Constants";
import cnsole from 'loglevel';


class AllFilters extends React.Component {
    constructor(props) {
        super(props);

        this.languages = {};
        this.genders = {};
        if (props.filters.languages) {
            props.filters.languages.forEach(x => this.languages[x] = true);
        }
        if (props.filters.genders) {
            props.filters.genders.forEach(x => this.genders[x] = true);
        }
        cnsole.log('AllFilters props:', props);
    }

    setFn = (x) => (key, val) => {
        this[x][key] = val;
    };

    onClose = () => {
        this.props.closeFn();
    };
    onDone = () => {
        const languages = getKeysWhereValueIs(this.languages, true);
        const genders = getKeysWhereValueIs(this.genders, true);
        this.props.doneFn({ languages, genders });
    };

    render() {
        const {classes} = this.props;

        const languages = getKeysWhereValueIs(this.languages, true);
        const genders = getKeysWhereValueIs(this.genders, true);

        return (
            <div className={classes.root}>
                <div className={classes.tickCrossContainer}>
                    <div className={classes.crossImg} onClick={this.onClose}>
                        <img src={CROSS_ICON} height="20" width="20" />
                    </div>
                    <div className={classes.tickImg} onClick={this.onDone}>
                        <img src={TICK_ICON} height="20" width="20" />
                    </div>
                </div>

                <div className={classes.ctr}>
                    <OptionPickerWidget heading={'Gender preference'} optionList={[GENDER_MALE, GENDER_FEMALE, GENDER_OTHER]} initialSelected={genders} toggleFn={this.setFn('genders')} />
                </div>
                <div className={classes.ctr}>
                    <OptionPickerWidget heading={'What languages should druid speak ?'} optionList={LANGUAGES} initialSelected={languages} toggleFn={this.setFn('languages')} />
                </div>
            </div>
        );
    }
}

const TICK_ICON = 'http://www.clker.com/cliparts/U/7/a/e/5/3/check-mark-grey-md.png';
const CROSS_ICON = 'https://image.flaticon.com/icons/svg/53/53804.svg';
const BORDER_COLOR = '#404040';
const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',
    },

    tickCrossContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    tickImg: {
        marginRight: 10,
    },
    crossImg: {
        marginLeft: 10,
    },

    ctr: {
        marginTop: 20,
        width: '100%',
    },

    header: {
        width: '100%',
        textAlign: 'center',
        fontSize: 20,
        marginBottom: 10,
    },

    rows: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 10,
        width: '100%',
    },
    cell: {
        padding: 10,
        borderRadius: 5,
        border: '1px solid',
        borderColor: BORDER_COLOR,
        color: BORDER_COLOR,
        backgroundColor: 'white',
        marginBottom: 10,
        marginRight: 10,
    },
    selectedCell: {
        padding: 10,
        borderRadius: 5,
        border: '1px solid',
        borderColor: BORDER_COLOR,
        color: 'white',
        backgroundColor: BORDER_COLOR,
        marginBottom: 10,
        marginRight: 10,
    },

});
export default withStyles(styles)(AllFilters);
