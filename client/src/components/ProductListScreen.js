import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';
import {delAccessToken, getAccessToken} from "../helpers/AccessToken";
import resetAction from '../actions/navigation/ResetAction';

export default class ProductListScreen extends Component {

    constructor(props) {
        super(props);
        this.navDispatch = this.props.navigation.dispatch;

        this.logOut = this.logOut.bind(this);
    }

    componentWillMount() {
        getAccessToken().then((token) => {
            if (!token) {
                this.navDispatch(resetAction("LoginScreen"));
            } else {
                console.log(`Logged in with tokien ${token}`);
            }
        });
    }

    logOut() {
        delAccessToken();
        this.navDispatch(resetAction("LoginScreen"));
    }

    render() {
        return (<View>
            <Text>It works!</Text>
            <Button
                title="Logout" onPress={this.logOut}/>
        </View>);
    }
}