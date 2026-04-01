const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for chat images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// SEND MESSAGE (Supports optional image)
router.post("/", upload.single("image"), (req, res) => {
  let { sender_email, receiver_id, receiver_email, message_text } = req.body;
  if (!sender_email || (!receiver_id && !receiver_email)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sEmail = sender_email.toLowerCase().trim();
  const rEmail = receiver_email ? receiver_email.toLowerCase().trim() : null;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const msgText = message_text || "";

  const sql = `
    INSERT INTO messages (sender_email, receiver_id, receiver_email, message_text, image_url) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [sEmail, receiver_id || null, rEmail, msgText, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Message sent", id: result.insertId, image_url: imageUrl });
  });
});

// GET CHAT HISTORY (User <-> User or User <-> Collab)
router.get("/history/:user1/:user2", (req, res) => {
  const u1 = req.params.user1.toLowerCase().trim();
  const u2 = req.params.user2.toLowerCase().trim();
  
  let sql;
  let params;

  if (u2.includes("@")) {
    // Both are emails (Farmer <-> Expert)
    sql = `
      SELECT * FROM messages 
      WHERE (LOWER(sender_email) = ? AND LOWER(receiver_email) = ?) 
         OR (LOWER(sender_email) = ? AND LOWER(receiver_email) = ?)
      ORDER BY created_at ASC
    `;
    params = [u1, u2, u2, u1];
  } else {
    // u2 is a collab ID
    sql = `
      SELECT * FROM messages 
      WHERE (LOWER(sender_email) = ? AND receiver_id = ?) 
         OR (LOWER(receiver_email) = CONCAT('collab_', ?) AND LOWER(sender_email) = ?)
      ORDER BY created_at ASC
    `;
    params = [u1, u2, u2, u1];
  }
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET ACTIVE CHATS (For Experts/Farmers to see who they're talking to)
router.get("/active-chats/:email", (req, res) => {
  const { email } = req.params;
  const sql = `
    SELECT DISTINCT 
      CASE WHEN sender_email = ? THEN receiver_email ELSE sender_email END AS chat_partner
    FROM messages
    WHERE (sender_email = ? AND receiver_email IS NOT NULL)
       OR (receiver_email = ?)
  `;
  db.query(sql, [email, email, email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.map(r => r.chat_partner).filter(p => p !== null));
  });
});

module.exports = router;
