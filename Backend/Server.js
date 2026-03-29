const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
require("./db");

const userRoutes = require("./routes/users");
const productRoutes = require("./routes/product");
const loginRoute = require('./routes/login');
const weatherRoutes = require("./routes/weather");
const cartRoutes = require("./routes/cart"); 
const ordersRoutes = require("./routes/orders");
const collabRoutes = require("./routes/collaborations");
const demandsRoutes = require("./routes/demands");
const adminRoutes = require("./routes/admin");
const diseaseRoutes = require("./routes/disease");
const calendarRoutes = require("./routes/calendar");
const articleRoutes = require("./routes/articles");
const notificationRoutes = require("./routes/notification");


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Expose the uploads directory so that the React frontend can fetch images
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api', loginRoute); 
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', weatherRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', ordersRoutes);
app.use('/api/collaborations', collabRoutes);
app.use('/api/demands', demandsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/notification', notificationRoutes);



app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});