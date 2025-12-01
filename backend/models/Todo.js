const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false },

    // 🔥 NEW — required for priority sorting feature
    priority: { 
      type: String, 
      enum: ["high", "medium", "low"], 
      default: "medium" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
