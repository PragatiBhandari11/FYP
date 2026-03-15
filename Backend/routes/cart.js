const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. ADD ITEM TO CART POST
router.post("/add", (req, res) => {
  const { buyerEmail, productId } = req.body;

  if (!buyerEmail || !productId) {
    return res.status(400).json({ message: "Missing buyer or product details." });
  }

  // Check if item already exists in cart for this user
  const checkSql = "SELECT id, quantity FROM cart_items WHERE buyer_email = ? AND product_id = ?";
  db.query(checkSql, [buyerEmail, productId], (checkErr, results) => {
    if (checkErr) {
      console.error("❌ Cart check error:", checkErr.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      // Item exists: Increment quantity
      const cartId = results[0].id;
      const newQty = results[0].quantity + 1;
      
      const updateSql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
      db.query(updateSql, [newQty, cartId], (upErr) => {
        if (upErr) return res.status(500).json({ message: "Failed to update cart." });
        return res.status(200).json({ message: "Cart quantity updated.", quantity: newQty });
      });
    } else {
      // Item does not exist: Insert new row
      const insertSql = "INSERT INTO cart_items (buyer_email, product_id, quantity) VALUES (?, ?, 1)";
      db.query(insertSql, [buyerEmail, productId], (inErr, insertResult) => {
        if (inErr) return res.status(500).json({ message: "Failed to add to cart." });
        return res.status(201).json({ message: "Added to cart successfully!" });
      });
    }
  });
});

// 2. FETCH CART BY BUYER EMAIL
router.get("/:email", (req, res) => {
  const { email } = req.params;

  // We need to INNER JOIN the `products` table to return formatting like Names and Prices
  const sql = `
    SELECT 
      c.id AS cart_id, 
      c.quantity AS qty, 
      p.id AS product_id, 
      p.name, 
      p.price, 
      p.image_url, 
      p.farmer_id 
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.buyer_email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Cart Fetch error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

// 3. EDIT QUANTITY IN CART (Plus / Minus buttons)
router.post("/update", (req, res) => {
    const { cartId, delta } = req.body;
    
    // First, verify the current quantity
    const checkSql = "SELECT quantity FROM cart_items WHERE id = ?";
    db.query(checkSql, [cartId], (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ message: "Item not found in cart." });
      
      const newQty = results[0].quantity + delta;
      
      if (newQty <= 0) {
        // Drop the item entirely if it hits 0
        db.query("DELETE FROM cart_items WHERE id = ?", [cartId], (delErr) => {
            if (delErr) return res.status(500).json({ message: "Could not remove item." });
            return res.status(200).json({ message: "Item removed from cart." });
        });
      } else {
        // Update to new quantity
        db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQty, cartId], (upErr) => {
            if (upErr) return res.status(500).json({ message: "Could not update quantity." });
            return res.status(200).json({ message: "Quantity updated." });
        });
      }
    });
});

module.exports = router;
