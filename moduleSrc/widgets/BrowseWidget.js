import React from 'react';
import {Helmet, withStyles} from '../platform/Util';
import {awaitPromises, fireApiCalls, getCtx, View} from "../util/Util";
import {getAllSupplyNames} from "../util/Api";
import SuperRoot from "./SuperRoot";
import Header from "./Header";
import Footer from "./Footer";
import format from "string-format";
import {COOKS_PAGE_URL, MAIDS_PAGE_URL, NANNY_PAGE_URL, WRITE_SUPPLY_RECOMMENDATION} from "../controller/HomePageFlows";


class BrowseWidget extends React.Component {
    constructor(props) {
        super(props);
        this.contextObj = getCtx(this);

        // Fire promises for the API's which don't yet have data
        const { staticContext } = props;
        this.vals = fireApiCalls(staticContext, KEYS, promiseFn);

        this.state = {
            allSupply: this.vals[KEY_ALL_SUPPLY],
            fetchError: false,
        };
    }

    // Wait for the promises to return and set data
    async componentDidMount() {
        const { staticContext } = this.props;
        await awaitPromises(staticContext, KEYS, (k, v) => this.setState({ [k]: v }), () => this.setState({ fetchError: true }));
    }

    render() {
        const { classes } = this.props;
        if (!this.state.allSupply) {
            return (<View>Loading...</View>);
        }

        const linksByArea = {};
        this.state.allSupply.forEach(x => {
            const { area, city } = x.person.presentAddress;
            const { id, name } = x.person;
            if (!(area in linksByArea)) {
                linksByArea[area] = [];
            }

            const url = format('/person/{}/{}/{}/{}', id, encodeURIComponent(city), encodeURIComponent(area), encodeURIComponent(name));
            const link = <a href={url} target="_blank" className={classes.link} key={'' + id}>{name}</a>;
            linksByArea[area].push(link);
        });

        const areas = Object.keys(linksByArea).sort();
        return (
            <SuperRoot>
                <Helmet>
                    <title>All supply</title>
                </Helmet>

                <Header />

                <div className={classes.root}>
                    <div className={classes.heading}>Supply</div>

                    {areas.map(x =>
                        <div className={classes.ctr} key={x}>
                            <div className={classes.area}>{x}</div>
                            <div className={classes.links}>{linksByArea[x]}</div>
                        </div>)}


                    <div className={classes.heading}>Static pages</div>
                    <div className={classes.ctr}>
                        <div className={classes.links}>
                            <a href={MAIDS_PAGE_URL} target="_blank" className={classes.link}>Maids</a>
                            <a href={NANNY_PAGE_URL} target="_blank" className={classes.link}>Nannies</a>
                            <a href={COOKS_PAGE_URL} target="_blank" className={classes.link}>Cooks</a>
                            <a href={WRITE_SUPPLY_RECOMMENDATION} target="_blank" className={classes.link}>Recommend your maid</a>
                        </div>
                    </div>
                </div>

                <Footer />
            </SuperRoot>
        );
    }
}

const KEY_ALL_SUPPLY = 'allSupply';
const KEYS = [KEY_ALL_SUPPLY];
const promiseFn = (key) => {
    switch (key) {
        case KEY_ALL_SUPPLY:
            return getAllSupplyNames();
        default:
            return null;
    }
};

const styles = theme => ({
    root: {
        lineHeight: 1.5,
        fontFamily: 'Nunito, Arial, "Helvetica Neue", Helvetica, sans-serif',
        fontWeight: '300',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        fontSize: 14,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        // alignItems: 'center',
    },
    heading: {
        fontSize: 26,
        width: '100%',
        textAlign: 'center',
    },
    ctr: {
        marginTop: 30,
        marginBottom: 5,
        marginLeft: '20%',
    },
    area: {
        fontSize: 17,
    },
    links: {
        display: 'flex',
        flexDirection: 'column',
    },
    link: {
        fontSize: 15,
    },
});
export default withStyles(styles)(BrowseWidget);
