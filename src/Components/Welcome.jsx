import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>

        {/* Title */}
        <h1 style={styles.title}>Farmers Market</h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          Bringing the charm of the Nepali market to your fingertips
        </p>

        {/* Main Button */}
        <button
          style={styles.startButton}
          onClick={() => navigate("/login")}
        >
          Let’s get started
        </button>

        {/* Footer */}
        <p style={styles.footer}>
          Already have an account?
          <span
            style={styles.signIn}
            onClick={() => navigate("/login")}
          >
            {" "}Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "white",
    padding: "20px",
  },
  content: {
    textAlign: "center",
    width: "100%",
    maxWidth: "350px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#5a2ca0",
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: "35px",
    color: "gray",
    fontSize: "14px",
  },
  startButton: {
    width: "100%",
    padding: "15px",
    background: "#6a2ed9",
    color: "white",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    color: "gray",
  },
  signIn: {
    color: "#6a2ed9",
    fontWeight: "bold",
    cursor: "pointer",
  }
};

export default Welcome;
