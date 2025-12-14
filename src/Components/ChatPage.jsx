import React, { useState } from "react";

const farmersList = [
  { id: 1, name: "Farmer Ram" },
  { id: 2, name: "Farmer Sita" },
  { id: 3, name: "Green Nursery" },
  { id: 4, name: "Animal Farm" },
];

export default function ChatPage() {
  const [selectedFarmer, setSelectedFarmer] = useState(farmersList[0]);
  // Messages stored per farmer id
  const [messages, setMessages] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages(prev => ({
      ...prev,
      [selectedFarmer.id]: [
        ...prev[selectedFarmer.id],
        { text: input, sender: "buyer" }
      ],
    }));
    setInput("");
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%" }}>
      <h3 style={{ color: "#2e7d32" }}>Chat with Farmers 💬</h3>

      {/* Farmer contacts */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, overflowX: "auto" }}>
        {farmersList.map(farmer => (
          <button
            key={farmer.id}
            onClick={() => setSelectedFarmer(farmer)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: selectedFarmer.id === farmer.id ? "2px solid #2e7d32" : "1px solid #ccc",
              background: selectedFarmer.id === farmer.id ? "#a5d6a7" : "white",
              cursor: "pointer",
              minWidth: 100,
              fontWeight: selectedFarmer.id === farmer.id ? "700" : "400",
            }}
          >
            {farmer.name}
          </button>
        ))}
      </div>

      {/* Chat messages area */}
      <div
        style={{
          flexGrow: 1,
          background: "white",
          padding: 10,
          borderRadius: 12,
          overflowY: "auto",
          minHeight: 200,
          maxHeight: 300,
        }}
      >
        {messages[selectedFarmer.id].length === 0 ? (
          <p style={{ color: "#777", fontStyle: "italic" }}>No messages yet with {selectedFarmer.name}</p>
        ) : (
          messages[selectedFarmer.id].map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                textAlign: m.sender === "buyer" ? "right" : "left",
                color: m.sender === "buyer" ? "#2e7d32" : "#555",
              }}
            >
              <span
                style={{
                  background: m.sender === "buyer" ? "#a5d6a7" : "#eee",
                  padding: "6px 10px",
                  borderRadius: 12,
                  display: "inline-block",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input box */}
      <input
        style={{ width: "100%", marginTop: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Message ${selectedFarmer.name}...`}
        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
      />
      <button
        onClick={sendMessage}
        style={{ marginTop: 6, width: "100%", background: "#43a047", color: "white", border: "none", padding: 8, borderRadius: 6 }}
      >
        Send
      </button>
    </div>
  );
}
