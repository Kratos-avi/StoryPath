const express = require("express");
require("dotenv").config();
const cors = require("cors");


const storyRoutes = require("./routes/storyRoutes");
const authRoutes = require("./routes/authRoutes");


const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/stories", storyRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
