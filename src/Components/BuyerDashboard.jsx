import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const products = [
    { id: 1, name: "Sweet Corn", seller: "Green Valley Farm", price: "$2.50 / kg" },
    { id: 2, name: "Fresh Strawberries", seller: "Berry Organic", price: "$4.00 / box" },
    { id: 3, name: "Organic Potatoes", seller: "Farm Fresh", price: "$1.20 / kg" },
  ];

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
          margin-top: auto;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          background: #fff;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: #666;
          cursor: pointer;
        }

        .nav-item .icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .nav-item.active {
          color: #2e8b57;
          font-weight: bold;
        }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div>
              <h2>Hello, Sarah</h2>
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
            <div className="category">🥕<span>Veg</span></div>
            <div className="category">🍎<span>Fruits</span></div>
            <div className="category">🌾<span>Grains</span></div>
            <div className="category">🥛<span>Dairy</span></div>
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
          {products
            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
            .map(p => (
              <div className="product" key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.seller}</p>
                  <div className="price">{p.price}</div>
                </div>
                <button className="add">+</button>
              </div>
            ))}
        </section>

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

          <div className="nav-item">
            <span className="icon">📦</span>
            <span>Orders</span>
          </div>

          <div className="nav-item">
            <span className="icon">👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </>
  );
}
