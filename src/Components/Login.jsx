import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // Ensure it matches http://localhost:5000 exactly
const response = await fetch("http://localhost:5000/api/login", { 
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

    const data = await response.json();
    console.log("Login full Response:", data);

    if (response.ok) {
      // DEBUG: Let's see what the role actually is
      // alert(`Welcome back ${data.user.fullName}! Role: ${data.role}`); 

      localStorage.setItem("userFullName", data.user.fullName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", data.role || (data.user && data.user.role) || "Buyer");

      // REDIRECT LOGIC BASED ON ROLE (Robust)
      const roleToUse = data.role || (data.user && data.user.role) || "Buyer";
      const userRole = roleToUse.toLowerCase().trim();
      
      console.log("Redirecting for role:", userRole);
      
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "farmer") {
        navigate("/farmer-dashboard");
      } else if (userRole === "expert") {
        navigate("/expert-dashboard");
      } else {
        // Includes "buyer" and unknown roles
        navigate("/buyer-dashboard");
      }
      
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Connection error:", error);
    alert("Could not connect to the server.");
  }
};

  return (
    <>
      <style>{`
        body { margin: 0; font-family: Arial; background: linear-gradient(135deg,#1e7d4f,#3ac37a); height: 100vh; }
        .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-box { background: white; padding: 40px; border-radius: 10px; width: 350px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        h2 { color: #1e7d4f; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #1e7d4f; border: none; color: white; font-size: 16px; border-radius: 5px; cursor: pointer; transition: background 0.3s; }
        button:hover { background: #16623e; }
      `}</style>

      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;