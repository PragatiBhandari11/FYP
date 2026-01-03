import React from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }
        body {
          background: #e3f2dc;
          margin: 0;
          padding: 0;
        }
        .app {
          max-width: 400px;
          margin: auto;
          min-height: 100vh;
          border-radius: 20px;
          background: #3f8454;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 20px;
        }
        .greeting {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .greeting img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid white;
          object-fit: cover;
        }
        .greeting-text {
          flex: 1;
        }
        .greeting-text h2 {
          margin: 0;
          font-weight: 600;
          font-size: 20px;
        }
        .greeting-text small {
          opacity: 0.7;
        }
        .notification {
          font-size: 24px;
          cursor: pointer;
        }

        .cards {
          background: white;
          color: black;
          border-radius: 18px;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .card {
          background: #f8f9f7;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .card h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          opacity: 0.7;
        }
        .card .value {
          font-size: 22px;
          font-weight: 800;
          color: #2a5d33;
        }
        .highlight {
          font-weight: 600;
          background: #d3f0c0;
          padding: 6px 10px;
          border-radius: 14px;
          font-size: 12px;
          width: fit-content;
          color: #3b6d1f;
        }

        .quick-actions {
          background: white;
          border-radius: 18px;
          padding: 16px;
          color: black;
          display: flex;
          justify-content: space-around;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #3f8454;
        }
        .action-btn span {
          font-size: 24px;
        }
        .action-btn label {
          font-size: 12px;
          font-weight: 600;
          display: none; /* Hide label to keep only icons */
        }

        .market-price {
          background: white;
          border-radius: 18px;
          padding: 16px;
          color: black;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price-current {
          color: #2a5d33;
        }
        .price-demand {
          color: #c04a4a;
          font-weight: 700;
        }

        .recent-orders {
          background: white;
          border-radius: 18px;
          padding: 16px;
          color: black;
          max-height: 220px;
          overflow-y: auto;
        }
        .recent-orders-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 16px;
        }
        .order-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #d5e4d4;
        }
        .order-item img {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          object-fit: cover;
        }
        .order-details {
          flex: 1;
        }
        .order-title {
          font-weight: 700;
          margin: 0;
        }
        .order-info {
          font-size: 13px;
          opacity: 0.8;
        }
        .order-actions button {
          border: none;
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 600;
          margin-left: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-reject {
          background: #f4c7c7;
          color: #7d2c2c;
        }
        .btn-accept {
          background: #73b56b;
          color: white;
        }

        /* Weather Section Design Only */
        .weather {
          background: white;
          color: black;
          border-radius: 18px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 200px;
        }
        .weather img {
          width: 60px;
          height: 60px;
        }
        .weather-info {
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;
        }

        /* Bottom Navigation */
        .bottom-nav {
          margin-top: auto;
          background: white;
          border-radius: 20px;
          padding: 10px 0;
          display: flex;
          justify-content: space-around;
          color: #3f8454;
          font-weight: 700;
          font-size: 24px;
          user-select: none;
        }
        .nav-item {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #3f8454;
        }
        .nav-item.active {
          color: #2e8b57;
        }
      `}</style>

      <div className="app">
        {/* Greeting + Notification */}
        <div className="greeting">
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="profile"
          />
          <div className="greeting-text">
            <h2>Hello, Michael</h2>
            <small>Farm Owner</small>
          </div>
          <div className="notification" title="Notifications">
            🔔
          </div>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            <h3>Total Earnings</h3>
            <div className="value">$12,450</div>
            <div className="highlight">+15%</div>
          </div>
          <div className="card">
            <h3>Active Orders</h3>
            <div className="value">24</div>
            <div
              className="highlight"
              style={{ background: "#f0c77d", color: "#775e15" }}
            >
              Pending
            </div>
          </div>
          <div className="card" style={{ gridColumn: "span 2" }}>
            <h3>Total Products Listed</h3>
            <div className="value">134 Items</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-btn" title="Add Product" onClick={() => navigate("/add-product")}>
            <span>➕</span>
            <label>Add Product</label>
          </div>
          <div className="action-btn" title="Orders" onClick={() => navigate("/farmer-orders")}>
            <span>📦</span>
            <label>Orders</label>
          </div>
          <div className="action-btn" title="My Farm" onClick={() => navigate("/my-farm")}>
            <span>🌾</span>
            <label>My Farm</label>
          </div>
          <div className="action-btn" title="Add Expert" onClick={() => navigate("/add-expert")}>
            <span>🧑‍🌾</span>
            <label>Add Expert</label>
          </div>
        </div>

        {/* Wheat Market Price */}
        <div className="market-price">
          <div>
            Wheat Market Price <br />
            <span className="price-current">Current: $320 / ton</span>
          </div>
          <div className="price-demand">↗ High Demand</div>
        </div>

        {/* Static Weather Section */}
        <div className="weather" title="Weather Info">
          <img
            src="https://openweathermap.org/img/wn/01d@2x.png"
            alt="Clear sky"
          />
          <div className="weather-info">
            25°C <br />
            Clear Sky
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="recent-orders-header">
            <div>Recent Orders</div>
            <div
              style={{ cursor: "pointer", color: "#3f8454" }}
              onClick={() => navigate("/farmer-orders")}
            >
              See All
            </div>
          </div>

          <div className="order-item">
            <img
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea"
              alt="Sweet Corn Bushels"
            />
            <div className="order-details">
              <p className="order-title">Sweet Corn Bushels</p>
              <p className="order-info">Qty: 200kg - Total: $350.00</p>
            </div>
            <div className="order-actions">
              <button className="btn-reject">Reject</button>
              <button className="btn-accept">Accept Order</button>
            </div>
          </div>

          <div className="order-item">
            <img
              src="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce"
              alt="Tomatoes"
            />
            <div className="order-details">
              <p className="order-title">Cherry Tomatoes</p>
              <p className="order-info">Qty: 150kg - Total: $180.00</p>
            </div>
            <div className="order-actions">
              <button className="btn-reject">Reject</button>
              <button className="btn-accept">Accept Order</button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div
            className="nav-item active"
            onClick={() => navigate("/farmer-dashboard")}
            title="Home"
          >
            🏠
          </div>
          <div
            className="nav-item"
            onClick={() => navigate("/farmer-products")}
            title="Products"
          >
            🍅
          </div>
          <div
            className="nav-item"
            onClick={() => navigate("/farmer-experts")}
            title="Experts"
          >
            🧑‍🌾
          </div>
          <div
            className="nav-item"
            onClick={() => navigate("/crop-calendar")}
            title="Crop Calendar"
          >
            📅
          </div>
          <div
            className="nav-item"
            onClick={() => navigate("/farmer-profile")}
            title="Profile"
          >
            👤
          </div>
        </div>
      </div>
    </>
  );
}
