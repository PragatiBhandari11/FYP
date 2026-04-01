import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Ensure you have installed react-router-dom

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
    { label: "Disease Reports", icon: "🌡️", path: "/expert-disease-reports" },
    { label: "Farmer Chats", icon: "💬", path: "/expert-chats" },
    { label: "Write Article", icon: "📝", path: "/write-article" },
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
    { label: "Chats", icon: "💬", path: "/expert-chats" },
    { label: "Knowledge", icon: "📚", path: "/knowledge" },
    { label: "Profile", icon: "👤", path: "/expert-profile" },
  ],
};

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState({ name: "Loading...", role: "", avatar: "" });
  const [stats, setStats] = React.useState([
    { label: "Active Queries", value: 0 },
    { label: "Pending", value: 0 },
    { label: "Resolved", value: 0 },
  ]);
  const [recentQueries, setRecentQueries] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  React.useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    // Fetch Profile
    fetch(`http://localhost:5000/api/user/${email}`)
      .then(res => res.json())
      .then(data => {
        setUser({
          name: data.full_name,
          role: "Expert Specialist",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg" 
        });
      })
      .catch(err => console.error("Error fetching expert profile:", err));

    // Fetch Stats
    fetch("http://localhost:5000/api/disease/reports")
      .then(res => res.json())
      .then(reports => {
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'Pending').length;
        const resolved = reports.filter(r => r.status === 'Responded').length;
        
        setStats([
          { label: "Active Queries", value: total },
          { label: "Pending", value: pending },
          { label: "Resolved", value: resolved },
        ]);

        // Get top 3 latest questions (assuming they are sorted by backend, or we can sort here)
        setRecentQueries(reports.slice(0, 3));
      })
      .catch(err => console.error("Error fetching stats:", err));

    // Fetch Notifications
    fetch(`http://localhost:5000/api/notifications/${email}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error("Error fetching notifs:", err));
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      showToast("Marked as read");
    } catch (err) { 
      console.error(err); 
      showToast("Error updating notification", "error");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        <div style={{ position: 'relative' }} onClick={() => setShowNotifications(true)}>
          <button style={styles.bellButton} aria-label="Notifications">
            🔔
          </button>
          {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        {stats.map((stat) => (
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
          <div 
            key={tool.label} 
            style={styles.toolCard} 
            onClick={() => tool.path && navigate(tool.path)}
          >
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
        {recentQueries.length > 0 ? (
          recentQueries.map((q, i) => (
            <div key={i} onClick={() => navigate("/queries")} style={{...styles.questionCard, cursor: "pointer"}}>
              <span
                style={{
                  ...styles.tag,
                  backgroundColor: q.status === 'Pending' ? "#d32f2f" : "#2e7d32",
                }}
              >
                {q.status.toUpperCase()}
              </span>
              <div style={styles.questionText}>{q.description.substring(0, 60)}...</div>
              <div style={styles.author}>
                <span>👤 {q.farmer_name || "Farmer"}</span> • <span>{new Date(q.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No recent queries found.</div>
        )}
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

      {/* Notification Modal */}
      {showNotifications && (
        <div style={styles.notifOverlay} onClick={() => setShowNotifications(false)}>
          <div style={styles.notifModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0" }}>Expert Alerts</h3>
            {notifications.length === 0 ? <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>No alerts yet.</p> : (
              notifications.map(n => (
                <div key={n.id} style={{...styles.notifItem, ...(n.is_read ? {} : styles.notifItemUnread)}} onClick={() => !n.is_read && markAsRead(n.id)}>
                  <div style={{fontWeight: "bold", fontSize: "14px"}}>{n.title}</div>
                  <div style={{fontSize: "12px", color: "#666", marginTop: "4px"}}>{n.message}</div>
                  <div style={{fontSize: "10px", color: "#999", marginTop: "6px"}}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
            <button onClick={() => setShowNotifications(false)} style={styles.closeBtn}>Close</button>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={styles.toastContainer}>
          <div style={{...styles.toastContent, ...styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}}>
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.message}
          </div>
        </div>
      )}
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
  notifBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: 10,
    width: 16,
    height: 16,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #3a8a3a",
  },
  notifOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  notifModal: {
    width: "320px",
    maxHeight: "450px",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "20px",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },
  notifItem: {
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
    borderLeft: "4px solid #ddd",
    cursor: "pointer",
  },
  notifItemUnread: {
    borderLeftColor: "#3a8a3a",
    backgroundColor: "#f0fdf4",
  },
  closeBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#3a8a3a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  toastContainer: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10000,
    width: "90%",
    maxHeight: "320px",
  },
  toastContent: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "12px 16px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
    fontSize: "14px",
    animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  toastSuccess: { color: "#16a34a", borderLeft: "4px solid #16a34a" },
  toastError: { color: "#ef4444", borderLeft: "4px solid #ef4444" },
};

export default ExpertDashboard;