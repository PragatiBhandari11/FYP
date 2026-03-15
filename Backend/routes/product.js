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

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Store images in the generic 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Unique filename using timestamp
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// ADD PRODUCT ROUTE
router.post("/add-product", upload.single("image"), (req, res) => {
  const { name, category, price, quantity, farmerId } = req.body;

  // Basic validation
  if (!name || !category || !price || !quantity || !farmerId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Define image URL if a file was uploaded
  // Note: the frontend will fetch from http://localhost:5000/uploads/filename.ext
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO products (name, category, price, quantity, farmer_id, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, category, price, quantity, farmerId, imageUrl],
    (err, result) => {
      if (err) {
        console.error("❌ Add product error:", err.message);
        return res
          .status(500)
          .json({ message: `Database error: ${err.message}` });
      }

      res.status(201).json({
        message: "Product added successfully ✅",
        productId: result.insertId,
      });
    }
  );
});

// GET ALL PRODUCTS (Global Feed)
router.get("/products", (req, res) => {
  const sql = "SELECT * FROM products ORDER BY created_at DESC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch all products error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

// GET PRODUCTS BY FARMER ID
router.get("/products/farmer/:farmerId", (req, res) => {
  const { farmerId } = req.params;

  const sql = "SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC";
  
  db.query(sql, [farmerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch products error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
