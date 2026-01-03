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
          background: #e5f2e5; /* light greenish background for contrast */
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 20px;
        }

        .app {
          width: 390px;
          background: #f2fbf6;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow-y: auto;
          max-height: 90vh;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .profile {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
        }

        .verified {
          font-size: 12px;
          color: #16a34a;
        }

        /* Stats */
        .stats {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .stat-card {
          background: #fff;
          padding: 12px;
          border-radius: 14px;
          flex: 1;
        }

        .stat-card h4 {
          margin: 6px 0;
        }

        .green {
          color: #16a34a;
          font-size: 12px;
        }

        .yellow {
          color: #ca8a04;
          font-size: 12px;
        }

        /* Actions */
        .actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .action {
          background: #fff;
          width: 22%;
          padding: 12px 6px;
          border-radius: 14px;
          text-align: center;
          font-size: 12px;
        }

        .action div {
          font-size: 18px;
          margin-bottom: 6px;
          color: #16a34a;
        }

        /* Info */
        .info {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .info-card {
          background: #fff;
          padding: 14px;
          border-radius: 14px;
          flex: 1;
        }

        .info-card.blue {
          background: #3b82f6;
          color: white;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          background: #dcfce7;
          color: #16a34a;
          font-size: 11px;
          margin-top: 6px;
        }

        /* Section title */
        .section-title {
          font-weight: bold;
          margin: 16px 0 10px;
        }

        /* Orders */
        .order-card {
          background: #fff;
          border-radius: 14px;
          padding: 10px;
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .order-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
        }

        .order-info {
          flex: 1;
          font-size: 14px;
        }

        .order-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .reject {
          background: #f3f4f6;
          border: none;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .accept {
          background: #2e8b57;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Collaborations */
        .collab-list {
          display: flex;
          gap: 10px;
          overflow-x: auto;
        }

        .collab-card {
          min-width: 150px;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
        }

        .collab-img {
          height: 90px;
          width: 100%;
          object-fit: cover;
        }

        .collab-card p {
          padding: 8px;
          font-size: 13px;
          font-weight: bold;
        }

        /* Bottom nav */
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 10px 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
          margin-top: 16px;
          position: sticky;
          bottom: 0;
        }

        .bottom-nav span {
          font-size: 12px;
          text-align: center;
          color: #6b7280;
        }

        .bottom-nav .active {
          color: #16a34a;
        }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="profile">
            <div className="avatar">👤</div>
            <div>
              <strong>Hello, Rajesh</strong>
              <div className="verified">Verified Farmer</div>
            </div>
          </div>
          🔔
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div>Earnings</div>
            <h4>$4,250</h4>
            <div className="green">+12%</div>
          </div>
          <div className="stat-card">
            <div>Orders</div>
            <h4>18</h4>
            <div className="yellow">Pending</div>
          </div>
          <div className="stat-card">
            <div>Products</div>
            <h4>24</h4>
            <div>Listed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <div className="action"><div>＋</div>Add Product</div>
          <div className="action"><div>🧾</div>View Orders</div>
          <div className="action"><div>🚜</div>My Farm</div>
          <div className="action"><div>👤</div>Add Expert</div>
        </div>

        {/* Info */}
        <div className="info">
          <div className="info-card">
            <div>Wheat Price</div>
            <strong>$340/ton</strong>
            <div className="badge">High Demand</div>
          </div>
          <div className="info-card blue">
            <div>Today</div>
            <h3>24°C</h3>
            <div>Partly Cloudy</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="section-title">Recent Orders</div>

        <div className="order-card">
          <img
            className="order-img"
            src="https://images.unsplash.com/photo-1582515073490-39981397c445"
            alt="Potatoes"
          />
          <div className="order-info">
            <strong>Fresh Carrot</strong>
            <div>50 kg • Order #2049</div>
            <strong>$120.00</strong>
          </div>
          <div className="order-actions">
            <button className="reject">Reject</button>
            <button className="accept">Accept</button>
          </div>
        </div>

        {/* <div className="order-card">
          <img
            className="order-img"
            src="https://images.unsplash.com/photo-1546470427-f5d84a6f99c4"
            alt="Tomatoes"
          />
          <div className="order-info">
            <strong>Red Tomatoes</strong>
            <div>30 kg • Order #2048</div>
            <strong>$85.50</strong>
          </div>
          <div className="order-actions">
            <button className="reject">Reject</button>
            <button className="accept">Accept</button>
          </div>
        </div> */}

        {/* Collaborations */}
        <div className="section-title">Collaborations</div>

        <div className="collab-list">
          <div className="collab-card">
            <img
              className="collab-img"
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
              alt="Hotel"
            />
            <p>Green Valley Hotel</p>
          </div>

          <div className="collab-card">
            <img
              className="collab-img"
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9"
              alt="Restaurant"
            />
            <p>The Fresh Table</p>
          </div>

          <div className="collab-card">
            <img
              className="collab-img"
              src="https://images.unsplash.com/photo-1528605248644-14dd04022da1"
              alt="Urban Dine"
            />
            <p>Urban Dine</p>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          <span className="active">🏠<br />Home</span>
          <span>🌱<br />Products</span>
          <span>👥<br />Experts</span>
          <span>📅<br />Calendar</span>
          <span>👤<br />Profile</span>
        </div>
      </div>
    </>
  );
}
