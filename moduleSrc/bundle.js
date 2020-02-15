import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {reducerFn} from "./reducers";
import {BrowserRouter} from "react-router-dom";
import {routes} from './app';
import cnsole from 'loglevel';


function configureStore(preloadedState) {
    return createStore(
        reducerFn,
        preloadedState,
        applyMiddleware(
            thunkMiddleware
        )
    )
}

cnsole.log('hello from bundle.js');

// Create a fresh store
const store = configureStore();

render(
    <Provider store={store}>
        <BrowserRouter>
            {routes}
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
