import React from 'react';
import {StyleSheet, View, TouchableHighlight, Text} from 'react-native';
import {connect} from 'react-redux';

import ResetAction from '../actions/navigation/ResetAction';
import t from "tcomb-form-native";
import {signIn} from "../actions/AuthActions";

const Form = t.form.Form;

const EmailType = t.refinement(t.String, (text) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
});

const PasswordType = t.refinement(t.String, (text) => {
    return text && text.length > 4;
});

const User = t.struct({
    email: EmailType,
    password: PasswordType
});


const options = {
    auto: "placeholders",
    fields: {
        email: {
            error: "Insert a valid email",
            autoCorrect: false,
            autoCapitalize: "none"
        },
        password: {
            secureTextEntry: true,
            autoCorrect: false,
            autoCapitalize: "none",
            error: "Password has to have at least 4 characters"
        }
    }
};

const value = {
    email: "test2@test.com",
    password: "haslo"
};

class LoginScreen extends React.Component {

    constructor(props) {
        super(props);
        this.signIn = this.signIn.bind(this);
        this.form = null;
    }

    signIn() {
        const formContent = this.refs.form.getValue();
        if (formContent) {
            const {email, password} = formContent;
            const {navigation} = this.props;
            this.props.signIn(email, password, () => navigation.dispatch(ResetAction("ProductListScreen")));
        }
    }

    showError() {
        if (this.props.error) {
            return <Text style={styles.error}>{this.props.error}</Text>
        } else {
            return null;
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Log in</Text>
                    {this.showError()}
                    <Form
                        ref="form"
                        type={User}
                        options={options}
                        value={value}
                    />
                    <TouchableHighlight style={styles.button} onPress={this.signIn} underlayColor='#99d9f4'>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    formContainer: {
        width: "100%",
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
    },
    title: {
        fontSize: 30,
        alignSelf: 'center',
        marginBottom: 30
    },
    error: {
        fontSize: 15,
        alignSelf: 'center',
        marginBottom: 30,
        color: "red"
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    button: {
        height: 36,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    }
});


function mapStateToProps(state) {
    return {
        error: state.auth.error
    };
}

export default connect(mapStateToProps, {signIn})(LoginScreen);