const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// SIGN UP USER
router.post("/signup", async (req, res) => {
  const { fullName, email, phone, country, role, password } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (full_name, email, phone, country, role, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [fullName, email, phone, country, role, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("❌ Signup error:", err.message);
          return res.status(500).json({ message: "User already exists or DB error" });
        }

        res.status(201).json({
          message: "User registered successfully ✅",
          userId: result.insertId,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER PROFILE BY EMAIL
router.get("/user/:email", (req, res) => {
  const { email } = req.params;

  const sql = "SELECT full_name, email, phone, country, role, created_at FROM users WHERE email = ?";
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("❌ Fetch user error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data (without password)
    res.status(200).json(result[0]);
  });
});

module.exports = router;
