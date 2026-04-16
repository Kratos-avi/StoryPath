const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    let token;
    try {
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

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    let token;
    try {
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
