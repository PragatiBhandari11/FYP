const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agro_connect",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }

  console.log("✅ MySQL connected to agro_connect");

  // Farmers table
  const createFarmersTable = `
    CREATE TABLE IF NOT EXISTS farmers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(15),
      location VARCHAR(100),
      crop_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Users table
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20),
      country VARCHAR(50),
      role ENUM('Buyer','Farmer','Expert') NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Products table
  const productTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      price_per_kg DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      image_path VARCHAR(255),
      farmer_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
    )
  `;

  // Create farmers table
  db.query(createFarmersTable, (err) => {
    if (err) {
      console.error("❌ Failed to create farmers table:", err.message);
    } else {
      console.log("✅ farmers table ready");
    }
  });

  // Create users table
  db.query(usersTable, (err) => {
    if (err) {
      console.error("❌ Failed to create users table:", err.message);
    } else {
      console.log("✅ users table ready");
    }
  });

  // Create products table
  db.query(productTable, (err) => {
    if (err) {
      console.error("❌ Failed to create products table:", err.message);
    } else {
      console.log("✅ products table ready");
    }
  });

});

module.exports = db;