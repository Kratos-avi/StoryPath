const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

// JWT middleware reads the bearer token, verifies it, and attaches userId for protected controllers.
module.exports = function authMiddleware(req, res, next) {
  try {
    // The API client sends tokens in the standard "Bearer <token>" format.
    const authHeader = req.headers.authorization; // "Bearer <token>"

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];

    // If the token is valid, the decoded payload gives us the signed-in user ID.
    const decoded = jwt.verify(token, getJwtSecret());
    // ✅ IMPORTANT: set userId so controllers can use it
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
