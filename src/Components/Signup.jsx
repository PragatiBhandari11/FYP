import React, { useState } from "react";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    // Handle sign-in logic here
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => window.history.back()}
          style={styles.backButton}
          aria-label="Go back"
        >
          &#8592;
        </button>
      </div>

      <h2 style={styles.greeting}>Hi Saugat !</h2>
      <p style={styles.subGreeting}>Good to see you back</p>

      <form onSubmit={handleSignIn} style={styles.form}>
        <label style={styles.label}>
          Email
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Password
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showPasswordBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <p style={styles.forgotPassword}>Forgot your password ?</p>

        <button type="submit" style={styles.signInButton}>
          Sign in
        </button>
      </form>

      <p style={styles.orText}>or sign in with</p>

      <div style={styles.socialButtons}>
        <button style={{ ...styles.socialBtn, ...styles.googleBtn }}>
          <img
            src="/mnt/data/c04b4a4b-ecf0-49af-a98b-e238bd39af93.png"
            alt="Google logo"
            style={styles.socialIcon}
          />
          Google
        </button>
        <button style={{ ...styles.socialBtn, ...styles.facebookBtn }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
            alt="Facebook logo"
            style={styles.socialIcon}
          />
          Facebook
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    maxWidth: 360,
    margin: "20px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#6a3cc9",
  },
  greeting: {
    color: "#6a3cc9",
    margin: 0,
  },
  subGreeting: {
    color: "#666",
    marginTop: 4,
    marginBottom: 24,
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    color: "#888",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  },
  showPasswordBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: 12,
    color: "#6a3cc9",
    cursor: "pointer",
    marginTop: -16,
    marginBottom: 24,
  },
  signInButton: {
    width: "100%",
    backgroundColor: "#6a3cc9",
    color: "#fff",
    padding: "12px 0",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 30,
  },
  orText: {
    textAlign: "center",
    fontWeight: 500,
    color: "#aaa",
    marginBottom: 20,
  },
  socialButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    border: "1px solid #ddd",
  },
  googleBtn: {
    backgroundColor: "#fff",
    color: "#333",
  },
  facebookBtn: {
    backgroundColor: "#fff",
    color: "#1877F2",
  },
  socialIcon: {
    width: 18,
    height: 18,
  },
};

export default SignInPage;
