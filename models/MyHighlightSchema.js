const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const MyHighlight = new Schema({
    user_id: {
        type: String,
        requird: true,
    },
    highlight: [
        {
            news_id: {
                type: String,
                require: true,
            },
            word: { type: [String], required: true },
        },
    ],
});

module.exports = mongoose.model('MyHighlight', MyHighlight);
