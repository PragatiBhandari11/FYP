import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      background: "#fff1f0"
    }}>
      <div style={{
        background: "#fff", 
        padding: "40px", 
        borderRadius: "24px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        width: "360px"
      }}>
        <div style={{fontSize: "60px", marginBottom: "20px"}}>❌</div>
        <h2 style={{color: "#d9534f"}}>Payment Failed</h2>
        <p style={{color: "#666", lineHeight: "1.6"}}>
          Something went wrong with your Khalti transaction. 
          Please try again or choose a different payment method.
        </p>
        
        <div style={{display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "24px"}}>
          <button 
            onClick={() => navigate("/buyer-cart")}
            style={{
              flex: 1,
              padding: "14px",
              background: "#5c2d91",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Retry Now
          </button>
          
          <button 
            onClick={() => navigate("/buyer-dashboard")}
            style={{
              flex: 1,
              padding: "14px",
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
