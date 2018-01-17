const Product = require('../models/product');
const _ = require('lodash');

function findProductById(req, res, next, whenFound) {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(422).send({error: "Wrong id format"});
    }

    Product.findById(id, function (err, existingProduct) {
            if (err) {
                return next(err);
            }
            else if (!existingProduct) {
                return res.status(404).send();
            } else if (String(req.user._id) !== String(existingProduct.user)) {
                return res.status(403).send();
            } else {
                return whenFound(existingProduct);
            }
        }
    );
}

module.exports.getById = function (req, res, next) {
    findProductById(req, res, next, function (product) {
        return res.send(product);
    });
};

module.exports.updateAmount = function (req, res, next) {
    findProductById(req, res, next, function (product) {
        const increaseBy = parseInt(req.body.increase_by);
        let amount = product.amount;
        if (!amount) {
            amount = 0
        }
        if (product.amount + increaseBy < 0) {
            return res.status(422).send({error: "Amount cannot drop below 0."});
        }
        amount += increaseBy;
        product.amount = amount;
        product.save(function (err, savedProduct) {
            if (err) {
                return next(err);
            }
            else {
                return res.status(200).send(savedProduct);
            }
        });
    });
};

module.exports.updateDelta = function (req, res, next) {
    findProductById(req, res, next, function (product) {
            const deviceGuid = req.body.deviceGuid;
            const newDelta = parseInt(req.body.localAmountDelta);
            const index = _.findIndex(product.deltas, guidDeltaPair => guidDeltaPair.deviceGuid === deviceGuid);
            if (index !== -1) {
                const currentDelta = product.deltas[index].localAmountDelta;
                const difference = newDelta - currentDelta;
                let amount = product.amount;
                amount += difference;
                if (amount < 0) {
                    return res.status(422).send({_id: product._id, increaseDelta: -amount});
                }
                product.amount = amount;
                product.deltas[index].localAmountDelta = newDelta;
            } else {
                let amount = product.amount;
                amount += newDelta;
                if (amount < 0) {
                    return res.status(422).send({_id: product._id, increaseDelta: -amount});
                }
                product.amount = amount;
                // Connected with mongoose bug #4455
                product.deltas = product.deltas.concat([{deviceGuid, localAmountDelta: newDelta}]);
            }

            product.save(function (err, savedProduct) {
                if (err) {
                    return next(err);
                }
                else {
                    return res.status(200).send({
                        _id: savedProduct._id,
                        amount: savedProduct.amount
                    });
                }
            });
        }
    );
};

module.exports.remove = function (req, res, next) {
    findProductById(req, res, next, function (product) {
        product.remove(function (err) {
            if (err) {
                return next(err);
            }
            else {
                return res.send(product);
            }
        });
    });
};

module.exports.create = function (req, res, next) {
    const body = req.body;


    if (!body.name) {
        return res.status(422).send({error: "The product has to have a name."})
    }

    Product.findOne({name: body.name}, function (err, existingProduct) {
            if (err) {
                return next(err);
            }
            if (existingProduct) {
                return res.status(422).send({error: "The product with given name already exists"})
            }

            const product = new Product({
                _id: body._id,
                name: body.name,
                store: body.store,
                price: body.price,
                amount: body.amount,
                user: req.user._id,
                deltas: {deviceGuid: body.deviceGuid, localAmountDelta: body.localAmountDelta}
            });

            product.save(function (err, savedProduct) {
                if (err) {
                    return next(err)
                }
                res.status(201).send(savedProduct);
            });
        }
    );
};

module.exports.getAll = function (req, res, next) {
    Product.find({user: req.user._id}, function (err, products) {
        if (err) {
            return next(err);
        }
        else {
            res.send(products);
        }
    });
};