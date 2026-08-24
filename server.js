require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.json({ status: "Kharcha API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
