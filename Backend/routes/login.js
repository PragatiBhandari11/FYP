const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// SIGN UP USER
router.post("/signup", async (req, res) => {
  const { fullName, email, phone, country, city, role, password } = req.body;

  if (role === "Admin") {
    return res.status(403).json({ message: "Admin accounts cannot be created via signup." });
  }

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-approve Buyers, Farmers/Experts need manual approval
    const isApproved = (role === "Buyer") ? 1 : 0;

    const sql = "INSERT INTO users (full_name, email, phone, country, city, role, password, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [fullName, email, phone, country, city, role, hashedPassword, isApproved],
      (err, result) => {
        if (err) {
          console.error(" Signup error:", err.message);
          return res.status(500).json({ message: `Database error: ${err.message}` });
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

// GET ALL EXPERTS
router.get("/experts", (req, res) => {
  const sql = "SELECT id, full_name, email, phone, country, city FROM users WHERE role = 'Expert'";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(" Fetch experts error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.status(200).json(results);
  });
});

// LOGIN USER
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // HARDCODED ADMIN CHECK (Bypasses DB/Schema issues)
  if (email === "admin@gmail.com" && password === "admin") {
      console.log(" Admin hardcoded login triggered successfully.");
      return res.status(200).json({
          message: "Admin Login successful ✅",
          user: {
              id: 0,
              fullName: "System Admin",
              email: "admin@gmail.com",
              city: "Kathmandu",
          },
          role: "Admin",
      });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error(" Login error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    // Check if account is approved (Farmers/Experts need approval)
    if (user.is_approved === 0 && user.role !== "Buyer" && user.role !== "Admin") {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    // Compare password
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Successful login
      res.status(200).json({
        message: "Login successful ✅",
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          city: user.city,
        },
        role: user.role, // Dashboard redirect depends on this
      });
    } catch (error) {
      res.status(500).json({ message: "Error comparing passwords" });
    }
  });
});

// GET USER PROFILE BY EMAIL
router.get("/user/:email", (req, res) => {
  const { email } = req.params;

  const sql = "SELECT full_name, email, phone, country, city, role, created_at FROM users WHERE email = ?";
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error(" Fetch user error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data (without password)
    res.status(200).json(result[0]);
  });
});

// GET ALL USERS (For Admin)
router.get("/admin/users", (req, res) => {
  const sql = "SELECT id, full_name, email, role, is_approved, created_at FROM users WHERE role != 'Admin'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// APPROVE USER
router.put("/admin/users/:id/approve", (req, res) => {
  const sql = "UPDATE users SET is_approved = 1 WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User approved successfully" });
  });
});

// DELETE USER
router.delete("/admin/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User removed successfully" });
  });
});

module.exports = router;
