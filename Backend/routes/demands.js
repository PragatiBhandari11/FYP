const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. BUYER POSTS A DEMAND
router.post("/", (req, res) => {
  const { buyerEmail, productName, quantity, description } = req.body;

  if (!buyerEmail || !productName) {
    return res.status(400).json({ message: "Buyer email and product name are required." });
  }

  const sql = "INSERT INTO demands (buyer_email, product_name, quantity, description) VALUES (?, ?, ?, ?)";
  db.query(sql, [buyerEmail, productName, quantity, description], (err, result) => {
    if (err) {
      console.error("❌ Demand post error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    // Notify all farmers about the new demand
    db.query("SELECT email FROM users WHERE role = 'Farmer'", (farmerErr, farmers) => {
      if (!farmerErr) {
        const notifSql = "INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)";
        farmers.forEach(far => {
          db.query(notifSql, [far.email, "New Product Demand", `A buyer is looking for: ${productName} (${quantity})`, 'Demand'], (nErr) => {
             if (nErr) console.error("Farmer demand notif error:", nErr.message);
          });
        });
      }
    });

    res.status(201).json({ message: "Demand alert sent successfully! 📢", demandId: result.insertId });
  });
});

// 2. GET ALL DEMANDS (For Farmer Dashboard)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM demands ORDER BY created_at DESC LIMIT 10";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch demands error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
