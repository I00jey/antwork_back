const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const StockWordSchema = new Schema({
    eng_word: {
        require: true,
        type: String,
    },
    kor_word: {
        require: true,
        type: String,
    },
    explanation: {
        require: true,
        type: String,
    },
});

module.exports = mongoose.model('StockWord', StockWordSchema);
