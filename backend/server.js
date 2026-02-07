require("dotenv").config(); // 🔥 LOAD .env FILE

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); // parse JSON

app.use("/api/fir", require("./routes/firRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

mongoose
  .connect("mongodb://127.0.0.1:27017/fir_management")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});
