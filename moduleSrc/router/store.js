import {createStore} from 'redux';
import {reducerFn} from './reducers';


export const store = createStore(reducerFn);
