import {PRODUCT_LIST_ERROR, GET_ALL_PRODUCTS, GET_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT} from "../actions/types";

export function productsReducer(state = {}, action) {
    if(action) {
        switch(action.type) {
            case GET_ALL_PRODUCTS:
                return {...state, products: action.payload};
            case GET_PRODUCT:
            case UPDATE_PRODUCT:
            case CREATE_PRODUCT:
                return {...state, currentProduct: action.payload};
            case PRODUCT_LIST_ERROR:
                return {...state, error: action.payload};
        }
    }
    return state;
}
