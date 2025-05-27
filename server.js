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
const doctorRoutes = require("./routes/DoctorRoutes");
const questionRoutes = require("./routes/questionRoutes");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/diaguard")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", glucoseRoutes);
app.use("/doctors", doctorRoutes);
app.use("/questions", questionRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
