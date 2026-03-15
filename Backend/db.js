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
      city VARCHAR(50),
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
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      farmer_id VARCHAR(100) NOT NULL,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Cart tracking table
  const cartTable = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buyer_email VARCHAR(100) NOT NULL,
      product_id INT NOT NULL,
      quantity INT DEFAULT 1,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `;

  // Orders Table (High level metadata)
  const ordersTable = `
     CREATE TABLE IF NOT EXISTS orders (
       id INT AUTO_INCREMENT PRIMARY KEY,
       order_number VARCHAR(50) NOT NULL UNIQUE,
       buyer_email VARCHAR(100) NOT NULL,
       total_amount DECIMAL(10,2) NOT NULL,
       status VARCHAR(50) DEFAULT 'Order Placed',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     )
  `;

  // Order Items Table (Snapshot of product data at time of purchase)
  const orderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      price_at_purchase DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
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
        // Robust Migration: Check if column exists, then add if missing
        const checkCitySql = "SHOW COLUMNS FROM users LIKE 'city'";
        db.query(checkCitySql, (checkErr, results) => {
          if (checkErr) return console.error("❌ Column check error:", checkErr.message);
          if (results.length === 0) {
            db.query("ALTER TABLE users ADD COLUMN city VARCHAR(50)", (alterErr) => {
              if (alterErr) console.error("❌ Migration error (users):", alterErr.message);
              else console.log("✅ Added city column to users table");
            });
          }
        });
    }
  });

  // Create products table
  db.query(productTable, (err) => {
    if (err) {
      console.error("❌ Failed to create products table:", err.message);
    } else {
      console.log("✅ products table ready");

        // Robust Migration: Check if column exists, then add if missing
        const checkFarmerIdSql = "SHOW COLUMNS FROM products LIKE 'farmer_id'";
        db.query(checkFarmerIdSql, (checkErr, results) => {
          if (checkErr) return console.error("❌ Column check error:", checkErr.message);
          if (results.length === 0) {
            db.query("ALTER TABLE products ADD COLUMN farmer_id VARCHAR(100)", (alterErr) => {
              if (alterErr) console.error("❌ Migration error (products):", alterErr.message);
              else console.log("✅ Added farmer_id column to products table");
            });
          }
        });
    }
  });

  // Create cart table
  db.query(cartTable, (err) => {
    if (err) {
      console.error("❌ Failed to create cart table:", err.message);
    } else {
      console.log("✅ cart table ready");
    }
  });

  // Create orders tables
  db.query(ordersTable, (err) => {
    if (err) {
      console.error("❌ Failed to create orders table:", err.message);
    } else {
      console.log("✅ orders table ready");
      // Create sub-items table ONLY after parent orders table successfully exists
      db.query(orderItemsTable, (err2) => {
         if (err2) console.error("❌ Failed to create order_items table:", err2.message);
         else console.log("✅ order_items table ready");
      });
    }
  });

});

module.exports = db;