var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var PhotoSchema = new Schema({
    name: String,
    dateAdded: Date,
    fileName: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    meta: {
        likes: Number
    },
    random_point: {
        type: Array,
        index: '2d'
    }
});

PhotoSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Photo', PhotoSchema);