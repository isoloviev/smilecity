exports.index = function (req, res) {
    res.render('index', {
        title: 'Smile City'
    });
};

exports.upload = function (req, res) {
    res.render('upload', {
        title: 'Upload image to Smile City'
    });
};

exports.login = function (req, res) {
    res.render('login');
};
