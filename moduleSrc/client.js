import React from 'react';
import {hydrate, render} from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducerFn} from './reducers';
import {BrowserRouter} from "react-router-dom";
import {routes} from './app';
import window from "global/window";
import document from "global/document";


console.log('Hello from client.js');

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

// Create Redux store with initial state
const store = createStore(reducerFn, preloadedState);

const element = (
    <Provider store={store}>
        <BrowserRouter>
            {routes}
        </BrowserRouter>
    </Provider>
);
const rootElement = document.getElementById('root');

// NOTE: For testing only
// window.alert('IS_MOBILE_SCREEN ' + IS_MOBILE_SCREEN);

if (window.__HYDRATE_OR_RENDER__ === 'render') {
    console.log('Rendering');
    render(element, rootElement);
} else {
    console.log('Hydrating');
    hydrate(element, rootElement);
}
