import {
    CREATE_PRODUCT,
    CREATE_PRODUCT_ERROR,
    DELETE_CURRENT_PRODUCT,
    DELETE_PRODUCT_ERROR,
    GET_ALL_PRODUCTS,
    GET_PRODUCT,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_ERROR
} from "./types";
import realm from '../persistence';

const SERVER_ERROR = "server_error";

export function getAllProducts() {
    return {
        type: GET_ALL_PRODUCTS,
        payload: Array.from(realm.objects("Product").filtered("deleted = false"))
    };
}

export function getProduct(productId) {
    return {
        type: GET_PRODUCT,
        payload: realm.objects("Product").filtered(`_id = "${productId}"`)[0]
    };
}

export function createProduct(productData, callback) {
    return function (dispatch) {
        try {
            const newProduct = {
                _id: generateMongoID(),
                name: productData.name,
                store: productData.store,
                price: productData.price,
                amount: 0,

                created: true,
                deleted: false,
                localAmountDelta: 0
            };
            let createdProduct = null;
            realm.write(() => {
                createdProduct = realm.create('Product', newProduct);
            });
            dispatch({
                type: CREATE_PRODUCT,
                payload: createdProduct
            });
            callback(createdProduct);
        } catch (e) {
            dispatch({type: CREATE_PRODUCT_ERROR, payload: `Failed to add product to database: ${e}}`});
        }
    }
}

export function increaseProductCount(product, byCount) {
    return function (dispatch) {
        try {
            if (product.amount + byCount > 0) {
                realm.write(() => {
                    product.amount += byCount;
                    product.localAmountDelta += byCount;
                    if (!product.deltaModified) {
                        product.deltaModified = true;
                    }
                });
                dispatch({type: UPDATE_PRODUCT, payload: product});
            } else {
                dispatch({type: UPDATE_PRODUCT_ERROR, payload: "The amount of products cannot be below 0!"});
            }
        } catch (e) {
            dispatch({type: UPDATE_PRODUCT_ERROR, payload: `Failed to update product in database: ${e}}`});
        }
    }
}

export function removeProduct(product, callback) {
    return function (dispatch) {
        try {
            realm.write(() => {
                product.deleted = true;
            });
            dispatch({type: DELETE_CURRENT_PRODUCT, payload: product});
            callback();
        } catch (e) {
            dispatch({type: DELETE_PRODUCT_ERROR, payload: `Failed to update product in database: ${e}}`});
        }
    }
}

export function setAsCurrentProduct(product) {
    return {
        type: GET_PRODUCT,
        payload: product
    }
}

function generateMongoID() {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}
