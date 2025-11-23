import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    country: "",
    role: "Buyer",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Password confirmation check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    // Here you would normally send form data to backend API

    alert(`Welcome ${form.fullname}! Your account has been created.`);
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.greeting}>Create your account</h2>

      <form onSubmit={handleSignUp} style={styles.form}>
        <label style={styles.label}>
          Full Name
          <input
            type="text"
            name="fullname"
            placeholder="Enter your full name"
            value={form.fullname}
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
            placeholder="Enter your email"
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
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Country
          <input
            type="text"
            name="country"
            placeholder="Enter your country"
            value={form.country}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ ...styles.input, paddingRight: 30 }}
            required
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
            placeholder="Enter your password"
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
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

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
  greeting: {
    color: "#6a3cc9",
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
    color: "#555",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 6,
    padding: "10px 12px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    color: "red",
    marginBottom: 12,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#6a3cc9",
    color: "#fff",
    padding: "12px 0",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 10,
  },
};

export default SignUpPage;
