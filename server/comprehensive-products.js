const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Import models
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Product = require('./models/Product');

// Comprehensive product data for all states and categories
const createComprehensiveProducts = async () => {
  console.log('🚀 Creating comprehensive product database...');

  try {
    // Check if already seeded (skip check for now due to MongoDB connection issues)
    // const existingProducts = await Product.countDocuments();
    // if (existingProducts > 0) {
    //   console.log('✅ Products already exist, skipping seeding');
    //   return { success: true };
    // }

    // Create admin user (skip if exists)
    let admin;
    try {
      admin = await User.findOne({ email: 'admin@kalakari.shop' });
      if (!admin) {
        const adminPassword = await bcrypt.hash('admin123', 10);
        admin = await User.create({
          name: 'Admin User',
          email: 'admin@kalakari.shop',
          phone: '9876543210',
          password: adminPassword,
          role: 'admin'
        });
      }
    } catch (error) {
      console.log('Admin user creation skipped:', error.message);
    }

    // Create test customers (skip if exists)
    let customer1;
    try {
      customer1 = await User.findOne({ email: 'priya@gmail.com' });
      if (!customer1) {
        const customerPassword = await bcrypt.hash('password123', 10);
        customer1 = await User.create({
          name: 'Priya Sharma',
          email: 'priya@gmail.com',
          phone: '9876543211',
          password: customerPassword,
          role: 'customer'
        });
      }
    } catch (error) {
      console.log('Customer creation skipped:', error.message);
    }

    // Create artisans for different states
    const artisans = [];
    const states = [
      'Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala',
      'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha',
      'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Punjab', 'Haryana',
      'Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Assam', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim',
      'Goa', 'Chhattisgarh', 'Jharkhand', 'Arunachal Pradesh'
    ];

    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      try {
        let artisan = await Artisan.findOne({ email: `artisan${i}@${state.toLowerCase().replace(/\s+/g, '')}.com` });
        if (!artisan) {
          artisan = await Artisan.create({
            userId: customer1?._id || new mongoose.Types.ObjectId(),
            businessName: `${state} Crafts`,
            description: `Traditional crafts from ${state}`,
            craftType: 'Mixed',
            experience: Math.floor(Math.random() * 20) + 5,
            state: state,
            city: `${state} City`,
            address: `123 Main Street, ${state}`,
            pincode: '123456',
            phone: `9876543${String(i).padStart(3, '0')}`,
            email: `artisan${i}@${state.toLowerCase().replace(/\s+/g, '')}.com`,
            isApproved: true,
            commissionRate: 15 + Math.floor(Math.random() * 10),
            totalSales: Math.floor(Math.random() * 100000),
            rating: { average: 4.0 + Math.random(), count: Math.floor(Math.random() * 50) }
          });
        }
        artisans.push(artisan);
      } catch (error) {
        console.log(`Artisan creation skipped for ${state}:`, error.message);
        // Create a mock artisan object for product creation
        artisans.push({
          _id: new mongoose.Types.ObjectId(),
          businessName: `${state} Crafts`,
          state: state
        });
      }
    }

    // Categories and their products
    const categories = {
      'Pottery': [
        'Terracotta Vase', 'Clay Pot', 'Ceramic Bowl', 'Earthenware Plate', 'Pottery Sculpture',
        'Clay Lamp', 'Ceramic Mug', 'Terracotta Figurine', 'Clay Jar', 'Pottery Wall Hanging'
      ],
      'Textiles': [
        'Silk Saree', 'Cotton Kurta', 'Woolen Shawl', 'Embroidered Dupatta', 'Block Print Fabric',
        'Handwoven Rug', 'Silk Scarf', 'Cotton Bedsheet', 'Embroidered Cushion', 'Traditional Shawl'
      ],
      'Jewelry': [
        'Silver Necklace', 'Gold Earrings', 'Pearl Bracelet', 'Gemstone Ring', 'Traditional Pendant',
        'Silver Bangles', 'Gold Chain', 'Pearl Necklace', 'Gemstone Earrings', 'Traditional Nose Ring'
      ],
      'Woodwork': [
        'Wooden Table', 'Carved Chair', 'Wooden Sculpture', 'Wooden Bowl', 'Carved Mirror Frame',
        'Wooden Jewelry Box', 'Carved Door', 'Wooden Lamp', 'Wooden Tray', 'Carved Wall Panel'
      ],
      'Metalwork': [
        'Brass Plate', 'Copper Vase', 'Silver Spoon', 'Bronze Sculpture', 'Brass Lamp',
        'Copper Bowl', 'Silver Tray', 'Bronze Figurine', 'Brass Mirror', 'Copper Pot'
      ],
      'Paintings': [
        'Oil Painting', 'Watercolor Art', 'Folk Painting', 'Miniature Painting', 'Abstract Art',
        'Landscape Painting', 'Portrait Art', 'Traditional Mural', 'Modern Art', 'Religious Painting'
      ],
      'Bamboo': [
        'Bamboo Basket', 'Bamboo Lamp', 'Bamboo Mat', 'Bamboo Furniture', 'Bamboo Decoration',
        'Bamboo Tray', 'Bamboo Wall Hanging', 'Bamboo Sculpture', 'Bamboo Container', 'Bamboo Art'
      ],
      'Leather': [
        'Leather Bag', 'Leather Wallet', 'Leather Shoes', 'Leather Belt', 'Leather Jacket',
        'Leather Purse', 'Leather Sandals', 'Leather Gloves', 'Leather Case', 'Leather Art'
      ],
      'Stone': [
        'Stone Sculpture', 'Marble Bowl', 'Granite Statue', 'Stone Lamp', 'Marble Tray',
        'Stone Figurine', 'Marble Vase', 'Stone Wall Hanging', 'Marble Art', 'Stone Decoration'
      ],
      'Glass': [
        'Glass Vase', 'Stained Glass Art', 'Glass Bowl', 'Glass Sculpture', 'Glass Lamp',
        'Glass Decoration', 'Glass Mirror', 'Glass Tray', 'Glass Art', 'Glass Figurine'
      ]
    };

    // Create products for each state and category
    const products = [];
    let productIndex = 0;

    for (const [category, productNames] of Object.entries(categories)) {
      for (let stateIndex = 0; stateIndex < states.length; stateIndex++) {
        const state = states[stateIndex];
        const artisan = artisans[stateIndex];
        
        for (let i = 0; i < 10; i++) {
          const productName = productNames[i];
          const basePrice = 500 + Math.floor(Math.random() * 5000);
          const discount = Math.floor(Math.random() * 30);
          const originalPrice = Math.floor(basePrice / (1 - discount / 100));
          
          const product = {
            artisanId: artisan._id,
            name: `${state} ${productName}`,
            description: `Authentic ${productName.toLowerCase()} from ${state}. Handcrafted using traditional techniques passed down through generations.`,
            category: category,
            price: basePrice,
            originalPrice: originalPrice,
            discount: discount,
            images: [
              {
                url: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=500&auto=format&fit=crop&sig=${productIndex}`,
                alt: `${state} ${productName}`
              },
              {
                url: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=500&auto=format&fit=crop&sig=${productIndex + 1}`,
                alt: `${state} ${productName} Detail`
              }
            ],
            inventory: { 
              total: 10 + Math.floor(Math.random() * 20), 
              available: 5 + Math.floor(Math.random() * 15), 
              reserved: Math.floor(Math.random() * 5) 
            },
            dimensions: { 
              length: 10 + Math.floor(Math.random() * 50), 
              width: 10 + Math.floor(Math.random() * 50), 
              height: 5 + Math.floor(Math.random() * 30), 
              weight: 0.1 + Math.random() * 5, 
              unit: 'cm' 
            },
            materials: getMaterialsForCategory(category),
            colors: getColorsForCategory(category),
            tags: [category, state, 'Handmade', 'Traditional', 'Authentic'],
            isActive: true,
            isApproved: true,
            isFeatured: Math.random() > 0.7,
            shipping: {
              weight: 0.1 + Math.random() * 5,
              dimensions: { 
                length: 10 + Math.floor(Math.random() * 50), 
                width: 10 + Math.floor(Math.random() * 50), 
                height: 5 + Math.floor(Math.random() * 30) 
              },
              fragile: ['Pottery', 'Glass', 'Paintings'].includes(category),
              estimatedDays: 3 + Math.floor(Math.random() * 10)
            },
            stats: { 
              views: Math.floor(Math.random() * 500), 
              likes: Math.floor(Math.random() * 100), 
              shares: Math.floor(Math.random() * 50), 
              orders: Math.floor(Math.random() * 30) 
            },
            rating: { 
              average: 3.5 + Math.random() * 1.5, 
              count: Math.floor(Math.random() * 50) 
            }
          };
          
          products.push(product);
          productIndex++;
        }
      }
    }

    // Create all products
    try {
      await Product.insertMany(products);
      console.log(`✅ Created ${products.length} products across ${states.length} states and ${Object.keys(categories).length} categories`);
      console.log(`📊 Products per state: ${Object.keys(categories).length * 10}`);
      console.log(`📊 Products per category: ${states.length * 10}`);
    } catch (error) {
      console.log('Product creation error:', error.message);
      // Return the product data for manual inspection
      return { 
        success: false, 
        error: error.message, 
        productCount: products.length,
        sampleProduct: products[0]
      };
    }

    return { success: true, count: products.length };
  } catch (error) {
    console.error('❌ Error creating comprehensive products:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions
function getMaterialsForCategory(category) {
  const materialMap = {
    'Pottery': ['Clay', 'Natural Dyes', 'Water', 'Glaze'],
    'Textiles': ['Cotton', 'Silk', 'Wool', 'Natural Dyes', 'Thread'],
    'Jewelry': ['Silver', 'Gold', 'Pearls', 'Gemstones', 'Metal'],
    'Woodwork': ['Wood', 'Natural Finish', 'Wood Stain', 'Varnish'],
    'Metalwork': ['Brass', 'Copper', 'Silver', 'Bronze', 'Metal'],
    'Paintings': ['Canvas', 'Oil Paints', 'Watercolors', 'Brushes', 'Paper'],
    'Bamboo': ['Bamboo', 'Natural Fiber', 'Rattan', 'Cane'],
    'Leather': ['Leather', 'Thread', 'Dye', 'Hardware'],
    'Stone': ['Marble', 'Granite', 'Stone', 'Polish'],
    'Glass': ['Glass', 'Color', 'Lead', 'Frame']
  };
  return materialMap[category] || ['Natural Materials'];
}

function getColorsForCategory(category) {
  const colorMap = {
    'Pottery': ['Terracotta', 'Brown', 'Cream', 'Red'],
    'Textiles': ['Red', 'Blue', 'Green', 'Gold', 'Maroon'],
    'Jewelry': ['Silver', 'Gold', 'White', 'Blue', 'Green'],
    'Woodwork': ['Brown', 'Golden', 'Natural', 'Dark Brown'],
    'Metalwork': ['Brass', 'Golden', 'Copper', 'Silver'],
    'Paintings': ['Multi-color', 'Vibrant', 'Traditional', 'Modern'],
    'Bamboo': ['Natural', 'Brown', 'Golden', 'Light Brown'],
    'Leather': ['Brown', 'Black', 'Tan', 'Natural'],
    'Stone': ['White', 'Gray', 'Black', 'Natural'],
    'Glass': ['Clear', 'Blue', 'Green', 'Multi-color']
  };
  return colorMap[category] || ['Natural'];
}

// Development endpoints
app.post('/api/comprehensive-products', async (req, res) => {
  try {
    const result = await createComprehensiveProducts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Comprehensive Products Server running on port ${PORT}`);
});

module.exports = { createComprehensiveProducts };
