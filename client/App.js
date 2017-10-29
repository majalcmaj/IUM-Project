import React from 'react';
import {StackNavigator} from 'react-navigation';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {applyMiddleware, combineReducers, createStore} from 'redux';

import reducers from './src/reducers';
import LoginScreen from './src/components/LoginScreen';

const reducer = combineReducers(reducers);
const store = applyMiddleware(thunk)(createStore)(reducer);

const Navigator = StackNavigator({
    LoginScreen: {screen: LoginScreen},
});

export default function () {
    return (
        <Provider store={store}>
            <Navigator />
        </Provider>
    );
}

