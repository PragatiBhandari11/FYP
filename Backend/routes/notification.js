const express = require("express");
const db = require("../db");
const router = express.Router();

// GET NOTIFICATIONS FOR A USER
router.get("/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC LIMIT 20";
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Fetch notifications error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// MARK NOTIFICATION AS READ
router.put("/:id/read", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Update notification error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Notification marked as read" });
  });
});

// CREATE NOTIFICATION (Internal use or API)
router.post("/", (req, res) => {
  const { user_email, title, message, type } = req.body;
  const sql = "INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [user_email, title, message, type], (err, result) => {
    if (err) {
      console.error("Create notification error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Notification created", id: result.insertId });
  });
});

module.exports = router;
