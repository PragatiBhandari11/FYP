import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WeatherDetail() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    // Fetch user profile to get City
    fetch(`http://localhost:5000/api/user/${email}`)
      .then(res => res.json())
      .then(user => {
        if (user.city) {
          fetch(`http://localhost:5000/api/weather/${user.city}`)
            .then(res => res.json())
            .then(data => setWeather(data))
            .catch(err => console.error("Weather fetch error:", err));
        }
      });
  }, []);

  if (!weather) {
    return <div style={{ textAlign: "center", padding: "50px", color: "#2e7d32" }}>Loading Weather Data...</div>;
  }

  return (
    <>
      <style>{`
        body { margin: 0; font-family: 'Inter', sans-serif; background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%); min-height: 100vh; color: white; display: flex; justify-content: center; padding: 20px; }
        .container { width: 390px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 30px; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; position: relative; }
        .back-btn { position: absolute; top: 20px; left: 20px; background: rgba(255, 255, 255, 0.3); border: none; color: white; padding: 8px 12px; border-radius: 12px; cursor: pointer; font-weight: bold; }
        
        .city-name { font-size: 32px; font-weight: bold; margin-top: 40px; margin-bottom: 5px; }
        .date { font-size: 14px; opacity: 0.8; margin-bottom: 20px; }
        
        .main-temp { font-size: 80px; font-weight: 200; margin: 10px 0; }
        .condition { font-size: 20px; font-weight: 500; margin-bottom: 30px; }
        
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; margin-bottom: 30px; }
        .stat-item { background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 20px; text-align: center; }
        .stat-label { font-size: 12px; opacity: 0.7; margin-bottom: 5px; text-transform: uppercase; }
        .stat-value { font-size: 18px; font-weight: 600; }
        
        .forecast-title { align-self: flex-start; margin-bottom: 15px; font-weight: bold; font-size: 16px; }
        .forecast-list { display: flex; gap: 15px; width: 100%; overflow-x: auto; padding-bottom: 10px; }
        .forecast-item { background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 20px; min-width: 80px; text-align: center; flex-shrink: 0; }
        .forecast-day { font-size: 13px; margin-bottom: 10px; opacity: 0.8; }
        .forecast-temp { font-size: 16px; font-weight: bold; }
      `}</style>
      
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        
        <div className="city-name">{weather.city}</div>
        <div className="date">Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
        
        <div className="main-temp">{weather.temp}°</div>
        <div className="condition">{weather.condition}</div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Humidity</div>
            <div className="stat-value">{weather.humidity}%</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Wind</div>
            <div className="stat-value">{weather.windSpeed} km/h</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Pressure</div>
            <div className="stat-value">{weather.pressure} hPa</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Visibility</div>
            <div className="stat-value">{weather.visibility} km</div>
          </div>
        </div>
        
        <div className="forecast-title">5-Day Forecast</div>
        <div className="forecast-list">
          {weather.forecast.map((f, i) => (
            <div key={i} className="forecast-item">
              <div className="forecast-day">{f.day}</div>
              <div className="forecast-temp">{f.temp}°</div>
              <div style={{fontSize: "11px", marginTop: "5px"}}>{f.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
