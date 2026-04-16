/**
 * Authentication Routes
 * 
 * This module manages all authentication-related endpoints:
 * - User registration with hashed passwords
 * - User login with JWT token generation
 * 
 * No authentication middleware required for these routes.
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/**
 * POST /api/auth/register
 * Creates a new user account with email and hashed password.
 * Returns JWT token and user data on success.
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Authenticates user by credentials and returns JWT token.
 */
router.post("/login", authController.login);

module.exports = router;
