const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

// Define model

const userSchema = new Schema({
    email: {type: String, unique: true, lowercase: true},
    password: String
});

// On Save Hook, encrypt passwd, before saving model - run function.
userSchema.pre('save', function(next){
    const user = this;

    // Gen a salt
    bcrypt.genSalt(10, function(err, salt){
        if(err) {return next(err);}

        // hash (encrypt) a passwd using salt
        bcrypt.hash(user.password, salt, null, function(err, hash){
            if(err) {return next(err);}

            user.password = hash;

            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if(err) {return callback(err);}

        callback(null, isMatch);
    });
};

// Create model class
const ModelClass = mongoose.model('user', userSchema);

// Export the model
module.exports = ModelClass;