import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState("card");

  const buyerEmail = localStorage.getItem("userEmail");

  const fetchCart = async () => {
    if (!buyerEmail) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${buyerEmail}`);
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [buyerEmail]);

  const updateQty = async (cartId, delta) => {
    try {
      await fetch("http://localhost:5000/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, delta })
      });
      // Refresh cart visually after database update
      fetchCart();
    } catch (err) {
      console.error("Failed to update cart quantity", err);
    }
  };

  // Ensure calculations correctly parse database decimal strings
  const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
  const delivery = cart.length > 0 ? 2.5 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background: #f2f2f2; }

        .app {
          width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
        }

        .header {
          padding: 16px;
          text-align: center;
          font-weight: bold;
          border-bottom: 1px solid #eee;
        }

        .item {
          display: flex;
          gap: 12px;
          padding: 14px;
          margin: 12px;
          border-radius: 14px;
          background: #f9f9f9;
        }

        .item img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
        }

        .item-info { flex: 1; }

        .qty {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .qty button {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: #e0e0e0;
        }

        .section {
          padding: 16px;
        }

        .payment {
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          background: #f5f5f5;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
        }

        .payment.active {
          border: 2px solid #2e8b57;
          background: #eaf7f0;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .total {
          font-weight: bold;
          font-size: 18px;
        }

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
        <div className="content-scroll">
        <div className="header">My Cart</div>

        {loading ? (
          <div style={{textAlign: "center", padding: "40px"}}>Loading cart...</div>
        ) : cart.length === 0 ? (
          <div style={{textAlign: "center", padding: "40px", color: "#666"}}>
            <div style={{fontSize: "40px", marginBottom: "16px"}}>🛒</div>
            Your cart is currently empty.
          </div>
        ) : (
          cart.map(item => (
            <div className="item" key={item.cart_id}>
              <img src={item.image_url ? `http://localhost:5000${item.image_url}` : "https://via.placeholder.com/60"} alt={item.name} />
              <div className="item-info">
                <strong>{item.name}</strong>
                <p style={{margin: "4px 0", fontSize: "12px", color: "#666"}}>Seller ID: {item.farmer_id}</p>
                <strong>Rs{parseFloat(item.price).toFixed(2)}</strong>
              </div>
              <div className="qty">
                <button onClick={() => updateQty(item.cart_id, -1)}>-</button>
                {item.qty}
                <button onClick={() => updateQty(item.cart_id, 1)}>+</button>
              </div>
            </div>
          ))
        )}

        <div className="section">
          <h4>Payment Method</h4>
          <div
            className={`payment ${payment === "card" ? "active" : ""}`}
            onClick={() => setPayment("card")}
          >
            Visa ending in 4242 ✓
          </div>
          <div
            className={`payment ${payment === "cash" ? "active" : ""}`}
            onClick={() => setPayment("cash")}
          >
            Cash on Delivery
          </div>
        </div>

        <div className="section summary">
          <h4>Order Summary</h4>
          <div><span>Subtotal</span><span>Rs{subtotal.toFixed(2)}</span></div>
          <div><span>Delivery</span><span>Rs{delivery.toFixed(2)}</span></div>
          <div><span>Tax (5%)</span><span>Rs{tax.toFixed(2)}</span></div>
          <div className="total"><span>Total</span><span>Rs{total.toFixed(2)}</span></div>
        </div>

        </div>

        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
            <span className="icon">🏠</span>
            <span>Home</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-explore")}>
            <span className="icon">🔍</span>
            <span>Explore</span>
          </div>

          <div className="nav-item active">
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
      </div>
    </>
  );
}
