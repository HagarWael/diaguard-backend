const express = require("express");
require("dotenv").config();

const mongoose = require("mongoose");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const glucoseRoutes = require("./routes/glucoseRoutes");
mongoose
  .connect("mongodb://localhost:27017/diaguard")
  .then(() => console.log("connected"))
  .catch((err) => console.log("not connected "));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", glucoseRoutes);
app.listen(3000);
