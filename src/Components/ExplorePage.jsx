import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("category") || "All";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const handleAddToCart = async (productId) => {
    const buyerEmail = localStorage.getItem("userEmail");
    if (!buyerEmail) {
      alert("Please login to add items to cart.");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail, productId })
      });
      if (response.ok) alert("Added to cart!");
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
      `}</style>

      <div className="app">
        <div className="content-scroll">
          {/* Header */}
        <div className="header">
          <h2>Explore Products</h2>
          <div className="search-bar">
            🔍
            <input placeholder="Search products, farmers..." />
            ⚙️
          </div>
        </div>

        {/* Filters */}
        <section>
          <div className="filters">
            <div 
              className={`chip ${activeFilter === "All" ? "active" : ""}`}
              onClick={() => { setActiveFilter("All"); setSearchParams({}); }}
            >All</div>
            <div 
              className={`chip ${activeFilter === "vegetable" ? "active" : ""}`}
              onClick={() => { setActiveFilter("vegetable"); setSearchParams({category: "vegetable"}); }}
            >Vegetables</div>
            <div 
              className={`chip ${activeFilter === "fruits" ? "active" : ""}`}
              onClick={() => { setActiveFilter("fruits"); setSearchParams({category: "fruits"}); }}
            >Fruits</div>
            <div 
              className={`chip ${activeFilter === "dairy" ? "active" : ""}`}
              onClick={() => { setActiveFilter("dairy"); setSearchParams({category: "dairy"}); }}
            >Dairy</div>
             <div 
              className={`chip ${activeFilter === "plant" ? "active" : ""}`}
              onClick={() => { setActiveFilter("plant"); setSearchParams({category: "plant"}); }}
            >Plants</div>
          </div>

          {/* Products */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>Loading products...</div>
          ) : (
            <div className="grid">
              {products
                .filter(p => activeFilter === "All" ? true : p.category === activeFilter)
                .length === 0 ? (
                <div style={{ gridColumn: "span 2", textAlign: "center", color: "#666" }}>
                  No products available in this category.
                </div>
              ) : (
                products
                  .filter(p => activeFilter === "All" ? true : p.category === activeFilter)
                  .map((p) => (
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
                ))
              )}
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
