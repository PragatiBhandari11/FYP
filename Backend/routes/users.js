const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const db = require("../db");

const router = express.Router();

// MULTER CONFIGURATION FOR PROFILE IMAGES
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// 1. GET ALL USERS (Excluding Admins)
router.get("/", (req, res) => {
  const sql = "SELECT id, full_name, email, role, is_approved, profile_image, created_at FROM users WHERE role != 'Admin'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(" Fetch users error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 2. SIGN UP USER
router.post("/signup", async (req, res) => {
  const { fullName, email, phone, country, city, role, password } = req.body;

  if (role === "Admin") {
    return res.status(403).json({ message: "Admin accounts cannot be created via signup." });
  }

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (full_name, email, phone, country, city, role, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullName, email, phone, country, city, role, hashedPassword], (err, result) => {
      if (err) {
        console.error(" Signup error:", err.message);
        return res.status(500).json({ message: `Database error: ${err.message}` });
      }
      res.status(201).json({ message: "User registered successfully ✅", userId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. GET USER PROFILE BY EMAIL
router.get("/user/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT id, full_name, email, phone, country, city, role, profile_image, created_at FROM users WHERE email = ?";
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error(" Fetch user error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json(result[0]);
  });
});

// 4. UPDATE USER PROFILE DETAILS
router.put("/profile", (req, res) => {
  const { email, fullName, phone, country, city } = req.body;

  if (!email) return res.status(400).json({ message: "User email is required." });

  const sql = `
    UPDATE users 
    SET full_name = ?, phone = ?, country = ?, city = ? 
    WHERE email = ?
  `;

  db.query(sql, [fullName, phone, country, city, email], (err, result) => {
    if (err) {
      console.error(" Update profile error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Profile updated successfully! ✨" });
  });
});

// 5. UPDATE PROFILE IMAGE
router.post("/profile-image", upload.single("profileImage"), (req, res) => {
  const { email } = req.body;
  if (!req.file) return res.status(400).json({ message: "No image uploaded." });

  const imageUrl = `/uploads/${req.file.filename}`;
  const sql = "UPDATE users SET profile_image = ? WHERE email = ?";

  db.query(sql, [imageUrl, email], (err, result) => {
    if (err) {
      console.error(" Image update error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Profile photo updated! 📸", imageUrl });
  });
});

// 6. CHANGE PASSWORD
router.put("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required password fields." });
  }

  // Fetch current password hash
  const fetchSql = "SELECT password FROM users WHERE email = ?";
  db.query(fetchSql, [email], async (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, result[0].password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect current password." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updateSql = "UPDATE users SET password = ? WHERE email = ?";
    
    db.query(updateSql, [hashedNewPassword, email], (updErr) => {
      if (updErr) return res.status(500).json({ message: "Failed to update password." });
      res.status(200).json({ message: "Password updated successfully! 🔒" });
    });
  });
});

// 7. GET ALL EXPERTS (Helper for Farmers)
router.get("/experts", (req, res) => {
  const sql = "SELECT id, full_name, email, phone, country, city, profile_image FROM users WHERE role = 'Expert'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(200).json(results);
  });
});

module.exports = router;
