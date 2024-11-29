const express = require('express');
const Category = require('../models/categoryModel');  // Import the Category model
const router = express.Router();

// POST: Add new category
router.post('/add', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create and save new category
    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Fetch all category names
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find().select('name'); // Select only the 'name' field

    // If no categories found
    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: 'No categories found' });
    }

    res.status(200).json({ categories: categories.map(cat => cat.name) }); // Return the category names as an array
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
