const passport = require('passport');
const passportService = require('./services/passport');

const Authentication = require('./controllers/authentication');
const Product = require('./controllers/product');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSigning = passport.authenticate('local', {session: false});

module.exports = function(app) {
    app.post('/signin', requireSigning, Authentication.signin);
    app.post('/signup', Authentication.signup);

    app.get('/product/:id', requireAuth, Product.getById);
    app.put('/product/:id/amount', requireAuth, Product.updateAmount);
    app.delete('/product/:id', requireAuth, Product.remove);

    app.post('/product', requireAuth, Product.create);
    app.get('/product', requireAuth, Product.getAll);
};