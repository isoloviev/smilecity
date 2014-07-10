/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    photos = require('./routes/photos.js'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    config = require('./config.json');

var app = express();

// all environments
app.set('port', process.env.PORT || 3070);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'SMILE-ME' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var User = require('./models/User');

passport.serializeUser(function (user, done) {
    console.log("serialized: " + user._id);
    done(null, user._id);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        err
            ? done(err)
            : done(null, user);
    });
});

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: config.facebook.APP_ID,
        clientSecret: config.facebook.APP_SECRET,
        callbackURL: config.facebook.APP_CALLBACK
    },
    createOrRetrieveUser
));

var VKontakteStrategy = require('passport-vkontakte').Strategy;

passport.use(new VKontakteStrategy({
        clientID: config.vkontakte.APP_ID,
        clientSecret: config.vkontakte.APP_SECRET,
        callbackURL: config.vkontakte.APP_CALLBACK
    },
    createOrRetrieveUser
));

function createOrRetrieveUser(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOne({accountId: profile.provider + '-' + profile.id}, function(err, oldUser) {
        if (err) { done(err); return; }
        if (oldUser) {
            done(null, oldUser);
        } else {
            var userRoles = require('./models/Roles').userRoles;
            var user = new User();
            user.accountId = profile.provider + '-' + profile.id;
            user.provider = profile.provider;
            user.name = profile.displayName;
            if (profile.emails)
                user.email = profile.emails[0].value;
            user.gender = profile.gender;
            user.role = userRoles['user'];
            user.regDate = new Date();
            user.save(function(err) {
                if (err) { done(err); return; }
                done(null, user);
            });
        }
    });
}

mongoose.connect(config.mongo, null, function (err, db) {
    if (err) {
        console.log('Sorry, there is no mongo db server running.');
    } else {

        var attachDB = function (req, res, next) {
            req.db = db;
            next();
        };

        app.get('/', attachDB, routes.index);
        app.get('/upload.html', attachDB, routes.upload);
        app.get('/login.html', attachDB, routes.login);
        app.get('/logout.html', attachDB, routes.logout);
        app.get('/profile.html', attachDB, routes.profile);
        app.post('/upload/', attachDB, photos.upload);

        app.get('/api/photos', attachDB, photos.list);

        // facebook
        app.get('/auth/facebook', passport.authenticate('facebook', {display: 'touch'}));
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', { successRedirect: '/',
                failureRedirect: '/login' }));

        // vkontakte
        app.get('/auth/vkontakte', passport.authenticate('vkontakte', {display: 'mobile'}));
        app.get('/auth/vkontakte/callback',
            passport.authenticate('vkontakte', { successRedirect: '/',
                failureRedirect: '/login' }));

        http.createServer(app).listen(app.get('port'), function () {
            console.log('Successfully connected to MongoDB',
                '\nExpress server listening on port ' + app.get('port'));
        });
    }
});