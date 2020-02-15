import React, {Fragment} from 'react';
import {Modal, withStyles} from '../../platform/Util';
import {getCtx, priceFn, relevanceFn} from "../../util/Util";
import Footer from "../../widgets/Footer";
import {commonStyle} from "../../styles/common";
import Header from "../../widgets/Header";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {
    BANGALORE_LAT,
    BANGALORE_LNG,
    FILTER_ICON,
    GENDER_FEMALE,
    GENDER_MALE,
    INNER_WIDTH,
    NUM_FILTERS_BACKGROUND_COLOR,
    SORT_BY_PRICE,
    SORT_BY_RELEVANCE,
    SORT_FILTER_COLOR,
    SORT_ICON
} from "../../constants/Constants";
import AllFilters from "../../widgets/AllFilters";
import {searchSupply} from "../../util/Api";
import SupplyMiniProfile from "./SupplyMiniProfile";
import cnsole from 'loglevel';


class SearchProfilesWidget extends React.Component {
    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            // Cook list
            cookList: [],
            failed: false,

            filterModalOpen: false,
            sortBy: SORT_BY_RELEVANCE,
            sortByPriceAsc: true,
            sortByRelevanceDesc: false,
            filters: {},


            // Autocomplete
            latitude: BANGALORE_LAT - 1,
            longitude: BANGALORE_LNG - 1,

