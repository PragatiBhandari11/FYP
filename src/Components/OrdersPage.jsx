import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [currentOrder] = useState({
    id: "ORD-1024",
    status: "Out for Delivery",
    eta: "Today, 5:00 PM",
    steps: ["Order Placed", "Packed", "Shipped", "Out for Delivery"],
    currentStep: 3,
  });

  const [orderHistory] = useState([
    {
      id: "ORD-1018",
      date: "Aug 12, 2025",
      total: "$18.40",
      status: "Delivered",
    },
    {
      id: "ORD-1009",
      date: "Aug 05, 2025",
      total: "$24.90",
      status: "Delivered",
    },
    {
      id: "ORD-0997",
      date: "Jul 28, 2025",
      total: "$12.30",
      status: "Cancelled",
    },
  ]);

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
          text-align: center;
          padding: 16px;
          font-weight: bold;
          border-bottom: 1px solid #eee;
        }

        .section {
          padding: 16px;
        }

        .current-order {
          background: #eaf7f0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .status {
          color: #2e8b57;
          font-weight: bold;
        }

        .steps {
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
        }

        .step {
          flex: 1;
          text-align: center;
          font-size: 11px;
          color: #aaa;
        }

        .step.active {
          color: #2e8b57;
          font-weight: bold;
        }

        .step-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ccc;
          margin: 0 auto 6px;
        }

        .step.active .step-dot {
          background: #2e8b57;
        }

        .history-item {
          background: #f9f9f9;
          padding: 14px;
          border-radius: 14px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .delivered {
          color: green;
          font-weight: bold;
        }

        .cancelled {
          color: red;
          font-weight: bold;
        }

        /* Bottom Nav */
        .bottom-nav {
          margin-top: auto;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
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
        <div className="header">My Orders</div>

        {/* Current Order */}
        <div className="section">
          <h4>Current Order</h4>
          <div className="current-order">
            <strong>Order ID: {currentOrder.id}</strong>
            <p className="status">{currentOrder.status}</p>
            <p>ETA: {currentOrder.eta}</p>

            <div className="steps">
              {currentOrder.steps.map((step, index) => (
                <div
                  key={step}
                  className={`step ${
                    index <= currentOrder.currentStep ? "active" : ""
                  }`}
                >
                  <div className="step-dot"></div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="section">
          <h4>Order History</h4>
          {orderHistory.map(order => (
            <div className="history-item" key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <p>{order.date}</p>
              </div>
              <div>
                <strong>{order.total}</strong>
                <p
                  className={
                    order.status === "Delivered"
                      ? "delivered"
                      : "cancelled"
                  }
                >
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
            🏠<br />Home
          </div>
          <div className="nav-item" onClick={() => navigate("/buyer-explore")}>
            🔍<br />Explore
          </div>
          <div className="nav-item" onClick={() => navigate("/buyer-cart")}>
            🛒<br />Cart
          </div>
          <div className="nav-item active">
            📦<br />Orders
          </div>
          <div className="nav-item">
            👤<br />Profile
          </div>
        </div>
      </div>
    </>
  );
}
