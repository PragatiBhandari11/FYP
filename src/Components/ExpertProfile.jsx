import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExpertProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("Please log in to view your profile.");
      return;
    }

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
        body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f0f7f0; }
        .profile-container { 
          max-width: 420px;
          margin: auto;
          background: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .back-btn { background: none; border: none; font-size: 16px; color: #3a8a3a; cursor: pointer; margin-bottom: 20px; font-weight: bold; }
        .profile-header { text-align: center; margin-bottom: 30px; }
        .avatar { width: 90px; height: 90px; background: #3a8a3a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto 15px; }
        .profile-name { font-size: 24px; color: #333; margin: 0; }
        .profile-role { color: #3a8a3a; font-size: 14px; font-weight: bold; margin-top: 5px; }
        
        .info-section { background: #f9fdf9; border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid #e6f0e6; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #edf5ed; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #666; font-size: 14px; }
        .info-value { color: #222; font-size: 14px; font-weight: 600; }
        
        .logout-btn { width: 100%; padding: 14px; background: #dc3545; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .logout-btn:hover { background: #c82333; }
        .error { text-align: center; color: #dc3545; padding: 20px; }

        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; maxWidth: 420px; backgroundColor: "white"; borderTop: "1px solid #ddd"; display: "flex"; justifyContent: "space-around"; paddingTop: 8; paddingBottom: 8; boxShadow: "0 -2px 6px rgba(0,0,0,0.05)"; zIndex: 1000; }
        /* Reusing styles from dashboard */
      `}</style>

      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        {error ? (
          <div className="error">{error}</div>
        ) : !userData ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading profile...</div>
        ) : (
          <div>
            <div className="profile-header">
              <div className="avatar">{userData.full_name.charAt(0)}</div>
              <h2 className="profile-name">{userData.full_name}</h2>
              <div className="profile-role">Registered Expert</div>
            </div>

            <div className="info-section">
              <div className="info-row"><span className="info-label">Email</span><span className="info-value">{userData.email}</span></div>
              <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{userData.phone || "N/A"}</span></div>
              <div className="info-row"><span className="info-label">Country</span><span className="info-value">{userData.country}</span></div>
              <div className="info-row"><span className="info-label">City</span><span className="info-value">{userData.city}</span></div>
              <div className="info-row"><span className="info-label">Joined</span><span className="info-value">{new Date(userData.created_at).toLocaleDateString()}</span></div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </>
  );
}
