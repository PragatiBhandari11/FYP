const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");
const router = express.Router();

// Configure storage for images
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, "prod_" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ADD PRODUCT ROUTE
router.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, quantity, farmerId, category } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !price || !quantity || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO products (farmer_id, name, category, price_per_kg, quantity, image_path) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [farmerId, name, category, price, quantity, imagePath], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Product added successfully! ✅" });
  });
});

module.exports = router;