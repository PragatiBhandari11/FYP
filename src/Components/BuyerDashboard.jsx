import React, { useState } from "react";
import ChatPage from "./ChatPage";
import ProfilePage from "./ProfilePage";

export default function BuyerDashboard() {
  const productsData = [
    { id: 1, name: "Fresh Tomatoes", price: 120, unit: "kg", seller: "Farmer Ram", category: "Food", image: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
    { id: 2, name: "Organic Potatoes", price: 90, unit: "kg", seller: "Farmer Sita", category: "Food", image: "https://cdn-icons-png.flaticon.com/512/135/135687.png" },
    { id: 3, name: "Rose Plant", price: 250, unit: "pot", seller: "Green Nursery", category: "Plant", image: "https://cdn-icons-png.flaticon.com/512/2909/2909769.png" },
    { id: 4, name: "Goat (Young)", price: 12000, unit: "each", seller: "Animal Farm", category: "Animal", image: "https://cdn-icons-png.flaticon.com/512/616/616408.png" },
  ];

  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState([]);

  const categories = [
    { name: "All", icon: "🌱" },
    { name: "Food", icon: "🥬" },
    { name: "Plant", icon: "🌿" },
    { name: "Animal", icon: "🐄" },
  ];

  // ADD ITEM
  const addToCart = (product) => {
    setCart(prev => {
      const item = prev.find(p => p.id === product.id);
      if (item) {
        return prev.map(p =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // REMOVE ITEM
  const removeFromCart = (id) => {
    setCart(prev =>
      prev
        .map(p => p.id === id ? { ...p, qty: p.qty - 1 } : p)
        .filter(p => p.qty > 0)
    );
  };

  // Filter products by category and search text
  const filteredProducts = (activeCategory === "All"
    ? productsData
    : productsData.filter(p => p.category === activeCategory)
  ).filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <style>{`
        body { margin:0 }
        .app { font-family: Inter, sans-serif; background:#f4fbf6; min-height:100vh; padding-bottom:70px }
        .header { background:#2e7d32; color:white; padding:14px; font-size:18px; font-weight:700 }
        .categories { display:flex; overflow-x:auto; gap:12px; padding:12px; background:white }
        .cat { min-width:80px; text-align:center; padding:10px; border-radius:14px; font-size:13px; box-shadow:0 3px 8px rgba(0,0,0,0.1); cursor:pointer }
        .cat.active { background:#2e7d32; color:white }
        .fresh-sell { margin:12px; background:linear-gradient(135deg,#66bb6a,#43a047); color:white; padding:16px; border-radius:18px }
        .search-box { margin: 0 12px 12px 12px; }
        .search-box input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 12px;
          border: 1px solid #ccc;
          outline-color: #2e7d32;
        }
        .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; padding:12px }
        .card { background:white; border-radius:16px; padding:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1) }
        .card img { width:48px; height:48px }
        .name { font-weight:700; color:#2e7d32; font-size:14px }
        .price { font-size:13px; color:#388e3c }
        .seller { font-size:11px; color:#777 }
        .btn { margin-top:6px; width:100%; border:none; padding:6px; border-radius:14px; background:#43a047; color:white; font-size:12px }
        .qty { display:flex; justify-content:space-between; align-items:center; margin-top:6px }
        .qty button { border:none; padding:4px 10px; border-radius:8px; background:#2e7d32; color:white }
        .bottom-nav { position:fixed; bottom:0; left:0; width:100%; background:white; display:flex; justify-content:space-around; padding:10px 0; box-shadow:0 -4px 8px rgba(0,0,0,0.1) }
      `}</style>

      <div className="app">
        <div className="header">Hamro Bazaar 🛒 {cart.reduce((a, c) => a + c.qty, 0)}</div>

        {activeTab === "home" && (
          <>
            <div className="categories">
              {categories.map(c => (
                <div
                  key={c.name}
                  className={`cat ${activeCategory === c.name ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(c.name);
                    setSearchText("");  // clear search when category changes
                  }}
                >
                  <div style={{ fontSize: 20 }}>{c.icon}</div>
                  {c.name}
                </div>
              ))}
            </div>

            <div className="fresh-sell">
              <h3>🌿 Fresh Sell</h3>
              <p>Direct from farmers • Healthy • Organic</p>
            </div>

            {/* Search box */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="grid">
              {filteredProducts.length === 0 ? (
                <p style={{ padding: 12, color: "#777" }}>No products found</p>
              ) : (
                filteredProducts.map(p => {
                  const item = cart.find(c => c.id === p.id);
                  return (
                    <div key={p.id} className="card">
                      <img src={p.image} alt={p.name} />
                      <div className="name">{p.name}</div>
                      <div className="price">Rs. {p.price} / {p.unit}</div>
                      <div className="seller">{p.seller}</div>

                      {!item ? (
                        <button className="btn" onClick={() => addToCart(p)}>
                          Add to Cart
                        </button>
                      ) : (
                        <div className="qty">
                          <button onClick={() => removeFromCart(p.id)}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => addToCart(p)}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "chat" && <ChatPage />}
        {activeTab === "profile" && <ProfilePage cart={cart} />}

        <div className="bottom-nav">
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("chat")}>Chat</button>
          <button onClick={() => setActiveTab("profile")}>Profile</button>
        </div>
      </div>
    </>
  );
}
