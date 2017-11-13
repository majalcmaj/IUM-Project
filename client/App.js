import React, {Component} from 'react';
import {addNavigationHelpers, StackNavigator} from 'react-navigation';
import {Provider, connect} from 'react-redux';
import thunk from 'redux-thunk';
import {applyMiddleware, combineReducers, createStore} from 'redux';

import reducers from './src/reducers';
import LoginScreen from './src/components/LoginScreen';
import ProductListScreen from "./src/components/ProductListScreen";
import CreateProductScreen from "./src/components/CreateProductScreen";
import ProductScreen from "./src/components/ProductScreen";

const Navigator = StackNavigator({
    ProductListScreen: {screen: ProductListScreen},
    LoginScreen: {screen: LoginScreen},
    ProductScreen: {screen: ProductScreen},
    CreateProductScreen: {screen: CreateProductScreen}
});

const initialState = Navigator.router.getStateForAction(Navigator.router.getActionForPathAndParams('ProductListScreen'));

const navReducer = (state = initialState, action) => {
    const nextState = Navigator.router.getStateForAction(action, state);

    // Simply return the original `state` if `nextState` is null or undefined.
    return nextState || state;
};

const reducer = combineReducers({nav: navReducer, ...reducers});
const store = applyMiddleware(thunk)(createStore)(reducer);

class App extends Component {
    render() {
        return (
            <Navigator navigation={addNavigationHelpers({
                dispatch: this.props.dispatch,
                state: this.props.nav,
            })}/>
        );
    }
}

function mapStateToProps(state) {
    return {
        nav: state.nav
    }
}

const AppWithNavigationState = connect(mapStateToProps)(App);


export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <AppWithNavigationState/>
            </Provider>
        );
    }
}


