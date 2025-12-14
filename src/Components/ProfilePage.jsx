import React from "react";

export default function ProfilePage({ cart }) {
  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ color: "#2e7d32" }}>My Profile 👤</h3>

      <p><strong>Name:</strong> Buyer User</p>
      <p><strong>Location:</strong> Kathmandu</p>

      <h4 style={{ marginTop: 16 }}>My Cart 🛒</h4>
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        cart.map((c) => (
          <div key={c.id} style={{ background: "white", padding: 8, borderRadius: 10, marginBottom: 6 }}>
            {c.name} – Rs. {c.price}
          </div>
        ))
      )}
    </div>
  );
}
