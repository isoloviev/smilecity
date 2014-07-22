var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var PhotoVoteSchema = new Schema({
    photo: {type: Schema.Types.ObjectId, ref: 'Photo'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    date: Date
});

module.exports = mongoose.model('PhotoVote', PhotoVoteSchema);
