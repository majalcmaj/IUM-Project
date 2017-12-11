import {AsyncStorage} from 'react-native';
import {STORAGE_NAME} from "../common/consts";

export function setAccesToken (token) {
    return AsyncStorage.setItem(`${STORAGE_NAME}:token`, token);
}

export function getAccessToken() {
    return AsyncStorage.getItem(`${STORAGE_NAME}:token`);
}

export function removeAccessToken() {
    return AsyncStorage.removeItem(`${STORAGE_NAME}:token`);
}

