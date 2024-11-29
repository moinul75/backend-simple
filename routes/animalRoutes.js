const express = require('express');
const multer = require('multer');
const { bucket } = require('../firebaseConfig'); // Import Firebase Storage bucket
const Animal = require('../models/Animal');
const Category = require('../models/categoryModel');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Configure multer to store files in memory (Firebase requires buffer data for uploading)
const storage = multer.memoryStorage(); // Store the file in memory temporarily
const upload = multer({ storage });

// Add a new category
router.post('/category/add', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(400).json({ error: 'Category already exists' });

    // Create a new category
    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new animal with category
router.post('/add', upload.single('image'), async (req, res) => {
  const { name, categoryName } = req.body;
  if (!name || !categoryName || !req.file) return res.status(400).json({ error: 'All fields are required' });

  try {
    // Check if the category exists
    const category = await Category.findOne({ name: categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Create a unique file name using uuid
    const uniqueFileName = `${uuidv4()}-${req.file.originalname}`;

    // Create a reference to Firebase Storage
    const file = bucket.file(uniqueFileName);

    // Create a write stream to Firebase Storage
    const blobStream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle upload errors
    blobStream.on('error', (error) => {
      console.error('Error uploading file to Firebase Storage:', error);
      return res.status(500).json({ error: 'File upload failed' });
    });

    // On successful upload, get the image URL
    blobStream.on('finish', async () => {
      try {
        // Generate the correct Firebase Storage URL
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;
    
        // Save to MongoDB
        const newAnimal = new Animal({
          name,
          imageUrl, // Store the correct Firebase Storage URL
          categoryName, // Store the category name
        });
    
        await newAnimal.save();
        res.status(201).json(newAnimal); // Respond with the saved data
      } catch (error) {
        console.error('Error saving to MongoDB:', error);
        res.status(500).json({ error: 'Failed to save to MongoDB' });
      }
    });
    






    // Pipe the image buffer data into Firebase Storage
    blobStream.end(req.file.buffer);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all animals by category name
router.get('/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;

  try {
    const animals = await Animal.find({ categoryName });
    if (!animals.length) {
      return res.status(404).json({ error: 'No animals found for this category' });
    }
    res.status(200).json(animals);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all animals
router.get('/', async (req, res) => {
  try {
    const animals = await Animal.find();
    res.status(200).json(animals);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Fetch animals based on category name
router.get('/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;  // Category name from the route parameter

  try {
    // Find animals that belong to the given category name
    const animals = await Animal.find({ categoryName });

    if (animals.length === 0) {
      return res.status(404).json({ error: 'No animals found for this category' });
    }

    res.status(200).json(animals); // Send the list of animals belonging to the category
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
