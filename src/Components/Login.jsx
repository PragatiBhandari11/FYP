import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userFullName", data.user.fullName);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userCity", data.user.city || "");
        localStorage.setItem("userRole", data.role || "Buyer");

        const roleToUse = (data.role || "Buyer").toLowerCase().trim();
        if (roleToUse === "admin") navigate("/admin-dashboard");
        else if (roleToUse === "farmer") navigate("/farmer-dashboard");
        else if (roleToUse === "expert") navigate("/expert-dashboard");
        else navigate("/buyer-dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Could not connect to server.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

        body {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          background: #0f172a;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .mobile-frame {
          width: 390px;
          height: 844px;
          background: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          padding: 40px 30px;
          box-sizing: border-box;
        }

        .back-nav {
          font-size: 24px;
          cursor: pointer;
          margin-bottom: 40px;
          color: #64748b;
        }

        .header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .header p {
          color: #64748b;
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }

        .modern-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          font-size: 16px;
          background: #f8fafc;
          transition: 0.3s;
          box-sizing: border-box;
        }

        .modern-input:focus {
          outline: none;
          border-color: #16a34a;
          background: white;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
        }

        .btn-login {
          width: 100%;
          padding: 18px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: 0.3s;
          box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3);
        }

        .btn-login:active {
          transform: scale(0.98);
        }

        .footer-link {
          text-align: center;
          margin-top: auto;
          font-size: 14px;
          color: #94a3b8;
        }

        .footer-link span {
          color: #16a34a;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <div className="mobile-frame">
        <div className="back-nav" onClick={() => navigate("/")}>←</div>
        
        <div className="header">
          <h1>Welcome Back</h1>
          <p>Login to continue connecting with your agricultural community.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="modern-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="modern-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">Sign In</button>
        </form>

        <div className="footer-link">
          Don't have an account? <span onClick={() => navigate("/signup")}>Create One</span>
        </div>
      </div>
    </>
  );
}

export default Login;
