const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  userId: String,
  text: String,
  done: Boolean
});

module.exports = mongoose.model("Todo", TodoSchema);
