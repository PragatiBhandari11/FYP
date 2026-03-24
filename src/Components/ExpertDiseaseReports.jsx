import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExpertDiseaseReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState({}); // Track responses per report ID

  useEffect(() => {
    fetch("http://localhost:5000/api/disease/reports")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleResponseSubmit = async (id) => {
    const expertText = response[id];
    if (!expertText) return alert("Please type a response first.");

    try {
      const res = await fetch(`http://localhost:5000/api/disease/respond/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: expertText })
      });
      if (res.ok) {
        alert("Advice sent successfully! ✅");
        // Update local state
        setReports(reports.map(r => r.id === id ? { ...r, status: 'Responded', expert_response: expertText } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { margin: 0; background: #f0f7f4; }
        .page { max-width: 390px; margin: auto; background: white; min-height: 100vh; padding: 20px; }
        .header { display: flex; align-items: center; margin-bottom: 20px; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #2e7d32; }
        h2 { margin-left: 10px; font-size: 20px; color: #1b5e20; }
        
        .report-card { background: #f9f9f9; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #e0e0e0; }
        .report-img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
        .farmer-info { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 4px; }
        .desc { font-size: 14px; color: #666; margin-bottom: 12px; line-height: 1.4; }
        
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 12px; }
        .status.Pending { background: #fff3cd; color: #856404; }
        .status.Responded { background: #d4edda; color: #155724; }
        
        .response-area { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 13px; margin-bottom: 10px; min-height: 60px; }
        .submit-btn { width: 100%; padding: 10px; background: #2e7d32; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .expert-advice { background: #e8f5e9; padding: 10px; border-radius: 8px; border-left: 4px solid #2e7d32; font-size: 13px; color: #1b5e20; }
      `}</style>

      <div className="page">
        <div className="header">
          <button className="back-btn" onClick={() => navigate("/expert-dashboard")}>←</button>
          <h2>Diseases Reported</h2>
        </div>

        {loading ? <p>Loading reports...</p> : reports.length === 0 ? <p>No reports to show.</p> : (
          reports.map(report => (
            <div key={report.id} className="report-card">
              <img src={`http://localhost:5000${report.image_url}`} alt="Infected plant" className="report-img" />
              <div className="farmer-info">👤 {report.farmer_name}</div>
              <div className={`status ${report.status}`}>{report.status}</div>
              <p className="desc">{report.description}</p>
              
              {report.status === 'Pending' ? (
                <>
                  <textarea 
                    className="response-area" 
                    placeholder="Provide your advice or cure..."
                    value={response[report.id] || ""}
                    onChange={(e) => setResponse({ ...response, [report.id]: e.target.value })}
                  />
                  <button className="submit-btn" onClick={() => handleResponseSubmit(report.id)}>Send Advice</button>
                </>
              ) : (
                <div className="expert-advice">
                  <strong>Your Advice:</strong><br/>
                  {report.expert_response}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
