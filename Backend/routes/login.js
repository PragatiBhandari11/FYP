const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db'); // Path to your db connection file

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check if user exists in your MySQL table
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (result.length > 0) {
            const user = result[0];

            // 1. Try checking against old plain-text passwords (Legacy fallback)
            let isMatch = false;
            if (password === user.password) {
                isMatch = true;
            } 
            // 2. Try checking against newly encrypted bcrypt passwords
            else {
                isMatch = await bcrypt.compare(password, user.password);
            }

            if (isMatch) {
                // Send back success and role (e.g., 'expert', 'buyer')
                res.json({ 
                    success: true, 
                    role: user.role, 
                    user: { fullName: user.full_name } 
                });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    });
});

module.exports = router; // This line is vital for Server.js to see this file