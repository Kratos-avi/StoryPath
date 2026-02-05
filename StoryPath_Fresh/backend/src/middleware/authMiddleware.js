const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization; // "Bearer <token>"

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ IMPORTANT: set userId so controllers can use it
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
