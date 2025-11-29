import React, { useState } from "react";

export default function BuyerDashboard() {
  // Sample products & farmers data
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

  // State for search/filter
  const [searchTerm, setSearchTerm] = useState("");

  // State for cart items (basic)
  const [cart, setCart] = useState([]);

  // State to handle chat modal
  const [chatOpenFor, setChatOpenFor] = useState(null); // farmerId or null

  // State to handle demand alert modal
  const [demandOpenFor, setDemandOpenFor] = useState(null); // farmerId or null

  // Messages per farmer: { farmerId: [{sender, text, time}, ...] }
  const [messages, setMessages] = useState({});

  // Demand alerts sent (just store for demo)
  const [demandAlerts, setDemandAlerts] = useState({});

  // State to toggle between "products" and "profile"
  const [activeTab, setActiveTab] = useState("products");

  // Filter products by search term
  const filteredProducts = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, product]);
    }
  };

  // Send chat message
  const sendMessage = (farmerId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      sender: "buyer",
      text: text.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => {
      const prevMsgs = prev[farmerId] || [];
      return {
        ...prev,
        [farmerId]: [...prevMsgs, newMsg],
      };
    });
  };

  // Send demand alert
  const sendDemandAlert = (farmerId, demandText) => {
    if (!demandText.trim()) return;
    const newAlert = {
      text: demandText.trim(),
      time: new Date().toLocaleString(),
    };
    setDemandAlerts((prev) => {
      const prevAlerts = prev[farmerId] || [];
      return {
        ...prev,
        [farmerId]: [...prevAlerts, newAlert],
      };
    });
  };

  return (
    <>
      <style>{`
        .buyer-dashboard {
          font-family: Arial, sans-serif;
          padding: 20px 20px 80px 20px; /* padding bottom for nav */
          background: #f5f9f7;
          min-height: 100vh;
          color: #245c2a;
          position: relative;
          box-sizing: border-box;
        }
        h1 {
          text-align: center;
          color: #2e7d32;
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
          border: 1.5px solid #4caf50;
          font-size: 16px;
          outline: none;
          transition: box-shadow 0.3s ease;
        }
        .search-input:focus {
          box-shadow: 0 0 8px #4caf50aa;
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
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
          cursor: default;
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
          color: #2e7d32;
          text-align: center;
        }
        .product-price {
          font-size: 16px;
          color: #4caf50;
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
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 25px;
          padding: 8px 15px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex: 1;
        }
        button:hover {
          background-color: #388e3c;
        }
        button:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
        .cart-preview {
          position: fixed;
          right: 20px;
          bottom: 130px;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
          padding: 15px 20px;
          width: 280px;
          max-height: 300px;
          overflow-y: auto;
          color: #2e7d32;
          font-weight: 600;
          z-index: 900;
        }
        .cart-preview h3 {
          margin-bottom: 10px;
          font-size: 18px;
          border-bottom: 1px solid #4caf50;
          padding-bottom: 8px;
        }
        .cart-item {
          margin-bottom: 8px;
          font-size: 14px;
          border-bottom: 1px dotted #4caf50;
          padding-bottom: 4px;
        }
        .cart-empty {
          font-size: 14px;
          color: #888;
          font-style: italic;
          text-align: center;
        }
        /* Chat Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right:0; bottom:0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          width: 90%;
          max-width: 400px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        }
        .modal-header {
          padding: 15px 20px;
          background: #4caf50;
          color: white;
          font-weight: bold;
          font-size: 18px;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }
        .modal-body {
          padding: 10px 20px;
          overflow-y: auto;
          flex-grow: 1;
          background: #eaf6ea;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chat-message {
          background: white;
          padding: 8px 12px;
          border-radius: 12px;
          max-width: 80%;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          word-break: break-word;
        }
        .chat-message.buyer {
          align-self: flex-end;
          background: #c8e6c9;
        }
        .chat-message.farmer {
          align-self: flex-start;
          background: #fff;
        }
        .modal-footer {
          padding: 10px 15px;
          border-top: 1px solid #ddd;
          display: flex;
          gap: 10px;
        }
        .modal-input {
          flex-grow: 1;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid #4caf50;
          font-size: 14px;
          outline: none;
        }
        .modal-send-btn {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .modal-send-btn:hover {
          background-color: #388e3c;
        }
        /* Demand alert textarea */
        .demand-textarea {
          width: 100%;
          height: 80px;
          border-radius: 12px;
          border: 1px solid #4caf50;
          padding: 10px;
          resize: none;
          font-size: 14px;
          outline: none;
        }
        .demand-send-btn {
          margin-top: 10px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .demand-send-btn:hover {
          background-color: #388e3c;
        }
        .alert-info {
          font-size: 13px;
          color: #2e7d32;
          font-style: italic;
          margin-top: 6px;
        }
        /* Responsive */
        @media (max-width: 480px) {
          .cart-preview {
            width: 90vw;
            right: 5%;
            bottom: 130px;
          }
          .modal {
            width: 95%;
            max-height: 90vh;
          }
          .bottom-nav {
            width: 100%;
            bottom: 0;
            left: 0;
          }
        }
        /* Bottom navigation bar */
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
          color: #4caf50;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          flex-grow: 1;
          padding: 6px 0;
          transition: background-color 0.3s ease;
          outline: none;
        }
        .bottom-nav button:hover,
        .bottom-nav button.active {
          background-color: #e0f2e9;
          color: #2e7d32;
        }
        .profile-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 10px 15px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .profile-page h2 {
          text-align: center;
          color: #2e7d32;
          margin-bottom: 20px;
        }
        .profile-item {
          font-size: 16px;
          margin-bottom: 12px;
          color: #245c2a;
        }
      `}</style>

      <div className="buyer-dashboard">
        <h1>Welcome to Buyer Dashboard</h1>

        {activeTab === "products" && (
          <>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search crops by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search crops"
              />
            </div>

            <div className="products-grid">
              {filteredProducts.length ? (
                filteredProducts.map(
                  ({
                    id,
                    name,
                    price,
                    unit,
                    seller,
                    location,
                    farmerId,
                    image,
                  }) => (
                    <div
                      key={id}
                      className="product-card"
                      tabIndex={0}
                      aria-label={`Product: ${name}, sold by ${seller}`}
                    >
                      <img src={image} alt={name} className="product-image" />
                      <div className="product-name">{name}</div>
                      <div className="product-price">
                        Rs. {price} / {unit}
                      </div>
                      <div className="product-seller">
                        Seller: {seller} <br />
                        Location: {location}
                      </div>
                      <div className="btns-group">
                        <button
                          onClick={() => addToCart({ id, name, price, unit })}
                          disabled={cart.find((item) => item.id === id)}
                          aria-disabled={cart.find((item) => item.id === id)}
                          aria-label={`Add ${name} to cart`}
                        >
                          {cart.find((item) => item.id === id)
                            ? "Added to Cart"
                            : "Add to Cart"}
                        </button>
                        <button
                          onClick={() => setChatOpenFor(farmerId)}
                          aria-label={`Chat with ${seller}`}
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => setDemandOpenFor(farmerId)}
                          aria-label={`Send demand alert to ${seller}`}
                        >
                          Demand Alert
                        </button>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p>No products found matching "{searchTerm}".</p>
              )}
            </div>

            <div
              className="cart-preview"
              aria-live="polite"
              aria-label="Shopping cart preview"
            >
              <h3>Your Cart ({cart.length})</h3>
              {cart.length === 0 ? (
                <p className="cart-empty">Your cart is empty.</p>
              ) : (
                cart.map(({ id, name, price, unit }) => (
                  <div key={id} className="cart-item">
                    {name} - Rs. {price} / {unit}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <div className="profile-page" role="region" aria-label="User profile">
            <h2>Your Profile</h2>
            <div className="profile-item"><strong>Name:</strong> Buyer User</div>
            <div className="profile-item"><strong>Email:</strong> buyer@example.com</div>
            <div className="profile-item"><strong>Phone:</strong> +977-9876543210</div>
            <div className="profile-item"><strong>Address:</strong> Kathmandu, Nepal</div>
          </div>
        )}

        {/* CHAT MODAL */}
        {chatOpenFor && (
          <ChatModal
            farmerId={chatOpenFor}
            farmerName={
              productsData.find((p) => p.farmerId === chatOpenFor)?.seller ||
              "Farmer"
            }
            messages={messages[chatOpenFor] || []}
            onClose={() => setChatOpenFor(null)}
            onSend={(msg) => sendMessage(chatOpenFor, msg)}
          />
        )}

        {/* DEMAND ALERT MODAL */}
        {demandOpenFor && (
          <DemandAlertModal
            farmerId={demandOpenFor}
            farmerName={
              productsData.find((p) => p.farmerId === demandOpenFor)?.seller ||
              "Farmer"
            }
            onClose={() => setDemandOpenFor(null)}
            onSend={(msg) => {
              sendDemandAlert(demandOpenFor, msg);
              alert("Demand alert sent!");
              setDemandOpenFor(null);
            }}
            previousAlerts={demandAlerts[demandOpenFor] || []}
          />
        )}

        {/* Bottom Navigation */}
        <nav className="bottom-nav" aria-label="Main navigation tabs">
          <button
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "active" : ""}
            aria-current={activeTab === "products" ? "page" : undefined}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={activeTab === "profile" ? "active" : ""}
            aria-current={activeTab === "profile" ? "page" : undefined}
          >
            Profile
          </button>
        </nav>
      </div>
    </>
  );
}

// Chat modal component
function ChatModal({ farmerId, farmerName, messages, onClose, onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Chat with ${farmerName}`}
    >
      <div className="modal">
        <header className="modal-header">
          Chat with {farmerName}
          <button
            className="modal-close-btn"
            aria-label="Close chat"
            onClick={onClose}
          >
            &times;
          </button>
        </header>
        <main className="modal-body">
          {messages.length === 0 ? (
            <p>No messages yet. Say hello!</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender}`}
                aria-label={`${msg.sender} said at ${msg.time}`}
              >
                {msg.text} <br />
                <small style={{ fontSize: "10px", opacity: 0.6 }}>
                  {msg.time}
                </small>
              </div>
            ))
          )}
        </main>
        <footer className="modal-footer">
          <input
            className="modal-input"
            type="text"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            aria-label="Write message input"
          />
          <button
            className="modal-send-btn"
            onClick={handleSend}
            aria-label="Send message"
          >
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}

