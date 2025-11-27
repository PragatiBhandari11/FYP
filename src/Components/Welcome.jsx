import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.appContainer}>
      <div style={styles.card}>

        {/* App Title */}
        <h1 style={styles.title}>Farmers Market</h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          Bringing the charm of the Nepali market to your fingertips
        </p>

        {/* App Button */}
        <button
          style={styles.primaryButton}
          onClick={() => navigate("/login")}
        >
          Let’s Get Started
        </button>

        {/* Sign-in Link */}
        <p style={styles.footerText}>
          Already have an account?
          <span
            style={styles.signInLink}
            onClick={() => navigate("/login")}
          >
            {" "}Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#F9F5FF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    padding: 25,
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
  },

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: "#5a2ca0",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 40,
    paddingHorizontal: 10,
  },

  primaryButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#6a2ed9",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 25,
  },

  footerText: {
    fontSize: 14,
    color: "#777",
  },

  signInLink: {
    color: "#6a2ed9",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Welcome;
