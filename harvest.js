const express = require('express');
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// REGISTER A NEW CROP FOR TRACKING
router.post('/register-crop', (req, res) => {
    const { email, cropName, plantedDate, city } = req.body;

    if (!email || !cropName || !plantedDate) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Find maturity days from crop_calendar (default to 90 if not found)
    db.query("SELECT maturity_days FROM crop_calendar WHERE crop_name = ?", [cropName], (err, results) => {
        const maturity = (results && results.length > 0) ? results[0].maturity_days : 90;
        
        const planted = new Date(plantedDate);
        const expected = new Date(planted);
        expected.setDate(planted.getDate() + maturity);

        const sql = "INSERT INTO active_crops (farmer_email, crop_name, planted_date, expected_harvest_date, city) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [email, cropName, plantedDate, expected.toISOString().split('T')[0], city || 'Kathmandu'], (insErr) => {
            if (insErr) return res.status(500).json({ message: insErr.message });
            res.status(201).json({ message: "Crop registered for tracking! 🌾", expectedHarvest: expected });
        });
    });
});

// GET HARVEST ALERTS FOR A FARMER
router.get('/alerts/:email', async (req, res) => {
    const { email } = req.params;

    db.query("SELECT * FROM active_crops WHERE farmer_email = ? AND status = 'Growing'", [email], async (err, crops) => {
        if (err) return res.status(500).json({ message: err.message });
        if (crops.length === 0) return res.json([]);

        const alerts = [];
        const today = new Date();

        for (const crop of crops) {
            const harvestDate = new Date(crop.expected_harvest_date);
            const diffDays = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));

            // Logic: If within 10 days of harvest, check weather
            if (diffDays <= 10 && diffDays >= -5) {
                let weatherAlert = "Harvest time approaching.";
                let weatherOk = true;

                try {
                    const apiKey = process.env.OPENWEATHER_API_KEY;
                    const city = crop.city || "Kathmandu";
                    
                    if (apiKey && !apiKey.includes("YOUR_")) {
                        const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
                        
                        // Check next 48 hours
                        const next48Hours = weatherRes.data.list.slice(0, 16);
                        const rainSum = next48Hours.reduce((sum, w) => sum + (w.rain?.['3h'] || 0), 0);
                        const minTemp = Math.min(...next48Hours.map(w => w.main.temp));
                        
                        if (minTemp < 2) {
                            weatherAlert = "❄️ Frost alert! Temperature dropping below 2°C. Harvest immediately to avoid crop damage.";
                            weatherOk = false;
                        } else if (rainSum > 20) {
                            weatherAlert = `⚠️ Heavy rain expected (${Math.round(rainSum)}mm in 48h). Consider early harvest to save your yield!`;
                            weatherOk = false;
                        } else if (rainSum > 0) {
                            weatherAlert = "🌧️ Some rain predicted. Monitor your fields closely.";
                            weatherOk = true;
                        } else {
                            weatherAlert = "☀️ Clear skies predicted for next 48 hours. Perfect window for harvesting!";
                            weatherOk = true;
                        }
                    } else {
                        weatherAlert = "Forecast suggests a clear window (Mock Data). Best time to harvest!";
                    }
                } catch (wErr) {
                    console.error("Weather API error:", wErr.message);
                    weatherAlert = "Check local forecast before harvesting.";
                }

                // AUTO-SAVE TO NOTIFICATIONS TABLE (If not already notified today)
                const checkNotifSql = "SELECT id FROM notifications WHERE user_email = ? AND title LIKE ? AND created_at > CURDATE()";
                const notifTitle = `🌾 Harvest Alert: ${crop.crop_name}`;
                
                db.query(checkNotifSql, [email, `%${crop.crop_name}%`], (nErr, nRes) => {
                    if (!nErr && nRes.length === 0) {
                        const insNotifSql = "INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, 'Harvest')";
                        db.query(insNotifSql, [email, notifTitle, weatherAlert]);
                    }
                });

                alerts.push({
                    cropId: crop.id,
                    cropName: crop.crop_name,
                    expectedDate: crop.expected_harvest_date,
                    daysRemaining: diffDays,
                    message: weatherAlert,
                    isGoodWindow: weatherOk,
                    severity: diffDays <= 0 ? 'High' : 'Moderate'
                });
            }
        }

        res.json({
            alerts,
            crops: crops.map(c => {
                const planted = new Date(c.planted_date);
                const expected = new Date(c.expected_harvest_date);
                const totalDays = Math.ceil((expected - planted) / (1000 * 60 * 60 * 24)) || 90;
                const daysPassed = Math.ceil((today - planted) / (1000 * 60 * 60 * 24));
                const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
                return { ...c, progress };
            })
        });
    });
});

// GET SEASONAL ADVISORY
router.get('/seasonal-advisory', async (req, res) => {
    const { city } = req.query;
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }); // e.g., "April"
    
    // Find crops that are "best" in this month
    db.query("SELECT crop_name, crop_type, description FROM crop_calendar WHERE best_months LIKE ?", [`%${currentMonth}%`], async (err, crops) => {
        if (err) return res.status(500).json({ message: err.message });
        
        let weatherAdvice = "";
        let temp = "24";
        try {
            const apiKey = process.env.OPENWEATHER_API_KEY;
            const targetCity = city || "Kathmandu";
            if (apiKey && !apiKey.includes("YOUR_")) {
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${apiKey}&units=metric`);
                const cond = weatherRes.data.weather[0].main.toLowerCase();
                temp = weatherRes.data.main.temp.toString();
                if (cond.includes('rain')) weatherAdvice = "Heavy rain today. Delay any harvesting activities.";
                else weatherAdvice = "Clear weather. Ideal for harvesting seasonal crops!";
            } else {
                weatherAdvice = "Clear skies (Mock Data). Good for field work.";
            }
        } catch (wErr) {
            weatherAdvice = "Check local weather before starting.";
        }

        res.json({
            month: currentMonth,
            crops: crops || [],
            weatherAdvice,
            temp,
            summary: `It's ${currentMonth} in ${city || 'Nepal'}. ${crops.length > 0 ? `Traditional crops like ${crops.slice(0, 2).map(c => c.crop_name).join(', ')} are ready.` : 'Consult the crop calendar for details.'}`
        });
    });
});

module.exports = router;
