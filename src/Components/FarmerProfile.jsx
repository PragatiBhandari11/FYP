import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Edit3, Lock, LogOut, Check, X, User, Phone, MapPin, Globe, Tractor } from "lucide-react";

export default function FarmerProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile data and states
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Edit form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    city: ""
  });

  // Password form states
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const email = localStorage.getItem("userEmail");

  const fetchUserData = () => {
    if (!email) {
      setError("Please log in to view your profile.");
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/user/${email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user details");
        return res.json();
      })
      .then((data) => {
        setUserData(data);
        setEditForm({
          fullName: data.full_name,
          phone: data.phone || "",
          country: data.country || "",
          city: data.city || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not connect to the server.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...editForm })
      });
      if (response.ok) {
        setIsEditing(false);
        fetchUserData();
        alert("Profile updated successfully! ✨");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("email", email);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/profile-image", {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        fetchUserData();
        alert("Photo uploaded! 📸");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return alert("New passwords do not match!");
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSection(false);
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        body { margin: 0; font-family: 'Outfit', sans-serif; background: #f0fdf4; }
        
        .profile-container { 
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        .profile-header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          padding: 40px 20px 60px;
          text-align: center;
          color: white;
          position: relative;
        }

        .back-btn { 
          position: absolute; top: 20px; left: 20px;
          background: rgba(255,255,255,0.15); border: none; padding: 10px;
          border-radius: 12px; color: white; cursor: pointer; backdrop-filter: blur(8px);
        }

        .avatar-container {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto 15px;
        }

        .avatar { 
          width: 100%; height: 100%; 
          border: 4px solid rgba(255,255,255,0.3);
          border-radius: 50%; object-fit: cover;
          background: #15803d; display: flex; align-items: center; justify-content: center;
          font-size: 40px; font-weight: bold; overflow: hidden;
        }

        .upload-badge {
          position: absolute; bottom: 0; right: 0;
          background: #fff; color: #16a34a; padding: 8px;
          border-radius: 50%; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .upload-badge:active { transform: scale(0.9); }

        .profile-content {
          margin-top: -30px;
          background: #fff;
          border-radius: 32px 32px 0 0;
          padding: 30px 20px;
          flex: 1;
        }

        .farm-status-card { 
          background: #f0fdf4; border-radius: 16px; padding: 16px; margin-bottom: 25px; 
          display: flex; align-items: center; justify-content: space-between; border: 1px solid #dcfce7;
        }
        .status-badge { background: #16a34a; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; }

        .section-title { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;}
        
        .info-card { background: #f8fafc; border-radius: 20px; padding: 8px 16px; margin-bottom: 25px; border: 1px solid #f1f5f9; }
        .info-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f1f5f9; }
        .info-item:last-child { border-bottom: none; }
        .info-icon { background: #fff; padding: 10px; border-radius: 12px; color: #16a34a; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
        .info-text { flex: 1; }
        .info-label { display: block; font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 2px; }
        .info-value { display: block; font-size: 15px; color: #334155; font-weight: 600; }

        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .form-input { 
          width: 100%; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; 
          font-size: 15px; background: #f8fafc; outline: none; transition: 0.2s;
        }
        .form-input:focus { border-color: #16a34a; background: #fff; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1); }

        .btn { 
          width: 100%; padding: 16px; border-radius: 16px; border: none; 
          font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-primary { background: #16a34a; color: white; }
        .btn-outline { background: #fff; border: 2px solid #e2e8f0; color: #64748b; margin-top: 10px; }
        .btn-danger { background: #fef2f2; color: #ef4444; margin-top: 20px; }
        
        .bottom-nav {
          border-top: 1px solid #f1f5f9; display: flex; justify-content: space-around;
          padding: 12px 0 20px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);
        }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; cursor: pointer; }
        .nav-item.active { color: #16a34a; font-weight: 700; }
      `}</style>

      <div className="profile-container">
        {loading && <div style={{position: "absolute", top:0, left:0, right:0, height: "4px", background: "#16a34a", zIndex: 100}} />}

        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate(-1)}><X size={20} /></button>
          <div className="avatar-container">
            <div className="avatar">
              {userData?.profile_image ? (
                <img src={`http://localhost:5000${userData.profile_image}`} alt="Profile" style={{width: "100%", height: "100%", objectFit: "cover"}} />
              ) : (
                userData?.full_name?.charAt(0).toUpperCase()
              )}
            </div>
            <label className="upload-badge" htmlFor="photo-upload">
              <Camera size={20} />
              <input 
                id="photo-upload" 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                ref={fileInputRef}
              />
            </label>
          </div>
          <h2 style={{margin: 0, fontSize: "24px"}}>{userData?.full_name}</h2>
          <p style={{margin: "4px 0 0", opacity: 0.8, fontSize: "14px"}}>Verified Farmer</p>
        </div>

        <div className="profile-content">
          {!isEditing ? (
            <div style={{animation: "fadeIn 0.4s ease-out"}}>
              <div className="farm-status-card">
                 <div>
                   <div style={{fontWeight: "800", fontSize: "14px", color: "#166534"}}>Farm Status</div>
                   <div style={{fontSize: "12px", color: "#15803d", marginTop: "2px"}}>Active & Verified Member</div>
                 </div>
                 <div className="status-badge">ACTIVE</div>
              </div>

              <div className="section-title">
                Personal Details 
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{background: "none", border: "none", color: "#16a34a", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"}}
                >
                  <Edit3 size={16} /> Edit
                </button>
              </div>
              <div className="info-card">
                <div className="info-item">
                  <div className="info-icon"><User size={20} /></div>
                  <div className="info-text">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{userData?.full_name}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Phone size={20} /></div>
                  <div className="info-text">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{userData?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><MapPin size={20} /></div>
                  <div className="info-text">
                    <span className="info-label">City</span>
                    <span className="info-value">{userData?.city || "Not provided"}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Globe size={20} /></div>
                  <div className="info-text">
                    <span className="info-label">Country</span>
                    <span className="info-value">{userData?.country || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="section-title">Security</div>
              <button className="btn btn-outline" onClick={() => setShowPasswordSection(!showPasswordSection)}>
                <Lock size={18} /> {showPasswordSection ? "Cancel Password Change" : "Change Password"}
              </button>

              {showPasswordSection && (
                <form onSubmit={handleChangePassword} style={{marginTop: "16px", animation: "fadeIn 0.3s ease-out"}}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" required value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" required value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" required value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    Update Password
                  </button>
                </form>
              )}

              <button className="btn btn-danger" onClick={handleLogout}>
                <LogOut size={18} /> Logout Securely
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} style={{animation: "fadeIn 0.4s ease-out"}}>
              <div className="section-title">Update Information</div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} />
              </div>
              
              <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
                <button className="btn btn-outline" type="button" style={{flex: 1}} onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" style={{flex: 2}} disabled={loading}>
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/farmer-dashboard")}><span>🏠</span><span>Home</span></div>
          <div className="nav-item" onClick={() => navigate("/products")}><span>🌱</span><span>Products</span></div>
          <div className="nav-item" onClick={() => navigate("/experts")}><span>👥</span><span>Experts</span></div>
          <div className="nav-item" onClick={() => navigate("/farmer-calendar")}><span>📅</span><span>Calendar</span></div>
          <div className="nav-item active"><span>👤</span><span>Profile</span></div>
        </div>
      </div>
    </>
  );
}
