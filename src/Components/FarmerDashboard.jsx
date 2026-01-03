import React from "react";

export default function FarmerDashboard() {
  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Segoe UI", Arial, sans-serif;
        }

        body {
          margin: 0;
          background: #eaf6f0;
        }

        .dashboard {
          max-width: 390px;
          margin: auto;
          background: #f4fbf8;
          min-height: 100vh;
          padding-bottom: 90px;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }

        .user {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: url("https://i.pravatar.cc/100") center/cover;
        }

        .verified {
          font-size: 12px;
          color: green;
        }

        .bell {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        /* Stats */
        .stats {
          display: flex;
          gap: 10px;
          padding: 0 16px;
        }

        .stat {
          flex: 1;
          background: white;
          padding: 12px;
          border-radius: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .stat p {
          margin: 0;
          font-size: 12px;
          color: gray;
        }

        .stat h4 {
          margin: 6px 0;
        }

        .stat small {
          font-size: 11px;
          color: green;
        }

        /* Actions */
        .actions {
          display: flex;
          justify-content: space-between;
          padding: 16px;
        }

        .action {
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .action-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #e8f6ee;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          color: #2e8b57;
          font-weight: bold;
        }

        /* Cards */
        .cards {
          display: flex;
          gap: 12px;
          padding: 0 16px;
        }

        .card {
          flex: 1;
          padding: 14px;
          border-radius: 16px;
        }

        .price-card {
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .tag {
          background: #e8f6ee;
          color: green;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .weather-card {
          background: #4f8df7;
          color: white;
        }

        /* Orders */
        .section {
          padding: 16px;
        }

        .order {
          background: white;
          border-radius: 16px;
          padding: 10px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .order-top {
          display: flex;
          gap: 10px;
        }

        .order img {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
        }

        .price {
          color: green;
          font-weight: bold;
        }

        .order-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .reject {
          flex: 1;
          border: none;
          background: #f1f1f1;
          border-radius: 10px;
          padding: 8px;
        }

        .accept {
          flex: 1;
          border: none;
          background: #2e8b57;
          color: white;
          border-radius: 10px;
          padding: 8px;
        }

        /* Collaborations */
        .collabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .hotel {
          min-width: 140px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .hotel img {
          width: 100%;
          height: 90px;
          object-fit: cover;
          border-radius: 16px 16px 0 0;
        }

        .hotel p {
          margin: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Bottom Nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 100%;
          max-width: 390px;
          background: white;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #ddd;
        }

        .nav-item {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #7a7a7a;
        }

        .nav-item.active {
          background: #e8f6ee;
          color: #2e8b57;
        }
      `}</style>

      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div className="user">
            <div className="avatar"></div>
            <div>
              <h3>Hello, Rajesh</h3>
              <div className="verified">Verified Farmer</div>
            </div>
          </div>
          <div className="bell">🔔</div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <p>Earnings</p>
            <h4>Rs 4,250</h4>
            <small>+12%</small>
          </div>
          <div className="stat">
            <p>Orders</p>
            <h4>18</h4>
            <small style={{ color: "orange" }}>Pending</small>
          </div>
          <div className="stat">
            <p>Products</p>
            <h4>24</h4>
            <small>Listed</small>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <div className="action"><div className="action-icon">+</div>Add Product</div>
          <div className="action"><div className="action-icon">📦</div>View Orders</div>
          <div className="action"><div className="action-icon">🚜</div>My Farm</div>
          <div className="action"><div className="action-icon">👤</div>Add Expert</div>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card price-card">
            <p>Wheat Price</p>
            <h3>Rs 340 / ton</h3>
            <span className="tag">High Demand</span>
          </div>
          <div className="card weather-card">
            <p>Today</p>
            <h3>24°C</h3>
            <small>Partly Cloudy</small>
          </div>
        </div>

        {/* Orders */}
        <div className="section">
          <h4>Recent Orders</h4>

          {/* <div className="order">
            <div className="order-top">
              <img src="https://images.unsplash.com/photo-1582515073490-dc84c84c0c8b" />
              <div>
                <h5>Fresh Potatoes</h5>
                <small>50 kg • Order #2049</small>
                <div className="price">Rs 120.00</div>
              </div>
            </div>
            <div className="order-actions">
              <button className="reject">Reject</button>
              <button className="accept">Accept</button>
            </div>
          </div> */}

          <div className="order">
            <div className="order-top">
              <img src="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" />
              <div>
                <h5>Red Tomatoes</h5>
                <small>30 kg • Order #2048</small>
                <div className="price">Rs 85.50</div>
              </div>
            </div>
            <div className="order-actions">
              <button className="reject">Reject</button>
              <button className="accept">Accept</button>
            </div>
          </div>
        </div>

        {/* Collaborations */}
        <div className="section">
          <h4>Collaborations</h4>
          <div className="collabs">
            <div className="hotel">
              <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de" />
              <p>Green Valley Hotel</p>
            </div>
            <div className="hotel">
              <img src="https://images.unsplash.com/photo-1544025162-d76694265947" />
              <p>The Fresh Table</p>
            </div>
            <div className="hotel">
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9" />
              <p>Urban Kitchen</p>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <div className="nav-item active">🏠</div>
          <div className="nav-item">📦</div>
          <div className="nav-item">👨‍🌾</div>
          <div className="nav-item">📅</div>
          <div className="nav-item">👤</div>
        </div>
      </div>
    </>
  );
}
