import {AUTH_ERROR, SIGN_IN, SIGN_OUT} from "../actions/types";

export function authReducer(state = {}, action) {
    if(action) {
        switch(action.type) {
            case SIGN_IN:
                return {...state, authenticated: true, error: null};
            case SIGN_OUT:
                return {...state, authenticated: false, error: null};
            case AUTH_ERROR:
                return {...state, error: action.payload};
        }
    }
    return state;
}
