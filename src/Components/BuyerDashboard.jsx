import React, { useState } from "react";

export default function BuyerDashboard() {
  const productsData = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 120,
      unit: "kg",
      seller: "Farmer Ram",
      location: "Kathmandu",
      farmerId: 101,
      image:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=60",
    },
    {
      id: 2,
      name: "Organic Potatoes",
      price: 90,
      unit: "kg",
      seller: "Farmer Sita",
      location: "Lalitpur",
      farmerId: 102,
      image:
        "https://images.unsplash.com/photo-1506801310323-534be5e7bb60?auto=format&fit=crop&w=400&q=60",
    },
    {
      id: 3,
      name: "Green Chilies",
      price: 150,
      unit: "kg",
      seller: "Farmer Gopal",
      location: "Bhaktapur",
      farmerId: 103,
      image:
        "https://images.unsplash.com/photo-1590080877777-3953849b9433?auto=format&fit=crop&w=400&q=60",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [chatOpenFor, setChatOpenFor] = useState(null);
  const [messages, setMessages] = useState({});
  const [demandAlerts, setDemandAlerts] = useState({});
  const [activeTab, setActiveTab] = useState("products");

  const filteredProducts = productsData.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, product]);
    }
  };

  const sendMessage = (farmerId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      sender: "buyer",
      text: text.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => {
      const prevMsgs = prev[farmerId] || [];
      return { ...prev, [farmerId]: [...prevMsgs, newMsg] };
    });
  };

  const sendDemandAlert = (farmerId, text) => {
    if (!text.trim()) return;
    const newAlert = { text: text.trim(), time: new Date().toLocaleString() };
    setDemandAlerts((prev) => {
      const prevAlerts = prev[farmerId] || [];
      return { ...prev, [farmerId]: [...prevAlerts, newAlert] };
    });
  };

  // Chat list data for Chat tab
  const chatList = productsData.filter((p) => messages[p.farmerId]);

  return (
    <>
      <style>{`
        .buyer-dashboard {
          font-family: Arial, sans-serif;
          padding: 20px 20px 80px 20px;
          background: #f3f0fa;
          min-height: 100vh;
          color: #3e1f7a;
          position: relative;
        }
        h1 {
          text-align: center;
          color: #6a3cc9;
          margin-bottom: 25px;
          letter-spacing: 1px;
        }
        .search-box {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }
        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 10px 15px;
          border-radius: 25px;
          border: 1.5px solid #6a3cc9;
          font-size: 16px;
          outline: none;
        }
        .search-input:focus {
          box-shadow: 0 0 8px #6a3cc9aa;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .product-card {
          background: white;
          border-radius: 15px;
          padding: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .product-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .product-name {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 6px;
          color: #6a3cc9;
          text-align: center;
        }
        .product-price {
          font-size: 16px;
          color: #9b59b6;
          margin-bottom: 8px;
        }
        .product-seller {
          font-size: 14px;
          color: #555;
          margin-bottom: 12px;
          text-align: center;
        }
        .btns-group {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }
        button {
          background-color: #6a3cc9;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 8px 15px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          flex: 1;
        }
        button:hover {
          background-color: #592bb5;
        }
        button:disabled {
          background-color: #b29ddb;
          cursor: not-allowed;
        }
        .cart-preview {
          position: fixed;
          right: 20px;
          bottom: 130px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
          padding: 15px 20px;
          width: 280px;
          max-height: 300px;
          overflow-y: auto;
          color: #3e1f7a;
          font-weight: 600;
          z-index: 900;
        }
        .cart-preview h3 {
          margin-bottom: 10px;
          font-size: 18px;
          border-bottom: 1px solid #6a3cc9;
          padding-bottom: 8px;
        }
        .cart-item {
          margin-bottom: 8px;
          font-size: 14px;
          border-bottom: 1px dotted #6a3cc9;
          padding-bottom: 4px;
        }
        .cart-empty {
          font-size: 14px;
          color: #888;
          font-style: italic;
          text-align: center;
        }
        .profile-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 15px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .profile-page h2 {
          text-align: center;
          color: #6a3cc9;
          margin-bottom: 20px;
        }
        .profile-item {
          font-size: 16px;
          margin-bottom: 12px;
          color: #3e1f7a;
        }
        .demand-textarea {
          width: 100%;
          height: 80px;
          border-radius: 12px;
          border: 1px solid #6a3cc9;
          padding: 10px;
          resize: none;
          font-size: 14px;
          outline: none;
        }
        .demand-send-btn {
          margin-top: 10px;
          background-color: #6a3cc9;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
        }
        .demand-send-btn:hover {
          background-color: #592bb5;
        }
        /* Bottom navigation */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: white;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 8px 0;
          box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
          z-index: 1100;
        }
        .bottom-nav button {
          background: none;
          border: none;
          color: #6a3cc9;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          flex-grow: 1;
          padding: 6px 0;
        }
        .bottom-nav button:hover,
        .bottom-nav button.active {
          background-color: #e5dbf7;
          color: #3e1f7a;
        }
        /* Chat List */
        .chat-list {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        .chat-item:hover {
          background-color: #f0e5fc;
        }
        .chat-item .name-time {
          display: flex;
          flex-direction: column;
        }
        .chat-item .name-time .name {
          font-weight: bold;
          color: #6a3cc9;
        }
        .chat-item .name-time .time {
          font-size: 12px;
          color: #888;
        }
        .chat-item .last-msg {
          max-width: 150px;
          font-size: 13px;
          color: #555;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>

      <div className="buyer-dashboard">
        <h1>Expert Buyer Dashboard</h1>

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search crops by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="products-grid">
              {filteredProducts.length ? (
                filteredProducts.map((p) => (
                  <div key={p.id} className="product-card">
                    <img src={p.image} alt={p.name} className="product-image" />
                    <div className="product-name">{p.name}</div>
                    <div className="product-price">
                      Rs. {p.price} / {p.unit}
                    </div>
                    <div className="product-seller">
                      Seller: {p.seller} <br /> Location: {p.location}
                    </div>
                    <div className="btns-group">
                      <button
                        onClick={() =>
                          addToCart({ id: p.id, name: p.name, price: p.price, unit: p.unit })
                        }
                        disabled={cart.find((item) => item.id === p.id)}
                      >
                        {cart.find((item) => item.id === p.id)
                          ? "Added"
                          : "Add to Cart"}
                      </button>
                      <button onClick={() => setChatOpenFor(p.farmerId)}>Chat</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products found "{searchTerm}"</p>
              )}
            </div>

            <div className="cart-preview">
              <h3>Your Cart ({cart.length})</h3>
              {cart.length === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
              ) : (
                cart.map((c) => (
                  <div key={c.id} className="cart-item">
                    {c.name} - Rs. {c.price} / {c.unit}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="chat-list">
            {chatList.length === 0 ? (
              <p>No chats yet. Start a conversation from Products tab.</p>
            ) : (
              chatList.map((f) => {
                const msgs = messages[f.farmerId];
                const lastMsg = msgs[msgs.length - 1];
                return (
                  <div
                    key={f.farmerId}
                    className="chat-item"
                    onClick={() => setChatOpenFor(f.farmerId)}
                  >
                    <div className="name-time">
                      <span className="name">{f.seller}</span>
                      <span className="time">{lastMsg.time}</span>
                    </div>
                    <div className="last-msg">{lastMsg.text}</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="profile-page">
            <h2>Your Profile</h2>
            <div className="profile-item"><strong>Name:</strong> Buyer User</div>
            <div className="profile-item"><strong>Email:</strong> buyer@example.com</div>
            <div className="profile-item"><strong>Phone:</strong> +977-9876543210</div>
            <div className="profile-item"><strong>Address:</strong> Kathmandu, Nepal</div>

            {/* DEMAND ALERT */}
            <h3 style={{ color: "#6a3cc9", marginTop: 20 }}>Send Demand Alert</h3>
            <DemandAlertProfile
              products={productsData}
              sendDemandAlert={sendDemandAlert}
              previousAlerts={demandAlerts}
            />
          </div>
        )}

        {/* CHAT MODAL */}
        {chatOpenFor && (
          <ChatModal
            farmerId={chatOpenFor}
            farmerName={productsData.find((p) => p.farmerId === chatOpenFor)?.seller || "Farmer"}
            messages={messages[chatOpenFor] || []}
            onClose={() => setChatOpenFor(null)}
            onSend={(msg) => sendMessage(chatOpenFor, msg)}
          />
        )}

        <nav className="bottom-nav">
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "chat" ? "active" : ""}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </nav>
      </div>
    </>
  );
}

// CHAT MODAL
function ChatModal({ farmerId, farmerName, messages, onClose, onSend }) {
  const [input, setInput] = useState("");
  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          Chat with {farmerName}
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </header>
        <main className="modal-body">
          {messages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.sender}`}>
                {m.text} <br />
                <small>{m.time}</small>
              </div>
            ))
          )}
        </main>
        <footer className="modal-footer">
          <input
            className="modal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="modal-send-btn" onClick={handleSend}>Send</button>
        </footer>
      </div>
    </div>
  );
}

