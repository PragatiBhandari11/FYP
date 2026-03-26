import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ArticleForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    content: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${id}`);
      const data = await response.json();
      setFormData({
        title: data.title,
        category: data.category,
        content: data.content,
        image: null,
      });
      if (data.image_url) {
        setPreview(`http://localhost:5000${data.image_url}`);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("content", formData.content);
    data.append("author_email", localStorage.getItem("userEmail"));
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const url = isEdit 
        ? `http://localhost:5000/api/articles/${id}` 
        : "http://localhost:5000/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        alert(isEdit ? "Article updated!" : "Article published!");
        navigate("/knowledge");
      }
    } catch (error) {
      console.error("Error submitting article:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <h2 style={styles.title}>{isEdit ? "Edit Article" : "Write New Article"}</h2>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter article title"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={styles.input}
          >
            <option value="General">General</option>
            <option value="Crops">Crops</option>
            <option value="Soil Health">Soil Health</option>
            <option value="Weather Tips">Weather Tips</option>
            <option value="Pest Control">Pest Control</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your article here..."
            style={styles.textarea}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.fileInput}
          />
          {preview && (
            <img src={preview} alt="Preview" style={styles.preview} />
          )}
        </div>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? "Processing..." : isEdit ? "Update Article" : "Publish Article"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 420,
    margin: "0 auto",
    backgroundColor: "#f5f9f5",
    fontFamily: "'Inter', sans-serif",
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
  form: {
    padding: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    minHeight: "200px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  fileInput: {
    fontSize: "14px",
  },
  preview: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "8px",
    maxHeight: "200px",
    objectFit: "cover",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#3a8a3a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
};

export default ArticleForm;
