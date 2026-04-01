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
import FarmerOrdersPage from "./Components/FarmerOrdersPage";
import AdminDashboard from "./Components/AdminDashboard";
import MyProducts from "./Components/MyProducts";
import ExpertDiseaseReports from "./Components/ExpertDiseaseReports";
import FarmerCalendarPage from "./Components/FarmerCalendarPage";
import Queries from "./Components/Queries";
import KnowledgePage from "./Components/KnowledgePage";
import ArticleForm from "./Components/ArticleForm";
import ArticleDetail from "./Components/ArticleDetail";
import PaymentSuccess from "./Components/PaymentSuccess";
import PaymentFailure from "./Components/PaymentFailure";
import ChatPage from "./Components/ChatPage";
import ExpertChats from "./Components/ExpertChats";








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
        <Route path="/edit-product/:id" element={<AddProduct />} />
        <Route path="/collaboration/:id" element={<CollaborationDetail />} />
        <Route path="/weather-detail" element={<WeatherDetail />} />
        <Route path="/products" element={<FarmerProductPage />} />
        <Route path="/experts" element={<FarmerExpertPage />} />
        <Route path="/farmer-calendar" element={<FarmerCalendarPage />} />
        <Route path="/farmer-orders" element={<FarmerOrdersPage />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/expert-dashboard" element={<ExpertDashboard />} />
        <Route path="/expert-disease-reports" element={<ExpertDiseaseReports />} />
        <Route path="/expert-chats" element={<ExpertChats />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/my-farm" element={<MyProducts />} />
        <Route path="/buyer-cart" element={<CartPage />} />
        <Route path="/queries" element={<Queries />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/write-article" element={<ArticleForm />} />
        <Route path="/edit-article/:id" element={<ArticleForm />} />
        <Route path="/article/:id" element={<ArticleDetail />} />

        <Route path="/buyer-orders" element={<OrdersPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/chat/:type/:id" element={<ChatPage />} />


        {/* Buyer Explore */}
        <Route path="/buyer-explore" element={<ExplorePage />} />

        {/* Role-Specific Profiles */}
        <Route path="/buyer-profile" element={<BuyerProfile />} />
        <Route path="/farmer-profile" element={<FarmerProfile />} />
        <Route path="/expert-profile" element={<ExpertProfile />} />

        {/* Fallback Smart Redirect for the old generic /profile link */}
        <Route path="/profile" element={
          localStorage.getItem("userRole")?.toLowerCase() === "admin"
            ? <Navigate to="/admin-dashboard" />
            : localStorage.getItem("userRole")?.toLowerCase() === "farmer"
              ? <Navigate to="/farmer-profile" />
              : localStorage.getItem("userRole")?.toLowerCase() === "expert"
                ? <Navigate to="/expert-profile" />
                : <Navigate to="/buyer-profile" />
        } />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
