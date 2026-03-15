import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Sarah");

  // Fetch the dynamic user name when the page loads
  useEffect(() => {
    const storedName = localStorage.getItem("userFullName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

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

  const [dbProducts, setDbProducts] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setDbProducts(data))
      .catch(err => console.error(err));
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
          width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
        }

        .header {
          background: #2e8b57;
          color: white;
          padding: 20px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search {
          width: 100%;
          margin-top: 15px;
          padding: 10px;
          border-radius: 12px;
          border: none;
        }

        section {
          padding: 16px;
        }

        .categories {
          display: flex;
          justify-content: space-between;
        }

        .category {
          width: 70px;
          height: 70px;
          background: #f1f1f1;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
        }

        .category span {
          font-size: 12px;
          margin-top: 4px;
        }

        .order {
          background: #fff3cd;
          padding: 14px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .track {
          color: green;
          font-weight: bold;
          cursor: pointer;
        }

        .product {
          background: #f9f9f9;
          padding: 14px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .price {
          color: green;
          font-weight: bold;
        }

        .add {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #2e8b57;
          color: white;
          font-size: 18px;
          cursor: pointer;
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
          <div className="header-top">
            <div>
              <h2>Hello, {userName}</h2>
              <p>Find fresh products nearby</p>
            </div>
            <div>🛒 🔔</div>
          </div>

          <input
            className="search"
            placeholder="Search vegetables, fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <section>
          <h3>Categories</h3>
          <div className="categories">
            <div className="category" onClick={() => navigate("/buyer-explore?category=vegetable")}><span>Veg</span></div>
            <div className="category" onClick={() => navigate("/buyer-explore?category=fruits")}><span>Fruits</span></div>
            <div className="category" onClick={() => navigate("/buyer-explore?category=plant")}><span>Plants</span></div>
            <div className="category" onClick={() => navigate("/buyer-explore?category=dairy")}><span>Dairy</span></div>
          </div>
        </section>

        {/* Order Status */}
        <section>
          <h3>Order Status</h3>
          <div className="order">
            <div>
              <strong>Out for Delivery</strong>
              <p>Arriving by 5:00 PM</p>
            </div>
            <div className="track">Track</div>
          </div>
        </section>

        {/* Products */}
        <section>
          <h3>Featured Products</h3>
          {dbProducts.length === 0 ? <p>Loading products...</p> : (
            dbProducts
              .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .slice(0, 3) // Only show top 3 on dashboard
              .map(p => (
                <div className="product" key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <p style={{fontSize: "12px", color: "#666"}}>Fresh Category</p>
                    <div className="price">Rs{p.price}</div>
                  </div>
                  <button className="add" onClick={() => handleAddToCart(p.id)}>+</button>
                </div>
              ))
          )}
        </section>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item active" onClick={() => navigate("/buyer-dashboard")}>
            <span className="icon">🏠</span>
            <span>Home</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-explore")}>
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
