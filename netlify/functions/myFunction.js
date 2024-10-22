const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const serverless = require('serverless-http'); // Import serverless-http

// Create an express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve the 'uploads' folder

// MongoDB connection string
const mongoUri = 'mongodb+srv://arsalanahmed19970:siddiqui0311$@cluster0.4sggc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Create a Mongoose schema for the product
const productSchema = new mongoose.Schema({
  sku: String,
  promotion: Number,
  beforePrice: Number,
  arabic: String,
  english: String,
  area: String,
  sizeX: String,
  sizeY: Number,
  image: String,
});

const Product = mongoose.model('Product', productSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique file name
  }
});

// POST route to save form data
const upload = multer({ storage: storage }); // Pass the storage configuration to multer

// Route to handle the product creation with image upload
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { sku, promotion, beforePrice, arabic, english, area, sizeX, sizeY } = req.body;

    // req.file contains the image file information uploaded by multer
    const imagePath = req.file ? req.file.path : ''; // Get the path of the uploaded image

    const newProduct = new Product({
      sku,
      promotion,
      beforePrice,
      arabic,
      english,
      area,
      sizeX,
      sizeY,
      image: imagePath // Store the image path in MongoDB
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Remove the app.listen() and replace it with the serverless handler

// Export the app as a serverless function
module.exports.handler = serverless(app); // Export as a handler for serverless deployment
