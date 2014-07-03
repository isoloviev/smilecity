var fs = require('fs'),
    uuid = require('node-uuid'),
    path = require('path'),
    User = require('../models/User'),
    Photo = require('../models/Photo');

module.exports = {
    upload: function (req, res, next) {
        if (!req.user) {
            res.send(401);
            return;
        }

        var gm = require('gm');

        var imgFile = req.files.files[0];

        var imageTypes = /\.(gif|jpe?g|png)$/i;

        if (!imageTypes.test(imgFile.name)) {
            console.log('Unsupported file type');
            res.send(500);
            return;
        }

        // more than 7MB
        if (7000000 < this.size) {
            console.log('File is too big');
            res.send({
                error: 'File is too big'
            });
            return;
        }

        var img = gm(imgFile.path);
        img.size(function (err, size) {
            if (!err) {
                console.log('width = ' + size.width);
                console.log('height = ' + size.height);
                var w = size.width,
                    h = size.height,
                    s = w,
                    x = 0,
                    y = 0;

                // define the smallest side
                if (h < w) {
                    s = h;
                    x = (w - h) / 2;
                }

                if (h > w) {
                    y = (h - w) / 2;
                }

                console.log("size: %s, x: %s, y: %s", s, x, y);
                var fileName = uuid.v1() + '.jpg';
                var newPath = "./uploads/" + fileName;
                //crop by this side
                img.crop(s, s, x, y).stream(function (err, stdout, stderr) {
                    if (err) return next(err);
                    stdout.pipe(fs.createWriteStream(newPath));
                    setTimeout(function () {
                        var p = new Photo();
                        p.name = imgFile.name;
                        p.fileName = fileName;
                        p.dateAdded = new Date();
                        p.user = req.user._id;
                        p.random_point = [Math.random(), 0];
                        p.save(function (err) {
                            if (err != null) {
                                res.send(500, err);
                                return;
                            }
                            // create preview
                            module.exports._imagePreview(fileName, newPath, 150, 150, false, false, function () {
                                module.exports._imagePreview(fileName, newPath, 150, 150, true, false, function () {
                                    module.exports._imagePreview(fileName, newPath, 600, 600, false, false, function () {
                                        res.send({
                                            files: [
                                                {
                                                    url: 'http://localhost:3000/images/600x600/' + fileName,
                                                    thumbnailUrl: 'http://localhost:3000/images/300x300/' + fileName,
                                                    name: imgFile.name,
                                                    type: imgFile.headers['content-type'],
                                                    size: imgFile.size,
                                                    deleteUrl: '',
                                                    deleteType: 'DELETE'
                                                }
                                            ]
                                        });
                                    });
                                });
                            });

                        });
                    }, 500);
                });

            } else {
                console.log(err);
                next();
            }
        });


    },

    _imagePreview: function (img, src, w, h, blur, userpic, next) {
        var gm = require('gm')
            , resizeX = w
            , resizeY = h;
        var mkdirp = require('mkdirp');

        var tFileName = path.join(__dirname, '..', 'public', 'images', w + 'x' + h + (blur ? '-blur' : ''), img);
        mkdirp(path.dirname(tFileName), function () {
            var orient = gm(src)
                .resize(resizeX, resizeY)
                .autoOrient();
            if (blur) {
                orient.blur(30, 20);
            }
            orient
                .write(tFileName, function () {
                    next();
                });
        })
    },

    _imageProcessor: function(w, h, filename, type, next) {
        console.log('%s X %s ; %s', w, h, filename);
        var isBlurred = false;
        var isUserPic = false;
        if (type) {
            console.log('with alias - ' + type);
            isBlurred = type == 'blur';
            isUserPic = type == 'u';
        }

        if (filename == '{{item.fileName}}') {
            next(404);
            return;
        }

        var gm = require('gm');
        var tFileName = path.join(__dirname, '..', 'public', 'images', w + 'x' + h + (isBlurred ? '-blur' : ''), filename);

        if (fs.existsSync(tFileName)) {

            next(200, tFileName);

        } else {

            var src = path.join(__dirname, '..', 'uploads', filename);
            // replace to default
            if (!fs.existsSync(src) && isUserPic) {
                src = path.join(__dirname, '..', 'public', 'img', 'default_profile_pic.jpg');
            }

            module.exports._imagePreview(filename, src, w, h, isBlurred, isUserPic, function () {

                if (!fs.existsSync(tFileName)) {
                    next(404);
                    return;
                }

                next(200, tFileName);

            });

        }
    },

    list: function (req, res, next) {

        var limit = 500;
        var skip = parseInt(req.param('next', 0));
        if (skip < 0) {
            skip = 0;
        }

        if (req.param('rnd')) {
            Photo
                .find({ random_point: { $near: [Math.random(), 0] } }, '-comments')
                .limit(12)
                .populate('user')
                .exec(function (err, list) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.json(200, { list: list });
                });
            return;
        }

        Photo
            .find(null, '-comments')
            .skip(skip)
            .limit(limit)
            .populate('user')
            .sort('-dateAdded')
            .exec(function (err, list) {
                if (err) {
                    console.log(err);
                    return;
                }
                res.json(200, { list: list });
            });
    },

    image: function (req, res) {

        module.exports._imageProcessor(req.params.width, req.params.height, req.params.filename, req.params.type, function(code, filename) {

            if (code == 404) {
                res.send(404);
                return;
            }

            var stat = fs.statSync(filename);

            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': stat.size,
                'Cache-Control': 'max-age=86400, public',
                'Pragma': 'public'
            });

            var readStream = fs.createReadStream(filename);
            readStream.pipe(res);

        });

    },

    postComment: function (req, res, next) {
        if (!req.user) {
            res.send(401);
            return;
        }
        console.log('User wants to post comment to photo %s', req.params.photoId);
        var post = req.body.comment;
        Photo.findOne({ _id: req.params.photoId}, function (err, photo) {
            photo.comments.push({
                body: post.body,
                date: new Date(),
                user: req.user._id
            });
            if (isNaN(photo.meta.comments)) {
                photo.meta.comments = 0;
            }
            photo.meta.comments++;
            photo.save(function (err) {
                res.json({ result: 'ok'});
            });
        });
    },

    item: function (req, res, next) {
        console.log('User wants to get info about photo %s', req.params.photoId);
        Photo.findOne({ _id: req.params.photoId}, '-comments').populate('user').exec(function (err, photo) {
            res.json({ photo: photo});
        });
    },

    comments: function (req, res, next) {
        if (!req.params.photoId) {
            res.send(404);
            return;
        }
        console.log('User wants to get comments of photo %s', req.params.photoId);
        Photo.findOne({ _id: req.params.photoId}).populate('comments.user').exec(function (err, photo) {
            if (!photo) {
                res.send(404);
                return;
            }
            res.json({ list: photo.comments});
        });
    }

};