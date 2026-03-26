const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

const router = express.Router();

// Ensure uploads directory exists (reusing the same pattern from disease.js or products.js)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for article images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `article-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: storage });

// CREATE ARTICLE
router.post("/", upload.single("image"), (req, res) => {
  const { title, category, content, author_email } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !content || !author_email) {
    return res.status(400).json({ message: "Missing required fields (title, content, author_email)" });
  }

  const sql = "INSERT INTO articles (title, category, content, author_email, image_url) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [title, category, content, author_email, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Article created successfully!", articleId: result.insertId });
  });
});

// GET ALL ARTICLES
router.get("/", (req, res) => {
  const sql = "SELECT * FROM articles ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// GET SINGLE ARTICLE
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM articles WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Article not found" });
    res.status(200).json(results[0]);
  });
});

// UPDATE ARTICLE
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { title, category, content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  let sql = "UPDATE articles SET title = ?, category = ?, content = ?";
  let params = [title, category, content];

  if (imageUrl) {
    sql += ", image_url = ?";
    params.push(imageUrl);
  }

  sql += " WHERE id = ?";
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: "Article updated successfully!" });
  });
});

// DELETE ARTICLE
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM articles WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: "Article deleted successfully!" });
  });
});

module.exports = router;
