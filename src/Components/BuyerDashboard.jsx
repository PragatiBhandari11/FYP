import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("");
  const [demand, setDemand] = useState({ name: "", quantity: "", description: "" });
  const [submittingDemand, setSubmittingDemand] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

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

  const handleDemandSubmit = async (e) => {
    e.preventDefault();
    const buyerEmail = localStorage.getItem("userEmail");
      if (!buyerEmail) { showToast("Login required", "error"); return; }
      
      setSubmittingDemand(true);
      try {
        const response = await fetch("http://localhost:5000/api/demands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerEmail,
            productName: demand.name,
            quantity: demand.quantity,
            description: demand.description
          })
        });
        if (response.ok) {
          showToast("Demand alert sent! 📢");
          setDemand({ name: "", quantity: "", description: "" });
        } else {
          showToast("Failed to send alert.", "error");
        }
    } catch (err) {
      console.error("Demand error", err);
    } finally {
      setSubmittingDemand(false);
    }
  }

  const [dbProducts, setDbProducts] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
  
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setDbProducts(data))
      .catch(err => console.error(err));

    const buyerEmail = localStorage.getItem("userEmail");
    if (buyerEmail) {
      fetch(`http://localhost:5000/api/orders/${buyerEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setLatestOrder(data[0]);
          }
        })
        .catch(err => console.error("Error fetching latest order:", err));

      // Fetch Notifications
      fetch(`http://localhost:5000/api/notifications/${buyerEmail}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error("Error fetching notifications:", err));
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

        :root {
          --primary: hsl(142, 72%, 29%);
          --primary-light: hsl(142, 60%, 96%);
          --primary-glow: hsla(142, 72%, 29%, 0.2);
          --accent: hsl(38, 92%, 50%);
          --text-main: hsl(210, 24%, 16%);
          --text-muted: hsl(215, 16%, 47%);
          --bg-main: hsl(0, 0%, 100%);
          --glass: rgba(255, 255, 255, 0.85);
          --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }

        * { box-sizing: border-box; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        body { background: #f8fafc; margin: 0; color: var(--text-main); }

        .app {
          width: 390px;
          margin: 0 auto;
          background: var(--bg-main);
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .content-scroll { flex: 1; overflow-y: auto; padding-bottom: 90px; }
        .content-scroll::-webkit-scrollbar { width: 0px; }

        .header {
          background: linear-gradient(135deg, #1e7d4f, #3ac37a);
          color: white;
          padding: 30px 20px 40px;
          border-bottom-left-radius: 30px;
          border-bottom-right-radius: 30px;
          box-shadow: 0 4px 20px rgba(46, 139, 87, 0.15);
        }

        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .user-greeting h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .user-greeting p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
        .header-icons { display: flex; gap: 15px; font-size: 20px; cursor: pointer; }

        .search-container { position: relative; width: 100%; top: 20px; }
        .search-input {
          width: 100%;
          padding: 16px 20px 16px 45px;
          border-radius: 18px;
          border: none;
          background: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          font-size: 15px;
          outline: none;
        }
        .search-input:focus { transform: scale(1.02); box-shadow: 0 20px 25px -5px var(--primary-glow); }
        .search-icon { position: absolute; left: 18px; top: 16px; color: var(--text-muted); pointer-events: none; }

        section { padding: 24px 20px; animation: fadeIn 0.6s ease-out; }
        section h3 { margin: 0 0 16px; font-size: 18px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px; }

        .demand-card {
          background: linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          padding: 18px;
          box-shadow: var(--shadow);
          background-color: #fdf8e6;
        }

        .status-card {
          background: white;
          padding: 18px;
          border-radius: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow);
          border: 1px solid #f1f5f9;
        }

        .product-card {
          background: white;
          padding: 16px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 16px;
          box-shadow: var(--shadow);
          border: 1px solid #f8fafc;
        }
        .product-card:hover { transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); border-color: var(--primary-light); }
        
        .product-image {
          width: 60px;
          height: 60px;
          background: var(--primary-light);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .product-info { flex: 1; }
        .product-info strong { display: block; font-size: 16px; color: var(--text-main); }
        .product-info span { font-size: 12px; color: var(--text-muted); }
        .product-price { color: var(--primary); font-weight: 700; font-size: 16px; margin-top: 4px; }

        .add-btn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: none;
          background: var(--primary);
          color: white;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px var(--primary-glow);
        }
        .add-btn:active { transform: scale(0.9); }

        .bottom-nav {
          position: fixed;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 360px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-radius: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          z-index: 1000;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
        }
        .nav-item .icon { font-size: 22px; transition: transform 0.3s; }
        .nav-item.active { color: var(--primary); font-weight: 700; }
        .nav-item.active .icon { transform: translateY(-5px); }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          width: 4px;
          height: 4px;
          background: var(--primary);
          border-radius: 50%;
        }

        input.modern-input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; margin-bottom: 10px; background: white; }
        button.modern-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }

        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--primary);
        }

        .notif-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(4px);
        }

        .notif-modal {
          width: 340px;
          max-height: 500px;
          background: white;
          border-radius: 24px;
          padding: 24px;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          position: relative;
        }

        .notif-item {
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          border-left: 4px solid #e2e8f0;
          background: #f8fafc;
        }
        .notif-item.unread { border-left-color: var(--primary); background: var(--primary-light); }
        .notif-item strong { display: block; font-size: 14px; margin-bottom: 2px; }
        .notif-item p { margin: 0; font-size: 12px; color: #64748b; }
        .notif-item span { font-size: 10px; color: #94a3b8; }

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
            <div className="header-top">
              <div className="user-greeting">
                <h2>Hi, {userName || "Guest"}!</h2>
                <p>Welcome to AgroConnect</p>
              </div>
              <div className="header-icons">
                <span onClick={() => navigate("/buyer-cart")}>🛒</span>
                <div style={{ position: 'relative' }} onClick={() => setShowNotifications(true)}>
                   <span>🔔</span>
                   {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </div>
              </div>
            </div>

            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search fresh products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    navigate(`/buyer-explore?search=${encodeURIComponent(search.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          <div style={{ padding: '0 10px', marginTop: '10px' }}>
            {search.trim() && (
              <div style={{ fontSize: "12px", color: "var(--primary)", textAlign: "center", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate(`/buyer-explore?search=${encodeURIComponent(search.trim())}`)}>
                View all results for "{search}" &rarr;
              </div>
            )}
          </div>

          {/* Demand Alert Section */}
          <section>
            <h3><span>📢</span> Demand Alerts</h3>
            <div className="demand-card">
              <p style={{ fontSize: "13px", color: "#666", marginTop: 0, marginBottom: "15px" }}>Looking for something specific? Notify local farmers.</p>
              <form onSubmit={handleDemandSubmit}>
                 <input 
                   className="modern-input"
                   type="text" 
                   placeholder="Product Name (e.g. Organic Ginger)" 
                   value={demand.name}
                   onChange={(e) => setDemand({...demand, name: e.target.value})}
                   required
                 />
                 <div style={{ display: "flex", gap: "10px" }}>
                   <input 
                     className="modern-input"
                     type="text" 
                     placeholder="Qty (e.g. 50kg)" 
                     value={demand.quantity}
                     onChange={(e) => setDemand({...demand, quantity: e.target.value})}
                     style={{ width: "40%" }}
                   />
                   <input 
                     className="modern-input"
                     type="text" 
                     placeholder="Notes/Deadline" 
                     value={demand.description}
                     onChange={(e) => setDemand({...demand, description: e.target.value})}
                     style={{ width: "60%" }}
                   />
                 </div>
                 <button 
                   className="modern-btn"
                   type="submit" 
                   disabled={submittingDemand}
                   style={{
                     background: "var(--accent)",
                     color: "white",
                     boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)",
                     opacity: submittingDemand ? 0.7 : 1
                   }}
                 >
                   {submittingDemand ? "Sending..." : "Post Demand Alert"}
                 </button>
              </form>
            </div>
          </section>

          {/* Order Status */}
          <section>
            <h3><span>📦</span> My Orders</h3>
            <div className="status-card" style={{ cursor: "pointer" }} onClick={() => navigate("/buyer-orders")}>
              {latestOrder ? (
                <>
                  <div>
                    <strong style={{ color: "var(--primary)", fontSize: "15px" }}>{latestOrder.status}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>Order #{latestOrder.order_number.slice(-8)}</p>
                  </div>
                  <div style={{ color: "var(--primary)", fontWeight: "bold" }}>Details &rarr;</div>
                </>
              ) : (
                <div style={{ color: "#666", fontSize: "14px" }}>No active orders currently.</div>
              )}
            </div>
          </section>

          {/* Featured Products */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}><span>🌟</span> Featured</h3>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate("/buyer-explore")}>See All</span>
            </div>
            {dbProducts.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>Finding freshness...</p> : (
              dbProducts
                .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 4) 
                .map(p => (
                  <div className="product-card" key={p.id}>
                    <div className="product-image" style={{ overflow: "hidden" }}>
                      {p.image_url ? (
                        <img 
                          src={p.image_url.startsWith("http") ? p.image_url : `http://localhost:5000${p.image_url.startsWith("/") ? "" : "/"}${p.image_url}`} 
                          alt={p.name} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        p.category?.toLowerCase() === 'fruit' ? '🍎' : p.category?.toLowerCase() === 'dairy' ? '🥛' : '🥦'
                      )}
                    </div>
                    <div className="product-info">
                      <strong>{p.name}</strong>
                      <span>Fresh from local farm</span>
                      <div className="product-price">Rs {p.price}</div>
                    </div>
                    <button className="add-btn" onClick={() => handleAddToCart(p.id)}>+</button>
                  </div>
                ))
            )}
          </section>
        </div>

        {/* Floating Bottom Navigation */}
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

        {/* Notification Modal */}
        {showNotifications && (
          <div className="notif-overlay" onClick={() => setShowNotifications(false)}>
            <div className="notif-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Notifications</h2>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No notifications yet!</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                    {!n.is_read && <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', marginTop: '5px' }}>Mark as read</div>}
                  </div>
                ))
              )}
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
