import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./Components/Welcome";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Components/Dashboard";
import FarmerDashboard from "./Components/FarmerDashboard";
import BuyerDashboard from "./Components/BuyerDashboard";
import ExpertDashboard from "./Components/ExpertDashboard";
import ExplorePage from "./Components/ExplorePage";
import CartPage from "./Components/CartPage";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Role Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/expert-dashboard" element={<ExpertDashboard />} />
        <Route path="/buyer-cart" element={<CartPage />} />
        

        {/* Buyer Explore */}
        <Route path="/buyer-explore" element={<ExplorePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
