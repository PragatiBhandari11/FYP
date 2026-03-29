import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      // Khalti sends pidx in the URL after redirection
      const pidx = searchParams.get("pidx");
      
      if (!pidx) {
        setMessage("No payment ID found. If you used eSewa, please wait...");
        // Re-check for eSewa's 'data' parameter if needed
        const esewaData = searchParams.get("data");
        if (!esewaData) {
            setLoading(false);
            return;
        }
        // Handle eSewa verification if needed (currently focusing on Khalti)
        setMessage("eSewa verification not implemented in this flow yet.");
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
          setMessage("Payment Successful! Your order has been placed. ✅");
          setTimeout(() => navigate("/buyer-orders"), 3000);
        } else {
          setMessage(result.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Error connecting to server.");
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
      height: "100vh", 
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      background: "#f4f7f6"
    }}>
      <div style={{
        background: "#fff", 
        padding: "40px", 
        borderRadius: "24px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        width: "360px"
      }}>
        {loading ? (
          <div>
            <div style={{fontSize: "50px", marginBottom: "16px"}}>🔄</div>
            <h2 style={{color: "#5c2d91"}}>Verifying Payment</h2>
            <p style={{color: "#666"}}>Please do not close this window...</p>
          </div>
        ) : (
          <>
            <div style={{fontSize: "60px", marginBottom: "20px"}}>
              {message.includes("Successful") ? "✅" : "❌"}
            </div>
            <h2 style={{color: message.includes("Successful") ? "#2e8b57" : "#d9534f"}}>
              {message.includes("Successful") ? "Success!" : "Failed"}
            </h2>
            <p style={{color: "#666", lineHeight: "1.6"}}>{message}</p>
            <button 
              onClick={() => navigate("/buyer-orders")}
              style={{
                marginTop: "24px",
                padding: "14px 28px",
                background: "#5c2d91",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                width: "100%"
              }}
            >
              View My Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
}
