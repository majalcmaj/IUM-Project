
import {authReducer} from "./AuthReducer";
import {productsReducer} from "./ProductReducer";
import {syncReducer} from "./SyncReducer";

export default {
    auth: authReducer,
    products: productsReducer,
    sync: syncReducer
}