// DEMAND ALERT COMPONENT IN PROFILE
function DemandAlertProfile({ products, sendDemandAlert, previousAlerts }) {
  const [selectedFarmer, setSelectedFarmer] = useState(products[0]?.farmerId || null);
  const [demandText, setDemandText] = useState("");

  return (
    <>
      <select
        style={{ padding: 8, borderRadius: 12, border: "1px solid #6a3cc9", marginBottom: 10 }}
        value={selectedFarmer}
        onChange={(e) => setSelectedFarmer(Number(e.target.value))}
      >
        {products.map((p) => (
          <option key={p.farmerId} value={p.farmerId}>
            {p.seller} ({p.name})
          </option>
        ))}
      </select>
      <textarea
        className="demand-textarea"
        placeholder="Write demand alert..."
        value={demandText}
        onChange={(e) => setDemandText(e.target.value)}
      />
      <button
        className="demand-send-btn"
        onClick={() => {
          if (!demandText.trim()) return alert("Enter message");
          sendDemandAlert(selectedFarmer, demandText);
          setDemandText("");
          alert("Demand alert sent!");
        }}
      >
        Send Demand Alert
      </button>

      {previousAlerts[selectedFarmer]?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <strong>Previous Alerts:</strong>
          <ul>
            {previousAlerts[selectedFarmer].map((a, i) => (
              <li key={i}>{a.text} <small>({a.time})</small></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
