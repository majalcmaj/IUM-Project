import {PRODUCTS_SYNCHRONIZED, SYNC_ERROR} from "../actions/types";

export function syncReducer(state = {synchronized: false}, action) {
    if (action) {
        switch (action.type) {
            case PRODUCTS_SYNCHRONIZED:
                state = {synchronized: true};
                break;
            case SYNC_ERROR:
                state = {synchronized: false, error: action.payload};
                break;
        }
    }
    return state;
}
