import React from "react";

export default function FarmerDashboard() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        body {
          margin: 0;
          background: #eaf6f0;
        }

        .dashboard {
          max-width: 400px;
          margin: auto;
          background: #f4fbf8;
          min-height: 100vh;
          padding-bottom: 70px;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #e7f5ef;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #4caf50;
        }

        .header h2 {
          margin: 0;
          font-size: 18px;
        }

        .verified {
          font-size: 12px;
          color: green;
        }

        /* Stats */
        .stats {
          display: flex;
          justify-content: space-around;
          padding: 14px;
        }

        .stat-box {
          background: white;
          width: 30%;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .stat-box h3 {
          margin: 0;
        }

        .stat-box p {
          margin: 4px 0 0;
          font-size: 12px;
          color: gray;
        }

        /* Actions */
        .actions {
          display: flex;
          justify-content: space-around;
          margin: 10px 0;
        }

        .action {
          width: 75px;
          height: 75px;
          background: white;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .action span {
          margin-top: 6px;
        }

        /* Cards */
        .info-cards {
          display: flex;
          gap: 10px;
          padding: 10px;
        }

        .card {
          flex: 1;
          padding: 14px;
          border-radius: 15px;
        }

        .price-card {
          background: #e8f6ee;
        }

        .price-card h3 {
          margin: 6px 0;
        }

        .price-card span {
          font-size: 12px;
          color: green;
        }

        .weather-card {
          background: #4f8df7;
          color: white;
        }

        /* Orders */
        .orders {
          padding: 10px;
        }

        .orders h3 {
          margin-bottom: 10px;
        }

        .order {
          background: white;
          padding: 12px;
          border-radius: 15px;
          margin-bottom: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .order h4 {
          margin: 0;
        }

        .order p {
          margin: 4px 0;
          font-size: 13px;
          color: gray;
        }

        .order-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .reject {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: #eee;
          cursor: pointer;
        }

        .accept {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: #2e7d32;
          color: white;
          cursor: pointer;
        }

        /* Bottom Navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 100%;
          max-width: 400px;
          background: white;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 10px 0;
        }

        .bottom-nav span {
          font-size: 12px;
          color: gray;
        }
      `}</style>

      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div className="avatar"></div>
          <div>
            <h2>Hello, Rajesh</h2>
            <div className="verified">✔ Verified Farmer</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-box">
            <h3>$4,250</h3>
            <p>Earnings</p>
          </div>
          <div className="stat-box">
            <h3>18</h3>
            <p>Orders</p>
          </div>
          <div className="stat-box">
            <h3>24</h3>
            <p>Products</p>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <div className="action">➕<span>Add Product</span></div>
          <div className="action">📦<span>Orders</span></div>
          <div className="action">🚜<span>My Farm</span></div>
          <div className="action">👨‍🌾<span>Add Expert</span></div>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="card price-card">
            <p>Wheat Price</p>
            <h3>$340 / ton</h3>
            <span>High Demand</span>
          </div>

          <div className="card weather-card">
            <p>Today</p>
            <h3>24°C</h3>
            <span>Partly Cloudy</span>
          </div>
        </div>

        {/* Orders */}
        <div className="orders">
          <h3>Recent Orders</h3>

          <div className="order">
            <h4>Fresh Potatoes</h4>
            <p>50 kg • $120</p>
            <div className="order-actions">
              <button className="reject">Reject</button>
              <button className="accept">Accept</button>
            </div>
          </div>

          <div className="order">
            <h4>Red Tomatoes</h4>
            <p>30 kg • $85.50</p>
            <div className="order-actions">
              <button className="reject">Reject</button>
              <button className="accept">Accept</button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <span>Home</span>
          <span>Products</span>
          <span>Experts</span>
          <span>Calendar</span>
          <span>Profile</span>
        </div>
      </div>
    </>
  );
}
