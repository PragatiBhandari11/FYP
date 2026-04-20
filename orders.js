const express = require("express");
const db = require("../db");

const router = express.Router();

// 1. CHECKOUT (Convert Cart to Order)
router.post("/checkout", (req, res) => {
  const { buyerEmail, totalAmount } = req.body;

  if (!buyerEmail || totalAmount === undefined) {
    return res.status(400).json({ message: "Missing buyer or total amount details." });
  }

  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction start failed." });

    const insertOrderSql = "INSERT INTO orders (order_number, buyer_email, total_amount, payment_method, payment_status, status) VALUES (?, ?, ?, 'COD', 'Pending', 'Accepted')";
    db.query(insertOrderSql, [orderNumber, buyerEmail, totalAmount], (err1, orderResult) => {
      if (err1) {
        return db.rollback(() => res.status(500).json({ message: "Failed to create order." }));
      }

      const orderId = orderResult.insertId;

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

        const orderItemsValues = cartItems.map(item => {
          let priceAtPurchase = item.price;
          if (item.wholesale_price && item.min_wholesale_qty && item.quantity >= item.min_wholesale_qty) {
            priceAtPurchase = item.wholesale_price;
          }
          return [orderId, item.product_id, item.name, priceAtPurchase, item.quantity];
        });

        const insertItemsSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";
        db.query(insertItemsSql, [orderItemsValues], (err3) => {
          if (err3) {
            return db.rollback(() => res.status(500).json({ message: "Failed to save order items." }));
          }

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

              // ✅ NEW: Notify Farmer(s)
              const notifyFarmerSql = `
                INSERT INTO notifications (user_email, title, message, type)
                SELECT DISTINCT p.farmer_id, 'New Order! 📦', CONCAT('You have a new order (#', ?, ')'), 'Order'
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
              `;
              db.query(notifyFarmerSql, [orderNumber, orderId], (nErr) => {
                if (nErr) console.error("Farmer notification error:", nErr.message);
                else console.log("✅ Farmer notified about order:", orderNumber);
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
  const { buyerEmail, totalAmount, buyerName, returnUrl } = req.body;

  if (!buyerEmail || !totalAmount) {
    return res.status(400).json({ message: "Missing buyer or amount." });
  }

  const orderNumber = `KLT-${Date.now()}`;
  const amountInPaisa = Math.round(parseFloat(totalAmount) * 100);

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction start failed." });

    const insertOrderSql = "INSERT INTO orders (order_number, buyer_email, total_amount, payment_method, payment_status, status) VALUES (?, ?, ?, 'Khalti', 'Pending', 'Payment Pending')";
    db.query(insertOrderSql, [orderNumber, buyerEmail, totalAmount], (err1, orderResult) => {
      if (err1) return db.rollback(() => res.status(500).json({ message: "Failed to create order." }));

      const orderId = orderResult.insertId;

      const fetchCartSql = `
        SELECT c.product_id, c.quantity, p.price, p.name 
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.buyer_email = ?
      `;

      db.query(fetchCartSql, [buyerEmail], async (err2, cartItems) => {
        if (err2 || cartItems.length === 0) return db.rollback(() => res.status(400).json({ message: "Cart is empty." }));

        const orderItemsValues = cartItems.map(item => {
          let priceAtPurchase = item.price;
          if (item.wholesale_price && item.min_wholesale_qty && item.quantity >= item.min_wholesale_qty) {
            priceAtPurchase = item.wholesale_price;
          }
          return [orderId, item.product_id, item.name, priceAtPurchase, item.quantity];
        });
        const insertItemsSql = "INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ?";

        db.query(insertItemsSql, [orderItemsValues], async (err3) => {
          if (err3) return db.rollback(() => res.status(500).json({ message: "Failed to save order items." }));

          try {
            console.log("--- Khalti Initiation Debug ---");
            console.log("Secret Key Loaded:", !!process.env.KHALTI_SECRET_KEY);
            console.log("Key Length:", process.env.KHALTI_SECRET_KEY?.length);

            // Default fallback if frontend doesn't send returnUrl
            const finalReturnUrl = returnUrl || "http://localhost:8081/buyer/PaymentSuccess";

            const payload = {
              "return_url": finalReturnUrl,
              "website_url": "http://localhost:8081",
              "amount": amountInPaisa,
              "purchase_order_id": orderNumber,
              "purchase_order_name": "AgroConnect Order",
              "customer_info": {
                "name": buyerName || "Valued Customer",
                "email": buyerEmail
              }
            };
            console.log("Payload:", JSON.stringify(payload, null, 2));

            // ✅ FIX #1: Corrected Khalti API URL (was a.khalti.com — does not exist)
            // Use dev.khalti.com for sandbox testing
            // Use khalti.com for live/production
            const khaltiRes = await fetch("https://dev.khalti.com/api/v2/epayment/initiate/", {
              method: "POST",
              headers: {
                "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const khaltiData = await khaltiRes.json();
            console.log("Khalti Response Status:", khaltiRes.status);
            
            if (khaltiRes.status === 200 && khaltiData.pidx) {
              // ✅ UPDATE order with pidx so we can verify it later
              db.query("UPDATE orders SET pidx = ? WHERE id = ?", [khaltiData.pidx, orderId], (err4) => {
                if (err4) {
                   console.error("Failed to update order with pidx:", err4);
                   return db.rollback(() => res.status(500).json({ message: "Failed to link payment." }));
                }
                
                db.commit((commitErr) => {
                  if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed." }));
                  console.log("✅ Khalti pidx generated & linked:", khaltiData.pidx);
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
  const currentPidx = String(pidx || "");

  if (!currentPidx || currentPidx === "undefined") return res.status(400).json({ message: "Missing or invalid pidx." });

  try {
    const verifyResponse = await fetch("https://dev.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pidx: currentPidx })
    });

    const statusData = await verifyResponse.json();
    console.log("--- Khalti Verification Full Response ---");
    console.log("HTTP Status:", verifyResponse.status);
    console.log("Data:", JSON.stringify(statusData, null, 2));

    // Khalti returns status: "Completed" for successful transactions
    if (statusData.status === "Completed") {
      const updateSql = "UPDATE orders SET payment_status = 'Paid', status = 'Accepted' WHERE pidx = ?";
      db.query(updateSql, [currentPidx], (err) => {
        if (err) return res.status(500).json({ message: "Database update failed." });

        // ✅ FIX #3: Safer cart clearing — two separate queries instead of risky subquery
        db.query("SELECT buyer_email FROM orders WHERE pidx = ? LIMIT 1", [currentPidx], (err2, rows) => {
          if (err2 || !rows || rows.length === 0) {
            console.warn("Could not find buyer email to clear cart.");
            return res.status(200).json({ message: "Payment Verified! ✅", status: "Completed" });
          }

          const buyerEmail = rows[0].buyer_email;
          db.query("DELETE FROM cart_items WHERE buyer_email = ?", [buyerEmail], (err3) => {
            if (err3) console.warn("Failed to clear cart after payment:", err3.message);
            res.status(200).json({ message: "Payment Verified! ✅", status: "Completed" });

            // ✅ NEW: Notify Farmer(s) for Khalti Order
            const notifyFarmerSql = `
                INSERT INTO notifications (user_email, title, message, type)
                SELECT DISTINCT p.farmer_id, 'New Paid Order! 💰', CONCAT('New paid order from ', ?, ' (#', o.order_number, ')'), 'Order'
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.pidx = ?
            `;
            db.query(notifyFarmerSql, [buyerEmail, currentPidx], (nErr) => {
              if (nErr) console.error("Farmer Khalti notification error:", nErr.message);
              else console.log("✅ Farmer(s) notified about Khalti order");
            });
          });
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
    SELECT 
      o.*, 
      v.plate_number, 
      v.vehicle_type,
      (SELECT p.name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = o.id 
       LIMIT 1) AS first_product_name,
      (SELECT COUNT(*) 
       FROM order_items 
       WHERE order_id = o.id) AS item_count
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
           u.full_name AS buyer_name,
           v.plate_number, v.vehicle_type
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.buyer_email = u.email
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

    const updateSql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(updateSql, [status, id], (err1) => {
      if (err1) return db.rollback(() => res.status(500).json({ message: "Update failed" }));

        const finishUpdate = (msg) => {
          db.commit((commitErr) => {
            if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
            res.status(200).json({ message: msg });

            // ✅ NEW: Notify Buyer of Status Change (Unified)
            db.query("SELECT buyer_email, order_number FROM orders WHERE id = ?", [id], (errN, rowsN) => {
              if (!errN && rowsN.length > 0) {
                const { buyer_email, order_number } = rowsN[0];
                let title = "Order Update 🚚";
                let notifMsg = `Your order ${order_number} status is now: ${status}`;

                if (status === "Accepted") notifMsg = `Your order ${order_number} has been accepted by the farmer! ✅`;
                if (status === "Packing") notifMsg = `Good news! Your order ${order_number} is being packed. 📦`;
                if (status === "Out for Delivery") {
                  title = "Out for Delivery! 🚚";
                  notifMsg = `Fasten your seatbelts! Your order ${order_number} is out for delivery.`;
                }
                if (status === "Delivered") {
                  title = "Delivered! 🥳";
                  notifMsg = `Great news! Your order ${order_number} has been delivered successfully.`;
                }

                db.query("INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, 'Order')", 
                  [buyer_email, title, notifMsg]);
              }
            });
          });
        };

        if (status === "Packing") {
          const checkSql = "SELECT vehicle_id FROM orders WHERE id = ?";
          db.query(checkSql, [id], (errC, rows) => {
            if (errC || rows.length === 0) return db.rollback(() => res.status(500).json({ message: "Check failed" }));

            if (!rows[0].vehicle_id) {
              const findSql = "SELECT id FROM delivery_vehicles WHERE status = 'Available' LIMIT 1";
              db.query(findSql, (errF, vRows) => {
                if (vRows && vRows.length > 0) {
                  const vehicleId = vRows[0].id;
                  const assignSql = "UPDATE orders SET vehicle_id = ? WHERE id = ?";
                  db.query(assignSql, [vehicleId, id], (errA) => {
                    if (errA) return db.rollback(() => res.status(500).json({ message: "Assign failed" }));

                    const updVehicleSql = "UPDATE delivery_vehicles SET status = 'Assigned' WHERE id = ?";
                    db.query(updVehicleSql, [vehicleId], (errV) => {
                      if (errV) return db.rollback(() => res.status(500).json({ message: "Vehicle update failed" }));
                      finishUpdate(`Status updated and Vehicle automatically assigned! 🚚`);
                    });
                  });
                } else {
                  finishUpdate(`Status updated to ${status} ✅ (No available vehicles)`);
                }
              });
            } else {
              finishUpdate(`Status updated to ${status} ✅`);
            }
          });
        } else if (status === "Delivered") {
          const checkSql = "SELECT vehicle_id FROM orders WHERE id = ?";
          db.query(checkSql, [id], (errC, rows) => {
            if (rows && rows[0]?.vehicle_id) {
              const vId = rows[0].vehicle_id;
              const releaseVSql = "UPDATE delivery_vehicles SET status = 'Available' WHERE id = ?";
              db.query(releaseVSql, [vId], (errR) => {
                if (errR) return db.rollback(() => res.status(500).json({ message: "Release failed" }));
                finishUpdate("Order Delivered and Vehicle Released! ✅");
              });
            } else {
              finishUpdate("Order Delivered! ✅");
            }
          });
        } else {
          finishUpdate(`Status updated to ${status} ✅`);
        }
    });
  });
});

module.exports = router;