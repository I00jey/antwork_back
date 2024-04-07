const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
    // 커뮤니티 아이디 불러오기
    communityId: {
        type: Schema.Types.ObjectId,
        ref: 'Community',
        require: true,
    },
    // 유저 아이디 불러오기
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    userNickName: {
        type: String,
        require: true,
    },

    content: {
        require: true,
        type: String,
    },
    date: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', CommentSchema);
