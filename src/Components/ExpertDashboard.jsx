import React, { useState } from "react";

/*
  ExpertDashboardMobile.jsx
  - Self-contained React (web) component for a mobile-style expert dashboard
  - No external icon libraries required
  - Tabs: Feed (farmer posts + expert comments), Chat (locked until verified), Profile (2-step verification)
*/

export default function ExpertDashboardMobile() {
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'chat' | 'profile'
  const [verificationFile, setVerificationFile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // sample feed items (farmer posts)
  const [feedItems, setFeedItems] = useState([
    { id: 1, farmer: "Ram", title: "Wheat crop yellowing", body: "My wheat leaves are turning yellow on edges.", expertComment: "" },
    { id: 2, farmer: "Sita", title: "Tomato leaf spots", body: "There are white spots on tomato leaves.", expertComment: "" },
  ]);

  // local state to hold typed comment per feed item
  const [draftComments, setDraftComments] = useState({});

  // chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: "farmer", text: "Hello expert, my crop needs help." },
    { id: 2, from: "expert", text: "Share a photo and details." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // handle file selection for verification
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setVerificationFile(file);
  };

  // submit expert comment for a feed item
  const handleSubmitComment = (itemId) => {
    const comment = (draftComments[itemId] || "").trim();
    if (!comment) return;
    setFeedItems((prev) => prev.map((f) => (f.id === itemId ? { ...f, expertComment: comment } : f)));
    setDraftComments((prev) => ({ ...prev, [itemId]: "" }));
  };

  // send chat message (only if verified)
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!isVerified) {
      alert("Complete verification before chatting with farmers.");
      return;
    }
    setChatMessages((prev) => [...prev, { id: Date.now(), from: "expert", text: newMessage }]);
    setNewMessage("");
  };

  // complete verification: a simple 2-step flow simulated here
  const handleCompleteVerification = () => {
    if (!verificationFile) {
      alert("Please choose a verification file (ID) first.");
      return;
    }
    // simulate step 2 (details) then mark verified
    setIsVerified(true);
    alert("Verification submitted — account marked verified (simulated). You can now chat.");
  };

  /* ---------- Render helpers for pages ---------- */

  const FeedPage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Farmer Posts</h2>

      {feedItems.map((item) => (
        <div key={item.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.farmerBadge}>👨‍🌾 {item.farmer}</span>
            <strong style={styles.cardTitle}>{item.title}</strong>
          </div>

          <p style={styles.cardText}>{item.body}</p>

          <textarea
            aria-label={`Comment for item ${item.id}`}
            placeholder="Write feedback..."
            value={draftComments[item.id] ?? ""}
            onChange={(e) => setDraftComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
            style={styles.textarea}
          />

          <button onClick={() => handleSubmitComment(item.id)} style={styles.btnPrimary}>
            Submit Feedback
          </button>

          {item.expertComment && (
            <div style={styles.expertComment}>
              <strong>✅ Your Comment:</strong>
              <div style={{ marginTop: 6 }}>{item.expertComment}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ChatPage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Chat with Farmers</h2>

      {!isVerified && <div style={styles.lockNotice}>🔒 You must verify your account to chat with farmers.</div>}

      <div style={styles.chatBox} role="log" aria-live="polite">
        {chatMessages.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.chatMessage,
              alignSelf: m.from === "expert" ? "flex-end" : "flex-start",
              backgroundColor: m.from === "expert" ? "#4c2bd9" : "#eef0f6",
              color: m.from === "expert" ? "#fff" : "#111",
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div style={styles.chatRow}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isVerified ? "Type a message..." : "Verify to send messages"}
          disabled={!isVerified}
          style={styles.input}
        />
        <button onClick={handleSendMessage} disabled={!isVerified} style={styles.sendBtn}>
          ➤
        </button>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div style={styles.page}>
      <h2 style={styles.heading}>Profile & Verification</h2>

      <div style={styles.card}>
        <p style={{ marginBottom: 8 }}>
          <strong>Verification status:</strong>{" "}
          {isVerified ? <span style={{ color: "green" }}>✔ Verified</span> : <span style={{ color: "crimson" }}>❌ Not verified</span>}
        </p>

        {!isVerified ? (
          <>
            <p style={{ marginBottom: 6 }}>Step 1: Upload ID (passport / national ID)</p>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={styles.fileInput} />
            {verificationFile && <div style={{ marginTop: 8 }}>Selected: {verificationFile.name}</div>}

            <div style={{ height: 12 }} />

            <p style={{ marginBottom: 6 }}>Step 2: Confirm details</p>
            <button onClick={handleCompleteVerification} style={styles.btnPrimary}>
              Submit Verification
            </button>
          </>
        ) : (
          <p style={{ color: "green" }}>You are verified — chat unlocked ✅</p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: "8px 0" }}>Profile Actions</h3>
        <button
          onClick={() => {
            setIsVerified(false);
            setVerificationFile(null);
            alert("Verification reset (simulated).");
          }}
          style={{ ...styles.btnOutline, marginBottom: 8 }}
        >
          Reset Verification
        </button>
        <button
          onClick={() => alert("Profile saved (simulated).")}
          style={styles.btnSecondary}
        >
          Save Profile
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* content */}
      <div style={styles.content}>
        {activeTab === "feed" && <FeedPage />}
        {activeTab === "chat" && <ChatPage />}
        {activeTab === "profile" && <ProfilePage />}
      </div>

      {/* bottom nav */}
      <nav style={styles.bottomNav} aria-label="Bottom navigation">
        <button
          onClick={() => setActiveTab("feed")}
          style={activeTab === "feed" ? styles.navActive : styles.navItem}
          aria-current={activeTab === "feed"}
        >
          <div style={{ fontSize: 18 }}>🏡</div>
          <div style={styles.navLabel}>Feed</div>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          style={activeTab === "chat" ? styles.navActive : styles.navItem}
          aria-current={activeTab === "chat"}
        >
          <div style={{ fontSize: 18 }}>💬</div>
          <div style={styles.navLabel}>Chat</div>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          style={activeTab === "profile" ? styles.navActive : styles.navItem}
          aria-current={activeTab === "profile"}
        >
          <div style={{ fontSize: 18 }}>👤</div>
          <div style={styles.navLabel}>Profile</div>
        </button>
      </nav>
    </div>
  );
}

/* ---------- Styles (JS object) ---------- */
const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "linear-gradient(180deg,#f6f5ff 0%, #ffffff 60%)",
  },
  content: {
    flex: 1,
    overflow: "auto",
    paddingBottom: 90, // leave space for nav
  },
  page: {
    padding: 16,
    maxWidth: 520,
    margin: "0 auto",
  },
  heading: {
    textAlign: "left",
    fontSize: 20,
    color: "#4c2bd9",
    margin: "12px 0",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 18px rgba(76,43,217,0.08)",
    marginBottom: 14,
  },
  cardHeader: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 6,
  },
  farmerBadge: {
    background: "#f0efff",
    color: "#4c2bd9",
    padding: "6px 10px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: 16,
    color: "#222",
  },
  cardText: {
    color: "#444",
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    minHeight: 70,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e3e3ef",
    resize: "vertical",
  },
  btnPrimary: {
    marginTop: 10,
    width: "100%",
    background: "linear-gradient(90deg,#4c2bd9,#6a4edc)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
  expertComment: {
    marginTop: 12,
    background: "#f0fff4",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e6f6ea",
    color: "#065f46",
  },

  /* chat */
  lockNotice: {
    background: "#fff7f7",
    border: "1px solid #ffd6d6",
    color: "#9b1c1c",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 6,
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
    marginLeft: 0,
    marginRight: 0,
    maxHeight: 360,
    overflow: "auto",
  },
  chatMessage: {
    padding: "8px 12px",
    borderRadius: 18,
    maxWidth: "78%",
    fontSize: 14,
    lineHeight: 1.3,
  },
  chatRow: {
    display: "flex",
    gap: 8,
    padding: "0 4px 12px 4px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e8e8f0",
  },
  sendBtn: {
    background: "#4c2bd9",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },

  /* profile area */
  fileInput: {
    width: "100%",
    padding: 8,
  },
  btnSecondary: {
    marginTop: 8,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    fontWeight: 600,
  },
  btnOutline: {
    marginTop: 8,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px dashed #cfc9ff",
    background: "transparent",
    color: "#4c2bd9",
    fontWeight: 700,
    cursor: "pointer",
  },

  /* bottom nav */
  bottomNav: {
    position: "fixed",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    width: "92%",
    maxWidth: 540,
    height: 64,
    background: "rgba(255,255,255,0.98)",
    borderRadius: 20,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(76,43,217,0.12)",
    padding: "8px 12px",
    border: "1px solid rgba(76,43,217,0.06)",
  },
  navItem: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    color: "#666",
    fontSize: 12,
  },
  navActive: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#f4eeff,#efe7ff)",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    color: "#4c2bd9",
    fontSize: 12,
    boxShadow: "0 6px 18px rgba(76,43,217,0.06)",
  },
  navLabel: { fontSize: 12, marginTop: 2 },
};
