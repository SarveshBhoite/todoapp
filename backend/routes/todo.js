const express = require("express");
const jwt = require("jsonwebtoken");
const Todo = require("../models/Todo");
const router = express.Router();

// Middleware to verify token
function auth(req, res, next) {
  const token = req.headers.token;
  if (!token) return res.json({ error: "No token" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.id;
    next();
  } catch {
    res.json({ error: "Invalid token" });
  }
}

// Get todos
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user });
  res.json(todos);
});

// Add todo
router.post("/add", auth, async (req, res) => {
  const { text, dueDate } = req.body;

  if (!text) return res.json({ error: "Task text required" });

  const todo = await Todo.create({
    userId: req.user,
    text,
    done: false,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  res.json(todo);
});


// Toggle done
router.post("/toggle", auth, async (req, res) => {
  const { id } = req.body;
  const todo = await Todo.findById(id);
  todo.done = !todo.done;
  await todo.save();
  res.json(todo);
});

// Delete
router.post("/delete", auth, async (req, res) => {
  const { id } = req.body;
  await Todo.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
});

module.exports = router;
