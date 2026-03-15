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
import OrdersPage from "./Components/OrdersPage";
import BuyerProfile from "./Components/BuyerProfile";
import FarmerProfile from "./Components/FarmerProfile";
import AddProduct from "./Components/AddProduct";
import CollaborationDetail from "./Components/CollaborationDetail";
import WeatherDetail from "./Components/WeatherDetail";
import ExpertProfile from "./Components/ExpertProfile";
import FarmerProductPage from "./Components/FarmerProductPage";
import FarmerExpertPage from "./Components/FarmerExpertPage";







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
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/collaboration/:id" element={<CollaborationDetail />} />
        <Route path="/weather-detail" element={<WeatherDetail />} />
        <Route path="/products" element={<FarmerProductPage />} />
        <Route path="/experts" element={<FarmerExpertPage />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/expert-dashboard" element={<ExpertDashboard />} />
        <Route path="/buyer-cart" element={<CartPage />} />
        <Route path="/buyer-orders" element={<OrdersPage />} />


        {/* Buyer Explore */}
        <Route path="/buyer-explore" element={<ExplorePage />} />

        {/* Role-Specific Profiles */}
        <Route path="/buyer-profile" element={<BuyerProfile />} />
        <Route path="/farmer-profile" element={<FarmerProfile />} />
        <Route path="/expert-profile" element={<ExpertProfile />} />

        {/* Fallback Smart Redirect for the old generic /profile link */}
        <Route path="/profile" element={
          localStorage.getItem("userRole")?.toLowerCase() === "farmer"
            ? <Navigate to="/farmer-profile" />
            : <Navigate to="/buyer-profile" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
