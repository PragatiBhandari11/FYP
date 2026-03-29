import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerExpertPage() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Directory"); // "Directory" or "Reports"
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ image: null, description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/experts")
      .then(res => res.json())
      .then(data => { setExperts(data); setLoading(false); })
      .catch(err => { setError("Could not load experts."); setLoading(false); });

    fetchFarmerReports();
  }, []);

  const fetchFarmerReports = () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
    fetch(`http://localhost:5000/api/disease/reports/farmer/${email}`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err));
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("userEmail");
    if (!email) return showToast("Please login.", "error");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("farmerEmail", email);
    formData.append("image", newReport.image);
    formData.append("description", newReport.description);

    try {
      const res = await fetch("http://localhost:5000/api/disease/report", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        showToast("Report submitted! ✅");
        setNewReport({ image: null, description: "" });
        fetchFarmerReports();
        setActiveTab("Reports");
      }
    } catch (err) {
      console.error(err);
      showToast("Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

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
        
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #16a34a; font-weight: bold; padding: 0; }
        .title { margin: 0; font-size: 22px; color: #111; text-align: center; flex: 1; }
        .header-spacer { width: 24px; }
        
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; text-align: center; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; background: #eee; color: #666; }
        .tab.active { background: #16a34a; color: white; }

        .expert-list, .report-list { display: flex; flex-direction: column; gap: 16px; }
        
        .expert-card { background: white; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .expert-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #22c55e); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; flex-shrink: 0; }
        .expert-info { flex: 1; }
        .expert-name { margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #111; }
        .expert-meta, .expert-phone { margin: 0; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
        .expert-phone { color: #16a34a; font-weight: bold; margin-top: 4px; }

        /* Report Form */
        .report-form { background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px dashed #16a34a; }
        .report-form h4 { margin: 0 0 12px 0; color: #16a34a; }
        .report-form input, .report-form textarea { width: 100%; margin-bottom: 10px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; }
        .report-form button { width: 100%; padding: 12px; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        
        .report-card { background: white; border-radius: 12px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 4px solid #16a34a; }
        .report-card.responded { border-left-color: #2e7d32; }
        .report-status { font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-responded { background: #d4edda; color: #155724; }
        .report-desc { font-size: 13px; color: #333; margin-bottom: 8px; }
        .expert-advice { font-size: 13px; color: #1b5e20; background: #e8f5e9; padding: 8px; border-radius: 6px; margin-top: 8px; }
        
        .empty-state { text-align: center; padding: 40px 20px; color: #6b7280; }
        .bottom-nav { display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #e5e7eb; background: #fff; margin-top: auto; }
        .bottom-nav span { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; cursor: pointer; }
        .bottom-nav .active { color: #16a34a; }

        .toast-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          width: 90%;
          max-width: 320px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
        }

        .toast-success { color: #16a34a; border-left: 4px solid #16a34a; }
        .toast-error { color: #ef4444; border-left: 4px solid #ef4444; }

        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="app-container">
        <div className="content-scroll">
          <div className="header">
            <button className="back-btn" onClick={() => navigate("/farmer-dashboard")}>←</button>
            <h2 className="title">Agro Expert</h2>
            <div className="header-spacer"></div>
          </div>

          <div className="tabs">
            <div className={`tab ${activeTab === "Directory" ? "active" : ""}`} onClick={() => setActiveTab("Directory")}>Experts</div>
            <div className={`tab ${activeTab === "Reports" ? "active" : ""}`} onClick={() => setActiveTab("Reports")}>Diseases</div>
          </div>

          {activeTab === "Directory" ? (
            <div className="expert-list">
              {experts.map(expert => (
                <div key={expert.id} className="expert-card">
                  <div className="expert-avatar">{expert.full_name?.charAt(0) || "👤"}</div>
                  <div className="expert-info">
                    <h4 className="expert-name">{expert.full_name}</h4>
                    <p className="expert-meta">📍 {expert.city || "Local Expert"}</p>
                    <p className="expert-phone">📞 {expert.phone || "Consult now"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="disease-reports">
              <form className="report-form" onSubmit={handleReportSubmit}>
                <h4>Report a Disease</h4>
                <input type="file" accept="image/*" required onChange={(e) => setNewReport({...newReport, image: e.target.files[0]})} />
                <textarea placeholder="Describe the symptoms (e.g., yellow spots on leaves)..." required value={newReport.description} onChange={(e) => setNewReport({...newReport, description: e.target.value})} />
                <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Report"}</button>
              </form>

              <div className="report-list">
                <h4 style={{marginBottom: "12px", color: "#333"}}>Your Reports</h4>
                {reports.length === 0 ? <p className="empty-state">No reports submitted yet.</p> : reports.map(report => (
                  <div key={report.id} className={`report-card ${report.status === 'Responded' ? 'responded' : ''}`}>
                    <div className={`report-status status-${report.status.toLowerCase()}`}>{report.status}</div>
                    <p className="report-desc">{report.description}</p>
                    {report.expert_response && (
                      <div className="expert-advice">
                        <strong>Expert Luck Advice:</strong> {report.expert_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
          <span className="active" onClick={() => navigate("/experts")}>
            <div className="icon">👥</div>Experts
          </span>
          <span onClick={() => navigate("/farmer-calendar")}>
            <div className="icon">📅</div>Calendar
          </span>
          <span onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </span>
        </div>

        {toast.show && (
          <div className="toast-container">
            <div className={`toast-content toast-${toast.type}`}>
              <span>{toast.type === "success" ? "✅" : "❌"}</span>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
