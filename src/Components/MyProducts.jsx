import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === "All" || product.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("Please log in to view your products.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/products/farmer/${email}`)
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
        * { box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif; }
        body { margin: 0; background: #eef7f2; }
        .page {
          max-width: 390px;
          margin: auto;
          background: #f6fcf9;
          min-height: 100vh;
          padding-bottom: 90px;
          display: flex;
          flex-direction: column;
        }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px; }
        .header h3 { margin: 0; font-size: 18px; color: #1b5e20; }
        .bell { width: 34px; height: 34px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        .search { padding: 0 16px; }
        .search input { width: 100%; padding: 10px 14px; border-radius: 12px; border: none; outline: none; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .filters { display: flex; gap: 8px; padding: 12px 16px; overflow-x: auto; }
        .filter { padding: 6px 14px; border-radius: 20px; font-size: 12px; white-space: nowrap; border: 1px solid #c8e6c9; color: #2e7d32; background: white; }
        .filter.active { background: #2e7d32; color: white; }
        .product-list { flex: 1; padding: 10px 0; }
        .product { background: white; margin: 10px 16px; padding: 10px; border-radius: 16px; display: flex; gap: 10px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
        .product img { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
        .product-info { flex: 1; }
        .product-info h4 { margin: 0; font-size: 14px; }
        .price { font-size: 13px; color: #2e7d32; font-weight: bold; margin: 4px 0; }
        .stock { font-size: 12px; color: gray; }
        .low { color: #ff9800; }
        .menu { font-size: 18px; color: gray; cursor: pointer; }
        .empty-state { text-align: center; padding: 40px 20px; color: #6b7280; }
        .add-btn { position: fixed; bottom: 80px; left: 50%; transform: translateX(120px); width: 52px; height: 52px; border-radius: 50%; background: #2e7d32; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); cursor: pointer; z-index: 10; }
        .bottom-nav { position: fixed; bottom: 0; width: 100%; max-width: 390px; background: white; display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #ddd; }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 13px; color: #7a7a7a; cursor: pointer; }
        .nav-item.active { color: #2e7d32; }
        .icon { font-size: 20px; }
      `}</style>

      <div className="page">
        <div className="header">
          <h3 onClick={() => navigate("/farmer-dashboard")} style={{cursor: "pointer"}}>← My Farm</h3>
          <div className="bell">🔔</div>
        </div>

        <div className="search">
          <input 
            placeholder="🔍 Search my products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          {["All", "Vegetable", "Fruits", "Dairy", "Plant"].map(cat => (
            <div 
              key={cat} 
              className={`filter ${activeFilter === cat ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <div className="product-list">
          {error && <div style={{color: "red", textAlign: "center", padding: "20px"}}>{error}</div>}
          {loading && <div style={{textAlign: "center", padding: "20px"}}>Loading products...</div>}
          
          {!loading && !error && filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div style={{fontSize: "40px"}}>🚜</div>
              <h4>No Products Found</h4>
              <p>We couldn't find any products matching your search or filter.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div className="product" key={product.id}>
                <img 
                  src={product.image_url ? `http://localhost:5000${product.image_url}` : "https://via.placeholder.com/56"} 
                  alt={product.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/56?text=No+Img" }}
                />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="price">Rs {product.price} / {product.unit || "kg"}</div>
                  <div className={`stock ${product.quantity < 10 ? "low" : ""}`}>
                    📦 {product.quantity} kg in stock
                  </div>
                </div>
                <div className="menu">⋮</div>
              </div>
            ))
          )}
        </div>

        <div className="add-btn" onClick={() => navigate("/add-product")}>+</div>

        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/farmer-dashboard")}>
            <div className="icon">🏠</div>Home
          </div>
          <div className="nav-item" onClick={() => navigate("/products")}>
            <div className="icon">🌱</div>Market
          </div>
          <div className="nav-item active">
            <div className="icon">🚜</div>Farm
          </div>
          <div className="nav-item" onClick={() => navigate("/experts")}>
            <div className="icon">👥</div>Experts
          </div>
          <div className="nav-item" onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </div>
        </div>
      </div>
    </>
  );
}
