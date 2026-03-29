import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [farmerId, setFarmerId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading..." });
  const [collabs, setCollabs] = useState([]);
  const [demands, setDemands] = useState([]);
  const [articles, setArticles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const cachedCity = localStorage.getItem("userCity");
    if (!email) return;

    const fetchAllData = () => {
      
      // Fetch Articles
      fetch("http://localhost:5000/api/articles")
        .then(res => res.json())
        .then(data => setArticles(data))
        .catch(err => console.error("Articles fetch error:", err));
      // Fetch user profile to get City
      fetch(`http://localhost:5000/api/user/${email}`)
        .then(res => res.json())
        .then(user => {
          setUserName(user.full_name);
          setFarmerId(user.id);
          // Only fetch weather if NOT already fetching/fetched from cache
          if (user.city && !cachedCity) {
            fetch(`http://localhost:5000/api/weather/${user.city}`)
              .then(res => res.json())
              .then(data => setWeather(data))
              .catch(err => console.error("Weather fetch error:", err));
          }
        });

      // Fetch Weather immediately if city is known
      if (cachedCity) {
        fetch(`http://localhost:5000/api/weather/${cachedCity}`)
          .then(res => res.json())
          .then(data => setWeather(data))
          .catch(err => console.error("Cached weather fetch error:", err));
      }

      // Fetch Orders
      fetch(`http://localhost:5000/api/orders/farmer/${email}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error("Farmer orders fetch error:", err);
          setLoadingOrders(false);
        });

      // Fetch Product Count
      fetch(`http://localhost:5000/api/products/farmer/${email}`)
        .then(res => res.json())
        .then(data => setProductCount(data.length))
        .catch(err => console.error("Product count fetch error:", err));

      // Fetch Collaborations
      fetch("http://localhost:5000/api/collaborations")
        .then(res => res.json())
        .then(data => setCollabs(data))
        .catch(err => console.error("Collabs fetch error:", err));

      // Fetch Buyer Demands
      fetch("http://localhost:5000/api/demands")
        .then(res => res.json())
        .then(data => setDemands(data))
        .catch(err => console.error("Demands fetch error:", err));

      // Fetch Notifications
      fetch(`http://localhost:5000/api/notifications/${email}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error("Notif fetch error:", err));
    };

    fetchAllData();
    
    // Store fetch function in a ref or just use it here
    window.refreshDashboard = fetchAllData; 
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.message, data.success !== false ? "success" : "error");
      if (window.refreshDashboard) window.refreshDashboard();
    })
    .catch(err => console.error("Update status error:", err));
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .content-scroll {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
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

        /* Expert Knowledge Horizontal */
        .article-list-horizontal {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .article-card-mini {
          min-width: 200px;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .article-img-mini {
          height: 100px;
          width: 100%;
          object-fit: cover;
        }

        .article-info-mini {
          padding: 10px;
        }

        .category-mini {
          font-size: 10px;
          color: #16a34a;
          text-transform: uppercase;
          font-weight: bold;
        }

        .article-info-mini p {
          margin: 5px 0 0;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
        }

        /* Bottom nav */
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
          margin-top: auto;
        }

        .bottom-nav span {
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 4px; 
          font-size: 13px; 
          color: #6b7280; 
          cursor: pointer; 
        }

        .bottom-nav span .icon { font-size: 20px; line-height: 1; }

        .bottom-nav .active {
          color: #16a34a;
        }

        /* Notif UI */
        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #ef4444;
          color: white;
          font-size: 9px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid white;
        }

        .notif-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .notif-modal {
          width: 320px;
          max-height: 400px;
          background: white;
          border-radius: 16px;
          padding: 20px;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .notif-item {
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          border-left: 3px solid #eee;
          background: #f9f9f9;
          cursor: pointer;
        }
        .notif-item.unread { border-left-color: #16a34a; background: #f0fdf4; }
        .notif-item strong { display: block; font-size: 13px; }
        .notif-item p { margin: 2px 0 0; font-size: 11px; color: #666; }

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
          <div className="profile">
            <div className="avatar">👤</div>
            <div>
              <strong>Hello, {userName}</strong>
              <div className="verified">Verified Farmer</div>
            </div>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(true)}>
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div>Earnings</div>
            <h4>Rs {
              orders
                .filter(o => o.status === "Delivered")
                .reduce((sum, o) => sum + (o.price_at_purchase * o.quantity), 0)
                .toLocaleString()
            }</h4>
            <div className="green">Delivered Total</div>
          </div>
          <div className="stat-card" onClick={() => navigate("/farmer-orders")} style={{cursor: "pointer"}}>
            <div>Orders</div>
            <h4>{orders.length}</h4>
            <div>Active</div>
          </div>
          <div className="stat-card">
            <div>Products</div>
            <h4>{productCount}</h4>
            <div>Listed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <div className="action" onClick={() => navigate("/add-product")} style={{cursor: "pointer"}}>
            <div>＋</div>Add Product
          </div>
          <div className="action" onClick={() => navigate("/farmer-orders")} style={{cursor: "pointer"}}><div>🧾</div>View Orders</div>
          <div className="action" onClick={() => navigate("/my-farm")} style={{cursor: "pointer"}}><div>🚜</div>My Farm</div>
          <div className="action"><div>👤</div>Add Expert</div>
        </div>

        {/* Info */}
        <div className="info">
          <div className="info-card">
            {demands.length > 0 ? (
              <>
                <div>High Demand: {demands[0].product_name}</div>
                <strong>{demands[0].quantity} Needed</strong>
                <div className="badge">{demands[0].description || "Urgent Request"}</div>
              </>
            ) : (
              <>
                <div>Wheat Price</div>
                <strong>$340/ton</strong>
                <div className="badge">High Demand</div>
              </>
            )}
          </div>
          <div className="info-card blue" onClick={() => navigate("/weather-detail")} style={{cursor: "pointer"}}>
            <div>{weather.city || "Weather"}</div>
            <h3>{weather.temp}°C</h3>
            <div>{weather.condition}</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div className="section-title">Recent Orders</div>
          <button 
            onClick={() => navigate("/farmer-orders")}
            style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "0"
            }}
          >View All</button>
        </div>

        {loadingOrders ? (
          <p style={{fontSize: "14px", color: "#666"}}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{fontSize: "14px", color: "#666"}}>No recent orders.</p>
        ) : (
          orders.slice(0, 3).map(order => (
            <div className="order-card" key={order.id}>
              <img
                className="order-img"
                src={order.image_url ? `http://localhost:5000${order.image_url}` : "https://images.unsplash.com/photo-1582515073490-39981397c445"}
                alt={order.product_name}
              />
              <div className="order-info">
                <strong>{order.product_name}</strong>
                <div>{order.quantity} units • {order.order_number}</div>
                <strong>Rs{order.price_at_purchase * order.quantity}</strong>
              </div>
              <div className="order-actions">
                {order.status === "Order Placed" ? (
                  <>
                    <button className="reject" onClick={() => updateOrderStatus(order.order_id, "Cancelled")}>Reject</button>
                    <button className="accept" onClick={() => updateOrderStatus(order.order_id, "Accepted")}>Accept</button>
                  </>
                ) : (
                  <span style={{fontSize: "12px", fontWeight: "bold", color: "#2e8b57"}}>{order.status}</span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Collaborations */}
        <div className="section-title">Collaborations</div>
        <div className="collab-list">
          {collabs.length === 0 ? (
            <p style={{fontSize: "12px", color: "#666"}}>Looking for new partnerships...</p>
          ) : (
            collabs.map(c => (
              <div className="collab-card" key={c.id} onClick={() => navigate(`/collaboration/${c.id}`)} style={{cursor:"pointer"}}>
                <img
                  className="collab-img"
                  src={c.image_url ? `http://localhost:5000${c.image_url}` : "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                  alt={c.name}
                />
                <p>{c.name}</p>
              </div>
            ))
          )}
        </div>

        {/* Expert Knowledge */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div className="section-title">Expert Knowledge</div>
          <button 
            onClick={() => navigate("/knowledge")}
            style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "0"
            }}
          >View All</button>
        </div>

        <div className="article-list-horizontal">
          {articles.length === 0 ? (
            <p style={{fontSize: "12px", color: "#666"}}>No articles yet.</p>
          ) : (
            articles.map(article => (
              <div 
                className="article-card-mini" 
                key={article.id} 
                onClick={() => navigate(`/article/${article.id}`)}
                style={{cursor: "pointer"}}
              >
                <img
                  className="article-img-mini"
                  src={article.image_url ? `http://localhost:5000${article.image_url}` : "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"}
                  alt={article.title}
                />
                <div className="article-info-mini">
                  <span className="category-mini">{article.category || "General"}</span>
                  <p>{article.title.substring(0, 30)}...</p>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          <span className="active" onClick={() => navigate("/farmer-dashboard")}>
            <div className="icon">🏠</div>Home
          </span>
          <span onClick={() => navigate("/products")}>
            <div className="icon">🌱</div>Products
          </span>
          <span onClick={() => navigate("/experts")}>
            <div className="icon">👥</div>Experts
          </span>
          <span onClick={() => navigate("/farmer-calendar")}>
            <div className="icon">📅</div>Calendar
          </span>
          <span onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </span>
        </div>

        {showNotifications && (
          <div className="notif-overlay" onClick={() => setShowNotifications(false)}>
            <div className="notif-modal" onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 15px 0" }}>Notifications</h3>
              {notifications.length === 0 ? <p style={{ textAlign: "center", fontSize: "12px", color: "#999" }}>No notifications</p> : (
                notifications.map(n => (
                  <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => !n.is_read && markAsRead(n.id)}>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <div style={{ fontSize: "9px", color: "#999", marginTop: "4px" }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                ))
              )}
              <button onClick={() => setShowNotifications(false)} style={{ width: "100%", marginTop: "10px", padding: "8px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

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
