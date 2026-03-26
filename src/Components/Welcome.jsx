import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

        :root {
          --primary: hsl(142, 76%, 36%);
          --primary-dark: hsl(142, 76%, 20%);
          --accent: hsl(45, 93%, 47%);
        }

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
        }

        .hero-section {
          height: 60%;
          position: relative;
          background: url('/assets/welcome_hero.png') center/cover no-repeat;
        }

        .hero-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent 40%, white 100%);
        }

        .content-section {
          height: 40%;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 10;
        }

        .logo-badge {
          background: var(--primary);
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 12px 0;
          line-height: 1.1;
        }

        .title span {
          color: var(--primary);
        }

        .subtitle {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .btn-primary {
          width: 100%;
          padding: 18px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3);
        }

        .btn-primary:active {
          transform: scale(0.98);
        }

        .footer {
          margin-top: auto;
          font-size: 14px;
          color: #94a3b8;
        }

        .btn-text {
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          margin-left: 5px;
        }

        /* Decorative Elements */
        .decoration {
          position: absolute;
          width: 200px;
          height: 200px;
          background: var(--primary);
          filter: blur(80px);
          opacity: 0.1;
          border-radius: 50%;
          bottom: -50px;
          right: -50px;
        }
      `}</style>

      <div className="mobile-frame">
        <div className="hero-section">
          <div className="hero-overlay" />
        </div>

        <div className="content-section">
          <div className="logo-badge">Premium Agri-Tech</div>
          <h1 className="title">Agro<span>Connect</span></h1>
          <p className="subtitle">
            Empowering Nepalese farmers with direct markets and expert guidance.
          </p>

          <button className="btn-primary" onClick={() => navigate("/login")}>
            Enter the Market
          </button>

          <div className="footer">
            New here? <span className="btn-text" onClick={() => navigate("/signup")}>Join Community</span>
          </div>
        </div>
        
        <div className="decoration" />
      </div>
    </>
  );
}
