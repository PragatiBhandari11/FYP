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

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `disease-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: storage });

// SUBMIT DISEASE REPORT
router.post("/report", upload.single("image"), (req, res) => {
  const { farmerEmail, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!farmerEmail || !imageUrl) {
    return res.status(400).json({ message: "Missing required information" });
  }

  const sql = "INSERT INTO disease_reports (farmer_email, image_url, description) VALUES (?, ?, ?)";
  db.query(sql, [farmerEmail, imageUrl, description], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Disease report submitted successfully!", reportId: result.insertId });
  });
});

// GET ALL REPORTS (For Experts)
router.get("/reports", (req, res) => {
  const sql = `
    SELECT r.*, u.full_name AS farmer_name 
    FROM disease_reports r 
    JOIN users u ON r.farmer_email = u.email 
    ORDER BY r.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// GET REPORTS BY FARMER EMAIL
router.get("/reports/farmer/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT * FROM disease_reports WHERE farmer_email = ? ORDER BY created_at DESC";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
});

// EXPERT RESPONSE
router.put("/respond/:id", (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  const sql = "UPDATE disease_reports SET expert_response = ?, status = 'Responded' WHERE id = ?";
  db.query(sql, [response, id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json({ message: "Response submitted!" });
  });
});

module.exports = router;
