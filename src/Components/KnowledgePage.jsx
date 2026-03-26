import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const KnowledgePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
    setUserRole(localStorage.getItem("userRole") || "");
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/articles");
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <h2 style={styles.title}>Knowledge Hub</h2>
        {userRole === "Expert" && (
          <button 
            style={styles.addButton}
            onClick={() => navigate("/write-article")}
          >
            + Write
          </button>
        )}
      </div>

      <div style={styles.searchContainer}>
        <input 
          type="search" 
          placeholder="Search articles, tips, or guides..." 
          style={styles.search} 
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Loading articles...</div>
      ) : (
        <div style={styles.articleList}>
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article.id} style={styles.articleCard}>
                {article.image_url && (
                  <img 
                    src={`http://localhost:5000${article.image_url}`} 
                    alt={article.title} 
                    style={styles.articleImage} 
                  />
                )}
                <div style={styles.content}>
                  <span style={styles.category}>{article.category || "General"}</span>
                  <h3 style={styles.articleTitle}>{article.title}</h3>
                  <p style={styles.excerpt}>
                    {article.content.substring(0, 100)}...
                  </p>
                  <div style={styles.footer}>
                    <button 
                      style={styles.readMore}
                      onClick={() => navigate(`/article/${article.id}`)}
                    >
                      Read Full Article
                    </button>
                    {userRole === "Expert" && localStorage.getItem("userEmail") === article.author_email && (
                      <div style={styles.expertActions}>
                        <button 
                          style={styles.editBtn}
                          onClick={() => navigate(`/edit-article/${article.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(article.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noData}>No articles published yet.</div>
          )}
        </div>
      )}

      {/* BOTTOM NAVIGATION (Consistent with App theme) */}
      <nav style={styles.navbar}>
        <Link to={userRole === "Expert" ? "/expert-dashboard" : userRole === "Farmer" ? "/farmer-dashboard" : "/buyer-dashboard"} style={styles.navItem}>
          <div style={styles.navIcon}>📊</div>
          <div style={styles.navLabel}>Dashboard</div>
        </Link>
        <Link to="/queries" style={styles.navItem}>
          <div style={styles.navIcon}>❓</div>
          <div style={styles.navLabel}>Queries</div>
        </Link>
        <Link to="/knowledge" style={{ ...styles.navItem, color: "#3a8a3a" }}>
          <div style={styles.navIcon}>📚</div>
          <div style={styles.navLabel}>Knowledge</div>
        </Link>
        <Link to="/profile" style={styles.navItem}>
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
    justifyContent: "space-between",
    color: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    background: "white",
    color: "#3a8a3a",
    border: "none",
    padding: "6px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "12px",
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
  articleList: {
    padding: "0 15px",
  },
  articleCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  articleImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  content: {
    padding: "15px",
  },
  category: {
    textTransform: "uppercase",
    fontSize: "10px",
    fontWeight: "bold",
    color: "#3a8a3a",
    backgroundColor: "#e8f5e9",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  articleTitle: {
    margin: "10px 0",
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  excerpt: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 15px 0",
    lineHeight: "1.5",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "12px",
  },
  readMore: {
    background: "none",
    border: "none",
    color: "#3a8a3a",
    fontWeight: "bold",
    padding: 0,
    cursor: "pointer",
    fontSize: "14px",
  },
  expertActions: {
    display: "flex",
    gap: "10px",
  },
  editBtn: {
    background: "#f3f4f6",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#3b82f6",
    fontWeight: "600",
  },
  deleteBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#ef4444",
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
  },
  noData: {
    textAlign: "center",
    padding: "50px",
    color: "#999",
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

export default KnowledgePage;
