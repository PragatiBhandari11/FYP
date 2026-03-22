import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/orders/farmer/${email}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Farmer orders fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    if (!newStatus) return;
    fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      fetchOrders();
    })
    .catch(err => console.error("Update status error:", err));
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background: #f2f2f2; margin: 0; }
        
        .app {
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .header {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #eee;
          background: #2e8b57;
          color: white;
        }

        .back-btn {
          cursor: pointer;
          font-size: 20px;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .order-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          border-bottom: 1px dashed #eee;
          padding-bottom: 8px;
        }

        .order-id {
          font-weight: bold;
          color: #2e8b57;
        }

        .order-date {
          font-size: 12px;
          color: #666;
        }

        .order-body {
          display: flex;
          gap: 12px;
        }

        .order-img {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
        }

        .order-details {
          flex: 1;
        }

        .product-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .product-meta {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .total-price {
          font-weight: bold;
          font-size: 16px;
          color: #333;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .status-OrderPlaced { background: #e2e3e5; color: #383d41; }
        .status-Accepted { background: #d4edda; color: #155724; }
        .status-Packing { background: #d1ecf1; color: #0c5460; }
        .status-OutforDelivery { background: #fff3cd; color: #856404; }
        .status-Delivered { background: #c3e6cb; color: #1e7d34; }
        .status-Cancelled { background: #f8d7da; color: #721c24; }

        .empty-state {
          text-align: center;
          margin-top: 100px;
          color: #666;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="app">
        <div className="header">
          <div className="back-btn" onClick={() => navigate("/farmer-dashboard")}>←</div>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>Customer Orders</div>
        </div>
        
        <div className="content">
          {loading ? (
            <div style={{ textAlign: "center", marginTop: "50px" }}>Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>When buyers order your products, they will appear here.</p>
            </div>
          ) : (
            orders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <span className="order-id">{order.order_number}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="order-body">
                  <img 
                    className="order-img" 
                    src={order.image_url ? `http://localhost:5000${order.image_url}` : "https://images.unsplash.com/photo-1582515073490-39981397c445"} 
                    alt={order.product_name} 
                  />
                  <div className="order-details">
                    <div className="product-name">{order.product_name}</div>
                    <div className="product-meta">Quantity: {order.quantity} units</div>
                    <div className="total-price">Rs{order.price_at_purchase * order.quantity}</div>
                  </div>
                </div>
                <div className="order-footer">
                   <div className={`status-badge status-${order.status.replace(/\s+/g, '')}`}>{order.status}</div>
                   <div style={{display: "flex", gap: "8px"}}>
                     <select 
                       defaultValue={order.status}
                       onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                       style={{
                         padding: "6px",
                         borderRadius: "6px",
                         border: "1px solid #2e8b57",
                         fontSize: "12px",
                         outline: "none"
                       }}
                     >
                       <option value="Order Placed">Order Placed</option>
                       <option value="Accepted">Accepted</option>
                       <option value="Packing">Packing</option>
                       <option value="Out for Delivery">Out for Delivery</option>
                       <option value="Delivered">Delivered</option>
                       <option value="Cancelled">Cancelled</option>
                     </select>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