// Demand alert modal component
function DemandAlertModal({
  farmerId,
  farmerName,
  onClose,
  onSend,
  previousAlerts,
}) {
  const [demandText, setDemandText] = useState("");

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Send demand alert to ${farmerName}`}
    >
      <div className="modal" style={{ maxHeight: "70vh" }}>
        <header className="modal-header">
          Demand Alert to {farmerName}
          <button
            className="modal-close-btn"
            aria-label="Close demand alert"
            onClick={onClose}
          >
            &times;
          </button>
        </header>
        <main className="modal-body">
          <textarea
            className="demand-textarea"
            placeholder="Write your demand alert here..."
            value={demandText}
            onChange={(e) => setDemandText(e.target.value)}
            aria-label="Demand alert text"
          />
          <button
            className="demand-send-btn"
            onClick={() => {
              if (demandText.trim()) {
                onSend(demandText);
                setDemandText("");
              } else {
                alert("Please enter a demand alert message.");
              }
            }}
            aria-label="Send demand alert"
          >
            Send Demand Alert
          </button>

          {previousAlerts.length > 0 && (
            <div className="alert-info" aria-live="polite" style={{ marginTop: 15 }}>
              <strong>Previous alerts sent:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {previousAlerts.map((alert, i) => (
                  <li key={i}>
                    {alert.text} <br />
                    <small style={{ fontSize: "10px", opacity: 0.6 }}>
                      {alert.time}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
