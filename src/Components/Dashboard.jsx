import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>AgroConnect Dashboard</h1>
        <nav>
          <Link to="/" style={styles.navLink}>
            Logout
          </Link>
        </nav>
      </header>

      <section style={styles.welcomeSection}>
        <h2>Welcome back, User!</h2>
        <p>Here's a summary of your activity.</p>
      </section>

      <section style={styles.cardsContainer}>
        <div style={styles.card}>
          <h3>Market Prices</h3>
          <p>Real-time updates</p>
        </div>

        <div style={styles.card}>
          <h3>Weather Updates</h3>
          <p>Current local weather</p>
        </div>

        <div style={styles.card}>
          <h3>Crop Tips</h3>
          <p>Best practices for your crops</p>
        </div>

        <div style={styles.card}>
          <h3>Community Forum</h3>
          <p>Connect with other farmers</p>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 900,
    margin: "30px auto",
    padding: "0 20px",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #6a3cc9",
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    color: "#6a3cc9",
    margin: 0,
  },
  navLink: {
    color: "#6a3cc9",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: 16,
    padding: "8px 12px",
    border: "1px solid #6a3cc9",
    borderRadius: 6,
    transition: "background-color 0.3s, color 0.3s",
  },
  welcomeSection: {
    marginBottom: 30,
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  card: {
    backgroundColor: "#f8f8ff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 12px rgba(106, 60, 201, 0.2)",
    transition: "transform 0.2s ease-in-out",
    cursor: "default",
  },
  cardHover: {
    transform: "scale(1.05)",
  },
};

export default Dashboard;
