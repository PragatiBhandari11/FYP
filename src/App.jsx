import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./Components/Welcome";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/expert-dashboard" element={<ExpertDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
