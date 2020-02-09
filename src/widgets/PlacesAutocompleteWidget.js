import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {commonStyle} from "../styles/common";
import React from "react";
import {BANGALORE_LAT, BANGALORE_LNG} from "../constants/Constants";
import window from "global";
import {getCityFromResults, getStateFromResults, getSublocalityFromResults} from "../util/Util";


export default class PlacesAutocompleteWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            addressEntered: '',
            landmarkLat: null,
            landmarkLon: null,
        };
        this.inputRef = React.createRef();
        this.INNER_WIDTH = this.props.innerWidth || window.innerWidth;
    }

    clearAddress = () => {
        this.setState({ address: '', addressEntered: '', landmarkLat: null, landmarkLon: null });
    };
    handleChange = addressEntered => {
        this.setState({ addressEntered });
    };
    handleSelect = async (address) => {
        console.log('Address selected:', address);
        try {
            const results = await geocodeByAddress(address);
            console.log('geocode results: ', results);

            const latLng = await getLatLng(results[0]);
            console.log('Success: ', latLng);

            const area = getSublocalityFromResults(results);
            const city = getCityFromResults(results);
            const state = getStateFromResults(results);
            const obj = {
                latitude: latLng.lat,
                longitude: latLng.lng,
                landmarkLat: latLng.lat,
                landmarkLon: latLng.lng,
                zoom: 16,
                address: address,
                addressEntered: this.state.addressEntered,
                area,
                city,
                state,
            };
            this.props.onSelectFn(obj);
        } catch (e) {
            console.log('Error in geocoding: ', e);
        }
        if (this.inputRef.current) {
            this.inputRef.current.blur();
        }
    };

    render() {
        const { classes } = this.props;
        const searchOptions = this.props.searchOptions || {
            location: {lat: () => BANGALORE_LAT, lng: () => BANGALORE_LNG},
            radius: 50000,
        };
        const styles = this.getStyles();
        const placeholder = this.props.placeholder || '   Enter a nearby landmark ...';
        return (
            <div style={styles.root}>
                <PlacesAutocomplete
                    value={this.state.addressEntered}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    searchOptions={searchOptions}>

                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                            <div style={styles.autocompleteDiv}>
                                <input ref={this.inputRef} style={styles.locationSearchInput} autoFocus="true"
                                       {...getInputProps({
                                           placeholder,
                                       })}
                                />
                                <div style={styles.autocompleteDropdownContainer}>
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map(suggestion => {
                                        const className = suggestion.active ? styles.suggestionItemActive : styles.suggestionItem;
                                        // inline style for demonstration purpose
                                        const style = suggestion.active ? { ...className, cursor: 'pointer' } : { ...className, cursor: 'pointer' };
                                        return (
                                            <div
                                                {...getSuggestionItemProps(suggestion, {
                                                    className,
                                                    style,
                                                })}>
                                                <span style={styles.suggestionSpan}>{suggestion.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{...styles.autocompleteCross, ...commonStyle.notSelectableText}} onClick={this.clearAddress}>X</div>
                        </div>
                    )}
                </PlacesAutocomplete>
            </div>
        );
    }

    getStyles = () => ({
        root: {
            position: 'relative',
            height: INNER_HEIGHT,
            width: '100%',
        },

        autocompleteCross: {
            position: 'absolute',
            left: 0.90 * this.INNER_WIDTH,
            top: 4 + INPUT_HEIGHT/2,
            zIndex: 10,
            elevation: 4,
        },
        autocompleteDiv: {
            position: 'absolute',
            left: 0.05 * this.INNER_WIDTH,
            width: 0.9 * this.INNER_WIDTH,
            top: 10,
            zIndex: 10,
            border: '1px solid',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
            backgroundColor: 'white',
        },
        locationSearchInput: {
            height: INPUT_HEIGHT,
            width: 0.80 * this.INNER_WIDTH,
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
    });
}

const INNER_HEIGHT = 200;
const INPUT_HEIGHT = 50;
