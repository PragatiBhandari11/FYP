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
    const insertOrderSql = "INSERT INTO orders (order_number, buyer_email, total_amount, payment_method, payment_status) VALUES (?, ?, ?, 'COD', 'Pending')";
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

// 1.5 KHALTI INITIATION
router.post("/initiate-khalti", (req, res) => {
  const { buyerEmail, totalAmount, buyerName } = req.body;

  if (!buyerEmail || !totalAmount) {
    return res.status(400).json({ message: "Missing buyer or amount." });
  }

  const orderNumber = `KLT-${Date.now()}`;
  const amountInPaisa = Math.round(parseFloat(totalAmount) * 100);

  // Begin transaction
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction start failed." });

    const insertOrderSql = "INSERT INTO orders (order_number, buyer_email, total_amount, payment_method, payment_status, status) VALUES (?, ?, ?, 'Khalti', 'Pending', 'Payment Pending')";
    db.query(insertOrderSql, [orderNumber, buyerEmail, totalAmount], (err1, orderResult) => {
      if (err1) return db.rollback(() => res.status(500).json({ message: "Failed to create order." }));

      const orderId = orderResult.insertId;

      // Extract cart items
      const fetchCartSql = `
        SELECT c.product_id, c.quantity, p.price, p.name 
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.buyer_email = ?
      `;

      db.query(fetchCartSql, [buyerEmail], async (err2, cartItems) => {
        if (err2 || cartItems.length === 0) return db.rollback(() => res.status(400).json({ message: "Cart is empty." }));

        const orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.name, item.price, item.quantity]);
        const insertItemsSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";

        db.query(insertItemsSql, [orderItemsValues], async (err3) => {
          if (err3) return db.rollback(() => res.status(500).json({ message: "Failed to save order items." }));

          try {
            console.log("--- Khalti Initiation Debug ---");
            console.log("Secret Key Loaded:", !!process.env.KHALTI_SECRET_KEY);
            console.log("Key Length:", process.env.KHALTI_SECRET_KEY?.length);
            
            const payload = {
              "return_url": "http://localhost:5173/payment-success",
              "website_url": "http://localhost:5173/",
              "amount": amountInPaisa,
              "purchase_order_id": orderNumber,
              "purchase_order_name": "AgroConnect Order",
              "customer_info": {
                "name": buyerName || "Valued Customer",
                "email": buyerEmail
              }
            };
            console.log("Payload:", JSON.stringify(payload, null, 2));

            const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
              method: "POST",
              headers: {
                "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const khaltiData = await khaltiResponse.json();
            console.log("Khalti Status:", khaltiResponse.status);
            console.log("Khalti Response Data:", khaltiData);

            if (khaltiData.pidx) {
              console.log("✅ Khalti pidx generated:", khaltiData.pidx);
              // Store pidx in the order
              db.query("UPDATE orders SET pidx = ? WHERE id = ?", [khaltiData.pidx, orderId], (err4) => {
                if (err4) {
                  console.error("❌ Failed to store pidx in DB:", err4.message);
                  return db.rollback(() => res.status(500).json({ message: "Failed to store pidx." }));
                }

                db.commit((commitErr) => {
                  if (commitErr) {
                    console.error("❌ DB Commit failed:", commitErr.message);
                    return db.rollback(() => res.status(500).json({ message: "Commit failed." }));
                  }
                  console.log("📦 Order & Payment record committed successfully.");
                  res.status(200).json(khaltiData);
                });
              });
            } else {
              console.error("❌ Khalti Initiation Failed. Full Response:", JSON.stringify(khaltiData, null, 2));
              db.rollback(() => res.status(400).json({ 
                message: "Khalti initiation failed.", 
                error: khaltiData 
              }));
            }
          } catch (error) {
            console.error("Khalti error:", error);
            db.rollback(() => res.status(500).json({ message: "External payment service error." }));
          }
        });
      });
    });
  });
});

