const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const passport = require('passport');
const User = require('../models/user');
const config = require('../config');

// Create local strategy

const localOptions = {usernameField: 'email'};
const localLogin = new LocalStrategy(localOptions, function (email, password, done) {
    // Verify email and password, call done with the user
    User.findOne({email: email}, function(err, user) {
        if(err) {return done(err);}

        if(!user) {return done(null, false)}

        // Compare with encrypted password
        user.comparePassword(password, function(err, isMatch){
            if(err) {return done(err);}
            if(!isMatch) {return done(null, false);}
            return done(null, user);
        });
    });
});

// Setup options for JWT strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    // See if the userID in payload exists in db
    User.findById(payload.sub, function (err, user) {

        if (err) {
            return done(err, false);
        }
        if (user) {
            // if it does, call 'done' with that object
            done(null, user);
        } else {
            // otherwise - call 'done' without a user object
            done(null, false);
        }
    })
});

// Tell passport to use strategy
passport.use(localLogin);
passport.use(jwtLogin);
