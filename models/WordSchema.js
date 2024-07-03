const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const WordSchema = new Schema({
  no: {
    require: true,
    type: Number,
  },
  word: {
    require: true,
    type: String,
  },
  explanation: {
    require: true,
    type: String,
  },
});

module.exports = mongoose.model("Word", WordSchema);
