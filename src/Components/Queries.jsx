import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

const queriesData = [
  {
    id: 1,
    category: "DISEASE",
    priority: "HIGH PRIORITY",
    time: "2h ago",
    title: "Yellow spots appearing on tomato leaves rapidly spreading. Is this early blight? Photos attached.",
    user: "Rajesh Kumar",
    location: "Karnataka",
  },
  {
    id: 2,
    category: "SOIL HEALTH",
    time: "5h ago",
    title: "Recommended fertilizer schedule for cotton in black soil region for upcoming season?",
    user: "Amit Singh",
    location: "Maharashtra",
  },
  {
    id: 3,
    category: "CROP CARE",
    time: "1d ago",
    title: "Wheat leaves turning brown at the tips. Watering schedule has been normal. Please advise.",
    user: "Suresh",
    location: "Punjab",
  },
  {
    id: 4,
    category: "GENERAL",
    time: "2d ago",
    title: "Best organic pesticide for brinjal shoot borer available in local markets?",
    user: "Vikram",
    location: "Gujarat",
  },
];

const categoriesColors = {
  DISEASE: "#f87171", // red
  "HIGH PRIORITY": "#fca5a5", // pink
  "SOIL HEALTH": "#d1fae5", // greenish
  "CROP CARE": "#fef3c7", // yellowish
  GENERAL: "#bfdbfe", // blueish
};

function Queries() {
  return (
    <div className="container">
      <h2 className="header">Farmer Queries</h2>
      <input
        type="search"
        placeholder="Search queries, crops, or diseases..."
        className="search"
      />
      <div className="filters">
        <button className="filter active">All</button>
        <button className="filter">Pending</button>
        <button className="filter">Urgent</button>
        <button className="filter">Resolved</button>
      </div>
      <div className="queries-list">
        {queriesData.map((q) => (
          <div key={q.id} className="query-card">
            <div className="category-row">
              <span
                className="category disease"
                style={{ backgroundColor: categoriesColors[q.category] || "#ddd" }}
              >
                {q.category}
              </span>
              {q.priority && (
                <span
                  className="category high-priority"
                  style={{ backgroundColor: categoriesColors["HIGH PRIORITY"] }}
                >
                  {q.priority}
                </span>
              )}
              <span className="time">{q.time}</span>
            </div>
            <p className="title">{q.title}</p>
            <p className="user">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="14"
                width="14"
                fill="#6b7280"
                viewBox="0 0 24 24"
                style={{ marginRight: 6 }}
              >
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
              {q.user} • {q.location}
            </p>
            <div className="actions">
              <button className="btn ignore">Ignore</button>
              <button className="btn reply">Reply</button>
            </div>
          </div>
        ))}
      </div>
      <nav className="nav-bar">
        <Link to="/" className="nav-link">
          <div className="nav-icon">🏠</div>
          Dashboard
        </Link>
        <Link to="/queries" className="nav-link active">
          <div className="nav-icon">❓</div>
          Queries
        </Link>
        <Link to="/knowledge" className="nav-link">
          <div className="nav-icon">📚</div>
          Knowledge
        </Link>
        <Link to="/profile" className="nav-link">
          <div className="nav-icon">👤</div>
          Profile
        </Link>
      </nav>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Welcome to Dashboard page.</p>
      <Nav />
    </div>
  );
}

function Knowledge() {
  return (
    <div className="container">
      <h2>Knowledge</h2>
      <p>Here is some knowledge content.</p>
      <Nav />
    </div>
  );
}

function Profile() {
  return (
    <div className="container">
      <h2>Profile</h2>
      <p>Your profile details go here.</p>
      <Nav />
    </div>
  );
}

function Nav() {
  return (
    <nav className="nav-bar">
      <Link to="/" className="nav-link">
        <div className="nav-icon">🏠</div>
        Dashboard
      </Link>
      <Link to="/queries" className="nav-link">
        <div className="nav-icon">❓</div>
        Queries
      </Link>
      <Link to="/knowledge" className="nav-link">
        <div className="nav-icon">📚</div>
        Knowledge
      </Link>
      <Link to="/profile" className="nav-link">
        <div className="nav-icon">👤</div>
        Profile
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/queries" element={<Queries />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
