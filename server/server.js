require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Connect to the database
connectDB();

const app = express();

// Allow our React website to talk to this server
app.use(cors());

// Let the server understand data sent as JSON
app.use(express.json());

// A test "door": visiting / returns a friendly message
app.get('/', (req, res) => {
  res.send('E-commerce API is running!');
});

// Connect the routes to their addresses
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Pick the port number (the server's "door number")
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});