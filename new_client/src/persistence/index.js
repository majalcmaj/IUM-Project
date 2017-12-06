import Realm from 'realm';

class Product extends Realm.Object {}
Product.schema = {
    name: 'Product',
    primaryKey: "_id",
    properties: {
        _id: "string",
        name: {type: "string", optional: false, indexed: true},
        store: "string",
        price: "int",
        amount: "int",

        created: "bool",
        deleted: "bool",
        localAmountDelta: "int"
    },
};

export default new Realm({schema: [Product]});