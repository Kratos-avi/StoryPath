/**
 * JWT Authentication Middleware
 * 
 * Validates Bearer tokens in Authorization header and extracts user ID.
 * Attaches userId to request object for use in protected routes.
 * 
 * Expected Header Format: Authorization: Bearer <token>
 * 
 * On Success: Calls next(), user ID attached to req.userId
 * On Failure: Returns 401 Unauthorized with error message
 */

const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Verify header exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify header format is "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET || "secret123";

    // Verify token validity and decode it
    const decoded = jwt.verify(token, jwtSecret);
    // Attach decoded userId to request for downstream handlers
    req.userId = decoded.userId;

    // Continue to next middleware/handler
    next();
  } catch (err) {
    // Return 401 for any token validation errors (invalid or expired)
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
