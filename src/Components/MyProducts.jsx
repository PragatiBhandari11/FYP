import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyProducts() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Segoe UI", Arial, sans-serif;
        }

        body {
          margin: 0;
          background: #eef7f2;
        }

        .page {
          max-width: 390px;
          margin: auto;
          background: #f6fcf9;
          min-height: 100vh;
          padding-bottom: 90px;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }

        .header h3 {
          margin: 0;
          font-size: 18px;
          color: #1b5e20;
        }

        .bell {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        /* Search */
        .search {
          padding: 0 16px;
        }

        .search input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          outline: none;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        /* Filters */
        .filters {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          overflow-x: auto;
        }

        .filter {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
          border: 1px solid #c8e6c9;
          color: #2e7d32;
          background: white;
        }

        .filter.active {
          background: #2e7d32;
          color: white;
        }

        /* Product Card */
        .product {
          background: white;
          margin: 10px 16px;
          padding: 10px;
          border-radius: 16px;
          display: flex;
          gap: 10px;
          align-items: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .product img {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          object-fit: cover;
        }

        .product-info {
          flex: 1;
        }

        .product-info h4 {
          margin: 0;
          font-size: 14px;
        }

        .price {
          font-size: 13px;
          color: #2e7d32;
          font-weight: bold;
          margin: 4px 0;
        }

        .stock {
          font-size: 12px;
          color: gray;
        }

        .low {
          color: #ff9800;
        }

        .inactive {
          color: gray;
        }

        .menu {
          font-size: 18px;
          color: gray;
        }

        /* Add Button */
        .add-btn {
          position: fixed;
          bottom: 90px;
          right: calc(50% - 170px);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #2e7d32;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        /* Bottom Nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 100%;
          max-width: 390px;
          background: white;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #ddd;
        }

        .nav-item {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #7a7a7a;
          cursor: pointer;
        }

        .nav-item.active {
          background: #e8f6ee;
          color: #2e7d32;
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="header">
          <h3>My Products</h3>
          <div className="bell">🔔</div>
        </div>

        {/* Search */}
        <div className="search">
          <input placeholder="🔍 Search products..." />
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter active">All Items</div>
          <div className="filter">Vegetables</div>
          <div className="filter">Fruits</div>
          <div className="filter">Grains</div>
        </div>

        {/* Products */}
        <div className="product">
          <img src="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce" />
          <div className="product-info">
            <h4>Fresh Tomatoes</h4>
            <div className="price">Rs 40 / kg</div>
            <div className="stock">📦 500 kg in stock</div>
          </div>
          <div className="menu">⋮</div>
        </div>

        <div className="product">
          <img src="https://images.unsplash.com/photo-1582515073490-dc84c84c0c8b" />
          <div className="product-info">
            <h4>Organic Potato</h4>
            <div className="price">Rs 30 / kg</div>
            <div className="stock">📦 1,200 kg in stock</div>
          </div>
          <div className="menu">⋮</div>
        </div>

        <div className="product">
          <img src="https://images.unsplash.com/photo-1603032301977-b9f4c0bda9f1" />
          <div className="product-info">
            <h4>Basmati Rice</h4>
            <div className="price">Rs 110 / kg</div>
            <div className="stock low">⚠ 50 kg left</div>
          </div>
          <div className="menu">⋮</div>
        </div>

        <div className="product">
          <img src="https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2" />
          <div className="product-info">
            <h4 className="inactive">Red Onions</h4>
            <div className="price inactive">Rs 25 / kg</div>
            <div className="stock inactive">Inactive</div>
          </div>
          <div className="menu">⋮</div>
        </div>

        {/* Floating Add Button */}
        <div className="add-btn">+</div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/")}>🏠</div>
          <div className="nav-item active" onClick={() => navigate("/products")}>📦</div>
          <div className="nav-item">👨‍🌾</div>
          <div className="nav-item">📅</div>
          <div className="nav-item">👤</div>
        </div>
      </div>
    </>
  );
}
