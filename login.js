const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// 1. USER LOGIN
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("❌ Login database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Account not found. Please sign up." });
    }

    const user = result[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password. Try again." });
      }

      // Successful login
      res.status(200).json({
        message: "Login successful!",
        token: "dummy-jwt-token", // In a real app, generate a JWT here
        role: user.role,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          city: user.city
        }
      });
    } catch (error) {
      console.error("❌ Password comparison error:", error);
      res.status(500).json({ message: "Server error during authentication" });
    }
  });
});

module.exports = router;
