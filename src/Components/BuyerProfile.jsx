import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Get the current logged-in user's email from localStorage
    const email = localStorage.getItem("userEmail");

    if (!email) {
      setError("Please log in to view your profile.");
      return;
    }

    // 2. Fetch the full user details from the database
    fetch(`http://localhost:5000/api/user/${email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user details");
        return res.json();
      })
      .then((data) => setUserData(data))
      .catch((err) => {
        console.error(err);
        setError("Could not connect to the server.");
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f2f2f2; }
        .profile-container { 
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 20px 20px 0 20px;
          box-sizing: border-box;
        }
        .back-btn { background: none; border: none; font-size: 16px; color: #2e8b57; cursor: pointer; margin-bottom: 20px; font-weight: bold; text-align: left;}
        .profile-header { text-align: center; margin-bottom: 30px; }
        .avatar { width: 80px; height: 80px; background: #2e8b57; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin: 0 auto 15px; }
        .profile-name { font-size: 24px; color: #333; margin: 0 0 5px; }
        .profile-role { color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .info-card { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; font-size: 14px; font-weight: 500; }
        .info-value { color: #222; font-size: 14px; font-weight: 600; text-align: right; }
        .logout-btn { width: 100%; padding: 14px; background: #dc3545; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-bottom: 20px;}
        .logout-btn:hover { background: #c82333; }
        .error { text-align: center; color: #dc3545; padding: 20px; }

        /* Bottom Navigation matching BuyerDashboard */
        .bottom-nav {
          margin-top: auto;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          background: #fff;
          margin-left: -20px;
          margin-right: -20px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: #666;
          cursor: pointer;
        }

        .nav-item .icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .nav-item.active {
          color: #2e8b57;
          font-weight: bold;
        }
      `}</style>

      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {error ? (
          <div className="error">{error}</div>
        ) : !userData ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading your profile...</div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div className="profile-header">
              <div className="avatar">
                {userData.full_name.charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-name">{userData.full_name}</h2>
              <span className="profile-role">{userData.role} Account</span>
            </div>

            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Email Address</span>
                <span className="info-value">{userData.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{userData.phone || "Not Provided"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Country</span>
                <span className="info-value">{userData.country || "Not Provided"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(userData.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout securely
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
            <span className="icon">🏠</span>
            <span>Home</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-explore")}>
            <span className="icon">🔍</span>
            <span>Explore</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-cart")}>
            <span className="icon">🛒</span>
            <span>Cart</span>
          </div>

          <div className="nav-item" onClick={() => navigate("/buyer-orders")}>
            <span className="icon">📦</span>
            <span>Orders</span>
          </div>

          <div className="nav-item active" onClick={() => navigate("/profile")}>
            <span className="icon">👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </>
  );
}
