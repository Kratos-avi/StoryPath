const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

// Auth controller handles account creation and login, then returns a signed JWT.
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Require every field before creating a user.
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent duplicate accounts for the same email address.
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Store only a hashed password, never the raw password.
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    let token;
    try {
      // Issue a JWT so the frontend can persist the logged-in session.
      const secret = getJwtSecret();
      if (!secret || secret.trim() === "") {
        throw new Error("JWT_SECRET is not configured in environment variables");
      }
      token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: "1d" }
      );
      if (!token) {
        throw new Error("Token generation returned empty value");
      }
    } catch (jwtErr) {
      console.error("[Auth] JWT token generation failed:", jwtErr.message);
      return res.status(500).json({ message: "Failed to generate authentication token. Contact support." });
    }

    // Return a minimal safe user object plus the new token.
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
};

// Login validates the password against the stored hash and returns a fresh JWT.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Both values are required for authentication.
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Look up the account by email before checking the password hash.
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare the submitted password with the stored hash.
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    let token;
    try {
      // Generate a fresh token for the session after password verification succeeds.
      const secret = getJwtSecret();
      if (!secret || secret.trim() === "") {
        throw new Error("JWT_SECRET is not configured in environment variables");
      }
      token = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: "1d" }
      );
      if (!token) {
        throw new Error("Token generation returned empty value");
      }
    } catch (jwtErr) {
      console.error("[Auth] JWT token generation failed:", jwtErr.message);
      return res.status(500).json({ message: "Failed to generate authentication token. Contact support." });
    }

    // Send back only the data the client needs for session state.
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.status(500).json({ message: "Server error", error: String(err) });
  }
};
