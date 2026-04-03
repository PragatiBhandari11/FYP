import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("Buyer");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }

      if (role === "Farmer" || role === "Expert") {
        alert("Account created! ✅\n\nNote: Farmers and Experts require admin approval before login.");
      } else {
        alert("Registration successful! ✅ Please log in.");
      }
      navigate("/login");
    } catch (error) {
      alert("Server error ❌");
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
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          padding: 30px;
          box-sizing: border-box;
        }

        .mobile-frame::-webkit-scrollbar {
          width: 0px;
        }

        .back-nav {
          font-size: 24px;
          cursor: pointer;
          margin-bottom: 20px;
          color: #64748b;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }

        .modern-input, .modern-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          font-size: 15px;
          background: #f8fafc;
          transition: 0.3s;
          box-sizing: border-box;
   a     }

        .modern-input:focus, .modern-select:focus {
          outline: none;
          border-color: #16a34a;
          background: white;
        }

        .btn-signup {
          width: 100%;
          padding: 16px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.2);
        }

        .footer-link {
          text-align: center;
          margin-top: 25px;
          font-size: 14px;
          color: #94a3b8;
          padding-bottom: 20px;
        }

        .footer-link span {
          color: #16a34a;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <div className="mobile-frame">
        <div className="back-nav" onClick={() => navigate(-1)}>←</div>
        
        <div className="header">
          <h1>Create Account</h1>
        </div>

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="modern-input" type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input className="modern-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
              <label>Phone</label>
              <input className="modern-input" type="tel" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label>City</label>
              <input className="modern-input" type="text" name="city" value={form.city} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <select className="modern-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Buyer">Buyer</option>
              <option value="Farmer">Farmer</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="modern-input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input className="modern-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-signup">Create Account</button>
        </form>

        <div className="footer-link">
          Already have an account? <span onClick={() => navigate("/login")}>Sign In</span>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
