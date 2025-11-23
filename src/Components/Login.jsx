import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Simple auth check example
    if (form.email === "user@123.com" && form.password === "password") {
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome Back!</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>
          Log In
        </button>
      </form>

      <p style={styles.signupText}>
        Don't have an account?{" "}
        <Link to="/signup" style={styles.signupLink}>
          Sign up
        </Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "60px auto",
    padding: 30,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    borderRadius: 12,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    color: "#6a3cc9",
    fontWeight: "700",
    fontSize: 28,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 16,
    fontWeight: "600",
    fontSize: 14,
    color: "#555",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 6,
    padding: "12px 16px",
    borderRadius: 8,
    border: "1.5px solid #ddd",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    marginTop: 20,
    padding: "12px",
    backgroundColor: "#6a3cc9",
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  signupText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    color: "#6a3cc9",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Login;
