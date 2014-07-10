var userRoles = require('../models/Roles').userRoles;

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
    res.render('index', {
        title: 'SmileCity',
        loggedUser: req.user,
        authFailure: req.query.auth == 'failure'
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
