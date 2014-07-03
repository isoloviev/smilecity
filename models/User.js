var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
        username: String,
        name: String,
        provider: String,
        email: String,
        accountId: {
            type: String,
            unique: true
        },
        gender: String,
        role: {
            bitMask: Number,
            title: String
        },
        regDate: Date
    },
    { id: true });

UserSchema.set('toJSON', { getters: true });
UserSchema.path('username').get(function (v) {
    return v ? v : this.id;
});

module.exports = mongoose.model('User', UserSchema);