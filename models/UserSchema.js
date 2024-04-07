const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const UserSchema = new Schema({
    user_id: {
        require: true,
        unique: true,
        type: String,
    },
    user_password: {
        require: true,
        type: String,
    },
    user_nickname: {
        require: true,
        type: String,
    },
    user_email: {
        require: true,
        type: String,
    },

    word_bookmark: [
        {
            ref: 'WordSchema',
            type: Object,
        },
    ],
    news_bookmark: [
        {
            ref: 'News',
            type: Schema.Types.ObjectId,
        },
    ],
    isKakao: {
        require: true,
        type: Number,
        enum: [0, 1],
    },
    user_profile: {
        type: String,
        default: process.env.DEFAULTIMAGE,
    },
    isAdmin: {
        type: Number,
        require: true,
        enum: [0, 1],
    },
});

// 기본적으로 첫번째인자 + s(소문자)로 생성된다. -> 세번째 인자로 설정한 값이 DB 컬렉션 아래에 스키마명으로 들어가게 된다.
module.exports = mongoose.model('User', UserSchema);
