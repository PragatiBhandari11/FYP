import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ExpertChats() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:5000/api/chat/active-chats/${userEmail}`)
      .then(res => res.json())
      .then(async (emails) => {
        // Fetch details for each email
        const detailedChats = await Promise.all(emails.map(async (email) => {
          try {
            const userRes = await fetch(`http://localhost:5000/api/user/${email}`);
            const userData = await userRes.json();
            return {
              email: email,
              name: userData.full_name || email,
              city: userData.city || "Unknown",
              role: userData.role
            };
          } catch (e) {
            return { email, name: email, city: "Unknown", role: "Farmer" };
          }
        }));
        setChats(detailedChats);
      })
      .catch(err => console.error("Active chats fetch error:", err))
      .finally(() => setLoading(false));
  }, [userEmail]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        body { background: #f5f9f5; margin: 0; }

        .page {
          width: 390px;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          padding-bottom: 80px;
        }

        .header {
          padding: 20px;
          background: #3a8a3a;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }

        .chat-list {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-radius: 12px;
          background: white;
          border: 1px solid #eee;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .chat-card:active { transform: scale(0.98); }
        .chat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #3a8a3a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }

        .chat-info { flex: 1; }
        .name { font-weight: bold; font-size: 16px; margin-bottom: 2px; }
        .sub { font-size: 12px; color: #666; }

        .navbar {
          position: fixed;
          bottom: 0;
          left: "50%";
          transform: translateX(-50%);
          width: 100%;
          maxWidth: 390px;
          backgroundColor: white;
          borderTop: "1px solid #ddd";
          display: "flex";
          justifyContent: "space-around";
          paddingTop: 8;
          paddingBottom: 8;
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)";
          zIndex: 1000;
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; color: #888; font-size: 10px; cursor: pointer; text-decoration: none; padding: 5px; flex: 1; text-align: center;}
      `}</style>

      <div className="page">
        <div className="header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h2 style={{margin: 0, fontSize: "1.2rem"}}>Active Conversations</h2>
        </div>

        <div className="chat-list">
          {loading ? (
            <p style={{textAlign:"center", color: "#666"}}>Syncing conversations...</p>
          ) : chats.length === 0 ? (
            <div style={{textAlign: "center", marginTop: "40px", color: "#999"}}>
               <div style={{fontSize: "40px"}}>💬</div>
               <p>No active chats found.</p>
               <p style={{fontSize: "12px"}}>Start a conversation from the Queries page!</p>
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.email} 
                className="chat-card" 
                onClick={() => navigate(`/chat/user/${chat.email}`)}
              >
                <div className="avatar">{chat.name.charAt(0)}</div>
                <div className="chat-info">
                  <div className="name">{chat.name}</div>
                  <div className="sub">{chat.role} • {chat.city}</div>
                </div>
                <div style={{color: "#3a8a3a"}}>➜</div>
              </div>
            ))
          )}
        </div>

        {/* Universal Navbar */}
        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", 
          width: "390px", backgroundColor: "white", borderTop: "1px solid #ddd", 
          display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 1000
        }}>
          <Link to="/expert-dashboard" className="nav-item">📊<br/>Dashboard</Link>
          <Link to="/queries" className="nav-item">❓<br/>Queries</Link>
          <Link to="/expert-chats" className="nav-item" style={{color: "#3a8a3a", fontWeight: "bold"}}>💬<br/>Chats</Link>
          <Link to="/expert-profile" className="nav-item">👤<br/>Profile</Link>
        </nav>
      </div>
    </>
  );
}