            address: '',
            addressEntered: '',
            landmarkLat: null,
            landmarkLon: null,
        };
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((position => {
            cnsole.log('Got current gps position:', position);
            this.setState({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }));
    }

    clearAddress = () => {
        this.setState({ address: '', addressEntered: '', landmarkLat: null, landmarkLon: null });
    };
    handleChange = address => {
        this.setState({ address });
    };
    handleSelect = async (address) => {
        cnsole.log('Address selected:', address);
        try {
            const results = await geocodeByAddress(address);
            cnsole.log('geocode results: ', results);

            const latLng = await getLatLng(results[0]);
            cnsole.log('Success: ', latLng);
            this.setState({
                landmarkLat: latLng.lat,
                landmarkLon: latLng.lng,
                address: address,
                addressEntered: address,
            });
        } catch (e) {
            cnsole.log('Error in geocoding: ', e);
        }
        this.inputRef.current.blur();

        this.getCooksMatchingCriteria();
    };

    async getCooksMatchingCriteria() {
        try {
            const req = {
                ...this.contextObj,
                latitude: this.state.landmarkLat,
                longitude: this.state.landmarkLon,
            };
            const list = await searchSupply(req);
            this.setState({cookList: list, failed: false});
        } catch (e) {
            cnsole.log('Failed to get worker list: ', e);
            window.alert('Failed to get worker list');
            this.setState({failed: true});
        }
    }

    placeAutocompleteCtr() {
        const {classes} = this.props;
        const searchOptions = {
            location: {lat: () => BANGALORE_LAT, lng: () => BANGALORE_LNG},
            radius: 50000,
        };

        return (
            <PlacesAutocomplete
                value={this.state.address}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
                searchOptions={searchOptions}>

                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                        <div className={classes.autocompleteDiv}>
                            <input ref={this.inputRef}
                                   {...getInputProps({
                                       placeholder: '   Enter a nearby landmark ...',
                                       className: classes.locationSearchInput,
                                   })}
                            />
                            <div className={classes.autocompleteDropdownContainer}>
                                {loading && <div>Loading...</div>}
                                {suggestions.map(suggestion => {
                                    const className = suggestion.active ? classes.suggestionItemActive : classes.suggestionItem;
                                    // inline style for demonstration purpose
                                    const style = suggestion.active ? { cursor: 'pointer' } : { cursor: 'pointer' };
                                    return (
                                        <div
                                            {...getSuggestionItemProps(suggestion, {
                                                className,
                                                style,
                                            })}>
                                            <span className={classes.suggestionSpan}>{suggestion.description}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={classes.autocompleteCross} style={commonStyle.notSelectableText} onClick={this.clearAddress}>X</div>
                    </div>
                )}
            </PlacesAutocomplete>
        );
    }

    sortFilterSection() {
        const {classes} = this.props;
        return (
            <div className={classes.sortAndFilterContainer}>
                <div className={classes.sortContainer} onClick={this.sortClickFn} style={commonStyle.notSelectableText}>
                    <div className={classes.sortImg}>
                        <img src={SORT_ICON} height="20" width="20" />
                    </div>
                    <div className={classes.sortContent}>SORT</div>
                </div>
                <div className={classes.filterContainer} onClick={this.filterClickFn} style={commonStyle.notSelectableText}>
                    <div className={classes.filterImg}>
                        <img src={FILTER_ICON} height="20" width="20" />
                    </div>
                    <div className={classes.filterContent}>FILTER</div>
                    <div className={classes.numFilters}>{Object.keys(this.state.filters).length}</div>
                </div>
            </div>
        );
    }

    showCookFullProfile = (cook) => {
        const cuisines = this.state.filters.cuisines || [];
        const languages = this.state.filters.languages || [];
        const femaleOnly = this.state.filters.genders && this.state.filters.genders.includes(GENDER_FEMALE);
        this.props.cookFullProfileScreenFn(cook, { cuisines, languages, femaleOnly });
    };

    row(cook1, cook2) {
        const {classes} = this.props;

        return (
            <div className={classes.row} key={cook1.person.id}>
                <div className={classes.cook} onClick={() => this.showCookFullProfile(cook1)}>
                    <SupplyMiniProfile cookProfile={cook1} width={W} />
                </div>
                <div style={{ width: 10 }} />
                <div className={classes.cook} style={{visibility: cook2 ? 'visible' : 'hidden'}} onClick={() => this.showCookFullProfile(cook2)}>
                    <SupplyMiniProfile cookProfile={cook2 ? cook2 : cook1} width={W} />
                </div>
            </div>
        );
    }

    sortByFn = (valueFn, customerRequirement) => {
        return (a, b) => {
            const pa = valueFn(customerRequirement, a);
            const pb = valueFn(customerRequirement, b);
            return pa < pb ? -1 : (pa === pb ? 0 : 1);
        };
    };

    doesMatch = (cook, filters) => {
        const cookCuisines = cook.cuisines || [];
        const cookLanguages = cook.person.languages || [];
        const cookGenders = [cook.person.gender];
        const requestedCuisines = filters.cuisines || [];
        const requestedLanguages = filters.languages || [];
        let requestedGenders = filters.genders || [];
        if (requestedGenders.includes(GENDER_MALE) && requestedGenders.includes(GENDER_FEMALE)) {
            requestedGenders = [];      // Choosing both is the same as choosing neither
        }

        return requestedCuisines.every(x => cookCuisines.includes(x)) &&
            requestedLanguages.every(x => cookLanguages.includes(x)) &&
            requestedGenders.every(x => cookGenders.includes(x));
    };

    filterAndSortCooks = (cooks) => {
        const list = [];
        for (let i = 0; i < cooks.length; i++) {
            if (this.doesMatch(cooks[i], this.state.filters)) {
                list.push(cooks[i]);
            }
        }

        const customerRequirement = this.contextObj;
        const sortByPriceAsc = this.sortByFn(priceFn, customerRequirement);
        const sortByPriceDesc = (a, b) => -1 * sortByPriceAsc(a, b);
        const sortByRelevanceAsc = this.sortByFn(relevanceFn, customerRequirement);
        const sortByRelevanceDesc = (a, b) => -1 * sortByRelevanceAsc(a, b);

        let sortFn = null;
        if (this.state.sortBy === SORT_BY_PRICE) {
            sortFn = this.state.sortByPriceAsc ? sortByPriceAsc : sortByPriceDesc;
        } else {
            sortFn = this.state.sortByRelevanceDesc ? sortByRelevanceAsc : sortByRelevanceDesc;
        }
        list.sort(sortFn);

        cnsole.log('sorted list:', list);
        return list;
    };

    sortClickFn = () => {
        cnsole.log('sorting by price toggle');
        this.setState({ sortBy: SORT_BY_PRICE, sortByPriceAsc: !this.state.sortByPriceAsc });
    };
    filterClickFn = () => {
        this.toggleModal();
    };

    toggleModal = () => {
        this.setState({ filterModalOpen: !this.state.filterModalOpen });
    };
    closeModal = () => {
        this.setState({ filterModalOpen: false });
        document.body.style.overflow = 'auto';
    };
    disableScroll = () => {
        document.body.style.overflow = 'hidden';
    };
    filterModal = () => {
        const closeFn = () => this.closeModal();
        const doneFn = ({ cuisines, languages, genders }) => {
            const f = {};
            if (cuisines.length > 0) {
                f.cuisines = cuisines;
            }
            if (languages.length > 0) {
                f.languages = languages;
            }
            if (genders.length > 0) {
                f.genders = genders;
            }
            cnsole.log('filters now: ', f);
            this.setState({ filters: f });
            this.closeModal();
        };

        return (
            <Modal isOpen={this.state.filterModalOpen} onRequestClose={closeFn}
                   style={filterModalStyles} onAfterOpen={this.disableScroll} contentLabel="Example Modal">
                <AllFilters doneFn={doneFn} closeFn={closeFn} filters={this.state.filters} />
            </Modal>
        );
    };

    render() {
        const {classes} = this.props;

        const list = this.filterAndSortCooks(this.state.cookList);
        const array = [];
        for (let i = 0; i < list.length; i+=2) {
            const c1 = list[i];
            const c2 = i === list.length ? null : list[i+1];
            array.push(this.row(c1, c2));
        }

        const emptyCooksListSection = (
            <div className={classes.emptyCooksListSection}>
                There are no cooks matching these filters in your area at the moment. Try relaxing your requirements to only ones you regularly need.
                <br/>
                We are onboarding 100+ workers every week. You could check back, we might have someone matching your requirements. Just place your request for now.
            </div>
        );
        const cookListSection = Object.keys(this.state.filters) > 0 && list.length === 0 ? emptyCooksListSection : (
            <div className={classes.cookList}>
                {array}
            </div>
        );

        return (
            <Fragment>
                <Header />
                <div className={classes.root1}>
                    <div className={classes.root2}>
                        <div style={{ position: 'relative' }}>
                            {this.placeAutocompleteCtr()}
                        </div>
                        {this.sortFilterSection()}

                        {this.filterModal()}

                        <div className={classes.availableCooks}>
                            Available supply
                        </div>
                        {cookListSection}
                    </div>
                </div>

                <Footer/>
            </Fragment>
        );
    }
}

const W = 0.4 * INNER_WIDTH;
const INPUT_HEIGHT = 50;
const styles = theme => ({
    // Places autocomplete
    autocompleteCross: {
        position: 'absolute',
        left: 0.94 * INNER_WIDTH,
        top: INPUT_HEIGHT/2 - 5,
        zIndex: 10,
        elevation: 4,
    },
    autocompleteDiv: {
        width: 0.98 * INNER_WIDTH,
        zIndex: 10,
        border: '1px solid',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        backgroundColor: 'white',
    },
    locationSearchInput: {
        height: INPUT_HEIGHT,
        width: 0.90 * INNER_WIDTH,
        fontSize: 15,
        border: 0,
        outline: "none",
        marginLeft: 5,
    },
    autocompleteDropdownContainer: {
        backgroundColor: 'white',
    },
    suggestionItemActive: {
        margin: 10,
        backgroundColor: '#f0f0f0',
    },
    suggestionItem: {
        margin: 10,
    },
    suggestionSpan: {
        fontSize: 16,
        color: '#646464',
    },



    // Cook list
    root1: {
        width: '100%',
        fontFamily: 'Lato,Open Sans,Segoe UI,Helvetica,sans-serif',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },
    root2: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        verticalAlign: 'middle',
        alignItems: 'center',
    },

    sortAndFilterContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: 50,
        marginTop: 1,
        fontSize: 20,
    },
    sortContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        backgroundColor: SORT_FILTER_COLOR,

        borderLeft: '2px solid white',
        borderRight: '1px solid white',
    },
    sortImg: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    sortContent: {},
    filterContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        backgroundColor: SORT_FILTER_COLOR,

        // borderLeft: '0.5px solid white',
        borderRight: '2px solid white',
    },
    filterImg: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    filterContent: {
        marginRight: 5,
    },
    numFilters:{
        fontSize: 15,
        backgroundColor: NUM_FILTERS_BACKGROUND_COLOR,
        borderRadius: 10,
        height: 20,
        width: 20,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    availableCooks: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20,
        fontWeight: 400,
    },

    row: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
    },
    cook: {
        width: W,
        border: '1px solid',
        borderRadius: 3,
        borderColor: '#ababab',
    },
    cookList: {
    },
    emptyCooksListSection: {
        margin: 10,
    },

    errorMessage: {
        color: 'red',
        fontSize: 15,
        marginTop: 10,
        marginBottom: 10,
        height: 10,
    },
});
const filterModalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.75)",
    },
    content: {
        position: "absolute",
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
        border: "1px solid #ccc",
        background: "#fff",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: "4px",
        outline: "none",
        padding: "20px"
    },
};
export default withStyles(styles)(SearchProfilesWidget);
