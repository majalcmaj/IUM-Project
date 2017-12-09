import realm from '../persistence';
import axios from 'axios';
import {SERVER_URL} from "../common/consts";
import {getAccessToken} from "../helpers/AccessToken";
import _ from 'lodash';
import {GET_ALL_PRODUCTS, PRODUCTS_SYNCHRONIZED, SYNC_ERROR} from "./types";

function createAxiosInstance() {
    return getAccessToken().then(accessToken => {
        const instance = axios.create();
        instance.defaults.timeout = 2500;
        instance.defaults.headers.common['authorization'] = accessToken;
        return instance;
    })
}

export function startSynchronization() {
    return (dispatch) => {
        createAxiosInstance().then(axiosInst => {
            const toDelPromise = axiosInst.get(`${SERVER_URL}/product`)
                .then((response) => {
                    const productsOnServer = _.keyBy(response.data, "_id");
                    const notNewlyCreatedOnDevice = _.keyBy(realm.objects("Product").filtered("created = false"), "_id");
                    const newlyCreatedOnDevice = _.keyBy(realm.objects("Product").filtered("created = true"), "_id");
                    const keysOnServer = _.keys(productsOnServer);
                    const keysOnDeviceNNC = _.keys(notNewlyCreatedOnDevice);
                    const toAddKeys = _.difference(keysOnServer, keysOnDeviceNNC);

                    toAddKeys.forEach(toAddKey => {
                        const product = productsOnServer[toAddKey];
                        const duplicatedProduct = _.find(newlyCreatedOnDevice, created => created.name === product.name);
                        realm.write(() => {
                            let localAmountDelta = 0;
                            let deltaModified = false;
                            if (duplicatedProduct) {
                                if (duplicatedProduct.deltaModified) {
                                    deltaModified = true;
                                    localAmountDelta = duplicatedProduct.localAmountDelta;
                                }
                                realm.delete(duplicatedProduct);
                            }
                            const toWriteProduct = {
                                _id: product._id,
                                name: product.name,
                                store: product.store,
                                price: product.price,
                                amount: product.amount,

                                created: false,
                                deleted: false,
                                localAmountDelta,
                                deltaModified
                            };
                            realm.create("Product", toWriteProduct);
                        });
                    });

                    const toRemoveKeys = _.difference(keysOnDeviceNNC, keysOnServer);
                    toRemoveKeys.forEach(toRemoveKey => {
                        realm.write(() => realm.delete(notNewlyCreatedOnDevice[toRemoveKey]))
                    });

                    // What with created and deleted locally? - Should be deleted earlier!
                    const deletedProductsArray = Array.from(realm.objects("Product").filtered("deleted = true"));
                    return Promise.all(_.map(deletedProductsArray, (toDelProd) => axiosInst.delete(`${SERVER_URL}/product/${toDelProd._id}`)));
                });
            const createdPromise = toDelPromise.then((deletedArray) => {
                    if (deletedArray) {
                        deletedArray.forEach((deletedProduct) => {
                            realm.write(() => {
                                const toDelProd = realm.objectForPrimaryKey("Product", deletedProduct.data._id);
                                realm.delete(toDelProd);
                            });
                        });
                        const createdProductsArray = Array.from(realm.objects("Product").filtered("created = true"));
                        return Promise.all(_.map(createdProductsArray, (toCreateProd) => axiosInst.post(`${SERVER_URL}/product`, toCreateProd)));
                    }
                }
            ).catch(error => {
                console.log(error);
                dispatch({type: SYNC_ERROR, payload: error});
            });
            createdPromise.then((createdArray) => {
                if(createdArray) {
                    createdArray.forEach((created) => {
                        const createdProd = realm.objectForPrimaryKey("Product", created.data._id);
                        realm.write(() => {
                            createdProd.created = false;
                        })
                    });
                }
                dispatch({type: PRODUCTS_SYNCHRONIZED, payload: realm.objects("Product")});
            }).catch((error) => {
                console.log(error);
                return dispatch({type: SYNC_ERROR, payload: error});
            });
        })
    }
}
