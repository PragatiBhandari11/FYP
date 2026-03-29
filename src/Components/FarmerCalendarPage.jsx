import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerCalendarPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Global"); // "Global" or "MyFarm"
  const [globalCrops, setGlobalCrops] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newTask, setNewTask] = useState({ name: "", date: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };


  const farmerEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchGlobalCrops();
    if (farmerEmail) fetchActivities();
  }, [farmerEmail]);

  const fetchGlobalCrops = () => {
    fetch("http://localhost:5000/api/calendar/crops")
      .then(res => res.json())
      .then(data => setGlobalCrops(data))
      .catch(err => console.error(err));
  };

  const fetchActivities = () => {
    fetch(`http://localhost:5000/api/calendar/activities/${farmerEmail}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!farmerEmail) return showToast("Please login.", "error");
    try {
      const res = await fetch("http://localhost:5000/api/calendar/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_email: farmerEmail,
          task_name: newTask.name,
          task_date: newTask.date,
          notes: newTask.notes
        }),
      });
      if (res.ok) {
        showToast("Task added! 📅");
        setNewTask({ name: "", date: "", notes: "" });
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to add task.", "error");
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
      const res = await fetch(`http://localhost:5000/api/calendar/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Remove this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/calendar/activities/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Task deleted.");
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete task.", "error");
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
        body { margin: 0; background: #e5f2e5; display: flex; justify-content: center; min-height: 100vh; padding: 20px; }
        .app-container {
          width: 390px;
          background: #f2fbf6;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .content-scroll {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #16a34a; font-weight: bold; padding: 0; }
        .title { margin: 0; font-size: 22px; color: #111; text-align: center; flex: 1; }
        
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; text-align: center; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; background: #eee; color: #666; }
        .tab.active { background: #16a34a; color: white; }

        /* Global Calendar Styles */
        .crop-card { background: white; padding: 12px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border-left: 4px solid #16a34a; }
        .crop-type { font-size: 11px; text-transform: uppercase; color: #16a34a; font-weight: bold; }
        .crop-name { font-size: 16px; font-weight: bold; margin: 4px 0; color: #333; }
        .season-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px; }
        .seasonal { background: #dcfce7; color: #15803d; }
        .off-seasonal { background: #fef3c7; color: #b45309; }
        .months { font-size: 13px; color: #666; font-style: italic; }

        /* My Farm Styles */
        .task-form { background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px dashed #16a34a; }
        .task-form input, .task-form textarea { width: 100%; margin-bottom: 10px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-size: 14px; }
        .add-task-btn { width: 100%; padding: 12px; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        
        .task-card { background: white; padding: 12px; border-radius: 12px; margin-bottom: 10px; display: flex; gap: 12px; align-items: flex-start; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .task-checkbox { width: 20px; height: 20px; margin-top: 3px; cursor: pointer; accent-color: #16a34a; }
        .task-info { flex: 1; }
        .task-title { margin: 0; font-size: 15px; font-weight: bold; color: #333; }
        .task-title.completed { text-decoration: line-through; color: #999; }
        .task-meta { font-size: 12px; color: #666; margin-top: 2px; }
        .delete-btn { color: #f43f5e; background: none; border: none; cursor: pointer; padding: 4px; font-size: 14px; }

        .bottom-nav { display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #e5e7eb; background: #fff; margin-top: auto; }
        .bottom-nav span { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; cursor: pointer; }
        .bottom-nav .active { color: #16a34a; }

        .toast-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          width: 90%;
          max-width: 320px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;
        }

        .toast-success { color: #16a34a; border-left: 4px solid #16a34a; }
        .toast-error { color: #ef4444; border-left: 4px solid #ef4444; }

        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="app-container">
        <div className="content-scroll">
          <div className="header">
            <button className="back-btn" onClick={() => navigate("/farmer-dashboard")}>←</button>
            <h2 className="title">Agro Calendar</h2>
            <div style={{width: 24}}></div>
          </div>

          <div className="tabs">
            <div className={`tab ${activeTab === "Global" ? "active" : ""}`} onClick={() => setActiveTab("Global")}>Crop Guide</div>
            <div className={`tab ${activeTab === "MyFarm" ? "active" : ""}`} onClick={() => setActiveTab("MyFarm")}>My Tasks</div>
          </div>

          {activeTab === "Global" ? (
            <div className="global-list">
              <p style={{fontSize: "13px", color: "#666", marginBottom: "15px"}}>Seasons and timelines for regional crops.</p>
              {globalCrops.length === 0 ? <p style={{textAlign: "center", padding: "20px", color: "#999"}}>No data available.</p> : globalCrops.map(crop => (
                <div key={crop.id} className="crop-card">
                  <div className="crop-type">{crop.crop_type}</div>
                  <h4 className="crop-name">{crop.crop_name}</h4>
                  <span className={`season-badge ${crop.season_type === 'Seasonal' ? 'seasonal' : 'off-seasonal'}`}>
                    {crop.season_type}
                  </span>
                  <div className="months">📅 {crop.best_months}</div>
                  {crop.description && <p style={{fontSize: "12px", color: "#555", marginTop: "8px"}}>{crop.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="my-farm">
              <form className="task-form" onSubmit={handleAddTask}>
                <h4 style={{margin: "0 0 10px 0", color: "#16a34a"}}>Track Farm Work</h4>
                <input type="text" placeholder="Task Name (e.g., Watering Spinach)" required value={newTask.name} onChange={(e) => setNewTask({...newTask, name: e.target.value})} />
                <input type="date" required value={newTask.date} onChange={(e) => setNewTask({...newTask, date: e.target.value})} />
                <textarea placeholder="Notes (optional)..." rows="2" value={newTask.notes} onChange={(e) => setNewTask({...newTask, notes: e.target.value})} />
                <button type="submit" className="add-task-btn">Add to Calendar</button>
              </form>

              <div className="task-list">
                <h4 style={{margin: "0 0 12px 0", color: "#333"}}>Upcoming Activities</h4>
                {activities.length === 0 ? <p style={{textAlign: "center", padding: "20px", color: "#999"}}>No tasks added yet.</p> : activities.map(task => (
                  <div key={task.id} className="task-card">
                    <input type="checkbox" className="task-checkbox" checked={task.status === "Completed"} onChange={() => toggleTaskStatus(task.id, task.status)} />
                    <div className="task-info">
                      <h4 className={`task-title ${task.status === "Completed" ? "completed" : ""}`}>{task.task_name}</h4>
                      <div className="task-meta">📅 {new Date(task.task_date).toLocaleDateString()}</div>
                      {task.notes && <p style={{fontSize: "12px", color: "#777", margin: "4px 0 0 0"}}>{task.notes}</p>}
                    </div>
                    <button className="delete-btn" onClick={() => deleteTask(task.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bottom-nav">
          <span onClick={() => navigate("/farmer-dashboard")}>
            <div className="icon">🏠</div>Home
          </span>
          <span onClick={() => navigate("/products")}>
            <div className="icon">🌱</div>Products
          </span>
          <span onClick={() => navigate("/experts")}>
            <div className="icon">👥</div>Experts
          </span>
          <span className="active">
            <div className="icon">📅</div>Calendar
          </span>
          <span onClick={() => navigate("/profile")}>
            <div className="icon">👤</div>Profile
          </span>
        </div>

        {toast.show && (
          <div className="toast-container">
            <div className={`toast-content toast-${toast.type}`}>
              <span>{toast.type === "success" ? "✅" : "❌"}</span>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
