import React from 'react';
import {Button, Text, View, AsyncStorage, TextInput} from 'react-native';
import {connect} from 'react-redux';

import {signIn} from "../actions/index";

import styles from '../styles/Styles';
import {STORAGE_NAME} from "../consts";

class LoginScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {token: "", email: "", password: ""};
        this.signIn = this.signIn.bind(this);
    }

    signIn() {
        AsyncStorage.getItem(`${STORAGE_NAME}:token`)
            .then(token => {
            this.setState({token: token})
        }).catch(err => {
            this.setState({error: err});
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <TextInput style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}} onChangeText={email => this.setState({email})} value={this.state.email} defaultValue="Username"/>
                <TextInput style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}} onChangeText={password => this.setState({password})} value={this.state.password} defaultValue="Password"/>
                <Button title="auth!" onPress={this.props.signIn}/>
                <Button title="Get token!" onPress={this.signIn}/>
                <Text>{this.props.auth.authenticated === true ? "Auth'd" : "Not authenticated!"}</Text>
                <Text>Token: {this.state.token}</Text>
                <Text>Error: {this.state.error}</Text>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {auth: state.auth};
}

export default connect(mapStateToProps, {signIn})(LoginScreen);