import React, { useState, useEffect } from "react";

const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // replace with your API key

const defaultPlaces = [
  { name: "Kathmandu", query: "Kathmandu" },
  { name: "Pokhara", query: "Pokhara" },
  { name: "Lalitpur", query: "Lalitpur" },
  { name: "Bharatpur", query: "Bharatpur" },
  { name: "Biratnagar", query: "Biratnagar" },
];

export  default function WeatherInfoPage() {
  const [search, setSearch] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},NP&appid=${API_KEY}&units=metric&lang=en`
      );
      if (!response.ok) {
        throw new Error("Location not found");
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather(defaultPlaces[0].query);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() === "") return;
    fetchWeather(search.trim());
  };

  return (
    <div style={{ maxWidth: 450, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#4caf50" }}>Weather Information</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search city (e.g. Kathmandu)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />
      </form>

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 10 }}>
        {defaultPlaces.map(({ name, query }) => (
          <button
            key={query}
            onClick={() => fetchWeather(query)}
            style={{
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 14,
              minWidth: 90,
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#e7f5e7",
          padding: 20,
          borderRadius: 12,
          minHeight: 160,
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {weatherData && !loading && (
          <>
            <h3 style={{ marginBottom: 6 }}>{weatherData.name}</h3>
            <p style={{ fontSize: 24, margin: "6px 0" }}>
              {Math.round(weatherData.main.temp)}°C
            </p>
            <p style={{ fontSize: 16, margin: "6px 0", fontWeight: "bold" }}>
              {weatherData.weather[0].description}
            </p>
            <p style={{ margin: "4px 0" }}>
              Humidity: {weatherData.main.humidity}%
            </p>
            <p style={{ margin: "4px 0" }}>
              Wind Speed: {weatherData.wind.speed} m/s
            </p>
          </>
        )}
      </div>
    </div>
  );
}
