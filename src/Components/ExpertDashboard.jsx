import React, { useState } from "react";

/*
  ExpertDashboardMobile.jsx
  - Mobile-style expert dashboard
  - GREEN theme
  - Farmer posts include images
  - Tabs: Feed | Chat | Profile
*/

export default function ExpertDashboardMobile() {
  const [activeTab, setActiveTab] = useState("feed");
  const [verificationFile, setVerificationFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // Farmer feed with images
  const [feedItems, setFeedItems] = useState([
    {
      id: 1,
      farmer: "Ram",
      title: "Wheat crop yellowing",
      body: "My wheat leaves are turning yellow on edges.",
      image: "https://via.placeholder.com/400x220?text=Wheat+Leaf",
      expertComment: "",
    },
    {
      id: 2,
      farmer: "Sita",
      title: "Tomato leaf spots",
      body: "There are white spots on tomato leaves.",
      image: "https://via.placeholder.com/400x220?text=Tomato+Leaf",
      expertComment: "",
    },
  ]);

  const [draftComments, setDraftComments] = useState({});

  // Chat
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: "farmer", text: "Hello expert, my crop needs help." },
    { id: 2, from: "expert", text: "Please share a photo and details." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSubmitComment = (itemId) => {
    const comment = (draftComments[itemId] || "").trim();
    if (!comment) return;
    setFeedItems((prev) =>
      prev.map((f) => (f.id === itemId ? { ...f, expertComment: comment } : f))
    );
    setDraftComments((prev) => ({ ...prev, [itemId]: "" }));
  };

  const handleSendMessage = () => {
    if (!isVerified) return alert("Verify account to chat.");
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "expert", text: newMessage },
    ]);
    setNewMessage("");
  };

  const handleFileChange = (e) => {
    setVerificationFile(e.target.files?.[0] ?? null);
  };

  const handleCompleteVerification = () => {
    if (!verificationFile) return alert("Upload ID first.");
    setIsVerified(true);
    alert("Verification successful (simulated).");
  };

  /* ---------------- PAGES ---------------- */

  const FeedPage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Farmer Posts</h2>

      {feedItems.map((item) => (
        <div key={item.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.farmerBadge}>👨‍🌾 {item.farmer}</span>
            <strong>{item.title}</strong>
          </div>

          <p style={styles.cardText}>{item.body}</p>

          {item.image && (
            <img
              src={item.image}
              alt="Crop"
              style={{
                width: "100%",
                borderRadius: 10,
                marginBottom: 8,
                maxHeight: 220,
                objectFit: "cover",
              }}
            />
          )}

          <textarea
            placeholder="Write expert feedback..."
            value={draftComments[item.id] ?? ""}
            onChange={(e) =>
              setDraftComments((p) => ({ ...p, [item.id]: e.target.value }))
            }
            style={styles.textarea}
          />

          <button
            style={styles.btnPrimary}
            onClick={() => handleSubmitComment(item.id)}
          >
            Submit Feedback
          </button>

          {item.expertComment && (
            <div style={styles.expertComment}>
              <strong>✅ Your Comment:</strong>
              <div>{item.expertComment}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ChatPage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Chat with Farmers</h2>

      {!isVerified && (
        <div style={styles.lockNotice}>
          🔒 Verify your account to unlock chat
        </div>
      )}

      <div style={styles.chatBox}>
        {chatMessages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.chatMessage,
              alignSelf: m.from === "expert" ? "flex-end" : "flex-start",
              background: m.from === "expert" ? "#2e7d32" : "#e8f5e9",
              color: m.from === "expert" ? "#fff" : "#111",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div style={styles.chatRow}>
        <input
          style={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!isVerified}
          placeholder="Type message..."
        />
        <button
          style={styles.sendBtn}
          onClick={handleSendMessage}
          disabled={!isVerified}
        >
          ➤
        </button>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Profile & Verification</h2>

      <div style={styles.card}>
        <p>
          Status:{" "}
          {isVerified ? (
            <span style={{ color: "green" }}>✔ Verified</span>
          ) : (
            <span style={{ color: "crimson" }}>❌ Not Verified</span>
          )}
        </p>

        {!isVerified && (
          <>
            <input type="file" onChange={handleFileChange} />
            <button
              style={styles.btnPrimary}
              onClick={handleCompleteVerification}
            >
              Submit Verification
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {activeTab === "feed" && <FeedPage />}
        {activeTab === "chat" && <ChatPage />}
        {activeTab === "profile" && <ProfilePage />}
      </div>

      <nav style={styles.bottomNav}>
        <button
          style={activeTab === "feed" ? styles.navActive : styles.navItem}
          onClick={() => setActiveTab("feed")}
        >
          🏡 Feed
        </button>
        <button
          style={activeTab === "chat" ? styles.navActive : styles.navItem}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
        <button
          style={activeTab === "profile" ? styles.navActive : styles.navItem}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
      </nav>
    </div>
  );
}

/* ---------------- STYLES (GREEN THEME) ---------------- */

const styles = {
  container: {
    fontFamily: "Arial",
    height: "100vh",
    background: "linear-gradient(180deg,#f1f8e9,#ffffff)",
  },
  content: { paddingBottom: 90 },
  page: { padding: 16, maxWidth: 520, margin: "auto" },
  heading: { color: "#2e7d32", fontSize: 20, marginBottom: 10 },
  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    boxShadow: "0 6px 18px rgba(46,125,50,0.15)",
  },
  cardHeader: { display: "flex", gap: 10, marginBottom: 6 },
  farmerBadge: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: "bold",
  },
  cardText: { fontSize: 14, marginBottom: 6 },
  textarea: {
    width: "100%",
    minHeight: 60,
    borderRadius: 8,
    padding: 8,
    border: "1px solid #c8e6c9",
  },
  btnPrimary: {
    width: "100%",
    marginTop: 8,
    padding: 10,
    background: "linear-gradient(90deg,#2e7d32,#43a047)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
  },
  expertComment: {
    marginTop: 8,
    background: "#e8f5e9",
    padding: 8,
    borderRadius: 8,
  },
  lockNotice: {
    background: "#fff3e0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  chatBox: {
    background: "#fff",
    padding: 10,
    borderRadius: 12,
    maxHeight: 300,
    overflow: "auto",
  },
  chatMessage: {
    padding: "8px 12px",
    borderRadius: 16,
    marginBottom: 6,
    maxWidth: "75%",
  },
  chatRow: { display: "flex", gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #c8e6c9",
  },
  sendBtn: {
    padding: "10px 14px",
    background: "#2e7d32",
    color: "#fff",
    borderRadius: 10,
    border: "none",
  },
  bottomNav: {
    position: "fixed",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-around",
    borderRadius: 20,
    padding: 10,
    boxShadow: "0 8px 20px rgba(46,125,50,0.25)",
  },
  navItem: {
    background: "transparent",
    border: "none",
    color: "#555",
    fontWeight: "bold",
  },
  navActive: {
    background: "#e8f5e9",
    border: "none",
    color: "#2e7d32",
    padding: "6px 12px",
    borderRadius: 12,
    fontWeight: "bold",
  },
};
