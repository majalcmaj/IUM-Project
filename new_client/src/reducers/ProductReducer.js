import {
    PRODUCT_LIST_ERROR, GET_ALL_PRODUCTS, GET_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT,
    CREATE_PRODUCT_ERROR, UPDATE_PRODUCT_ERROR, DELETE_PRODUCT_ERROR, DELETE_CURRENT_PRODUCT
} from "../actions/types";

export function productsReducer(state = {updateNo: 0}, action) {
    if (action) {
        switch (action.type) {
            case GET_ALL_PRODUCTS:
                state = {...state, products: action.payload}; break;
            case GET_PRODUCT:
            case UPDATE_PRODUCT:
            case CREATE_PRODUCT:
                state = {...state, currentProduct: action.payload, updateNo: state.updateNo + 1}; break;
            case DELETE_CURRENT_PRODUCT:
                state = {...state, currentProduct: null}; break;
            case PRODUCT_LIST_ERROR:
            case CREATE_PRODUCT_ERROR:
            case UPDATE_PRODUCT_ERROR:
            case DELETE_PRODUCT_ERROR:
                state = {...state, error: action.payload}; break;
        }
    }
    return state;
}
