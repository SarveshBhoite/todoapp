const express = require("express");
const jwt = require("jsonwebtoken");
const Todo = require("../models/Todo");
const router = express.Router();

// ---------------- AUTH MIDDLEWARE ----------------
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

// ---------------- GET TODOS ----------------
// Just newest first (frontend will sort by priority)
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user }).sort({ createdAt: -1 });
  res.json(todos);
});

// ---------------- ADD TODO with PRIORITY ----------------
router.post("/add", auth, async (req, res) => {
  const { text, priority } = req.body;
  if (!text) return res.json({ error: "Task text required" });

  const todo = await Todo.create({
    userId: req.user,
    text,
    done: false,
    priority: priority || "medium",
  });

  res.json(todo);
});

// ---------------- TOGGLE DONE ----------------
router.post("/toggle", auth, async (req, res) => {
  const { id } = req.body;
  const todo = await Todo.findById(id);
  if (!todo) return res.json({ error: "Todo not found" });

  todo.done = !todo.done;
  await todo.save();
  res.json(todo);
});

// ---------------- DELETE TODO ----------------
router.post("/delete", auth, async (req, res) => {
  const { id } = req.body;
  await Todo.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
});

module.exports = router;
