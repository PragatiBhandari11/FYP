import React from "react";
import { useNavigate } from "react-router-dom";

export default function ExplorePage() {
  const navigate = useNavigate();

  return (
    <>
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

        .header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .header h2 {
          margin-bottom: 12px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: #f6f6f6;
          border-radius: 12px;
          padding: 10px 12px;
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          font-size: 14px;
          margin: 0 8px;
        }

        section {
          padding: 16px;
        }

        .filters {
          display: flex;
          gap: 10px;
          overflow-x: auto;
        }

        .chip {
          padding: 8px 14px;
          border-radius: 20px;
          background: #f1f1f1;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
        }

        .chip.active {
          background: #2e8b57;
          color: white;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 16px;
        }

        .card {
          background: #f9f9f9;
          border-radius: 16px;
          overflow: hidden;
        }

        .card img {
          width: 100%;
          height: 130px;
          object-fit: cover;
        }

        .card-body {
          padding: 12px;
        }

        .card-title {
          font-size: 14px;
          font-weight: bold;
        }

        .price {
          color: #2e8b57;
          font-weight: bold;
          margin: 6px 0;
        }

        .rating {
          font-size: 13px;
        }

        /* Bottom Navigation */
        .bottom-nav {
          margin-top: auto;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
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

        .nav-item.active {
          color: #2e8b57;
          font-weight: bold;
        }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <h2>Explore Products</h2>
          <div className="search-bar">
            🔍
            <input placeholder="Search products, farmers..." />
            ⚙️
          </div>
        </div>

        {/* Filters */}
        <section>
          <div className="filters">
            <div className="chip active">All</div>
            <div className="chip">Vegetables</div>
            <div className="chip">Fruits</div>
            <div className="chip">Organic</div>
          </div>

          {/* Products */}
          <div className="grid">
            <ProductCard
              title="Fresh Strawberries"
              price="$4.50 / kg"
              rating="⭐ 4.9"
              img="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6"
            />
            <ProductCard
              title="Sweet Corn"
              price="$0.80 / ea"
              rating="⭐ 4.7"
              img="https://images.unsplash.com/photo-1592924357228-91a4daadcfea"
            />
            <ProductCard
              title="Cherry Tomatoes"
              price="$3.20 / kg"
              rating="⭐ 4.8"
              img="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce"
            />
            <ProductCard
              title="Bell Peppers"
              price="$2.50 / kg"
              rating="⭐ 4.5"
              img="https://images.unsplash.com/photo-1582284540020-8acbe03f4924"
            />
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/buyer-dashboard")}>
            <span>🏠</span>
            <span>Home</span>
          </div>

          <div className="nav-item active">
            <span>🔍</span>
            <span>Explore</span>
          </div>

          <div className="nav-item"  onClick={() => navigate("/buyer-cart")}>
            <span>🛒</span>
            <span>Cart</span>
          </div>

          <div className="nav-item">
            <span>📦</span>
            <span>Orders</span>
          </div>

          <div className="nav-item">
            <span>👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ title, price, rating, img }) {
  return (
    <div className="card">
      <img src={img} alt={title} />
      <div className="card-body">
        <div className="card-title">{title}</div>
        <div className="price">{price}</div>
        <div className="rating">{rating}</div>
      </div>
    </div>
  );
}
