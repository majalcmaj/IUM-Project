import {SERVER_URL} from "../common/consts";
import {
    CREATE_PRODUCT, CREATE_PRODUCT_ERROR, DELETE_PRODUCT_ERROR, GET_ALL_PRODUCTS, GET_PRODUCT, GET_PRODUCT_ERROR,
    PRODUCT_LIST_ERROR, UPDATE_PRODUCT
} from "./types";
import {getAccessToken} from "../helpers/AccessToken";

const SERVER_ERROR = "server_error";

export function getAllProducts() {
    return function (dispatch) {
        getAccessToken().then(token => {
            const headers = new Headers({authorization: token});
            return fetch(`${SERVER_URL}/product`, {
                method: 'GET',
                timeout: 5000,
                headers
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            const error = Error(`Server returned with status ${response.status}`);
            error.type = SERVER_ERROR;
            throw error;
        }).then((responseJson) => {
            dispatch({
                type: GET_ALL_PRODUCTS,
                payload: responseJson
            });
        }).catch((err) => {
            const message = err.type === SERVER_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: PRODUCT_LIST_ERROR,
                payload: message
            });
        })
    }
}

export function getProduct(productId) {
    return function (dispatch) {
        getAccessToken().then(token => {
            const headers = new Headers({authorization: token});
            return fetch(`${SERVER_URL}/product/${productId}`, {
                method: 'GET',
                timeout: 5000,
                headers
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            const error = Error(`Server returned with status ${response.status}`);
            error.type = SERVER_ERROR;
            throw error;
        }).then((responseJson) => {
            dispatch({
                type: GET_PRODUCT,
                payload: responseJson
            });
        }).catch((err) => {
            const message = err.type === SERVER_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: GET_PRODUCT_ERROR,
                payload: message
            });
        })
    }
}

export function createProduct(productData, callback) {
    return function (dispatch) {
        getAccessToken().then(token => {
            const headers = new Headers({authorization: token});
            return fetch(`${SERVER_URL}/product`, {
                method: 'POST',
                timeout: 5000,
                headers,
                body: JSON.stringify(productData)
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            const error = Error(`Server returned with status ${response.status}`);
            error.type = SERVER_ERROR;
            throw error;
        }).then((responseJson) => {
            dispatch({
                type: CREATE_PRODUCT,
                payload: responseJson
            });
            callback();
        }).catch((err) => {
            const message = err.type === SERVER_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: CREATE_PRODUCT_ERROR,
                payload: message
            });
        })
    }
}

export function increaseProductCount(product, byCount) {
    return function (dispatch) {
        getAccessToken().then(token => {
            const headers = new Headers({authorization: token});
            return fetch(`${SERVER_URL}/product/${product._id}/amount`, {
                method: 'PUT',
                timeout: 5000,
                headers,
                body: JSON.stringify({
                    increase_by: byCount
                })
            })
        }).then(response => {
            let message = null;
            if (response.ok) {
                return response.json()
            } else if (response.status === 422) {
                message = "The amount has to be greater than 0";
            } else {
                message = `Server returned with status ${response.status}`;
            }
            const error = Error(message);
            error.type = SERVER_ERROR;
            throw error;
        }).then((responseJson) => {
            dispatch({
                type: UPDATE_PRODUCT,
                payload: responseJson
            });
        }).catch((err) => {
            const message = err.type === SERVER_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: GET_PRODUCT_ERROR,
                payload: message
            });
        })
    }
}

export function removeProduct(product, callback) {
    return function (dispatch) {
        getAccessToken().then(token => {
            const headers = new Headers({authorization: token});
            return fetch(`${SERVER_URL}/product/${product._id}`, {
                method: 'DELETE',
                timeout: 5000,
                headers
            })
        }).then(response => {
            let message = null;
            if (response.ok) {
                callback();
            }
            const error = Error(`Server returned with status ${response.status}`);
            error.type = SERVER_ERROR;
            throw error;
        }).catch((err) => {
            const message = err.type === SERVER_ERROR ? err.message : "There was a problem connecting to server.";
            dispatch({
                type: DELETE_PRODUCT_ERROR,
                payload: message
            });
        })
    }
}

export function setAsCurrentProduct(product) {
    return {
        type: GET_PRODUCT,
        payload: product
    }
}

