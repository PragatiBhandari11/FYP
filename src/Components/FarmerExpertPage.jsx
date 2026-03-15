import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerExpertPage() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/experts")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch experts");
        return res.json();
      })
      .then(data => {
        setExperts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Could not load experts directory.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { margin: 0; background: #e5f2e5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; }
        .app-container {
          width: 390px;
          background: #f2fbf6;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .content-scroll {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #16a34a; font-weight: bold; padding: 0; }
        .title { margin: 0; font-size: 22px; color: #111; text-align: center; flex: 1; }
        .header-spacer { width: 24px; } /* To balance the back button flex */
        
        .expert-list { display: flex; flex-direction: column; gap: 16px; }
        
        .expert-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .expert-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .expert-info { flex: 1; }
        .expert-name { margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #111; }
        .expert-meta { margin: 0 0 4px 0; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
        .expert-phone { margin: 0; font-size: 13px; color: #16a34a; font-weight: bold; display: flex; align-items: center; gap: 6px; }
        
        .empty-state { text-align: center; padding: 40px 20px; color: #6b7280; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        
        /* Bottom nav */
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
          margin-top: auto;
        }
        .bottom-nav span { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 4px; 
          font-size: 13px; 
          color: #6b7280; 
          cursor: pointer; 
        }
        .bottom-nav span .icon { font-size: 20px; line-height: 1; }
        .bottom-nav .active { color: #16a34a; }
      `}</style>

      <div className="app-container">
        <div className="content-scroll">
          <div className="header">
            <button className="back-btn" onClick={() => navigate("/farmer-dashboard")}>←</button>
            <h2 className="title">Experts Directory</h2>
            <div className="header-spacer"></div>
          </div>

          {error && <div style={{color: "red", textAlign: "center"}}>{error}</div>}
          {loading && <div style={{textAlign: "center", color: "#666"}}>Finding local experts...</div>}

          {!loading && !error && experts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Experts Available</h3>
              <p>There are currently no certified experts registered in the system.</p>
            </div>
          ) : (
            <div className="expert-list">
              {experts.map(expert => (
                <div key={expert.id} className="expert-card">
                  <div className="expert-avatar">
                   {/* Grab first letter of name for initials icon */}
                   {expert.full_name ? expert.full_name.charAt(0).toUpperCase() : "👤"}
                  </div>
                  <div className="expert-info">
                    <h4 className="expert-name">{expert.full_name}</h4>
                    <p className="expert-meta">
                      📍 {expert.city ? `${expert.city}, ${expert.country || ''}` : "Location not provided"}
                    </p>
                    <p className="expert-phone">
                      📞 {expert.phone || "No phone listed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          <span onClick={() => navigate("/farmer-dashboard")}>
            <div className="icon">🏠</div>Home
          </span>
          <span onClick={() => navigate("/products")}>
            <div className="icon">🌱</div>Products
          </span>
          <span className="active">
            <div className="icon">👥</div>Experts
          </span>
          <span>
            <div className="icon">📅</div>Calendar
          </span>
          <span onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </span>
        </div>
      </div>
    </>
  );
}
