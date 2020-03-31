import React from 'react';
import ReactDOM from 'react-dom';
import {routes} from './app';
import {BrowserRouter} from "react-router-dom";


const rootElement = document.getElementById('root');
ReactDOM.render(<BrowserRouter>{routes}</BrowserRouter>, rootElement);
