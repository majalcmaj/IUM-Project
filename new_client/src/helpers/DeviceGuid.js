import {AsyncStorage} from 'react-native';
import {STORAGE_NAME, DEVICE_GUID_KEY} from "../common/consts";
import uuid from 'uuid/v4';

export function createDeviceGuid() {
    return uuid();
}

export function saveDeviceGuid (guid) {
    return AsyncStorage.setItem(`${STORAGE_NAME}:${DEVICE_GUID_KEY}`, guid);
}

export function getDeviceGuid() {
    return AsyncStorage.getItem(`${STORAGE_NAME}:${DEVICE_GUID_KEY}`);
}

export function removeDeviceGuid() {
    return AsyncStorage.removeItem(`${STORAGE_NAME}:${DEVICE_GUID_KEY}`);
}
