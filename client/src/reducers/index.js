import {LOCAL_STORAGE_ERROR, SIGN_UP} from "../actions/types";

function authReducer(state = {}, action) {
    switch(action.type) {
        case SIGN_UP:
            return {...state, authenticated: true};

        case LOCAL_STORAGE_ERROR:
            return {...state, error: action.payload};
        default:
            return state;
    }
}

export default {
    auth: authReducer
}