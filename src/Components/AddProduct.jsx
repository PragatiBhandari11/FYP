import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "vegetable",
    price: "",
    quantity: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setError("");
    setSuccess("");

    // The Farmer's Email is acting as their unique identifier in the products schema "farmer_id"
    const farmerId = localStorage.getItem("userEmail");
    
    if (!farmerId) {
      setError("You must be logged in to add a product.");
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
    }

    try {
      const response = await fetch("http://localhost:5173/api/products/add-product", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Product added successfully!");
        setFormData({ name: "", category: "vegetable", price: "", quantity: "", image: null }); // Reset form
        e.target.reset(); // clear the file input visually
      } else {
        setError(result.message || "Failed to add product");
      }
    } catch (err) {
      setError("Cannot connect to server.");
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
          position: relative;
        }
        .back-btn { background: none; border: none; font-size: 16px; color: #16a34a; cursor: pointer; margin-bottom: 20px; font-weight: bold; text-align: left; padding: 0;}
        h2 { text-align: center; color: #111; margin-top: 0; margin-bottom: 24px; font-size: 24px; }
        
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; font-size: 14px; color: #333; }
        input[type="text"], input[type="number"], input[type="file"], select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
        }
        input[type="file"] { padding: 8px 12px; }
        
        button.submit-btn {
          width: 100%;
          padding: 14px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.3s;
        }
        button.submit-btn:hover { background: #15803d; }
        button.submit-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        
        .error-msg { background: #fde8e8; color: #c81e1e; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; }
        .success-msg { background: #def7ec; color: #03543f; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; }
      `}</style>

      <div className="app-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Add New Product</h2>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g. Fresh Tomatoes" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="fruits">Fruits</option>
              <option value="vegetable">Vegetable</option>
              <option value="dairy">Dairy</option>
              <option value="plant">Plant</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (Rs per kg)</label>
            <input 
              type="number" 
              name="price" 
              placeholder="e.g. 50" 
              min="1"
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Available Quantity (kg)</label>
            <input 
              type="number" 
              name="quantity" 
              placeholder="e.g. 100" 
              min="1"
              value={formData.quantity} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "List Product"}
          </button>
        </form>
      </div>
    </>
  );
}
