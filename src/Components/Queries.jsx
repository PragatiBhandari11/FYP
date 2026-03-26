import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const CategoriesColors = {
  DISEASE: "#f87171", // red
  "URGENT": "#ef4444", // dark red
  "PENDING": "#f59e0b", // orange
  "RESOLVED": "#10b981", // green
  "GENERAL": "#3b82f6", // blue
};

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/disease/reports");
      const data = await response.json();
      setQueries(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching queries:", error);
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (filter === "All") return true;
    if (filter === "Pending") return q.status === "Pending";
    if (filter === "Resolved") return q.status === "Responded";
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <h2 style={styles.title}>Farmer Queries</h2>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="search"
          placeholder="Search queries, crops, or diseases..."
          style={styles.search}
        />
      </div>

      <div style={styles.filters}>
        {["All", "Pending", "Resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filter,
              ...(filter === f ? styles.filterActive : {}),
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading queries...</div>
      ) : (
        <div style={styles.queriesList}>
          {filteredQueries.length > 0 ? (
            filteredQueries.map((q) => (
              <div key={q.id} style={styles.queryCard}>
                <div style={styles.categoryRow}>
                  <span
                    style={{
                      ...styles.category,
                      backgroundColor: q.status === "Pending" ? CategoriesColors.PENDING : CategoriesColors.RESOLVED,
                    }}
                  >
                    {q.status.toUpperCase()}
                  </span>
                  <span style={styles.time}>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
                <p style={styles.queryTitle}>{q.description || "No description provided"}</p>
                {q.image_url && (
                  <img 
                    src={`http://localhost:5000${q.image_url}`} 
                    alt="Query" 
                    style={styles.queryImage} 
                  />
                )}
                <div style={styles.footer}>
                  <p style={styles.user}>
                    <span style={{ marginRight: 6 }}>👤</span>
                    {q.farmer_name}
                  </p>
                  <div style={styles.actions}>
                    <button style={styles.btnIgnore}>Ignore</button>
                    <button 
                      style={styles.btnReply}
                      onClick={() => navigate(`/expert-disease-reports`)} // Link to report detail/response page
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noData}>No queries found for this filter.</div>
          )}
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav style={styles.navbar}>
        <Link to="/expert-dashboard" style={styles.navItem}>
          <div style={styles.navIcon}>📊</div>
          <div style={styles.navLabel}>Dashboard</div>
        </Link>
        <Link to="/queries" style={{ ...styles.navItem, color: "#3a8a3a" }}>
          <div style={styles.navIcon}>❓</div>
          <div style={styles.navLabel}>Queries</div>
        </Link>
        <Link to="/knowledge" style={styles.navItem}>
          <div style={styles.navIcon}>📚</div>
          <div style={styles.navLabel}>Knowledge</div>
        </Link>
        <Link to="/expert-profile" style={styles.navItem}>
          <div style={styles.navIcon}>👤</div>
          <div style={styles.navLabel}>Profile</div>
        </Link>
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
  },
  header: {
    backgroundColor: "#3a8a3a",
    padding: "20px 15px",
    display: "flex",
    alignItems: "center",
    color: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    marginRight: "15px",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  searchContainer: {
    padding: "15px",
  },
  search: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  filters: {
    display: "flex",
    gap: "10px",
    padding: "0 15px 15px",
    overflowX: "auto",
  },
  filter: {
    padding: "8px 20px",
    borderRadius: "20px",
    border: "1px solid #3a8a3a",
    background: "white",
    color: "#3a8a3a",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  filterActive: {
    background: "#3a8a3a",
    color: "white",
  },
  queriesList: {
    padding: "0 15px",
  },
  queryCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  category: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "white",
    padding: "4px 10px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  time: {
    fontSize: "11px",
    color: "#888",
  },
  queryTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  queryImage: {
    width: "100%",
    borderRadius: "8px",
    marginBottom: "12px",
    maxHeight: "200px",
    objectFit: "cover",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "12px",
  },
  user: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
    display: "flex",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  btnIgnore: {
    background: "#f3f4f6",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#666",
    cursor: "pointer",
  },
  btnReply: {
    background: "#3a8a3a",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
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
    textDecoration: "none",
    color: "#888",
    cursor: "pointer",
  },
  navIcon: { fontSize: 20, marginBottom: 2 },
  navLabel: { fontWeight: "600", fontSize: 10 },
};

export default Queries;
