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
    SELECT o.*, u.full_name AS buyer_name, v.plate_number, v.vehicle_type
    FROM orders o
    LEFT JOIN users u ON o.buyer_email = u.email
    LEFT JOIN delivery_vehicles v ON o.vehicle_id = v.id
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

// 8. UPDATE ORDER STATUS (Global with Auto-Assign)
router.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) return res.status(400).json({ message: "Status required" });

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction failed" });

    // Step 1: Fetch order for notification info
    db.query("SELECT buyer_email, order_number, vehicle_id FROM orders WHERE id = ?", [id], (errO, rows) => {
      if (errO || rows.length === 0) return db.rollback(() => res.status(500).json({ message: "Order not found" }));
      
      const { buyer_email, order_number, vehicle_id } = rows[0];

      // Step 2: Update status
      const updateSql = "UPDATE orders SET status = ? WHERE id = ?";
      db.query(updateSql, [status, id], (err1) => {
        if (err1) return db.rollback(() => res.status(500).json({ message: "Update failed" }));

        // Step 3: Notification Logic (Shared)
        const sendNotification = (callback) => {
          const notifSql = "INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)";
          const title = `Order Update: #${order_number.slice(-8)}`;
          const message = `Your order status has been updated to: ${status}`;
          db.query(notifSql, [buyer_email, title, message, 'Order'], (notifErr) => {
            if (notifErr) console.error("Failed to create order notification:", notifErr.message);
            callback();
          });
        };

        // Step 4: Auto-assign logic for Admin
        if (status === "Packing" && !vehicle_id) {
          const findSql = "SELECT id FROM delivery_vehicles WHERE status = 'Available' LIMIT 1";
          db.query(findSql, (errF, vRows) => {
            if (vRows && vRows.length > 0) {
              const vId = vRows[0].id;
              const assignSql = "UPDATE orders SET vehicle_id = ? WHERE id = ?";
              db.query(assignSql, [vId, id], (errA) => {
                if (errA) return db.rollback(() => res.status(500).json({ message: "Assign failed" }));

                const updVSql = "UPDATE delivery_vehicles SET status = 'Assigned' WHERE id = ?";
                db.query(updVSql, [vId], (errV) => {
                  if (errV) return db.rollback(() => res.status(500).json({ message: "Vehicle update failed" }));

                  db.commit((commitErr) => {
                    if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                    sendNotification(() => res.status(200).json({ message: "Status updated & Vehicle Assigned! 🚚" }));
                  });
                });
              });
            } else {
              db.commit((commitErr) => {
                if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                sendNotification(() => res.status(200).json({ message: `Status updated to ${status} ✅ (No Vans Available)` }));
              });
            }
          });
        } else if (status === "Delivered") {
          // Auto-Release vehicle for Admin update
          if (vehicle_id) {
            const releaseSql = "UPDATE delivery_vehicles SET status = 'Available' WHERE id = ?";
            db.query(releaseSql, [vehicle_id], (errR) => {
              if (errR) return db.rollback(() => res.status(500).json({ message: "Release failed" }));
              db.commit((commitErr) => {
                if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
                sendNotification(() => res.status(200).json({ message: "Order Delivered and Vehicle Released! ✅" }));
              });
            });
          } else {
            db.commit((commitErr) => {
              if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
              sendNotification(() => res.status(200).json({ message: "Order Delivered! ✅" }));
            });
          }
        } else {
          db.commit((commitErr) => {
            if (commitErr) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
            sendNotification(() => res.status(200).json({ message: `Order status updated to ${status} ✅` }));
          });
        }
      });
    });
  });
});

// 9. GET ALL DELIVERY VEHICLES (Inventory)
router.get("/vehicles", (req, res) => {
  const sql = "SELECT * FROM delivery_vehicles ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Admin Fetch vehicles error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// 10. ADD NEW DELIVERY VEHICLE
router.post("/vehicles", (req, res) => {
  const { plate_number, vehicle_type } = req.body;
  if (!plate_number || !vehicle_type) {
    return res.status(400).json({ message: "Plate number and vehicle type are required." });
  }

  const sql = "INSERT INTO delivery_vehicles (plate_number, vehicle_type) VALUES (?, ?)";
  db.query(sql, [plate_number, vehicle_type], (err) => {
    if (err) {
      console.error("❌ Admin Add vehicle error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Vehicle added successfully ✅" });
  });
});

// 11. DELETE DELIVERY VEHICLE
router.delete("/vehicles/:id", (req, res) => {
  const sql = "DELETE FROM delivery_vehicles WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("❌ Admin Delete vehicle error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json({ message: "Vehicle removed successfully ✅" });
  });
});

// 12. ASSIGN VEHICLE TO ORDER
router.put("/orders/:id/assign-vehicle", (req, res) => {
  const { vehicleId } = req.body;
  const orderId = req.params.id;

  if (!vehicleId) return res.status(400).json({ message: "Vehicle Selection Required" });

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction start failed" });

    // Step 1: Assign vehicle to order
    const updateOrderSql = "UPDATE orders SET vehicle_id = ? WHERE id = ?";
    db.query(updateOrderSql, [vehicleId, orderId], (err1) => {
      if (err1) {
        return db.rollback(() => res.status(500).json({ message: "Failed to assign vehicle to order" }));
      }

      // Step 2: Mark vehicle as 'Assigned'
      const updateVehicleSql = "UPDATE delivery_vehicles SET status = 'Assigned' WHERE id = ?";
      db.query(updateVehicleSql, [vehicleId], (err2) => {
        if (err2) {
          return db.rollback(() => res.status(500).json({ message: "Failed to update vehicle status" }));
        }

        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
          }
          res.status(200).json({ message: "Vehicle assigned successfully! 🚚" });
        });
      });
    });
  });
});

module.exports = router;
