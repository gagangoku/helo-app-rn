import React, {Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import GoogleMapReact from 'google-map-react';
import {BANGALORE_LAT, BANGALORE_LNG, GOOGLE_MAPS_API_KEY, MAP_CENTER_PIN_IMG} from "../../constants/Constants";
import PlacesAutocomplete, {geocodeByAddress, getLatLng,} from 'react-places-autocomplete';
import {fabButton, getCtx, haversineDistanceKms, latLonFn} from "../../util/Util";
import {commonStyle} from "../../styles/common";
import {confirmAlert} from 'react-confirm-alert';
import {Helmet} from "react-helmet";
import window from "global/window";
import {WINDOW_INNER_HEIGHT, WINDOW_INNER_WIDTH} from "../../platform/Util";


class LocationInputScreen extends React.Component {
    static URL = '/location-input';

    constructor(props) {
        super(props);

        this.contextObj = getCtx(this);
        this.state = {
            latitude: BANGALORE_LAT - 1,
            longitude: BANGALORE_LNG - 1,
            zoom: 13,

            area: '',
            city: '',
            address: '',
            addressEntered: '',
            landmarkLat: null,
            landmarkLon: null,

            mapReady: false,
            boundsChanged: 0,

            gpsLat: null,
            gpsLon: null,
        };
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        const gpsLatitude = this.props.gpsLatitude || this.contextObj.gpsLatitude;
        const gpsLongitude = this.props.gpsLongitude || this.contextObj.gpsLongitude;

        const setFn = (lat, lon) => this.setState({ latitude: lat, longitude: lon, zoom: 15, gpsLat: lat, gpsLon: lon });
        if (gpsLatitude && gpsLongitude) {
            console.log('Got current position from url params:', gpsLatitude, gpsLongitude);
            setTimeout(() => setFn(gpsLatitude, gpsLongitude), 500);
        } else {
            navigator.geolocation.getCurrentPosition((position => {
                console.log('Got current gps position:', position);
                setFn(position.coords.latitude, position.coords.longitude);
            }));
        }
    }

    mapReady = () => {
        console.log('Map ready');
        this.setState({ mapReady: true });
    };
    clearAddress = () => {
        this.setState({ address: '', addressEntered: '', landmarkLat: null, landmarkLon: null });
    };
    handleChange = address => {
        this.setState({ address });
    };
    handleSelect = async (address) => {
        console.log('Address selected:', address);
        try {
            const results = await geocodeByAddress(address);
            console.log('geocode results: ', results);

            const latLng = await getLatLng(results[0]);
            console.log('Success: ', latLng);
            this.setState({
                latitude: latLng.lat,
                longitude: latLng.lng,
                landmarkLat: latLng.lat,
                landmarkLon: latLng.lng,
                zoom: 16,
                address: address,
                addressEntered: address,
                area: this._getSublocality(results),
                city: this._getCity(results),
            });
        } catch (e) {
            console.log('Error in geocoding: ', e);
        }
        this.inputRef.current.blur();
    };

    gotoLatLon = (latitude, longitude) => {
        console.log('Moving to: ', latitude, longitude);
        if (latitude !== null && longitude !== null) {
            this.setState({ latitude, longitude });
        }
    };

    _getSublocality = (results) => {
        const loc = results[0]['address_components'];
        for (let i = 0; i < loc.length; i++) {
            if ('types' in loc[i] && loc[i]['types'].includes('sublocality')) {
                console.log('sublocality:', loc[i]['long_name']);
                return loc[i]['long_name'];
            }
        }
        return 'not_found';
    };

    _getCity = (results) => {
        const loc = results[0]['address_components'];
        for (let i = 0; i < loc.length; i++) {
            if ('types' in loc[i] && loc[i]['types'].includes('locality')) {
                console.log('city:', loc[i]['long_name']);
                return loc[i]['long_name'];
            }
        }
        return 'not_found';
    };

    onBoundsChange = (center, zoom) => {
        console.log('Bounds change:', center, zoom, this.state.mapReady);
        if (this.state.mapReady) {
            this.setState({ latitude: center.lat, longitude: center.lng, zoom: zoom });
        }
        this.inputRef.current.blur();
    };
    onDone = () => {
        console.log('Done: ', this.state);

        if (!this.state.landmarkLat) {
            window.alert('Please enter a landmark !');
            return;
        }

        const distKm = haversineDistanceKms(latLonFn(this.state.latitude, this.state.longitude), latLonFn(this.state.landmarkLat, this.state.landmarkLon));
        const thresh = DISTANCE_THRESHOLD_LANDMARK_METERS / 1000.0;
        console.log('distance from landmark, threshold: ', distKm, thresh);

        const confirm = () => {
            this.inputRef.current.blur();
            this.props.onSubmitFn(this.state);
        };

        if (distKm > thresh) {
            confirmAlert({
                title: 'Is this your exact home location ?',
                message: 'The landmark you entered is more than ' + DISTANCE_THRESHOLD_LANDMARK_METERS + ' meters away. Your exact location and landmark will make coordination easier.',
                buttons: [{
                    label: 'I WILL CHANGE IT',
                    onClick: () => {
                    },
                }, {
                    label: 'IT\'S CORRECT',
                    onClick: confirm,
                }],
            });
        } else {
            confirm();
        }
    };

    render() {
        const {classes} = this.props;

        const searchOptions = {
            location: {lat: () => BANGALORE_LAT, lng: () => BANGALORE_LNG},
            radius: 50000,
        };
        return (
            <Fragment>
                    <Helmet>
                        <title>Enter location</title>
                    </Helmet>
                    <div className={classes.root}>
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
                                                const style = suggestion.active
                                                    ? { cursor: 'pointer' }
                                                    : { cursor: 'pointer' };
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

                        <GoogleMapReact
                            bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                            center={{ lat: this.state.latitude, lng: this.state.longitude }}
                            zoom={this.state.zoom}
                            defaultOptions={{ fullscreenControl: false }}
                            onGoogleApiLoaded={this.mapReady}
                            onBoundsChange={this.onBoundsChange}>

                            <div lat={this.state.gpsLat} lng={this.state.gpsLon} className={classes.currentLocation} />
                        </GoogleMapReact>

                        <div className={classes.showCurrentLocationMarker} onClick={() => this.gotoLatLon(this.state.gpsLat, this.state.gpsLon)}>
                            <img alt="location" src={SHOW_CURRENT_LOCATION_MARKER} style={{ height: 30, width: 30 }} />
                        </div>
                        <div className={classes.mapCenterMarker}>
                            <img alt="pin" src={MAP_CENTER_PIN_IMG} className={classes.mapCenterPinImg} />
                        </div>

                    </div>
                {fabButton('DONE', this.onDone)}
            </Fragment>
        );
    }
}

const INNER_WIDTH = WINDOW_INNER_WIDTH;
const INNER_HEIGHT = WINDOW_INNER_HEIGHT;
const SHOW_CURRENT_LOCATION_MARKER = 'https://images-lb.heloprotocol.in/26.png-2816-792530-1552576482116.png?name=current-location.png';

const DISTANCE_THRESHOLD_LANDMARK_METERS = 500.0;                   // location should not be more than 500 meters from landmark
const INPUT_HEIGHT = 50;
const styles = theme => ({
    // Important! Always set the container height explicitly
    root: {
        position: 'relative',
        height: INNER_HEIGHT,
        width: '100%',
    },
    mapCenterPinImg: {
        height: 40,
        width: 40,
    },
    mapCenterMarker: {
        position: 'absolute',
        // NOTE: The 4,8 adjustment is needed, don't know why. DONT MESS WITH IT !
        left: 0.5 * INNER_WIDTH - 20 + 4,
        top: 0.5 * INNER_HEIGHT - 20 - 8,
        height: 40,
        width: 40,
        zIndex: 10,
    },

    autocompleteCross: {
        position: 'absolute',
        left: 0.90 * INNER_WIDTH,
        top: 4 + INPUT_HEIGHT/2,
        zIndex: 10,
        elevation: 4,
    },
    autocompleteDiv: {
        position: 'absolute',
        left: 0.05 * INNER_WIDTH,
        width: 0.9 * INNER_WIDTH,
        top: 10,
        zIndex: 10,
        border: '1px solid',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        backgroundColor: 'white',
    },
    locationSearchInput: {
        height: INPUT_HEIGHT,
        width: 0.80 * INNER_WIDTH,
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

    doneButtonText: {
    },
    currentLocation: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#5357e6',
        borderColor: 'white',
        zIndex: 10,
    },
    showCurrentLocationMarker: {
        height: 30,
        width: 30,
        zIndex: 10,
        position: 'fixed',
        bottom: '10%',
        left: '5%',
    },
});
export default withStyles(styles)(LocationInputScreen);
