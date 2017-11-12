import {ERROR, SIGN_IN, SIGN_UP} from "./types";
import {AsyncStorage} from 'react-native';
import {STORAGE_NAME, SERVER_URL} from "../common/consts";
import {setAccesToken} from "../helpers/AccessToken";
const AUTH_ERROR = "auth_error";


export function signIn(email, password, callback) {
    return function (dispatch) {

        fetch(`${SERVER_URL}/signIn`, {
            method: 'POST',
            timeout: 5000,
            body: JSON.stringify({
                email: email,
                password: password
            })
        }).then(response => {
            let message;
            if (response.ok) {
                return response.json()
            } else if (response.status === 401) {
                message = "Invalid email/password";
            } else {
                message = `Server responded with status ${response.status}`;
            }
            const error = Error(message);
            error.type = AUTH_ERROR;
            throw error;
        }).then((responseJson) => {
            setAccesToken(responseJson.token).then(() => {
                dispatch({
                    type: SIGN_IN,
                });
                callback();
            })
                .catch(() => {
                    dispatch({
                        type: ERROR,
                        payload: "An error has occurred during accessing the local storage."
                    });
                });
        }).catch((err) => {
            const message = err.type === AUTH_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: ERROR,
                payload: message
            });
        })
    }
}