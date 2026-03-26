/**
 * Authentication Controller
 * 
 * Handles user authentication operations:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - Password security using bcrypt
 * 
 * Dependencies:
 * - Prisma ORM for database operations
 * - bcrypt for password hashing and comparison
 * - jsonwebtoken (JWT) for token generation
 */

const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * POST /api/auth/register
 * 
 * Creates a new user account in the database.
 * Hashes password with bcrypt before storage for security.
 * Generates JWT token and returns user data.
 * 
 * Request body:
 * - name (string, required): User's display name
 * - email (string, required): Email address (unique)
 * - password (string, required): Plain text password
 * 
 * Response:
 * - 201: User created successfully
 * - 400: Missing fields or email already exists
 * - 500: Server error
 * 
 * Returns: { message, token, user: { id, name, email } }
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists in database
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password with 10 salt rounds for security
    const hashed = await bcrypt.hash(password, 10);

    // Create new user in database with hashed password
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    // Generate JWT token valid for 1 day
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // Return success with token and user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    // Log error and return generic server error (don't expose details)
    res.status(500).json({ message: "Server error", error: String(err) });
  }
};

/**
 * POST /api/auth/login
 * 
 * Authenticates user by checking email and password.
 * Compares provided password with bcrypt hashed password in database.
 * Generates and returns JWT token on successful authentication.
 * 
 * Request body:
 * - email (string, required): User's email address
 * - password (string, required): Plain text password
 * 
 * Response:
 * - 200: Login successful
 * - 400: Missing email or password
 * - 401: Invalid credentials (user not found or wrong password)
 * - 500: Server error
 * 
 * Returns: { message, token, user: { id, name, email } }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Look up user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare provided password with stored hashed password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token valid for 1 day
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // Return token and user data
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    // Log error and return generic server error
    res.status(500).json({ message: "Server error", error: String(err) });
  }
};
