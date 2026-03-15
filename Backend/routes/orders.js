const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. CHECKOUT (Convert Cart to Order)
router.post("/checkout", (req, res) => {
  const { buyerEmail, totalAmount } = req.body;

  if (!buyerEmail || totalAmount === undefined) {
    return res.status(400).json({ message: "Missing buyer or total amount details." });
  }

  // Generate a random order number (e.g. ORD-1024)
  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  // Begin transaction
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction start failed." });

    // Step 1: Create the parent Order record
    const insertOrderSql = "INSERT INTO orders (order_number, buyer_email, total_amount) VALUES (?, ?, ?)";
    db.query(insertOrderSql, [orderNumber, buyerEmail, totalAmount], (err1, orderResult) => {
      if (err1) {
        return db.rollback(() => res.status(500).json({ message: "Failed to create order." }));
      }

      const orderId = orderResult.insertId;

      // Step 2: Extract current cart items combining with locked-in prices from the main products table
      const fetchCartSql = `
        SELECT c.product_id, c.quantity, p.price, p.name 
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.buyer_email = ?
      `;

      db.query(fetchCartSql, [buyerEmail], (err2, cartItems) => {
        if (err2 || cartItems.length === 0) {
          return db.rollback(() => res.status(400).json({ message: "Cart is empty or failed to fetch." }));
        }

        // Prepare bulk insert mapping for order_items table securely locking historical prices
        const orderItemsValues = cartItems.map(item => [
          orderId, item.product_id, item.name, item.price, item.quantity
        ]);

        const insertItemsSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";
        db.query(insertItemsSql, [orderItemsValues], (err3) => {
          if (err3) {
            return db.rollback(() => res.status(500).json({ message: "Failed to save order items." }));
          }

          // Step 3: Successfully transferred. Wipe the cart clean synchronously.
          const wipeCartSql = "DELETE FROM cart_items WHERE buyer_email = ?";
          db.query(wipeCartSql, [buyerEmail], (err4) => {
            if (err4) {
              return db.rollback(() => res.status(500).json({ message: "Failed to clear cart." }));
            }

            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => res.status(500).json({ message: "Transaction commit failed." }));
              }

              res.status(201).json({ 
                message: "Order placed successfully!", 
                orderNumber: orderNumber 
              });
            });
          });
        });
      });
    });
  });
});

// 2. FETCH ALL ORDERS FOR A BUYER
router.get("/:email", (req, res) => {
  const { email } = req.params;

  const sql = "SELECT * FROM orders WHERE buyer_email = ? ORDER BY created_at DESC";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Fetch orders error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