// 1.6 KHALTI VERIFICATION
router.post("/verify-khalti", async (req, res) => {
  const { pidx } = req.body;

  if (!pidx) return res.status(400).json({ message: "Missing pidx." });

  try {
    const verifyResponse = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pidx })
    });

    const statusData = await verifyResponse.json();

    if (statusData.status === "Completed") {
      // Update order status
      const updateSql = "UPDATE orders SET payment_status = 'Paid', status = 'Order Placed' WHERE pidx = ?";
      db.query(updateSql, [pidx], (err) => {
        if (err) return res.status(500).json({ message: "Database update failed." });

        // Wipe the cart clean for this buyer
        const wipeCartSql = "DELETE FROM cart_items WHERE buyer_email = (SELECT buyer_email FROM orders WHERE pidx = ? LIMIT 1)";
        db.query(wipeCartSql, [pidx], (err2) => {
          if (err2) console.warn("Failed to clear cart after payment:", err2.message);
          res.status(200).json({ message: "Payment Verified! ✅", status: "Completed" });
        });
      });
    } else {
      res.status(400).json({ message: "Payment not completed.", details: statusData });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal verification error." });
  }
});
// 2. FETCH ALL ORDERS FOR A BUYER
router.get("/:email", (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT o.*, v.plate_number, v.vehicle_type 
    FROM orders o 
    LEFT JOIN delivery_vehicles v ON o.vehicle_id = v.id 
    WHERE o.buyer_email = ? 
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Fetch orders error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 3. FETCH ORDERS FOR A FARMER (Products belonging to them)
router.get("/farmer/:farmerId", (req, res) => {
  const { farmerId } = req.params;

  const sql = `
    SELECT oi.*, o.order_number, o.created_at, o.status, p.image_url, 
           v.plate_number, v.vehicle_type
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN delivery_vehicles v ON o.vehicle_id = v.id
    WHERE p.farmer_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [farmerId], (err, results) => {
    if (err) {
      console.error("❌ Fetch farmer orders error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 4. UPDATE ORDER STATUS
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required." });

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction failed" });

    // Step 1: Update status
    const updateSql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(updateSql, [status, id], (err1) => {
      if (err1) return db.rollback(() => res.status(500).json({ message: "Update failed" }));

      // Step 2: Auto-assign vehicle if status is "Packing" AND no vehicle is assigned
      if (status === "Packing") {
        const checkSql = "SELECT vehicle_id FROM orders WHERE id = ?";
        db.query(checkSql, [id], (errC, rows) => {
          if (errC || rows.length === 0) return db.rollback(() => res.status(500).json({ message: "Check failed" }));

          if (!rows[0].vehicle_id) {
            // Find an available vehicle
            const findSql = "SELECT id FROM delivery_vehicles WHERE status = 'Available' LIMIT 1";
            db.query(findSql, (errF, vRows) => {
              if (vRows && vRows.length > 0) {
                const vehicleId = vRows[0].id;
                // Assign and update vehicle status
                const assignSql = "UPDATE orders SET vehicle_id = ? WHERE id = ?";
                db.query(assignSql, [vehicleId, id], (errA) => {
                  if (errA) return db.rollback(() => res.status(500).json({ message: "Assign failed" }));

                  const updVehicleSql = "UPDATE delivery_vehicles SET status = 'Assigned' WHERE id = ?";
                  db.query(updVehicleSql, [vehicleId], (errV) => {
                    if (errV) return db.rollback(() => res.status(500).json({ message: "Vehicle update failed" }));

                    db.commit((commitErr) => {
                      if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                      res.status(200).json({ message: `Status updated and Vehicle automatically assigned! 🚚` });
                    });
                  });
                });
              } else {
                // No vehicle available, but status is updated
                db.commit((commitErr) => {
                  if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                  res.status(200).json({ message: `Status updated to ${status} ✅ (No available vehicles for auto-assignment)` });
                });
              }
            });
          } else {
            db.commit((commitErr) => {
              if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
              res.status(200).json({ message: `Status updated to ${status} ✅` });
            });
          }
        });
      } else if (status === "Delivered") {
        // Auto-Release vehicle when delivered
        const checkSql = "SELECT vehicle_id FROM orders WHERE id = ?";
        db.query(checkSql, [id], (errC, rows) => {
          if (rows && rows[0]?.vehicle_id) {
            const vId = rows[0].vehicle_id;
            const releaseVSql = "UPDATE delivery_vehicles SET status = 'Available' WHERE id = ?";
            db.query(releaseVSql, [vId], (errR) => {
              if (errR) return db.rollback(() => res.status(500).json({ message: "Release failed" }));
              db.commit((commitErr) => {
                if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                res.status(200).json({ message: "Order Delivered and Vehicle Released! ✅" });
              });
            });
          } else {
            db.commit((commitErr) => {
              if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
              res.status(200).json({ message: "Order Delivered! ✅" });
            });
          }
        });
      } else {
        db.commit((commitErr) => {
          if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
          res.status(200).json({ message: `Status updated to ${status} ✅` });
        });
      }
    });
  });
});

module.exports = router;
