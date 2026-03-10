const express = require("express");
const router = express.Router();

// Mock Weather Data Function
const getMockWeather = (city) => {
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy"];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.floor(Math.random() * (35 - 10) + 10); // 10°C to 35°C
  
  return {
    city: city || "Unknown",
    temp: temp,
    condition: randomCondition,
    humidity: Math.floor(Math.random() * (90 - 30) + 30),
    windSpeed: (Math.random() * 20).toFixed(1),
    pressure: Math.floor(Math.random() * (1020 - 990) + 990),
    visibility: (Math.random() * 10 + 5).toFixed(1),
    description: `Clear skies with occasional ${randomCondition.toLowerCase()} intervals.`,
    forecast: [
      { day: "Mon", temp: temp + 2, condition: "Sunny" },
      { day: "Tue", temp: temp - 1, condition: "Partly Cloudy" },
      { day: "Wed", temp: temp + 1, condition: "Cloudy" },
      { day: "Thu", temp: temp, condition: "Rainy" },
      { day: "Fri", temp: temp + 3, condition: "Sunny" },
    ]
  };
};

// GET WEATHER ROUTE
router.get("/weather/:city", (req, res) => {
  const { city } = req.params;
  
  // For now, return mock data. 
  // In a real app, you'd fetch from OpenWeatherMap here using an API Key.
  const weatherData = getMockWeather(city);
  
  res.status(200).json(weatherData);
});

module.exports = router;
