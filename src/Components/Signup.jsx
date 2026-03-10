import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();

  // Role state
  const [role, setRole] = useState("Buyer");

  // Form state (⬅️ THIS IS WHERE YOUR CODE GOES)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle signup submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          password: form.password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Navigate by role after success
      if (role === "Farmer") navigate("/farmer-dashboard");
      else if (role === "Expert") navigate("/expert-dashboard");
      else navigate("/buyer-dashboard");

    } catch (error) {
      alert("Server error ❌");
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <h2 style={styles.greeting}>Create your account</h2>

      <form onSubmit={handleSignUp} style={styles.form}>
        <label style={styles.label}>
          Full Name
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Phone Number
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Country
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          City
          <input
            type="text"
            name="city"
            value={form.city}
            placeholder="e.g. Kathmandu"
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Select Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ ...styles.input, backgroundColor: "#fff" }}
          >
            <option value="Buyer">Buyer</option>
            <option value="Farmer">Farmer</option>
            <option value="Expert">Expert</option>
          </select>
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <button type="submit" style={styles.signUpButton}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    maxWidth: 400,
    margin: "20px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  backButton: {
    border: "none",
    background: "transparent",
    color: "#2e7d32",
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: 10,
  },
  greeting: {
    color: "#2e7d32",
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: "#444",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 6,
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #c8e6c9",
    backgroundColor: "#f1f8f4",
  },
  signUpButton: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    padding: "12px 0",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 15,
  },
};

export default SignUpPage;
