import realm from '../persistence';
import axios from 'axios';
import {SERVER_URL} from "../common/consts";
import {getAccessToken} from "../helpers/AccessToken";
import _ from 'lodash';
import {GET_ALL_PRODUCTS, PRODUCTS_SYNCHRONIZED, SYNC_ERROR} from "./types";
import {getDeviceGuid} from "../helpers/DeviceGuid";

function createAxiosInstance() {
    return getAccessToken().then(accessToken => {
        const instance = axios.create();
        instance.defaults.timeout = 2500;
        instance.defaults.headers.common['authorization'] = accessToken;
        return instance;
    })
}

function createProduct(product) {
    realm.write(() => {
        if (!product.hasOwnProperty("localAmountDelta")) {
            product.localAmountDelta = 0;
        }

        if (!product.hasOwnProperty("deltaModified")) {
            product.deltaModified = false;
        }
        const toWriteProduct = {
            _id: product._id,
            name: product.name,
            store: product.store,
            price: product.price,
            amount: product.amount,

            created: false,
            deleted: false,
            localAmountDelta: product.localAmountDelta,
            deltaModified: product.deltaModified
        };
        realm.create("Product", toWriteProduct);
    });
}

function mergeWithPossibleDuplicate(newlyCreatedOnDevice, product) {
    const duplicatedProduct = _.find(newlyCreatedOnDevice, created => created.name === product.name);
    if (duplicatedProduct) {
        realm.write(() => {
            product.deltaModified = duplicatedProduct.deltaModified;
            product.localAmountDelta = duplicatedProduct.localAmountDelta;
            realm.delete(duplicatedProduct);
        });
    }
    return product;
}

function incorporateRemoteChanges(response) {
    const productsOnServer = _.keyBy(response.data, "_id");
    const notNewlyCreatedOnDevice = _.keyBy(realm.objects("Product").filtered("created = false"), "_id");
    const newlyCreatedOnDevice = _.keyBy(realm.objects("Product").filtered("created = true"), "_id");
    const keysOnServer = _.keys(productsOnServer);
    const keysOnDeviceNNC = _.keys(notNewlyCreatedOnDevice);
    const toAddKeys = _.difference(keysOnServer, keysOnDeviceNNC);

    toAddKeys.forEach(toAddKey => {
        let product = productsOnServer[toAddKey];
        product = mergeWithPossibleDuplicate(newlyCreatedOnDevice, product);
        createProduct(product);
    });

    const toRemoveKeys = _.difference(keysOnDeviceNNC, keysOnServer);
    toRemoveKeys.forEach(toRemoveKey => {
        realm.write(() => realm.delete(notNewlyCreatedOnDevice[toRemoveKey]))
    });

    _.forOwn(productsOnServer, (product) => {
        const productLocal = realm.objectForPrimaryKey("Product", product._id);
        if (productLocal.amount !== product.amount) {
            realm.write(() => {
                productLocal.amount = product.amount;
            })
        }
    });

    return Promise.resolve();
}

function deleteLocallyDeletedFromServer(axiosInst) {
    return () => {
        const deletedProducts = Array.from(realm.objects("Product").filtered("deleted = true"));
        return Promise.all(_.map(
            deletedProducts,
            (toDelProd) => axiosInst.delete(`${SERVER_URL}/product/${toDelProd._id}`))
        );
    }
}

function applyDels(deletedArray) {
    if (deletedArray) {
        deletedArray.forEach((deletedProduct) => {
            realm.write(() => {
                const toDelProd = realm.objectForPrimaryKey("Product", deletedProduct.data._id);
                realm.delete(toDelProd);
            });
        });
    }
}

function createLocallyCreatedOnServer(axiosInst, deviceGuid) {
    return function () {
        const createdProductsArray = Array.from(realm.objects("Product").filtered("created = true"));
        return Promise.all(_.map(createdProductsArray, toCreateProd => {
            toCreateProd.deviceGuid = deviceGuid;
            return axiosInst.post(`${SERVER_URL}/product`, toCreateProd)
        }));
    }
}

function applyAdds(createdArray) {
    if (createdArray) {
        createdArray.forEach((created) => {
            const createdProd = realm.objectForPrimaryKey("Product", created.data._id);
            realm.write(() => {
                createdProd.created = false;
                createdProd.deltaModified = false;
            })
        });
    }
    return Promise.resolve();
}

function sendLocalDeltasToServer(axiosInst, deviceGuid) {
    return () => {
        const modifiedProducts = Array.from(realm.objects("Product").filtered("deltaModified = true"));
        return Promise.all(modifiedProducts.map((product) => {
            return axiosInst.put(`${SERVER_URL}/product/${product._id}/delta`, {
                deviceGuid,
                localAmountDelta: product.localAmountDelta
            })
        }));
    }
}

function updateLocalProductCounts(updatedProducts) {
    updatedProducts.forEach((productSrv) => {
        const prodDb = realm.objectForPrimaryKey("Product", productSrv.data._id);
        realm.write(() => {
            prodDb.deltaModified = false;
            prodDb.amount = productSrv.data.amount;
        })
    });
    return Promise.resolve();
}

function handleDeltasRejection(error) {
    if(!error.response) {
        throw Error(error);
    }
    const { response } = error;
    if(response.status === 422) {
        const product = realm.objectForPrimaryKey("Product", response.data._id);
        throw Error(
            `Could not set the wanted value, because the amount of product on server would be less than 0.
To synchronize set count of product ${product.name} to ${product.amount + response.data.increaseDelta}`);
    }else {
        throw Error(`Request failed with status ${response.status}`);
    }
}

export function startSynchronization() {
    return (dispatch) => {
        Promise.all([createAxiosInstance(), getDeviceGuid()]).then(axiosAndGuid => {
            const axiosInst = axiosAndGuid[0];
            const deviceGuid = axiosAndGuid[1];

            axiosInst.get(`${SERVER_URL}/product`)
                .then(incorporateRemoteChanges)
                .then(deleteLocallyDeletedFromServer(axiosInst))
                .then(applyDels)
                .then(createLocallyCreatedOnServer(axiosInst, deviceGuid))
                .then(applyAdds)
                .then(sendLocalDeltasToServer(axiosInst, deviceGuid)).catch(handleDeltasRejection)
                .then(updateLocalProductCounts)
                .then(() => dispatch({type: PRODUCTS_SYNCHRONIZED, payload: realm.objects("Product")}))
                .catch((error) => {
                    const message = `Synchronization failed with error:\n${error.message}`;
                    dispatch({type: SYNC_ERROR, payload: message})
                });
        });
    }
}
