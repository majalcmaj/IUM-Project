import {AUTH_ERROR, SIGN_IN} from "../actions/types";

export function authReducer(state = {}, action) {
    if(action) {
        switch(action.type) {
            case SIGN_IN:
                return {...state, authenticated: true, error: null};
            case AUTH_ERROR:
                return {...state, error: action.payload};
        }
    }
    return state;
}
