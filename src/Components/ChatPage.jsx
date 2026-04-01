import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatPage() {
  const { type, id } = useParams(); // type: 'collab' or 'user', id: numeric ID or email
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const userEmail = localStorage.getItem("userEmail");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!userEmail) {
       showToast("User not logged in. Redirecting...", "error");
       setTimeout(() => navigate("/login"), 2000);
       return;
    }

    // Fetch Recipient Details
    if (type === 'collab') {
      fetch(`http://localhost:5000/api/collaborations/${id}`)
        .then(res => res.json())
        .then(data => setRecipient({ name: data.name, sub: data.type, isUser: false }))
        .catch(err => console.error("Error fetching collab:", err));
    } else {
      // It's a user chat (Expert or Farmer)
      fetch(`http://localhost:5000/api/user/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.message) throw new Error(data.message);
          setRecipient({ name: data.full_name, sub: data.role, isUser: true });
        })
        .catch(err => {
          console.error("Error fetching user:", err);
          setRecipient({ name: id, sub: "User", isUser: true });
        });
    }

    // Initial message fetch
    fetchMessages();

    // Polling for new messages every 4 seconds
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [type, id, userEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!userEmail || !id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/history/${userEmail}/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;
    if (sending) return;

    setSending(true);
    const formData = new FormData();
    formData.append("sender_email", userEmail);
    formData.append("message_text", newMessage);
    if (image) formData.append("image", image);
    
    if (type === 'collab') {
      formData.append("receiver_id", id);
    } else {
      formData.append("receiver_email", id);
    }

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        body: formData // No headers needed for FormData
      });
      
      if (res.ok) {
        setNewMessage("");
        setImage(null);
        setImagePreview(null);
        fetchMessages(); // Refresh history immediately
        
        // Also trigger a system notification for the recipient if it's a user
        if (type !== 'collab') {
          fetch("http://localhost:5000/api/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_email: id,
              title: "New Message",
              message: `You have a new message from ${localStorage.getItem("userFullName") || 'a user'}`,
              type: "Response"
            })
          }).catch(err => console.error("Notif trigger error:", err));
        }
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to send message", "error");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      showToast("Connection error", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
        
        * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: #f0f2f5; margin: 0; }

        .app {
          width: 390px;
          margin: 0 auto;
          background: #fff;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          position: relative;
        }

        .header {
          padding: 16px;
          background: #1e7d4f;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .back-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; }

        .recipient-info { display: flex; flex-direction: column; }
        .recipient-name { font-weight: 600; font-size: 16px; }
        .recipient-status { font-size: 11px; opacity: 0.8; }

        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8f9fa;
        }

        .message-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          position: relative;
          word-wrap: break-word;
          animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .sent { align-self: flex-end; background: #1e7d4f; color: white; border-bottom-right-radius: 4px; }
        .received { align-self: flex-start; background: white; color: #333; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        .message-img {
          width: 100%;
          max-width: 240px;
          border-radius: 12px;
          margin-bottom: 5px;
          display: block;
          cursor: pointer;
        }

        .message-time { font-size: 9px; margin-top: 4px; opacity: 0.7; text-align: right; }

        /* Preview Area */
        .preview-area {
          padding: 10px 16px;
          background: #fdfdfd;
          border-top: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .preview-container {
          position: relative;
          width: 60px;
          height: 60px;
        }
        .preview-img {
           width: 100%;
           height: 100%;
           object-fit: cover;
           border-radius: 8px;
           border: 1px solid #ddd;
        }
        .remove-preview {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
          border: 2px solid white;
        }

        .input-area {
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .attach-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 0;
          transition: color 0.2s;
        }
        .attach-btn:hover { color: #1e7d4f; }

        .message-input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 24px;
          border: 1px solid #eee;
          outline: none;
          font-size: 14px;
          background: #f9f9f9;
        }

        .send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #1e7d4f;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }

        .send-btn:disabled { background: #ccc; cursor: not-allowed; }

        .placeholder-text {
          text-align: center;
          margin-top: 40px;
          color: #888;
          font-size: 13px;
        }

        /* Toast */
        .toast {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 13px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .toast-error { background: #ef4444; }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div className="recipient-info">
            <span className="recipient-name">{recipient?.name || "Syncing..."}</span>
            <span className="recipient-status">{recipient?.sub} • online</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-area">
          {loading ? (
            <div className="placeholder-text">Syncing with server...</div>
          ) : messages.length === 0 ? (
            <div className="placeholder-text">No messages. Say hello to {recipient?.name}!</div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-bubble ${msg.sender_email === userEmail ? 'sent' : 'received'}`}
              >
                {msg.image_url && (
                  <img 
                    src={`http://localhost:5000${msg.image_url}`} 
                    className="message-img" 
                    alt="Chat attachment" 
                    onClick={() => window.open(`http://localhost:5000${msg.image_url}`)}
                  />
                )}
                {msg.message_text && <div className="text-content">{msg.message_text}</div>}
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview Area */}
        {imagePreview && (
          <div className="preview-area">
            <div className="preview-container">
              <img src={imagePreview} className="preview-img" alt="Preview"/>
              <div className="remove-preview" onClick={() => {setImage(null); setImagePreview(null);}}>×</div>
            </div>
            <div style={{fontSize: "12px", color: "#666"}}>Image attached</div>
          </div>
        )}

        {/* Input Area */}
        <form className="input-area" onSubmit={handleSendMessage}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            accept="image/*" 
            onChange={handleImageChange}
          />
          <button 
            type="button" 
            className="attach-btn" 
            onClick={() => fileInputRef.current.click()}
          >
            📎
          </button>
          
          <input 
            type="text" 
            className="message-input" 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          
          <button type="submit" className="send-btn" disabled={sending || (!newMessage.trim() && !image)}>
            {sending ? "..." : "➔"}
          </button>
        </form>

        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
