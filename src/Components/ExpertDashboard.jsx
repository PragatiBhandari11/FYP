import React from "react";
import { Link } from "react-router-dom"; // Ensure you have installed react-router-dom

const data = {
  user: {
    name: "Dr. A. Patel",
    role: "Soil & Crop Specialist",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  stats: [
    { label: "Active Queries", value: 12 },
    { label: "Pending", value: 5 },
    { label: "Resolved", value: 142 },
  ],
  tools: [
    { label: "Write Article", icon: "📝" },
    { label: "Upload Guide", icon: "☁️⬆️" },
  ],
  questions: [
    {
      tag: "DISEASE",
      tagColor: "#d32f2f",
      question: "Yellow spots appearing on tomato leaves. Is this blight?",
      author: "Rajesh Kumar",
      location: "Karnataka",
      time: "2h ago",
    },
    {
      tag: "SOIL HEALTH",
      tagColor: "#a57c2c",
      question: "Recommended fertilizer schedule for cotton in black soil?",
      author: "Amit Singh",
      location: "Maharashtra",
      time: "5h ago",
    },
    {
      tag: "WEATHER",
      tagColor: "#1976d2",
      question: "Precautions for wheat crop during upcoming frost?",
      author: "Suresh",
      location: "Punjab",
      time: "1d ago",
    },
  ],
  navItems: [
    { label: "Dashboard", icon: "📊", path: "/expert-dashboard" },
    { label: "Queries", icon: "❓", path: "/queries" },
    { label: "Knowledge", icon: "📚", path: "/knowledge" },
    { label: "Profile", icon: "👤", path: "/expert-profile" },
  ],
};

const ExpertDashboard = () => {
  const [user, setUser] = React.useState({ name: "Expert", role: "Specialist", avatar: data.user.avatar });

  React.useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(`http://localhost:5000/api/user/${email}`)
      .then(res => res.json())
      .then(data => {
        setUser({
          name: data.full_name,
          role: "Expert Specialist",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg" // Placeholder for now
        });
      })
      .catch(err => console.error("Error fetching expert profile:", err));
  }, []);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.profile}>
          <img src={user.avatar} alt="avatar" style={styles.avatar} />
          <div>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.role}>{user.role}</div>
          </div>
        </div>
        <button style={styles.bellButton} aria-label="Notifications">
          🔔
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        {data.stats.map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Expert Tools Section */}
      <div style={styles.sectionTitle}>Expert Tools</div>
      <div style={styles.toolsContainer}>
        {data.tools.map((tool) => (
          <div key={tool.label} style={styles.toolCard}>
            <div style={styles.toolIcon}>{tool.icon}</div>
            <div>{tool.label}</div>
          </div>
        ))}
      </div>

      {/* Questions Header */}
      <div style={styles.newQuestionsHeader}>
        <div style={styles.sectionTitle}>New Questions</div>
        <Link to="/queries" style={styles.viewAll}>
          View All
        </Link>
      </div>

      {/* Question List */}
      <div style={{ paddingBottom: "20px" }}>
        {data.questions.map((q, i) => (
          <div key={i} style={styles.questionCard}>
            <span
              style={{
                ...styles.tag,
                backgroundColor: q.tagColor,
              }}
            >
              {q.tag}
            </span>
            <div style={styles.questionText}>{q.question}</div>
            <div style={styles.author}>
              <span>👤 {q.author}</span> • <span>{q.location}</span>
            </div>
            <div style={styles.time}>{q.time}</div>
          </div>
        ))}
      </div>

      {/* FUNCTIONAL BOTTOM NAVIGATION */}
      <nav style={styles.navbar}>
        {data.navItems.map((item) => (
          <Link key={item.label} to={item.path} style={styles.navItem}>
            <div style={styles.navIcon}>{item.icon}</div>
            <div style={styles.navLabel}>{item.label}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 420,
    margin: "0 auto",
    backgroundColor: "#f5f9f5",
    fontFamily: "'Inter', sans-serif",
    paddingBottom: 80, 
    minHeight: "100vh",
    color: "#333",
    position: "relative",
  },
  header: {
    backgroundColor: "#3a8a3a",
    borderRadius: "15px",
    color: "white",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "20px 15px 10px 15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  profile: { display: "flex", gap: 12, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: "50%", objectFit: "cover" },
  name: { fontWeight: "bold", fontSize: 16 },
  role: { fontSize: 12, opacity: 0.85, marginTop: -2 },
  bellButton: { background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "white" },
  statsContainer: {
    display: "flex",
    gap: 10,
    backgroundColor: "#3a8a3a",
    borderRadius: "15px",
    color: "white",
    padding: "12px 15px",
    margin: "0 15px 20px 15px",
    justifyContent: "space-around",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  statCard: { flex: 1, textAlign: "center" },
  statValue: { fontWeight: "bold", fontSize: 20 },
  statLabel: { fontSize: 12, opacity: 0.8, marginTop: 4 },
  sectionTitle: { fontWeight: "600", fontSize: 16, marginLeft: 20, marginBottom: 12 },
  toolsContainer: { display: "flex", gap: 15, padding: "0 20px", marginBottom: 20 },
  toolCard: { backgroundColor: "#e6f0e6", flex: 1, padding: 18, borderRadius: 12, textAlign: "center", fontWeight: "600", fontSize: 14, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  toolIcon: { fontSize: 24, marginBottom: 8 },
  newQuestionsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginBottom: 10 },
  viewAll: { color: "#3a8a3a", fontWeight: "600", fontSize: 14, textDecoration: "none", cursor: "pointer" },
  questionCard: { backgroundColor: "white", padding: 15, borderRadius: 12, margin: "0 15px 15px 15px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", position: "relative" },
  tag: { position: "absolute", top: 15, left: 15, color: "white", fontWeight: "600", fontSize: 11, padding: "3px 8px", borderRadius: 8, letterSpacing: 0.7 },
  questionText: { fontWeight: "600", fontSize: 14, paddingLeft: 80, paddingRight: 10 },
  author: { fontSize: 12, color: "#666", paddingLeft: 80, marginTop: 6 },
  time: { fontSize: 11, color: "#999", paddingLeft: 80, marginTop: 2 },
  navbar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 8,
    boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
    zIndex: 1000,
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none", // Removes the blue underline from Links
    color: "#3a8a3a",
    cursor: "pointer",
  },
  navIcon: { fontSize: 20, marginBottom: 2 },
  navLabel: { fontWeight: "600", fontSize: 12 },
};

export default ExpertDashboard;