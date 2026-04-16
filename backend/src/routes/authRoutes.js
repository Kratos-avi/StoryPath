const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Authentication endpoints stay separate so login and register are easy to locate.
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
