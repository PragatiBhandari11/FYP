import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID if in Edit mode
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    category: "Vegetable",
    price: "",
    quantity: "",
    image: null,
    image_url: "", // For existing image display
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  useEffect(() => {
    if (isEdit) {
      // Fetch existing product data
      fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name,
            category: data.category,
            price: data.price,
            quantity: data.quantity,
            image: null,
            image_url: data.image_url
          });
        })
        .catch(err => showToast("Failed to load product data", "error"));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const farmerId = localStorage.getItem("userEmail");
    if (!farmerId) {
      showToast("You must be logged in.", "error");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("quantity", formData.quantity);
    data.append("farmerId", farmerId);
    if (formData.image) {
      data.append("image", formData.image);
    } else if (isEdit) {
      data.append("image_url", formData.image_url); // Keep existing image if no new one
    }

    const url = isEdit 
      ? `http://localhost:5000/api/products/${id}` 
      : "http://localhost:5000/api/add-product";
    
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        showToast(isEdit ? "Product updated successfully! ✅" : "Product added successfully! ✅");
        if (!isEdit) {
           setFormData({ name: "", category: "Vegetable", price: "", quantity: "", image: null, image_url: "" });
           e.target.reset();
        } else {
           setTimeout(() => navigate("/my-farm"), 1500); 
        }
      } else {
        showToast(result.message || "Operation failed", "error");
      }
    } catch (err) {
      showToast("Cannot connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { margin: 0; background: #e5f2e5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; }
        .app-container {
          width: 390px;
          background: #f2fbf6;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow-y: auto;
        }
        .back-btn { background: none; border: none; font-size: 16px; color: #16a34a; cursor: pointer; margin-bottom: 20px; font-weight: bold; padding: 0;}
        h2 { text-align: center; color: #111; margin-top: 0; margin-bottom: 24px; font-size: 24px; }
        
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; font-size: 14px; color: #333; }
        input[type="text"], input[type="number"], input[type="file"], select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }
        .submit-btn:disabled { background: #9ca3af; }
        .error-msg { background: #fde8e8; color: #c81e1e; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; }
        .success-msg { background: #def7ec; color: #03543f; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; }
        .current-img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; border: 1px solid #ddd; }

        .toast-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          width: 90%;
          max-width: 320px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
        }

        .toast-success { color: #16a34a; border-left: 4px solid #16a34a; }
        .toast-error { color: #ef4444; border-left: 4px solid #ef4444; }

        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="app-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>{isEdit ? "Update Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="Vegetable">Vegetable</option>
              <option value="Fruits">Fruits</option>
              <option value="Dairy">Dairy</option>
              <option value="Plant">Plant</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (Rs per kg)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Available Quantity (kg)</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Product Image {isEdit && "(Leave blank to keep current)"}</label>
            {isEdit && formData.image_url && (
              <img src={`http://localhost:5000${formData.image_url}`} alt="Current" className="current-img" />
            )}
            <input type="file" name="image" accept="image/*" onChange={handleChange} required={!isEdit} />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update Product" : "List Product")}
          </button>
        </form>

        {toast.show && (
          <div className="toast-container">
            <div className={`toast-content toast-${toast.type}`}>
              <span>{toast.type === "success" ? "✅" : "❌"}</span>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
