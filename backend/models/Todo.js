const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },           // 🔥 NEW
  },
  { timestamps: true }                 // createdAt, updatedAt
);

module.exports = mongoose.model("Todo", TodoSchema);
