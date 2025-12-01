const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);

app.listen(5000, "0.0.0.0", () => {
  console.log("Running on http://192.168.1.11:5000");
});
