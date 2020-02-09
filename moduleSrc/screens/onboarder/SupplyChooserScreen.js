import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {getCtx} from "../../util/Util";
import SuperRoot from "../../widgets/SuperRoot";
import {getAllSupplyNames} from "../../util/Api";
import {TEAL_COLOR_THEME} from "../../styles/common";


class SupplyChooserScreen extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);
        this.state = {
            supplies: null,
        };
    }

    async componentDidMount() {
        const supplies = await getAllSupplyNames();
        this.setState({ supplies });
    }

    item = (s) => {
        const {classes} = this.props;
        const supplyId = s.person.id;
        const supplyName = s.person.name;
        return (
            <div className={classes.item} onClick={() => this.props.submitFn({ supplyId, supplyName })}>
                {s.person.id}. {s.person.name}
            </div>
        );
    };

    render() {
        const {classes} = this.props;
        if (!this.state.supplies) {
            return (<div>Loading ...</div>);
        }

        return (
            <SuperRoot>
                <div className={classes.root}>
                    <h2 className={classes.heading}>Choose supply</h2>
                    <div className={classes.ctr}>
                        {this.state.supplies.map(x => this.item(x))}
                    </div>
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
    heading: {
        fontSize: 36,
        color: TEAL_COLOR_THEME,
        marginTop: 30,
        marginBottom: 30,
    },
    ctr: {
        width: '80%',
        height: '80%',
        borderRadius: 1,
        borderColor: '#000000',
        overflowY: 'scroll',
    },
    item: {
        marginLeft: 20,
        marginBottom: 10,
        textAlign: 'left',
    },
});
export default withStyles(styles)(SupplyChooserScreen);
