import {AUTH_ERROR, LOCAL_STORAGE_ERROR, SIGN_UP} from "./types";
import {AsyncStorage} from 'react-native';
import {STORAGE_NAME, SERVER_URL} from "../consts";

export function signIn() {
    return function (dispatch) {

        fetch(`${SERVER_URL}/signIn`, {
            method: 'POST',
            body: JSON.stringify({
                email: "test2@test.com",
                password: "haslo"
            })
        }).then(response => response.json())
            .then((responseJson) => {
                AsyncStorage.setItem(`${STORAGE_NAME}:token`, responseJson.token)
                    .then(() => {
                        dispatch({
                            type: SIGN_UP,
                        });
                    })
                    .catch(() => {
                        dispatch({
                            type: LOCAL_STORAGE_ERROR,
                            payload: "An error has occurred during accessing the local storage."
                        });
                    });
            })
            .catch(() => {
                dispatch({
                    type: AUTH_ERROR,
                    payload: "Could not sign in with given credentials."
                });
            })
    }
}