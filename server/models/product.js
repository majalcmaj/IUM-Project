const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const deltaSchema = new Schema({ deviceGuid: 'string', localAmountDelta: Number});

const productSchema = new Schema({
    name: {type: String, unique: true, required: true},
    store: String,
    price: {type: Number, min: 0},
    amount: {type: Number, min: 0, default: 0},
    user: String,
    deltas: [deltaSchema]
});

// Create model class
const ModelClass = mongoose.model('product', productSchema);

// Export the model
module.exports = ModelClass;



