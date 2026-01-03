import React from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  // Sample collaboration data
  const collaborations = [
    {
      id: 1,
      name: "Green Bistro",
      location: "Downtown",
      image: "https://images.unsplash.com/photo-1555992336-03a23c86c35e",
    },
    {
      id: 2,
      name: "Healthy Eats Restaurant",
      location: "City Center",
      image: "https://images.unsplash.com/photo-1541544184983-0c3b72da9a16",
    },
    {
      id: 3,
      name: "Sunset Hotel Kitchen",
      location: "Beachside",
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { margin:0; padding:0; background: #e3f2dc; }

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
          gap: 18px;
        }

        /* Greeting Section */
        .greeting { display:flex; align-items:center; gap:15px; }
        .greeting img { width:60px; height:60px; border-radius:50%; border:2px solid white; object-fit:cover; }
        .greeting-text { flex:1; }
        .greeting-text h2 { margin:0; font-weight:600; font-size:20px; }
        .greeting-text small { opacity:0.7; }
        .notification { font-size:24px; cursor:pointer; }

        /* Cards Section */
        .cards {
          background:white;
          color:black;
          border-radius:18px;
          padding:16px;
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:14px;
        }
        .card {
          background:#f8f9f7;
          border-radius:12px;
          padding:14px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          gap:6px;
          min-height:70px;
        }
        .card h3 { margin:0; font-size:14px; font-weight:700; opacity:0.7; }
        .card .value { font-size:20px; font-weight:800; color:#2a5d33; }
        .highlight { font-weight:600; background:#d3f0c0; padding:6px 10px; border-radius:14px; font-size:12px; width:fit-content; color:#3b6d1f; }

        /* Quick Actions */
        .quick-actions {
          background:white;
          border-radius:18px;
          padding:16px;
          color:black;
          display:flex;
          justify-content:space-around;
        }
        .action-btn { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; color:#3f8454; user-select:none; }
        .action-btn span { font-size:24px; line-height:1; }
        .action-btn label { font-size:12px; font-weight:600; display:none; }

        /* Market Price */
        .market-price {
          background:white;
          border-radius:18px;
          padding:16px;
          color:black;
          font-weight:600;
          font-size:14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }
        .price-current { color:#2a5d33; }
        .price-demand { color:#c04a4a; font-weight:700; }

        /* Weather Section */
        .weather {
          background:#3b82f6;
          color:white;
          border-radius:18px;
          padding:16px 20px;
          display:flex;
          align-items:center;
          gap:14px;
          max-width:220px;
          box-shadow:0 4px 8px rgba(59,130,246,0.4);
          user-select:none;
        }
        .weather img { width:60px; height:60px; filter:drop-shadow(0 0 1px rgba(0,0,0,0.3)); }
        .weather-info { font-weight:700; font-size:16px; line-height:1.2; text-shadow:0 0 2px rgba(0,0,0,0.3); }

        /* Recent Orders */
        .recent-orders {
          background:white;
          border-radius:18px;
          padding:16px;
          color:black;
          max-height:220px;
          overflow-y:auto;
        }
        .recent-orders-header {
          display:flex;
          justify-content:space-between;
          font-weight:700;
          margin-bottom:12px;
          font-size:16px;
        }
        .order-item {
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px 0;
          border-bottom:1px solid #d5e4d4;
        }
        .order-item img { width:60px; height:60px; border-radius:14px; object-fit:cover; }
        .order-details { flex:1; }
        .order-title { font-weight:700; margin:0; }
        .order-info { font-size:13px; opacity:0.8; }
        .order-actions { display:flex; gap:8px; }
        .order-actions button { border:none; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer; font-size:14px; user-select:none; transition:background-color 0.2s ease; }
        .btn-reject { background:#f4c7c7; color:#7d2c2c; }
        .btn-reject:hover { background:#e19b9b; }
        .btn-accept { background:#73b56b; color:white; }
        .btn-accept:hover { background:#5b8a4f; }

        /* Collaborations Section */
        .collaborations {
          background:white;
          border-radius:18px;
          padding:16px;
          color:black;
          max-height:180px;
          overflow-x:auto;
          display:flex;
          gap:12px;
        }
        .collab-item { min-width:140px; background:#f8f9f7; border-radius:14px; padding:12px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; }
        .collab-item img { width:100px; height:70px; border-radius:12px; object-fit:cover; }
        .collab-item .name { font-weight:700; font-size:14px; text-align:center; }
        .collab-item .location { font-size:12px; opacity:0.7; text-align:center; }

        /* Bottom Navigation */
        .bottom-nav {
          margin-top:auto;
          background:white;
          border-radius:20px;
          padding:10px 8px;
          display:flex;
          justify-content:space-around;
          color:#3f8454;
          font-weight:700;
          font-size:22px;
          user-select:none;
          box-shadow:0 0 8px rgba(0,0,0,0.1);
        }
        .nav-item { cursor:pointer; display:flex; align-items:center; justify-content:center; flex:1; padding:6px 0; color:#3f8454; transition:color 0.3s ease; }
        .nav-item:hover { color:#2e8b57; }
        .nav-item.active { color:#2e8b57; font-weight:800; }
      `}</style>

      <div className="app">
        {/* Greeting */}
        <div className="greeting">
          <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="profile" />
          <div className="greeting-text">
            <h2>Hello, Michael</h2>
            <small>Farm Owner</small>
          </div>
          <div className="notification" title="Notifications">🔔</div>
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
            <div className="highlight" style={{ background:"#f0c77d", color:"#775e15" }}>Pending</div>
          </div>
          <div className="card" style={{ gridColumn:"span 2" }}>
            <h3>Total Products Listed</h3>
            <div className="value">134 Items</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-btn" title="Add Product" onClick={()=>navigate("/add-product")}><span>➕</span></div>
          <div className="action-btn" title="Orders" onClick={()=>navigate("/farmer-orders")}><span>📦</span></div>
          <div className="action-btn" title="My Farm" onClick={()=>navigate("/my-farm")}><span>🌾</span></div>
          <div className="action-btn" title="Add Expert" onClick={()=>navigate("/add-expert")}><span>🧑‍🌾</span></div>
        </div>

        {/* Market Price */}
        <div className="market-price">
          <div>Wheat Market Price <br/><span className="price-current">Current: $320 / ton</span></div>
          <div className="price-demand">↗ High Demand</div>
        </div>

        {/* Weather */}
        <div className="weather" title="Weather Info">
          <img src="https://openweathermap.org/img/wn/01d@2x.png" alt="Clear sky"/>
          <div className="weather-info">25°C<br/>Clear Sky</div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="recent-orders-header">
            <div>Recent Orders</div>
            <div style={{cursor:"pointer", color:"#3f8454"}} onClick={()=>navigate("/farmer-orders")}>See All</div>
          </div>
          <div className="order-item">
            <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea" alt="Sweet Corn"/>
            <div className="order-details"><p className="order-title">Sweet Corn Bushels</p><p className="order-info">Qty:200kg - Total:$350</p></div>
            <div className="order-actions"><button className="btn-reject">Reject</button><button className="btn-accept">Accept Order</button></div>
          </div>
          <div className="order-item">
            <img src="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" alt="Tomatoes"/>
            <div className="order-details"><p className="order-title">Cherry Tomatoes</p><p className="order-info">Qty:150kg - Total:$180</p></div>
            <div className="order-actions"><button className="btn-reject">Reject</button><button className="btn-accept">Accept Order</button></div>
          </div>
        </div>

        {/* Collaborations with Hotels/Restaurants */}
        <div className="collaborations">
          {collaborations.map(c => (
            <div className="collab-item" key={c.id} onClick={()=>alert(`Collaborate with ${c.name}`)}>
              <img src={c.image} alt={c.name}/>
              <div className="name">{c.name}</div>
              <div className="location">{c.location}</div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item active" onClick={()=>navigate("/farmer-dashboard")} title="Home">🏠</div>
          <div className="nav-item" onClick={()=>navigate("/farmer-products")} title="Products">🍅</div>
          <div className="nav-item" onClick={()=>navigate("/farmer-experts")} title="Experts">🧑‍🌾</div>
          <div className="nav-item" onClick={()=>navigate("/crop-calendar")} title="Crop Calendar">📅</div>
          <div className="nav-item" onClick={()=>navigate("/farmer-profile")} title="Profile">👤</div>
        </div>
      </div>
    </>
  );
}
