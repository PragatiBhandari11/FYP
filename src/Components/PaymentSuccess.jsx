import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Home, LayoutDashboard } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment secure transaction...");

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx");
      
      if (!pidx) {
        setStatus("failed");
        setMessage("No payment ID found in your transaction.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/orders/verify-khalti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pidx })
        });
        
        const result = await response.json();

        if (response.ok && result.status === "Completed") {
          setStatus("success");
          setMessage("Your transaction has been processed successfully. Your order is now confirmed!");
          // Automatic redirect to Buyer Dashboard
          setTimeout(() => navigate("/buyer-dashboard"), 3000);
        } else {
          setStatus("failed");
          setMessage(result.message || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("Connection lost. Please check your bank statement or try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      textAlign: "center",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "#ffffff", 
        padding: "48px 32px", 
        borderRadius: "32px", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Top Accent Bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: loading ? "#6366f1" : (status === "success" ? "#10b981" : "#ef4444")
        }} />

        {loading ? (
          <div>
            <div style={{ 
              display: "inline-flex", 
              padding: "20px", 
              borderRadius: "50%", 
              background: "#f1f5f9", 
              marginBottom: "24px",
              animation: "pulse 2s infinite ease-in-out" 
            }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                border: "4px solid #e2e8f0", 
                borderTopColor: "#6366f1", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite" 
              }} />
            </div>
            <h2 style={{ color: "#1e293b", fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>
              Verifying Payment
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              Securely confirming your transaction...
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: "inline-flex", 
              padding: "20px", 
              borderRadius: "50%", 
              background: status === "success" ? "#ecfdf5" : "#fef2f2", 
              color: status === "success" ? "#10b981" : "#ef4444",
              marginBottom: "24px",
              boxShadow: `0 8px 16px ${status === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`
            }}>
              {status === "success" ? (
                <CheckCircle2 size={56} strokeWidth={2.5} />
              ) : (
                <XCircle size={56} strokeWidth={2.5} />
              )}
            </div>

            <h2 style={{ 
              color: "#1e293b", 
              fontSize: "28px", 
              fontWeight: "800", 
              marginBottom: "16px",
              letterSpacing: "-0.02em"
            }}>
              {status === "success" ? "Payment Successful! 🎉" : "Payment Failed"}
            </h2>

            <p style={{ 
              color: "#64748b", 
              fontSize: "17px", 
              lineHeight: "1.6", 
              marginBottom: "32px",
              padding: "0 10px" 
            }}>
              {message}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Primary and Only Action: Dashboard */}
              <button 
                onClick={() => navigate("/buyer-dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px 24px",
                  background: status === "success" ? "#10b981" : "#1e293b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <LayoutDashboard size={20} />
                Go to Buyer Dashboard
              </button>

              {status === "success" && (
                <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "8px" }}>
                  Redirecting to your dashboard in 3s...
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
