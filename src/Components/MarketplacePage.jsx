import React, { useState } from "react";


export default function MarketplacePage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      farmerName: "Ramesh",
      content: "Selling fresh tomatoes, 50kg available.",
      date: "2025-12-10",
    },
    {
      id: 2,
      farmerName: "Sita",
      content: "Looking to buy maize seeds for next season.",
      date: "2025-12-12",
    },
    {
      id: 3,
      farmerName: "Hari",
      content: "Potato crop is good this year, selling at 25 NPR/kg.",
      date: "2025-12-14",
    },
  ]);

  const currentPrices = [
    { item: "Tomato", price: "30 NPR/kg" },
    { item: "Maize Seed", price: "120 NPR/kg" },
    { item: "Potato", price: "25 NPR/kg" },
    { item: "Rice", price: "40 NPR/kg" },
  ];

  // New post inputs
  const [newFarmerName, setNewFarmerName] = useState("");
  const [newContent, setNewContent] = useState("");

  // Add new post handler
  const addNewPost = () => {
    if (!newFarmerName.trim() || !newContent.trim()) {
      alert("Please enter your name and post content.");
      return;
    }

    const newPost = {
      id: Date.now(),
      farmerName: newFarmerName.trim(),
      content: newContent.trim(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };

    setPosts([newPost, ...posts]);
    setNewFarmerName("");
    setNewContent("");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "0 15px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#245c2a", marginBottom: "20px" }}>🌾 Farmer Marketplace</h1>

      {/* Current prices */}
      <section style={{ background: "#e7f5e7", padding: "15px", borderRadius: "10px", marginBottom: "30px", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#2b5f2d", marginBottom: "10px" }}>📊 Current Market Prices</h2>
        <ul style={{ listStyleType: "none", paddingLeft: 0, fontSize: "16px" }}>
          {currentPrices.map(({ item, price }, index) => (
            <li key={index} style={{ padding: "6px 0", borderBottom: "1px solid #ccc" }}>
              <strong>{item}:</strong> {price}
            </li>
          ))}
        </ul>
      </section>

      {/* Add new post */}
      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#245c2a", marginBottom: "15px" }}>➕ Add Your Post</h2>
        <input
          type="text"
          placeholder="Your name"
          value={newFarmerName}
          onChange={(e) => setNewFarmerName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        />
        <textarea
          placeholder="What are you selling or looking for?"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            height: "80px",
            fontSize: "14px",
            resize: "vertical",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={addNewPost}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Post
        </button>
      </section>

      {/* Farmer posts */}
      <section>
        <h2 style={{ color: "#245c2a", marginBottom: "15px" }}>📢 Farmer Posts</h2>
        {posts.length === 0 ? (
          <p>No posts available yet.</p>
        ) : (
          posts.map(({ id, farmerName, content, date }) => (
            <div
              key={id}
              style={{
                background: "white",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ margin: 0, fontSize: "15px" }}>{content}</p>
              <small style={{ color: "#777", marginTop: "6px", display: "block" }}>
                Posted by <strong>{farmerName}</strong> on {date}
              </small>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
