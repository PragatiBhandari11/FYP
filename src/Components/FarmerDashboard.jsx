import React, { useState } from "react";

export default function FarmerDashboard() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  // For hotel section
  const hotels = [
    {
      id: 1,
      name: "Green Valley Hotel",
      location: "Kathmandu, Nepal",
      phone: "+977-01-1234567",
      details: "A cozy hotel with mountain views and local cuisine.",
    },
    {
      id: 2,
      name: "Sunrise Hotel",
      location: "Pokhara, Nepal",
      phone: "+977-061-7654321",
      details: "Famous for lakeside views and friendly staff.",
    },
    {
      id: 3,
      name: "Mountain Cafe & Hotel",
      location: "Lalitpur, Nepal",
      phone: "+977-01-9876543",
      details: "Cafe with hotel rooms, great coffee and warm atmosphere.",
    },
  ];

  const [openHotelId, setOpenHotelId] = useState(null);
  const [chatMessages, setChatMessages] = useState({}); // { hotelId: [messages] }
  const [chatInput, setChatInput] = useState("");

  // Post section functions
  const handleAddPost = () => {
    if (newPost.trim() === "") return;

    const newEntry = {
      id: Date.now(),
      content: newPost,
      comments: [],
    };

    setPosts([newEntry, ...posts]);
    setNewPost("");
  };

  const addComment = (postId, commentText) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, commentText],
            }
          : post
      )
    );
  };

  // Hotel section functions
  const toggleHotel = (id) => {
    setOpenHotelId(openHotelId === id ? null : id);
    setChatInput("");
  };

  const sendChatMessage = () => {
    if (chatInput.trim() === "") return;
    setChatMessages((prev) => {
      const hotelChats = prev[openHotelId] || [];
      return {
        ...prev,
        [openHotelId]: [...hotelChats, chatInput.trim()],
      };
    });
    setChatInput("");
  };

  return (
    <>
      <style>{`
        /* Main container */
        .dashboard-container {
          font-family: "Arial", sans-serif;
          background: #f4f7f2;
          min-height: 100vh;
          padding-bottom: 160px;
          padding-top: 10px;
        }

        /* Header */
        .dashboard-header {
          background: #4caf50;
          padding: 20px;
          text-align: center;
          color: white;
          font-size: 22px;
          font-weight: bold;
          letter-spacing: 1px;
          user-select: none;
          margin-bottom: 12px;
        }

        /* Features section */
        .features-wrapper {
          padding: 15px;
        }

        .feature-card {
          background: #fff;
          padding: 18px;
          border-radius: 14px;
          margin-bottom: 14px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .feature-card:hover {
          transform: scale(1.02);
        }

        .feature-card h3 {
          margin: 0 0 6px 0;
          font-size: 18px;
          color: #245c2a;
        }

        .feature-card p {
          margin: 0;
          font-size: 14px;
          color: #555;
        }

        /* ---------------- POST SECTION ---------------- */
        .post-section {
          margin: 20px;
        }

        .post-section h2 {
          color: #245c2a;
          margin-bottom: 10px;
        }

        .post-input {
          width: 100%;
          height: 80px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
          resize: vertical;
        }

        .post-btn {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .post-btn:hover {
          background: #3f8f43;
        }

        .posts-list {
          margin-top: 20px;
        }

        .post-card {
          background: white;
          padding: 15px;
          border-radius: 14px;
          margin-bottom: 15px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
        }

        .post-content {
          font-size: 15px;
          margin-bottom: 10px;
        }

        /* Comments */
        .comment-box {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .comment-input {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .comment-btn {
          padding: 10px 14px;
          background: #2b5f2d;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          transition: background-color 0.3s ease;
        }

        .comment-btn:hover {
          background-color: #24481e;
        }

        .comment {
          background: #e7f5e7;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 6px;
          font-size: 14px;
        }

        /* Bottom Navigation Bar */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #ffffff;
          display: flex;
          justify-content: space-around;
          padding: 14px 0;
          border-top: 1px solid #ccc;
          box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
          z-index: 100;
        }

        .bottom-nav div {
          font-size: 22px;
          color: #2b5f2d;
          cursor: pointer;
          user-select: none;
        }

        /* HOTEL CONTACTS WITH CHAT */
        .contact-section {
          margin: 20px 15px;
          background: #fff;
          padding: 16px;
          border-radius: 14px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.07);
        }

        .hotel-name {
          cursor: pointer;
          color: #4caf50;
          font-weight: bold;
          font-size: 18px;
          user-select: none;
          margin-bottom: 6px;
        }

        .hotel-details {
          background: #e7f5e7;
          border-radius: 10px;
          padding: 12px;
          margin-top: 6px;
        }

        .hotel-details p {
          margin: 6px 0;
        }

        .hotel-phone-link {
          color: #2b5f2d;
          font-weight: bold;
          text-decoration: none;
        }

        /* Chat */
        .chat-container {
          margin-top: 12px;
        }

        .chat-messages {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 8px;
          background: #fff;
          margin-bottom: 8px;
        }

        .chat-message {
          background: #c8e6c9;
          padding: 6px 10px;
          border-radius: 12px;
          margin-bottom: 6px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .chat-input {
          width: calc(100% - 90px);
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-right: 8px;
          font-size: 14px;
        }

        .chat-send-btn {
          padding: 8px 20px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .chat-send-btn:hover {
          background-color: #3f8f43;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .features-wrapper {
            padding: 10px;
          }

          .feature-card {
            padding: 14px;
            margin-bottom: 12px;
            border-radius: 12px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
          }

          .feature-card h3 {
            font-size: 16px;
          }

          .feature-card p {
            font-size: 13px;
          }

          .post-section {
            margin: 15px 10px;
          }

          .post-section h2 {
            font-size: 18px;
          }

          .post-input {
            height: 70px;
            font-size: 13px;
            padding: 10px;
          }

          .post-btn {
            font-size: 15px;
            padding: 10px;
          }

          .post-card {
            padding: 12px;
            border-radius: 12px;
          }

          .post-content {
            font-size: 14px;
          }

          .comment-input {
            padding: 8px;
            font-size: 13px;
          }

          .comment-btn {
            padding: 8px 12px;
            font-size: 14px;
          }

          .comment {
            font-size: 13px;
            padding: 6px;
          }

          .bottom-nav div {
            font-size: 18px;
          }

          .hotel-name {
            font-size: 16px;
          }

          .hotel-details {
            font-size: 14px;
          }

          .chat-input {
            font-size: 13px;
          }

          .chat-send-btn {
            font-size: 13px;
            padding: 6px 16px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* HEADER */}
        <div className="dashboard-header">Farmer Dashboard</div>

        {/* FEATURES */}
        <div className="features-wrapper">
          <div className="feature-card">
            <h3>🌾 Chat with Expert</h3>
            <p>Get advice from agriculture experts.</p>
          </div>

          <div className="feature-card">
            <h3>🛒 Marketplace</h3>
            <p>Buy & sell fresh crops directly.</p>
          </div>

          <div className="feature-card">
            <h3>➕ Add Product</h3>
            <p>Add your fresh harvest to the market.</p>
          </div>

          <div className="feature-card">
            <h3>📅 Crop Calendar</h3>
            <p>Check seasonal crop suggestions.</p>
          </div>

          <div className="feature-card">
            <h3>🌦 Weather Info</h3>
            <p>See weather forecast for farming.</p>
          </div>
        </div>

        {/* ---------------- POST SECTION ---------------- */}
        <div className="post-section">
          <h2>📝 Farmers Post Area</h2>

          <textarea
            className="post-input"
            placeholder="Share your crop update, problems, or ask for suggestions..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          ></textarea>

          <button className="post-btn" onClick={handleAddPost}>
            Post
          </button>

          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <p className="post-content">{post.content}</p>

                <h4>💬 Comments:</h4>
                {post.comments.map((c, i) => (
                  <p key={i} className="comment">
                    👉 {c}
                  </p>
                ))}

                <AddCommentForm postId={post.id} addComment={addComment} />
              </div>
            ))}
          </div>
        </div>

        {/* HOTEL CONTACTS WITH CHAT */}
        <div className="contact-section">
          <h3>🏨 Hotels List</h3>
          {hotels.map(({ id, name, location, phone, details }) => (
            <div key={id} style={{ marginBottom: "20px" }}>
              <div
                className="hotel-name"
                onClick={() => toggleHotel(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleHotel(id);
                }}
              >
                {name}
              </div>

              {openHotelId === id && (
                <div className="hotel-details">
                  <p>
                    <strong>Location:</strong> {location}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${phone}`} className="hotel-phone-link">
                      {phone}
                    </a>
                  </p>
                  <p>
                    <strong>Details:</strong> {details}
                  </p>

                  {/* Chat Section */}
                  <div className="chat-container">
                    <h4>💬 Chat with {name}</h4>
                    <div className="chat-messages">
                      {(chatMessages[id] || []).map((msg, i) => (
                        <div key={i} className="chat-message">
                          {msg}
                        </div>
                      ))}
                      {(!chatMessages[id] || chatMessages[id].length === 0) && (
                        <small style={{ color: "#777" }}>No messages yet.</small>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="chat-input"
                    />
                    <button className="chat-send-btn" onClick={sendChatMessage}>
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <div>🏠</div>
          <div>🛒</div>
          <div>➕</div>
          <div>💬</div>
          <div>👤</div>
        </div>
      </div>
    </>
  );
}

// ---------- COMMENT FORM COMPONENT ----------
function AddCommentForm({ postId, addComment }) {
  const [comment, setComment] = useState("");

  const submitComment = () => {
    if (comment.trim() === "") return;
    addComment(postId, comment);
    setComment("");
  };

  return (
    <div className="comment-box">
      <input
        type="text"
        placeholder="Write a suggestion..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="comment-input"
      />
      <button className="comment-btn" onClick={submitComment}>
        Reply
      </button>
    </div>
  );
}
