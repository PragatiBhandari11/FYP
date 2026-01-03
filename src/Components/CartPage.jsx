import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([
    {
      id: 1,
      name: "Fresh Strawberries",
      seller: "Berry Farm",
      price: 9.0,
      qty: 2,
      img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    },
    {
      id: 2,
      name: "Sweet Corn",
      seller: "Green Valley",
      price: 4.0,
      qty: 5,
      img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    },
  ]);

  const [payment, setPayment] = useState("card");

  const updateQty = (id, delta) => {
    setCart(cart =>
      cart.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = 2.5;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { background: #f2f2f2; }

        .app {
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
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
          margin-top: auto;
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #ddd;
          padding: 12px 0;
        }

        .nav-item {
          font-size: 12px;
          text-align: center;
          color: #666;
          cursor: pointer;
        }

        .nav-item.active {
          color: #2e8b57;
          font-weight: bold;
        }
      `}</style>

      <div className="app">
        <div className="header">My Cart</div>

        {cart.map(item => (
          <div className="item" key={item.id}>
            <img src={item.img} alt={item.name} />
            <div className="item-info">
              <strong>{item.name}</strong>
              <p>{item.seller}</p>
              <strong>${item.price.toFixed(2)}</strong>
            </div>
            <div className="qty">
              <button onClick={() => updateQty(item.id, -1)}>-</button>
              {item.qty}
              <button onClick={() => updateQty(item.id, 1)}>+</button>
            </div>
          </div>
        ))}

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
          <div><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div><span>Delivery</span><span>${delivery.toFixed(2)}</span></div>
          <div><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>🏠<br/>Home</div>
          <div className="nav-item" onClick={() => navigate("/buyer-explore")}>🔍<br/>Explore</div>
          <div className="nav-item active">🛒<br/>Cart</div>
          <div className="nav-item">📦<br/>Orders</div>
          <div className="nav-item">👤<br/>Profile</div>
        </div>
      </div>
    </>
  );
}
