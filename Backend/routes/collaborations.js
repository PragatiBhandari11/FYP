const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

const router = express.Router();

// Configure Multer for collaboration images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `collab-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// CREATE COLLABORATION
router.post("/", upload.single("image"), (req, res) => {
  const { name, type, description, location, contact } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO collaborations (name, type, description, image_url, location, contact)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, type, description, imageUrl, location, contact], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Collaboration added", id: result.insertId });
  });
});

// GET ALL COLLABORATIONS
router.get("/", (req, res) => {
  const sql = "SELECT * FROM collaborations ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET SINGLE COLLABORATION
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM collaborations WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(results[0]);
  });
});

// DELETE COLLABORATION
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM collaborations WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted successfully" });
  });
});

module.exports = router;
