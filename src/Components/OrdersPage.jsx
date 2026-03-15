import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const buyerEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!buyerEmail) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/orders/${buyerEmail}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Order fetch error:", err);
        setLoading(false);
      });
  }, [buyerEmail]);

  // Derive the active order mapping based on mockup (The most recent order placed)
  const currentOrder = orders.length > 0 ? orders[0] : null;

  // Derive the history based on remaining items
  const orderHistory = orders.length > 1 ? orders.slice(1) : [];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: #f2f2f2; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;}
        
        .app {
          width: 390px;
          height: 100vh;
          background: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .header {
          padding: 16px;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
          border-bottom: 1px solid #eee;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        h3 {
          font-size: 16px;
          margin-bottom: 12px;
          margin-top: 0;
        }

        /* Current Order Block */
        .current-order-card {
          background: #eaf7f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .order-id {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .status-highlight {
          color: #2e8b57;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .eta {
          font-size: 14px;
          margin-bottom: 20px;
          color: #333;
        }

        /* Progress Bar (Dots) */
        .progress-bar {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding-top: 10px;
        }

        .progress-line {
          position: absolute;
          top: 15px; /* Aligned with middle of dots */
          left: 20px;
          right: 20px;
          height: 2px;
          background: #c3e6cb;
          z-index: 1;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          width: 60px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ccc;
          margin-bottom: 6px;
        }

        .dot.active {
          background: #2e8b57;
        }

        .step-label {
          font-size: 10px;
          color: #999;
          text-align: center;
        }

        .step-label.active {
          color: #ccc; 
        }

        /* Order History Blocks */
        .history-item {
          background: #fafafa;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hist-left h4 {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: bold;
        }

        .hist-left p {
          margin: 0;
          font-size: 14px;
          color: #333;
        }

        .hist-right {
          text-align: right;
        }

        .hist-right .price {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .hist-right .status {
          font-weight: bold;
          font-size: 14px;
        }

        .status.Delivered { color: green; }
        .status.Cancelled { color: red; }

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
        <div className="header">My Orders</div>
        
        <div className="content">
          {loading ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>Loading tracking data...</div>
          ) : !buyerEmail ? (
             <div style={{ textAlign: "center", marginTop: "20px" }}>Please login to view orders.</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>
               <div style={{ fontSize: "40px", marginBottom: "16px" }}>📦</div>
               You haven't placed any orders yet.
            </div>
          ) : (
            <>
              {/* CURRENT ORDER WIDGET */}
              {currentOrder && (
                <>
                  <h3>Current Order</h3>
                  <div className="current-order-card">
                    <div className="order-id">Order ID: {currentOrder.order_number}</div>
                    <div className="status-highlight">{currentOrder.status}</div>
                    <div className="eta">ETA: Today, 5:00 PM</div>
                    
                    <div className="progress-bar">
                      <div className="progress-line"></div>
                      <div className="progress-step">
                        <div className="dot active"></div>
                        <div className="step-label active">Order Placed</div>
                      </div>
                      <div className="progress-step">
                        <div className="dot active"></div>
                        <div className="step-label active">Packed</div>
                      </div>
                      <div className="progress-step">
                        <div className="dot active"></div>
                        <div className="step-label active">Shipped</div>
                      </div>
                      <div className="progress-step">
                        <div className="dot active"></div>
                        <div className="step-label active">Out for Delivery</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ORDER HISTORY LIST */}
              {orderHistory.length > 0 && (
                <>
                  <h3 style={{marginTop: "30px"}}>Order History</h3>
                  
                  {orderHistory.map(ord => {
                     // Basic formatting of MySQL timestamp for history aesthetic
                     const dateObj = new Date(ord.created_at);
                     const ds = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                    
                    // We artificially mock older requests as "Delivered" just to fit the mock design aesthetic dynamically
                    const isOld = true; 
                    
                    return (
                      <div className="history-item" key={ord.id}>
                        <div className="hist-left">
                          <h4>{ord.order_number}</h4>
                          <p>{ds}</p>
                        </div>
                        <div className="hist-right">
                          <div className="price">Rs{ord.total_amount}</div>
                          <div className={`status ${isOld ? 'Delivered' : ''}`}>
                             Delivered
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
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

          <div className="nav-item active">
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
