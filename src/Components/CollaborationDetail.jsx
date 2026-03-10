import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Static collaboration data (extend as needed)
const collaborations = {
  1: {
    name: "Green Valley Hotel",
    address: "123 Green Valley Road, Kathmandu, Nepal",
    phone: "+977-01-4567890",
    email: "contact@greenvalleyhotel.com",
    type: "5-Star Hotel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    description:
      "Green Valley Hotel sources fresh organic produce directly from local farmers. They are interested in seasonal vegetables and fruits.",
  },
  2: {
    name: "The Fresh Table",
    address: "45 Foodie Lane, Pokhara, Nepal",
    phone: "+977-61-5234567",
    email: "hello@thefreshatable.com",
    type: "Farm-to-Table Restaurant",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    description:
      "A farm-to-table restaurant committed to using only locally grown ingredients for their seasonal menu.",
  },
  3: {
    name: "Urban Dine",
    address: "78 City Center, Lalitpur, Nepal",
    phone: "+977-01-5501234",
    email: "orders@urbandine.com",
    type: "Urban Bistro",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    description:
      "Urban Dine specializes in contemporary cuisine with a strong preference for fresh, chemical-free produce.",
  },
};

export default function CollaborationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collab = collaborations[id];

  const [messages, setMessages] = useState([
    {
      sender: "them",
      text: `Hello! We're excited to collaborate with you. How can we help?`,
      time: "9:00 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const farmerName = localStorage.getItem("userFullName") || "Farmer";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [...prev, { sender: "me", text: input.trim(), time }]);
    setInput("");

    // Simulate a reply after 1.2 seconds
    setTimeout(() => {
      const replies = [
        "Thanks for reaching out! We'll get back to you soon.",
        "Great! Can you tell us more about your available stock?",
        "We are very interested. What is your minimum order quantity?",
        "Perfect timing! We need supplies for next week.",
        "Could you send us a price list?",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        { sender: "them", text: reply, time: replyTime },
      ]);
    }, 1200);
  };

  if (!collab) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <p>Collaboration not found.</p>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; }
        body { background: #e5f2e5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; }

        .page {
          width: 390px;
          display: flex;
          flex-direction: column;
          gap: 0;
          max-height: 90vh;
        }

        /* ── Header ── */
        .top-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #fff;
          border-radius: 16px 16px 0 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .back-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #16a34a;
          padding: 0;
          line-height: 1;
        }
        .top-bar h2 {
          font-size: 16px;
          color: #111;
          font-weight: 700;
        }

        /* ── Hotel Info Card ── */
        .hotel-card {
          background: #fff;
          overflow: hidden;
        }
        .hotel-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }
        .hotel-body {
          padding: 16px;
        }
        .hotel-badge {
          display: inline-block;
          background: #dcfce7;
          color: #16a34a;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 8px;
        }
        .hotel-body h3 {
          font-size: 18px;
          color: #111;
          margin-bottom: 6px;
        }
        .hotel-body p.desc {
          font-size: 13px;
          color: #555;
          margin-bottom: 14px;
          line-height: 1.5;
        }
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #333;
        }
        .contact-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        /* ── Chat Section ── */
        .chat-section {
          background: #f2fbf6;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }
        .chat-header {
          padding: 12px 16px;
          background: #16a34a;
          color: white;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-dot {
          width: 8px;
          height: 8px;
          background: #86efac;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 200px;
          max-height: 240px;
        }
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }
        .msg-row.me { flex-direction: row-reverse; }

        .msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .msg-row.me .msg-avatar { background: #bbf7d0; }

        .msg-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
        .msg-row.them .msg-bubble {
          background: #fff;
          color: #111;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .msg-row.me .msg-bubble {
          background: #16a34a;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .msg-time {
          font-size: 10px;
          color: #9ca3af;
          margin-top: 3px;
          text-align: right;
        }
        .msg-row.them .msg-time { text-align: left; }

        /* ── Input Bar ── */
        .chat-input-bar {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          background: #fff;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 16px 16px;
        }
        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 22px;
          border: 1px solid #d1fae5;
          font-size: 13px;
          outline: none;
          background: #f0fdf4;
        }
        .chat-input:focus { border-color: #16a34a; }
        .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #16a34a;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .send-btn:hover { background: #15803d; }
      `}</style>

      <div className="page">
        {/* Top bar */}
        <div className="top-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h2>{collab.name}</h2>
        </div>

        {/* Hotel info card */}
        <div className="hotel-card">
          <img className="hotel-image" src={collab.image} alt={collab.name} />
          <div className="hotel-body">
            <span className="hotel-badge">{collab.type}</span>
            <h3>{collab.name}</h3>
            <p className="desc">{collab.description}</p>
            <div className="contact-list">
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <span>{collab.address}</span>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <span>{collab.phone}</span>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <span>{collab.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat section */}
        <div className="chat-section">
          <div className="chat-header">
            <div className="chat-dot" />
            Chat with {collab.name}
          </div>

          <div className="messages-area">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.sender === "me" ? "me" : "them"}`}>
                <div className="msg-avatar">
                  {msg.sender === "me" ? "👤" : "🏨"}
                </div>
                <div>
                  <div className="msg-bubble">{msg.text}</div>
                  <div className="msg-time">{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Type a message..."
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
}
