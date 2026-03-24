const express = require("express");
const router = express.Router();
const db = require("../db");

// --- GLOBAL CROP CALENDAR (Admin Managed) ---

// Add a crop timeline
router.post("/crops", (req, res) => {
  const { crop_name, crop_type, season_type, best_months, description } = req.body;
  const sql = "INSERT INTO crop_calendar (crop_name, crop_type, season_type, best_months, description) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [crop_name, crop_type, season_type, best_months, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Crop added to calendar!", id: result.insertId });
  });
});

// Get all crop timelines
router.get("/crops", (req, res) => {
  db.query("SELECT * FROM crop_calendar ORDER BY crop_name ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Delete a crop timeline
router.delete("/crops/:id", (req, res) => {
  db.query("DELETE FROM crop_calendar WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Crop removed from calendar" });
  });
});


// --- FARMER ACTIVITIES (Farmer Managed) ---

// Add a farmer activity
router.post("/activities", (req, res) => {
  const { farmer_email, task_name, task_date, notes } = req.body;
  const sql = "INSERT INTO farmer_activities (farmer_email, task_name, task_date, notes) VALUES (?, ?, ?, ?)";
  db.query(sql, [farmer_email, task_name, task_date, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Task added to your farm!", id: result.insertId });
  });
});

// Get activities for a farmer
router.get("/activities/:email", (req, res) => {
  db.query("SELECT * FROM farmer_activities WHERE farmer_email = ? ORDER BY task_date ASC", [req.params.email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Toggle activity status (Completed/Pending)
router.put("/activities/:id", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE farmer_activities SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Task status updated" });
  });
});

// Delete a farmer activity
router.delete("/activities/:id", (req, res) => {
  db.query("DELETE FROM farmer_activities WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Task removed" });
  });
});

module.exports = router;
