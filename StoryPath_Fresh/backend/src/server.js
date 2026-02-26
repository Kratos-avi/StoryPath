const express = require("express");
require("dotenv").config();
const cors = require("cors");

const storyRoutes = require("./routes/storyRoutes");
const authRoutes = require("./routes/authRoutes");
const nodeRoutes = require("./routes/nodeRoutes"); 

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root route (adds clean homepage)
app.get("/", (req, res) => {
  res.json({
    message: "StoryPath API is running",
    status: "success",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/stories", storyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", nodeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
