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
        title: 'Smile City',
        loggedUser: req.user
    });
};

exports.upload = function (req, res) {
    res.render('upload');
};

exports.login = function (req, res) {
    res.render('login');
};
