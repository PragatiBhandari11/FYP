import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState("khalti");
  const [checkingOut, setCheckingOut] = useState(false);

  const buyerEmail = localStorage.getItem("userEmail");

  const fetchCart = async () => {
    if (!buyerEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
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
      fetchCart();
    } catch (err) {
      console.error("Failed to update cart quantity", err);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    setCheckingOut(true);

    if (payment === "khalti") {
      try {
        const response = await fetch("http://localhost:5000/api/orders/initiate-khalti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerEmail,
            totalAmount: total.toFixed(2),
            buyerName: localStorage.getItem("userName")
          })
        });

        const data = await response.json();

        if (response.ok && data.payment_url) {
          // ✅ FIX #4: Direct redirect to Khalti — simpler & more reliable than QR modal
          window.location.href = data.payment_url;
        } else {
          alert(data.message || "Khalti initiation failed. Please try again.");
        }
      } catch (error) {
        console.error("Khalti initiation error:", error);
        alert("Network error. Please check your connection.");
      } finally {
        setCheckingOut(false);
      }
    } else {
      // Cash on Delivery
      try {
        const response = await fetch("http://localhost:5000/api/orders/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerEmail,
            totalAmount: total.toFixed(2)
          })
        });

        if (response.ok) {
          navigate("/buyer-orders");
        } else {
          const err = await response.json();
          alert(err.message || "Checkout failed");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        alert("Network error. Please check your connection.");
      } finally {
        setCheckingOut(false);
      }
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
  const delivery = cart.length > 0 ? 2.5 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: #f8fafc; }

        .app {
          width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          overflow: hidden;
          position: relative;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 20px;
        }

        .header {
          padding: 20px;
          text-align: center;
          font-weight: 700;
          font-size: 1.2rem;
          background: #fff;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        .item {
          display: flex;
          gap: 12px;
          padding: 16px;
          margin: 12px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #f1f5f9;
          transition: transform 0.2s ease;
        }

        .item img {
          width: 70px;
          height: 70px;
          border-radius: 12px;
          object-fit: cover;
        }

        .item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }

        .qty {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
          justify-content: center;
        }

        .qty button {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #f1f5f9;
          color: #1e293b;
          font-weight: bold;
        }

        .qty button:active { background: #e2e8f0; }

        .section { padding: 16px; }

        .payment {
          padding: 14px;
          border-radius: 16px;
          margin-bottom: 10px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .payment.active {
          border-color: #22c55e;
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
        }

        .summary {
           background: #f8fafc;
           margin: 12px;
           border-radius: 20px;
           padding: 20px;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .total {
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 10px;
          font-weight: 800;
          font-size: 1.1rem !important;
          color: #1e293b !important;
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
          transition: opacity 0.2s;
        }

        .checkout-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 14px 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-top: 1px solid #f1f5f9;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
          cursor: pointer;
          font-weight: 600;
        }

        .nav-item.active { color: #22c55e; }
        .nav-item .icon { font-size: 20px; }
      `}</style>

      <div className="app">
        <div className="content-scroll">
          <div className="header">My Shopping Cart</div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
              <p>Fetching your items...</p>
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🧺</div>
              <p style={{ fontWeight: 600 }}>Your cart is empty</p>
              <button
                onClick={() => navigate("/buyer-explore")}
                style={{ marginTop: "20px", color: "#22c55e", background: "none", border: "none", fontWeight: 700 }}
              >
                Go Shopping →
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div className="item" key={item.cart_id}>
                <img src={item.image_url ? `http://localhost:5000${item.image_url}` : "https://via.placeholder.com/70"} alt={item.name} />
                <div className="item-info">
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>{item.name}</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#22c55e" }}>Rs{parseFloat(item.price).toFixed(2)}</div>
                </div>
                <div className="qty">
                  <button onClick={() => updateQty(item.cart_id, 1)}>+</button>
                  <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "14px" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.cart_id, -1)}>-</button>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <>
              <div className="section">
                <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>Payment Choice</h4>
                <div
                  className={`payment ${payment === "khalti" ? "active" : ""}`}
                  onClick={() => setPayment("khalti")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>💜</span>
                    <strong>Khalti</strong>
                  </div>
                  {payment === "khalti" && <span>✅</span>}
                </div>
                <div
                  className={`payment ${payment === "cash" ? "active" : ""}`}
                  onClick={() => setPayment("cash")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>💵</span>
                    <strong>Cash on Delivery</strong>
                  </div>
                  {payment === "cash" && <span>✅</span>}
                </div>
              </div>

              <div className="section summary">
                <h4 style={{ marginBottom: "16px", color: "#1e293b" }}>Receipt</h4>
                <div><span>Subtotal</span><span>Rs{subtotal.toFixed(2)}</span></div>
                <div><span>Logistics Fee</span><span>Rs{delivery.toFixed(2)}</span></div>
                <div><span>Service Tax (5%)</span><span>Rs{tax.toFixed(2)}</span></div>
                <div className="total"><span>Grand Total</span><span>Rs{total.toFixed(2)}</span></div>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? "Processing..." : "Complete Order"}
                </button>
              </div>
            </>
          )}
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
