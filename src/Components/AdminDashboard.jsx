import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  LogOut,
  ShieldCheck,
  Search,
  PlusCircle,
  Trash2,
  Building2,
  CheckCircle,
  UserX
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [collabs, setCollabs] = useState([]);
  const [newCollab, setNewCollab] = useState({
    name: "",
    type: "Hotel",
    description: "",
    location: "",
    contact: "",
    image: null
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Check if actually admin
    const role = localStorage.getItem("userRole");
    if (role !== "Admin") {
      navigate("/login");
      return;
    }

    // Fetch dashboard stats (Mocking for now, could be real API calls)
    // Fetch Total Users
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, totalUsers: data.length })))
      .catch(err => console.error("Users fetch error:", err));

    // Fetch Total Products
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, totalProducts: data.length })))
      .catch(err => console.error("Products fetch error:", err));

    // Fetch Total Orders
    fetch("http://localhost:5000/api/orders")
        .then(res => res.json())
        .then(data => {
            setStats(prev => ({ ...prev, totalOrders: data.length }));
            const total = data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            setStats(prev => ({ ...prev, totalEarnings: total }));
        })
        .catch(err => console.error("Orders fetch error:", err));

    fetchCollabs();
    fetchUsers();
  }, [navigate]);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Users fetch error:", err));
  };

  const approveUser = (id) => {
    fetch(`http://localhost:5000/api/admin/users/${id}/approve`, { method: "PUT" })
      .then(() => fetchUsers());
  };

  const deleteUser = (id) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      fetch(`http://localhost:5000/api/admin/users/${id}`, { method: "DELETE" })
        .then(() => fetchUsers());
    }
  };

  const fetchCollabs = () => {
    fetch("http://localhost:5000/api/collaborations")
      .then(res => res.json())
      .then(data => setCollabs(data))
      .catch(err => console.error("Collabs fetch error:", err));
  };

  const handleCollabSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newCollab.name);
    formData.append("type", newCollab.type);
    formData.append("description", newCollab.description);
    formData.append("location", newCollab.location);
    formData.append("contact", newCollab.contact);
    if (newCollab.image) formData.append("image", newCollab.image);

    fetch("http://localhost:5000/api/collaborations", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        fetchCollabs();
        setNewCollab({ name: "", type: "Hotel", description: "", location: "", contact: "", image: null });
        alert("Collaboration added successfully!");
      });
  };

  const deleteCollab = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      fetch(`http://localhost:5000/api/collaborations/${id}`, { method: "DELETE" })
        .then(() => fetchCollabs());
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: #1e293b;
          color: white;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          font-size: 20px;
          font-weight: bold;
          color: #10b981;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
          color: #94a3b8;
        }

        .nav-item:hover, .nav-item.active {
          background: #334155;
          color: white;
        }

        .logout {
          margin-top: auto;
          color: #ef4444;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .search-bar {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 300px;
        }

        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 28px;
          color: #1e293b;
        }

        .stat-info p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .stat-icon {
          padding: 12px;
          border-radius: 12px;
          background: #f0fdf4;
          color: #10b981;
        }

        .stat-icon.blue { background: #eff6ff; color: #3b82f6; }
        .stat-icon.yellow { background: #fffbeb; color: #f59e0b; }
        .stat-icon.purple { background: #faf5ff; color: #8b5cf6; }

        /* Tables */
        .dashboard-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 12px;
          color: #64748b;
          font-size: 13px;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #334155;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge.active { background: #dcfce7; color: #16a34a; }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <ShieldCheck size={32} />
          AgroAdmin
        </div>
        
        <nav>
          <div className={`nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <TrendingUp size={20} /> Overview
          </div>
          <div className={`nav-item ${activeTab === "collabs" ? "active" : ""}`} onClick={() => setActiveTab("collabs")}>
            <Building2 size={20} /> Collaborations
          </div>
          <div className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            <Users size={20} /> User Management
          </div>
          <div className="nav-item">
            <Package size={20} /> Inventory
          </div>
          <div className="nav-item">
            <ShoppingBag size={20} /> All Orders
          </div>
          <div className="nav-item">
            <Settings size={20} /> System Settings
          </div>
        </nav>

        <div className="nav-item logout" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Dashboard Overview</h1>
          <div className="search-bar">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search system logs..." />
          </div>
        </header>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-icon"> <Users size={24} /> </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
                <div className="stat-icon blue"> <Package size={24} /> </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Active Orders</p>
                </div>
                <div className="stat-icon yellow"> <ShoppingBag size={24} /> </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <h3>Rs {stats.totalEarnings.toLocaleString()}</h3>
                  <p>System Revenue</p>
                </div>
                <div className="stat-icon purple"> <TrendingUp size={24} /> </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>System Alerts</h2>
                <AlertTriangle size={20} color="#f59e0b" />
              </div>
              <p style={{color: '#64748b', fontSize: '14px'}}>
                System is running stable. No critical errors detected in the last 24 hours.
              </p>
            </section>
          </>
        ) : activeTab === "collabs" ? (
          <div className="collab-management">
            <section className="dashboard-section" style={{marginBottom: '24px'}}>
              <h2>Add New Collaboration</h2>
              <form onSubmit={handleCollabSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px'}}>
                <input type="text" placeholder="Name" value={newCollab.name} onChange={e => setNewCollab({...newCollab, name: e.target.value})} required style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}/>
                <select value={newCollab.type} onChange={e => setNewCollab({...newCollab, type: e.target.value})} style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}>
                  <option value="Hotel">Hotel</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Other">Other</option>
                </select>
                <input type="text" placeholder="Location" value={newCollab.location} onChange={e => setNewCollab({...newCollab, location: e.target.value})} required style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}/>
                <input type="text" placeholder="Contact" value={newCollab.contact} onChange={e => setNewCollab({...newCollab, contact: e.target.value})} required style={{padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}/>
                <textarea placeholder="Description" value={newCollab.description} onChange={e => setNewCollab({...newCollab, description: e.target.value})} style={{gridColumn: 'span 2', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', height: '80px'}}/>
                <input type="file" onChange={e => setNewCollab({...newCollab, image: e.target.files[0]})} style={{gridColumn: 'span 2'}}/>
                <button type="submit" style={{gridColumn: 'span 2', background: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                  Add Partner
                </button>
              </form>
            </section>

            <section className="dashboard-section">
              <h2>Existing Partnerships</h2>
              <div style={{marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px'}}>
                {collabs.map(c => (
                  <div key={c.id} style={{border: '1px solid #f1f5f9', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h4 style={{margin: 0}}>{c.name}</h4>
                      <p style={{margin: '4px 0', fontSize: '12px', color: '#64748b'}}>{c.type} • {c.location}</p>
                    </div>
                    <button onClick={() => deleteCollab(c.id)} style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer'}}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : activeTab === "users" ? (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>User Approvals</h2>
              <Users size={20} color="#10b981" />
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge active" style={{background: '#f1f5f9', color: '#475569'}}>{u.role}</span></td>
                    <td>
                      {u.is_approved ? 
                        <span className="badge active">Approved</span> : 
                        <span className="badge" style={{background: '#fef3c7', color: '#d97706'}}>Pending</span>
                      }
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        {!u.is_approved && (
                          <button onClick={() => approveUser(u.id)} style={{background: '#dcfce7', color: '#16a34a', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer'}}>
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteUser(u.id)} style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer'}}>
                          <UserX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </main>
    </div>
  );
}
