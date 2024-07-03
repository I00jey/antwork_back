const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const NewsSchema = new Schema({
    url: {
        require: true,
        type: String,
    },
    title: {
        require: true,
        type: String,
        unique: true,
    },
    content: {
        require: true,
        type: String,
        unique: true,
    },
    date: {
        type: String,
    },
    views: {
        type: Number,
        require: true,
        default: 0,
    },
    bookmark: {
        type: Number,
        require: true,
        default: 0,
    },
    smallimg: {
        type: String,
    },
    bigimg: {
        type: String,
    },
    // 1 : 주식뉴스
    // 2 : 코인뉴스
    // 3 : 경제뉴스
    group: {
        type: Number,
        require: true,
        default: 0,
    },
    subtitle: {
        type: String,
    },
});

module.exports = mongoose.model('News', NewsSchema);
