import {AUTH_ERROR, SIGN_IN, SIGN_OUT, SIGN_UP} from "./types";
import {AsyncStorage} from 'react-native';
import {STORAGE_NAME, SERVER_URL} from "../common/consts";
import {removeAccessToken, setAccesToken} from "../helpers/AccessToken";
import {createDeviceGuid, getDeviceGuid, saveDeviceGuid} from "../helpers/DeviceGuid";

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
                return getDeviceGuid();
            }).then((deviceGuid) => {
                if (!deviceGuid) {
                    return saveDeviceGuid(createDeviceGuid());
                }
                else {
                    return null;
                }
            })
                .then(callback)
                .catch(() => {
                    dispatch({
                        type: AUTH_ERROR,
                        payload: "An error has occurred during accessing the local storage."
                    });
                });
        }).catch((err) => {
            const message = err.type === AUTH_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: AUTH_ERROR,
                payload: message
            });
        })
    }
}

export function signOut(callback) {
    return (dispatch) => {
        removeAccessToken()
            .then(() => {
                dispatch({type: SIGN_OUT, payload: null});
                callback()
            });
    }
}