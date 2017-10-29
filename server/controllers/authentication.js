const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp  }, config.secret);
}

exports.signup = function(req, res, next) {
    // See if a user with email exists
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password) {
        return res.status(422).send({error: "You must provide an email and password."});
    }

    User.findOne({email: email}, function(err, existingUser) {

        if(err) {return next(err);}
        // If the email exists - return an error
        if(existingUser) {
            return res.status(442).send({error: "Email is in use."});
        }
        // If user and email does not exists, create user adn save user record
        const user = new User({
            email: email,
            password: password
        });

        user.save(function (err) {
            if(err) {return next(err);}

            // Respond to request indicationg the user was created

            res.json({token: tokenForUser(user)});
        });
    });
};

exports.signin = function(req, res, next) {
    // User auth'd - give'em token!
    res.send({token: tokenForUser(req.user)});
};