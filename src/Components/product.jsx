import React, { useState } from "react";

const AddProduct = () => {
  const [name, setName] = useState("");

  const addProduct = async () => {
    if (!name) {
      alert("Enter product name");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        alert("Product added");
        setName("");
      } else {
        alert("Failed to add product");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div>
      <h3>Add Product</h3>

      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={addProduct}>Add</button>
    </div>
  );
};

export default AddProduct;
