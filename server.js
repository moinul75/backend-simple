// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const animalRoutes = require('./routes/animalRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); 
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/animals', animalRoutes);
app.use('/api/categories', categoryRoutes);  // Use category routes

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
