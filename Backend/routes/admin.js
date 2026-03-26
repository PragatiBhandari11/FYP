const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. GET ALL USERS (Excluding Admins)
router.get("/users", (req, res) => {
  const sql = "SELECT id, full_name, email, role, is_approved, created_at FROM users WHERE role != 'Admin'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Admin Fetch users error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 2. APPROVE USER
router.put("/users/:id/approve", (req, res) => {
  const sql = "UPDATE users SET is_approved = 1 WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("❌ Admin Approve user error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "User approved successfully ✅" });
  });
});

// 3. DELETE USER
router.delete("/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("❌ Admin Delete user error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "User removed successfully ✅" });
  });
});

// 4. GET ALL PRODUCTS (Global Inventory)
router.get("/products", (req, res) => {
  const sql = `
    SELECT p.*, u.full_name AS farmer_name 
    FROM products p 
    LEFT JOIN users u ON p.farmer_id = u.email 
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Admin Fetch products error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 5. DELETE PRODUCT
router.delete("/products/:id", (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("❌ Admin Delete product error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Product deleted successfully ✅" });
  });
});

// 6. GET ALL ORDERS (System Wide)
router.get("/orders", (req, res) => {
  const sql = `
    SELECT o.*, u.full_name AS buyer_name
    FROM orders o
    LEFT JOIN users u ON o.buyer_email = u.email
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Admin Fetch orders error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 7. GET ORDER ITEMS
router.get("/orders/:id/items", (req, res) => {
  const sql = "SELECT * FROM order_items WHERE order_id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("❌ Admin Fetch order items error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 8. UPDATE ORDER STATUS (Global)
router.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status required" });

  // First fetch order to get buyer_email
  db.query("SELECT buyer_email, order_number FROM orders WHERE id = ?", [req.params.id], (err, orderResult) => {
    if (err || orderResult.length === 0) return res.status(500).json({ message: "Order not found" });
    
    const { buyer_email, order_number } = orderResult[0];

    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (updErr) => {
      if (updErr) {
        console.error("❌ Admin Update status error:", updErr.message);
        return res.status(500).json({ message: "Database error" });
      }

      // Create notification for buyer
      const notifSql = "INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)";
      const title = `Order Update: #${order_number.slice(-8)}`;
      const message = `Your order status has been updated to: ${status}`;
      db.query(notifSql, [buyer_email, title, message, 'Order'], (notifErr) => {
        if (notifErr) console.error("Failed to create order notification:", notifErr.message);
      });

      res.status(200).json({ message: "Order status updated ✅" });
    });
  });
});

module.exports = router;
