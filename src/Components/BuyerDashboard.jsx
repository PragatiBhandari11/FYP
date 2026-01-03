import React, { useState } from "react";

export default function BuyerDashboard() {
  const [search, setSearch] = useState("");

  const products = [
    { id: 1, name: "Sweet Corn", seller: "Green Valley Farm", price: "$2.50 / kg" },
    { id: 2, name: "Fresh Strawberries", seller: "Berry Organic", price: "$4.00 / box" },
    { id: 3, name: "Organic Potatoes", seller: "Farm Fresh", price: "$1.20 / kg" },
  ];

  return (
    <>
      {/* CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        body {
          background: #f2f2f2;
        }

        .app {
          max-width: 390px;
          margin: auto;
          background: #fff;
          min-height: 100vh;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          background: #2e8b57;
          color: white;
          padding: 20px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .icons {
          font-size: 20px;
        }

        .search {
          width: 100%;
          margin-top: 15px;
          padding: 10px;
          border-radius: 12px;
          border: none;
        }

        section {
          padding: 16px;
        }

        section h3 {
          margin-bottom: 10px;
        }

        /* Categories */
        .categories {
          display: flex;
          justify-content: space-between;
        }

        .category {
          width: 70px;
          height: 70px;
          background: #f1f1f1;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .category span {
          font-size: 12px;
          margin-top: 4px;
        }

        /* Order */
        .order {
          background: #fff3cd;
          padding: 14px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .track {
          color: green;
          font-weight: bold;
          cursor: pointer;
        }

        /* Products */
        .product {
          background: #f9f9f9;
          padding: 14px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .product p {
          font-size: 12px;
          color: gray;
          margin: 4px 0;
        }

        .price {
          color: green;
          font-weight: bold;
        }

        .add {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #2e8b57;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }

        /* Bottom Navigation */
        .bottom-nav {
          margin-top: auto;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 10px 0;
          background: #fff;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: #666;
          cursor: pointer;
        }

        .nav-item .icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .nav-item.active {
          color: #2e8b57;
          font-weight: bold;
        }
      `}</style>

      {/* UI */}
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div>
              <h2>Hello, Sarah</h2>
              <p>Find fresh products nearby</p>
            </div>
            <div className="icons">🛒 🔔</div>
          </div>

          <input
            className="search"
            type="text"
            placeholder="Search vegetables, fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <section>
          <h3>Categories</h3>
          <div className="categories">
            <div className="category">🥕<span>Veg</span></div>
            <div className="category">🍎<span>Fruits</span></div>
            <div className="category">🌾<span>Grains</span></div>
            <div className="category">🥛<span>Dairy</span></div>
          </div>
        </section>

        {/* Order Status */}
        <section>
          <h3>Order Status</h3>
          <div className="order">
            <div>
              <strong>Out for Delivery</strong>
              <p>Arriving by 5:00 PM</p>
            </div>
            <div className="track">Track</div>
          </div>
        </section>

        {/* Products */}
        <section>
          <h3>Featured Products</h3>
          {products
            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
            .map(p => (
              <div className="product" key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.seller}</p>
                  <div className="price">{p.price}</div>
                </div>
                <button className="add">+</button>
              </div>
            ))}
        </section>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item active">
            <span className="icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <span className="icon">🔍</span>
            <span>Explore</span>
          </div>
          <div className="nav-item">
            <span className="icon">🛒</span>
            <span>Cart</span>
          </div>
          <div className="nav-item">
            <span className="icon">📦</span>
            <span>Orders</span>
          </div>
          <div className="nav-item">
            <span className="icon">👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </>
  );
}
