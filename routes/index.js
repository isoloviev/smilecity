var userRoles = require('../models/Roles').userRoles,
    Photo = require('../models/Photo');

exports.index = function (req, res) {
    var role = userRoles.public, username = '';
    var user = req.user;
    if (!user) {
        user = {
            role: role,
            username: username
        }
    }
    res.cookie('user', JSON.stringify(user));

    var limit = 40;
    var page = parseInt(req.param('page', 1));
    var skip = (page - 1) * limit;
    if (skip < 0) {
        skip = 0;
    }

    console.log('Page:', page);
    console.log('Limit:', limit);
    console.log('Skip:', skip);

    Photo
        .find(null, '-comments')
        .skip(skip)
        .limit(limit)
        .populate('user')
        .sort('-dateAdded')
        .exec(function (err, smiles) {
            res.render('index', {
                title: 'SmileCity',
                loggedUser: req.user,
                authFailure: req.query.auth == 'failure',
                smiles: smiles
            });
        });


};

exports.upload = function (req, res) {
    res.render('upload', {
        loggedUser: req.user
    });
};

exports.profile = function (req, res) {
    res.render('profile', {
        loggedUser: req.user
    });
};

exports.login = function (req, res) {
    res.render('login');
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect("/");
};
