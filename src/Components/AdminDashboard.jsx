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
  UserX,
  Home,
  Menu,
  X,
  ChevronRight,
  RefreshCcw,
  Calendar,
  Handshake
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [cropCalendar, setCropCalendar] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New crop form
  const [newCrop, setNewCrop] = useState({
    crop_name: "",
    crop_type: "Vegetable",
    season_type: "Seasonal",
    best_months: "",
    description: ""
  });

  // New collab form
  const [newCollab, setNewCollab] = useState({
    name: "",
    type: "Hotel",
    description: "",
    location: "",
    contact: "",
    image: null
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role?.toLowerCase() !== "admin") {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch stats
      const [usersRes, productsRes, ordersRes, collabsRes, calendarRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users").then(r => r.json()),
        fetch("http://localhost:5000/api/admin/products").then(r => r.json()),
        fetch("http://localhost:5000/api/admin/orders").then(r => r.json()),
        fetch("http://localhost:5000/api/collaborations").then(r => r.json()),
        fetch("http://localhost:5000/api/calendar/crops").then(r => r.json())
      ]);

      setUsers(usersRes || []);
      setProducts(productsRes || []);
      setOrders(ordersRes || []);
      setCollabs(collabsRes || []);
      setCropCalendar(calendarRes || []);

      const earnings = (ordersRes || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      setStats({
        totalUsers: (usersRes || []).length,
        totalProducts: (productsRes || []).length,
        totalOrders: (ordersRes || []).length,
        totalEarnings: earnings
      });
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Actions
  const approveUser = (id) => {
    fetch(`http://localhost:5000/api/admin/users/${id}/approve`, { method: "PUT" })
      .then(() => fetchAllData());
  };

  const deleteUser = (id) => {
    if (window.confirm("Remove this user?")) {
      fetch(`http://localhost:5000/api/admin/users/${id}`, { method: "DELETE" })
        .then(() => fetchAllData());
    }
  };

  const deleteProduct = (id) => {
    if (window.confirm("Delete this product from inventory?")) {
      fetch(`http://localhost:5000/api/admin/products/${id}`, { method: "DELETE" })
        .then(() => fetchAllData());
    }
  };

  const deleteCollab = (id) => {
    if (window.confirm("Remove partnership?")) {
      fetch(`http://localhost:5000/api/collaborations/${id}`, { method: "DELETE" })
        .then(() => fetchAllData());
    }
  };

  const updateOrderStatus = (id, status) => {
    fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then(() => fetchAllData());
  };

  const handleCollabSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newCollab).forEach(key => {
      if (newCollab[key]) formData.append(key, newCollab[key]);
    });

    fetch("http://localhost:5000/api/collaborations", { method: "POST", body: formData })
      .then(() => {
        fetchAllData();
        setNewCollab({ name: "", type: "Hotel", description: "", location: "", contact: "", image: null });
        alert("Partner added!");
      });
  };

  const handleCropSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/calendar/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCrop)
    }).then(() => {
      fetchAllData();
      setNewCrop({ crop_name: "", crop_type: "Vegetable", season_type: "Seasonal", best_months: "", description: "" });
      alert("Crop added to calendar!");
    });
  };

  const deleteCrop = (id) => {
    if (window.confirm("Remove this crop from calendar?")) {
      fetch(`http://localhost:5000/api/calendar/crops/${id}`, { method: "DELETE" })
        .then(() => fetchAllData());
    }
  };

  return (
    <div className="mobile-admin">
      <style>{`
        .mobile-admin {
          width: 390px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          position: relative;
          box-shadow: 0 0 40px rgba(0,0,0,0.1);
          padding-bottom: 80px; /* Space for bottom nav */
        }

        .admin-header {
          background: #1e293b;
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-header h1 {
          font-size: 20px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .refresh-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
        }

        .content-area {
          padding: 16px;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-card .label {
          font-size: 12px;
          color: #64748b;
        }

        .stat-card .value {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-card .icon-box {
          align-self: flex-end;
          padding: 6px;
          border-radius: 8px;
          margin-top: -24px;
        }

        /* List Items */
        .list-card {
          background: white;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-info h4 { margin: 0; font-size: 15px; }
        .list-info p { margin: 2px 0 0; font-size: 12px; color: #64748b; }

        .btn-group { display: flex; gap: 8px; }
        .btn-icon {
          padding: 8px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        /* Bottom Nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 390px;
          background: white;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #e2e8f0;
          z-index: 100;
        }

        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
          font-size: 11px;
          cursor: pointer;
          transition: 0.2s;
        }

        .nav-link.active {
          color: #10b981;
        }

        /* Badge */
        .status-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .pending { background: #fef3c7; color: #d97706; }
        .approved { background: #dcfce7; color: #16a34a; }

        .empty-state {
          text-align: center;
          color: #94a3b8;
          padding: 40px 20px;
        }

        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 10px;
          font-size: 14px;
        }
      `}</style>

      <header className="admin-header">
        <h1><ShieldCheck size={24} color="#10b981" /> AgroAdmin</h1>
        <button className="refresh-btn" onClick={fetchAllData} disabled={isRefreshing}>
          <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="content-area">
        {activeTab === "overview" && (
          <div className="tab-content">
            <h2 style={{fontSize: '18px', marginBottom: '16px'}}>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("users")} style={{cursor: 'pointer'}}>
                <span className="label">Total Users</span>
                <span className="value">{stats.totalUsers}</span>
                <div className="icon-box" style={{background: '#eff6ff', color: '#3b82f6'}}><Users size={18} /></div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("inventory")} style={{cursor: 'pointer'}}>
                <span className="label">Inventory</span>
                <span className="value">{stats.totalProducts}</span>
                <div className="icon-box" style={{background: '#f0fdf4', color: '#10b981'}}><Package size={18} /></div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("orders")} style={{cursor: 'pointer'}}>
                <span className="label">Total Orders</span>
                <span className="value">{stats.totalOrders}</span>
                <div className="icon-box" style={{background: '#fffbeb', color: '#f59e0b'}}><ShoppingBag size={18} /></div>
              </div>
              <div className="stat-card">
                <span className="label">Revenue</span>
                <span className="value">Rs {stats.totalEarnings.toLocaleString()}</span>
                <div className="icon-box" style={{background: '#faf5ff', color: '#8b5cf6'}}><TrendingUp size={18} /></div>
              </div>
            </div>

            <section style={{marginTop: '24px'}}>
              <h3 style={{fontSize: '16px', marginBottom: '12px'}}>Critical Alerts</h3>
              <div className="list-card" style={{borderLeft: '4px solid #f59e0b'}}>
                <div className="list-info">
                  <h4>{users.filter(u => !u.is_approved).length} Pending Approvals</h4>
                  <p>New Farmers/Experts awaiting review</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <div className="tab-content">
            <h2 style={{fontSize: '18px', marginBottom: '16px'}}>Users & Approvals</h2>
            {users.length === 0 ? <div className="empty-state">No users in registry</div> : 
              users.map(u => (
                <div className="list-card" key={u.id}>
                  <div className="list-info">
                    <h4>{u.full_name} <span className={`status-badge ${u.is_approved ? 'approved' : 'pending'}`}>{u.is_approved ? 'Approved' : 'Pending'}</span></h4>
                    <p>{u.role} • {u.email}</p>
                  </div>
                  <div className="btn-group">
                    {!u.is_approved && (
                      <button className="btn-icon" style={{background: '#dcfce7', color: '#16a34a'}} onClick={() => approveUser(u.id)}><CheckCircle size={18} /></button>
                    )}
                    <button className="btn-icon" style={{background: '#fee2e2', color: '#ef4444'}} onClick={() => deleteUser(u.id)}><UserX size={18} /></button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="tab-content">
            <h2 style={{fontSize: '18px', marginBottom: '16px'}}>Global Inventory</h2>
            {products.length === 0 ? <div className="empty-state">Store is empty</div> : 
              products.map(p => (
                <div className="list-card" key={p.id}>
                  <div className="list-info" style={{maxWidth: '240px'}}>
                    <h4>{p.name}</h4>
                    <p>Rs {p.price} • Stock: {p.quantity} • {p.category}</p>
                    <p style={{fontSize: '10px', color: '#94a3b8'}}>Farmer: {p.farmer_name || p.farmer_id}</p>
                  </div>
                  <button className="btn-icon" style={{background: '#fee2e2', color: '#ef4444'}} onClick={() => deleteProduct(p.id)}><Trash2 size={18} /></button>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "orders" && (
          <div className="tab-content">
            <h2 style={{fontSize: '18px', marginBottom: '16px'}}>All System Orders</h2>
            {orders.length === 0 ? <div className="empty-state">No orders yet</div> : 
              orders.map(o => (
                <div className="list-card" key={o.id} style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px'}}>
                    <div className="list-info">
                      <h4>{o.order_number}</h4>
                      <p>Buyer: {o.buyer_name || o.buyer_email}</p>
                      <p>Total: Rs {o.total_amount}</p>
                    </div>
                    <select 
                      value={o.status} 
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      style={{width: 'auto', padding: '4px', fontSize: '11px', margin: 0}}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "collabs" && (
          <div className="tab-content">
             <section style={{marginBottom: '32px'}}>
                <h2 style={{fontSize: '18px', marginBottom: '16px'}}>Partnerships</h2>
                <div style={{background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px'}}>
                  <h3 style={{fontSize: '14px', marginTop: 0}}>Add New Partner</h3>
                  <form onSubmit={handleCollabSubmit}>
                    <input type="text" placeholder="Partner Name" value={newCollab.name} onChange={e => setNewCollab({...newCollab, name: e.target.value})} required />
                    <select value={newCollab.type} onChange={e => setNewCollab({...newCollab, type: e.target.value})}>
                      <option value="Hotel">Hotel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Other">Other</option>
                    </select>
                    <input type="text" placeholder="Location" value={newCollab.location} onChange={e => setNewCollab({...newCollab, location: e.target.value})} required />
                    <button type="submit" style={{width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Add Partner</button>
                  </form>
                </div>
                {collabs.map(c => (
                  <div className="list-card" key={c.id}>
                    <div className="list-info">
                      <h4>{c.name}</h4>
                      <p>{c.type} • {c.location}</p>
                    </div>
                    <button className="btn-icon" style={{background: '#fee2e2', color: '#ef4444'}} onClick={() => deleteCollab(c.id)}><Trash2 size={18} /></button>
                  </div>
                ))}
             </section>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="tab-content">
             <section style={{marginBottom: '32px'}}>
                <h2 style={{fontSize: '18px', marginBottom: '16px'}}>Crop Calendar</h2>
                <div style={{background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px'}}>
                  <h3 style={{fontSize: '14px', marginTop: 0}}>Add Seasonal Guide</h3>
                  <form onSubmit={handleCropSubmit}>
                    <input type="text" placeholder="Crop (e.g. Rice)" value={newCrop.crop_name} onChange={e => setNewCrop({...newCrop, crop_name: e.target.value})} required />
                    <div style={{display: 'flex', gap: '8px'}}>
                      <select value={newCrop.crop_type} onChange={e => setNewCrop({...newCrop, crop_type: e.target.value})}>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Fruit">Fruit</option>
                      </select>
                      <select value={newCrop.season_type} onChange={e => setNewCrop({...newCrop, season_type: e.target.value})}>
                        <option value="Seasonal">Seasonal</option>
                        <option value="Off-seasonal">Off-seasonal</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Months (e.g. June - Oct)" value={newCrop.best_months} onChange={e => setNewCrop({...newCrop, best_months: e.target.value})} />
                    <button type="submit" style={{width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Add Timeline</button>
                  </form>
                </div>

                {cropCalendar.map(crop => (
                  <div className="list-card" key={crop.id}>
                    <div className="list-info">
                      <h4>{crop.crop_name}</h4>
                      <p>{crop.crop_type} • {crop.season_type} ({crop.best_months})</p>
                    </div>
                    <button className="btn-icon" style={{background: '#fee2e2', color: '#ef4444'}} onClick={() => deleteCrop(crop.id)}><Trash2 size={18} /></button>
                  </div>
                ))}
             </section>
          </div>
        )}

        {activeTab === "more" && (
          <div className="tab-content">
             <section>
                <h2 style={{fontSize: '18px', marginBottom: '16px'}}>System Settings</h2>
                <div className="list-card" onClick={handleLogout} style={{cursor: 'pointer', background: '#fff1f2', border: '1px solid #fecaca'}}>
                  <div className="list-info">
                    <h4 style={{color: '#be123c'}}>Log Out</h4>
                    <p style={{color: '#e11d48'}}>Safely end current session</p>
                  </div>
                  <LogOut size={18} color="#be123c" />
                </div>
             </section>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <div className={`nav-link ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          <Home size={22} />
          <span>General</span>
        </div>
        <div className={`nav-link ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          <Users size={22} />
          <span>Users</span>
        </div>
        <div className={`nav-link ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>
          <Calendar size={22} />
          <span>Calendar</span>
        </div>
        <div className={`nav-link ${activeTab === "collabs" ? "active" : ""}`} onClick={() => setActiveTab("collabs")}>
          <Handshake size={22} />
          <span>Collab</span>
        </div>
        <div className={`nav-link ${activeTab === "more" ? "active" : ""}`} onClick={() => setActiveTab("more")}>
          <Settings size={22} />
          <span>More</span>
        </div>
      </nav>
    </div>
  );
}
