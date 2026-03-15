import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // farmerId is stored as userEmail
    const farmerId = localStorage.getItem("userEmail");
    
    if (!farmerId) {
      setError("Please log in as a farmer to view your products.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/products/farmer/${farmerId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load products.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { margin: 0; background: #e5f2e5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; }
        .app-container {
          width: 390px;
          background: #f2fbf6;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .content-scroll {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #16a34a; font-weight: bold; padding: 0; }
        .title { margin: 0; font-size: 22px; color: #111; text-align: center; flex: 1; }
        
        .add-btn { 
          background: #16a34a; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          padding: 8px 12px; 
          font-size: 14px; 
          cursor: pointer; 
          font-weight: bold;
        }
        
        .product-list { display: flex; flex-direction: column; gap: 16px; }
        
        .product-card {
          background: white;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .product-img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          background: #e5e7eb;
        }
        
        .product-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .product-name { margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #333; }
        .product-cat { margin: 0; font-size: 12px; color: #6b7280; text-transform: capitalize; }
        .product-details { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; }
        .product-price { font-size: 16px; font-weight: bold; color: #16a34a; margin: 0; }
        .product-qty { font-size: 12px; color: #4b5563; margin: 0; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        
        .empty-state { text-align: center; padding: 40px 20px; color: #6b7280; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        
        /* Bottom nav */
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
          margin-top: auto;
        }
        .bottom-nav span { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 4px; 
          font-size: 13px; 
          color: #6b7280; 
          cursor: pointer; 
        }
        .bottom-nav span .icon { font-size: 20px; line-height: 1; }
        .bottom-nav .active { color: #16a34a; }
      `}</style>

      <div className="app-container">
        <div className="content-scroll">
          <div className="header">
            <button className="back-btn" onClick={() => navigate("/farmer-dashboard")}>←</button>
            <h2 className="title">My Products</h2>
            <button className="add-btn" onClick={() => navigate("/add-product")}>+ Add</button>
          </div>

        {error && <div style={{color: "red", textAlign: "center"}}>{error}</div>}
        {loading && <div style={{textAlign: "center", color: "#666"}}>Loading your products...</div>}

        {!loading && !error && products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No Products Yet</h3>
            <p>You haven't added any products to your farm yet. Click the + Add button to get started.</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img 
                  className="product-img" 
                  src={product.image_url ? `http://localhost:5000${product.image_url}` : "https://via.placeholder.com/80"} 
                  alt={product.name} 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=No+Image" }}
                />
                <div className="product-info">
                  <div>
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-cat">{product.category}</p>
                  </div>
                  <div className="product-details">
                    <p className="product-price">Rs {product.price}</p>
                    <p className="product-qty">{product.quantity} kg left</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          <span onClick={() => navigate("/farmer-dashboard")}>
            <div className="icon">🏠</div>Home
          </span>
          <span className="active">
            <div className="icon">🌱</div>Products
          </span>
          <span onClick={() => navigate("/experts")}>
            <div className="icon">👥</div>Experts
          </span>
          <span>
            <div className="icon">📅</div>Calendar
          </span>
          <span onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </span>
        </div>
      </div>
    </>
  );
}
