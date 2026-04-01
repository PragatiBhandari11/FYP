import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleAddToCart = async (productId) => {
    const buyerEmail = localStorage.getItem("userEmail");
    if (!buyerEmail) {
      showToast("Please login to add items to cart.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail, productId })
      });
      if (response.ok) {
        showToast("Added to cart! 🛒");
      } else {
        showToast("Failed to add to cart.", "error");
      }
    } catch (err) {
      console.error("Cart error", err);
    }
  }

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        body {
          background: #f2f2f2;
        }

        .app {
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .header h2 {
          margin-bottom: 12px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: #f6f6f6;
          border-radius: 12px;
          padding: 10px 12px;
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          font-size: 14px;
          margin: 0 8px;
        }

        section {
          padding: 16px;
        }

        .filters {
          display: flex;
          gap: 10px;
          overflow-x: auto;
        }

        .chip {
          padding: 8px 14px;
          border-radius: 20px;
          background: #f1f1f1;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
        }

        .chip.active {
          background: #2e8b57;
          color: white;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 16px;
        }

        .card {
          background: #f9f9f9;
          border-radius: 16px;
          overflow: hidden;
        }

        .card img {
          width: 100%;
          height: 130px;
          object-fit: cover;
        }

        .card-body {
          padding: 12px;
        }

        .card-title {
          font-size: 14px;
          font-weight: bold;
        }

        .price {
          color: #2e8b57;
          font-weight: bold;
          margin: 6px 0;
        }

        .rating {
          font-size: 13px;
        }

        /* Bottom Navigation */
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
          margin-top: auto;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
        }

        .nav-item .icon {
          font-size: 20px;
          line-height: 1;
        }

        .nav-item.active {
          color: #2e8b57;
        }

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

      <div className="app">
        <div className="content-scroll">
          {/* Header */}
          <div className="header">
            <h2>Explore Products</h2>
            <div className="search-bar">
              🔍
              <input
                placeholder="Search products, farmers..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  const newParams = new URLSearchParams(searchParams);
                  if (val) newParams.set("search", val);
                  else newParams.delete("search");
                  setSearchParams(newParams);
                }}
              />
              ⚙️
            </div>
          </div>

          {/* Filters */}
          <section>
            <div className="filters">
              <div 
                className={`chip ${activeFilter === "All" ? "active" : ""}`}
                onClick={() => { 
                  setActiveFilter("All"); 
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("category");
                  setSearchParams(newParams);
                }}
              >All</div>
              {["Vegetable", "Fruits", "Dairy", "Plant"].map(cat => (
              <div 
                key={cat}
                className={`chip ${activeFilter.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
                onClick={() => { 
                  setActiveFilter(cat); 
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("category", cat.toLowerCase());
                  setSearchParams(newParams); 
                }}
              >{cat}{cat === "Vegetable" ? "s" : ""}</div>
            ))}
          </div>
          </section>

          {/* Products */}
          <section>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>Loading products...</div>
            ) : (
              <div className="grid">
                {(() => {
                  const filtered = products
                    .filter(p => activeFilter === "All" ? true : p.category?.toLowerCase() === activeFilter.toLowerCase())
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                  
                  if (filtered.length === 0) {
                    return (
                      <div style={{ gridColumn: "span 2", textAlign: "center", color: "#666", padding: "40px" }}>
                        No products found for this search/filter.
                      </div>
                    );
                  }

                  return filtered.map((p) => (
                    <div style={{ position: "relative" }} key={p.id}>
                      <ProductCard
                        title={p.name}
                        price={`Rs${p.price}`}
                        rating="⭐ 4.8"
                        img={
                          p.image_url
                            ? `http://localhost:5000${p.image_url}`
                            : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea"
                        }
                      />
                      <button
                        onClick={() => handleAddToCart(p.id)}
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          background: "#16a34a",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          fontSize: "18px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                        }}
                      >+</button>
                    </div>
                  ));
                })()}
              </div>
            )}
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
            <span className="icon">🏠</span>
            <span>Home</span>
          </div>

          <div className="nav-item active">
            <span className="icon">🔍</span>
            <span>Explore</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-cart")}>
            <span className="icon">🛒</span>
            <span>Cart</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-orders")}>
            <span className="icon">📦</span>
            <span>Orders</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/profile")}>
            <span className="icon">👤</span>
            <span>Profile</span>
          </div>
        </div>

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

function ProductCard({ title, price, rating, img }) {
  return (
    <div className="card">
      <img src={img} alt={title} />
      <div className="card-body">
        <div className="card-title">{title}</div>
        <div className="price">{price}</div>
        <div className="rating">{rating}</div>
      </div>
    </div>
  );
}
