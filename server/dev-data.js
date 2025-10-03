const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { mockComprehensiveProducts } = require('./mock-comprehensive-products');
require('dotenv').config();

const app = express();
app.use(express.json());

// Import models
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Product = require('./models/Product');

// Mock database setup for development
const createDevData = async () => {
  console.log('🚀 Setting up development data...');

  try {
    // Check if already seeded (skip for now due to MongoDB connection issues)
    // const existingUsers = await User.countDocuments();
    // if (existingUsers > 0) {
    //   console.log('✅ Data already exists, skipping seeding');
    //   return { success: true };
    // }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kalakari.shop',
      phone: '9876543210',
      password: adminPassword,
      role: 'admin'
    });

    // Create test customers
    const customerPassword = await bcrypt.hash('password123', 10);
    const customer1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '9876543211',
      password: customerPassword,
      role: 'customer'
    });

    const customer2 = await User.create({
      name: 'Arjun Singh',
      email: 'arjun@gmail.com',
      phone: '9876543212',
      password: customerPassword,
      role: 'customer'
    });

    // Create artisan users
    const artisanUser1 = await User.create({
      name: 'Raj Mehta',
      email: 'raj@craftville.com',
      phone: '9876543213',
      password: customerPassword,
      role: 'artisan'
    });

    const artisanUser2 = await User.create({
      name: 'Sunita Devi',
      email: 'sunita@textile.com',
      phone: '9876543214',
      password: customerPassword,
      role: 'artisan'
    });

    // Create artisans
    const artisan1 = await Artisan.create({
      userId: artisanUser1._id,
      businessName: 'CraftVille Studios',
      description: 'Traditional Indian pottery and ceramics with modern design',
      craftType: 'Pottery',
      state: 'Rajasthan',
      city: 'Jaipur',
      experience: 10,
      languages: ['Hindi', 'English'],
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop&q=80'
      ],
      isVerified: true,
      isApproved: true,
      commissionRate: 15,
      totalSales: 0,
      rating: { average: 4.5, count: 20 }
    });

    const artisan2 = await Artisan.create({
      userId: artisanUser2._id,
      businessName: 'Textile Heritage',
      description: 'Handwoven textiles and block printing from Gujarat',
      craftType: 'Textiles',
      state: 'Gujarat',
      city: 'Ahmedabad',
      experience: 12,
      languages: ['Gujarati', 'Hindi', 'English'],
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&q=80'
      ],
      isVerified: true,
      isApproved: true,
      commissionRate: 18,
      totalSales: 0,
      rating: { average: 4.8, count: 35 }
    });

    // Create comprehensive products (10 per state per category)
    const comprehensiveProducts = mockComprehensiveProducts();
    console.log(`📊 Generated ${comprehensiveProducts.length} comprehensive products`);
    console.log(`📊 Products per state: ${Object.keys({
      'Pottery': [], 'Textiles': [], 'Jewelry': [], 'Woodwork': [], 'Metalwork': [],
      'Paintings': [], 'Bamboo': [], 'Leather': [], 'Stone': [], 'Glass': []
    }).length * 10}`);
    console.log(`📊 Products per category: ${29 * 10}`); // 29 states * 10 products

    // Create sample products (keeping existing ones for compatibility)
    const products = [
      {
        artisanId: artisan1._id,
        name: 'Royal Terracotta Vase',
        description: 'Handcrafted terracotta vase with intricate Rajasthani patterns. Perfect for both traditional and modern decor. Each piece is unique and made with traditional techniques passed down through generations.',
        category: 'Pottery',
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Royal Terracotta Vase'
          },
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Terracotta Vase Detail'
          }
        ],
        inventory: { total: 10, available: 8, reserved: 2 },
        dimensions: { length: 25, width: 25, height: 40, weight: 2.5, unit: 'cm' },
        materials: ['Clay', 'Natural Dyes', 'Water'],
        colors: ['Terracotta', 'Brown', 'Cream'],
        tags: ['Terracotta', 'Traditional', 'Vase', 'Decor', 'Rajasthani'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 2.5,
          dimensions: { length: 25, width: 25, height: 40 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 156, likes: 23, shares: 8, orders: 12 },
        rating: { average: 4.5, count: 12 }
      },
      {
        artisanId: artisan2._id,
        name: 'Traditional Cotton Saree',
        description: 'Elegant handwoven cotton saree with traditional patterns from Varanasi. Made with pure cotton and traditional weaving techniques. Perfect for daily wear and special occasions.',
        category: 'Textiles',
        price: 1200,
        originalPrice: 1500,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1887&auto=format&fit=crop',
            alt: 'Traditional Cotton Saree'
          },
          {
            url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=1887&auto=format&fit=crop',
            alt: 'Saree Detail'
          }
        ],
        inventory: { total: 15, available: 12, reserved: 3 },
        dimensions: { length: 550, width: 110, height: 1, weight: 0.5, unit: 'cm' },
        materials: ['Cotton', 'Silk Thread', 'Natural Dyes'],
        colors: ['Red', 'Gold', 'Green'],
        tags: ['Saree', 'Traditional', 'Cotton', 'Varanasi', 'Handwoven'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 0.5,
          dimensions: { length: 55, width: 11, height: 1 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 98, likes: 15, shares: 5, orders: 8 },
        rating: { average: 4.3, count: 8 }
      },
      {
        artisanId: artisan3._id,
        name: 'Silver Jewelry Set',
        description: 'Exquisite silver jewelry set with traditional Indian designs and semi-precious stones. Includes necklace, earrings, and bangles. Handcrafted by skilled artisans.',
        category: 'Jewelry',
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1887&auto=format&fit=crop',
            alt: 'Silver Jewelry Set'
          },
          {
            url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1887&auto=format&fit=crop',
            alt: 'Jewelry Detail'
          }
        ],
        inventory: { total: 8, available: 6, reserved: 2 },
        dimensions: { length: 20, width: 15, height: 5, weight: 0.3, unit: 'cm' },
        materials: ['Silver', 'Semi-precious Stones', 'Gold Plating'],
        colors: ['Silver', 'Blue', 'Green'],
        tags: ['Jewelry', 'Silver', 'Traditional', 'Set', 'Semi-precious'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 0.3,
          dimensions: { length: 20, width: 15, height: 5 },
          fragile: true,
          estimatedDays: 3
        },
        stats: { views: 234, likes: 45, shares: 12, orders: 6 },
        rating: { average: 4.8, count: 6 }
      },
      {
        artisanId: artisan2._id,
        name: 'Wooden Carved Table',
        description: 'Hand-carved wooden table with intricate traditional patterns from Kerala. Made from premium teak wood with traditional carving techniques. Perfect for dining or as a centerpiece.',
        category: 'Woodwork',
        price: 3500,
        originalPrice: 4200,
        discount: 17,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1887&auto=format&fit=crop',
            alt: 'Wooden Carved Table'
          },
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1887&auto=format&fit=crop',
            alt: 'Table Detail'
          }
        ],
        inventory: { total: 3, available: 2, reserved: 1 },
        dimensions: { length: 120, width: 60, height: 75, weight: 15, unit: 'cm' },
        materials: ['Teak Wood', 'Natural Finish', 'Wood Stain'],
        colors: ['Brown', 'Golden', 'Natural'],
        tags: ['Woodwork', 'Table', 'Traditional', 'Kerala', 'Teak'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 15,
          dimensions: { length: 120, width: 60, height: 75 },
          fragile: false,
          estimatedDays: 10
        },
        stats: { views: 67, likes: 12, shares: 3, orders: 2 },
        rating: { average: 4.2, count: 3 }
      },
      {
        artisanId: artisan3._id,
        name: 'Brass Decorative Plate',
        description: 'Ornate brass plate perfect for home decoration with traditional motifs. Handcrafted with intricate designs and polished to perfection. Ideal for wall decoration or serving.',
        category: 'Metalwork',
        price: 800,
        originalPrice: 1000,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Brass Decorative Plate'
          },
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Plate Detail'
          }
        ],
        inventory: { total: 15, available: 12, reserved: 3 },
        dimensions: { length: 30, width: 30, height: 2, weight: 1.2, unit: 'cm' },
        materials: ['Brass', 'Traditional Finish', 'Lacquer'],
        colors: ['Brass', 'Golden', 'Copper'],
        tags: ['Brass', 'Plate', 'Traditional', 'Decor', 'Handcrafted'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 1.2,
          dimensions: { length: 30, width: 30, height: 2 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 89, likes: 18, shares: 4, orders: 5 },
        rating: { average: 4.6, count: 5 }
      },
      {
        artisanId: artisan1._id,
        name: 'Blue Pottery Bowl Set',
        description: 'Authentic blue pottery bowls from Jaipur. Each piece is hand-painted with traditional motifs and glazed to perfection. Set of 4 bowls perfect for serving.',
        category: 'Pottery',
        price: 1800,
        originalPrice: 2200,
        discount: 18,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
            alt: 'Blue Pottery Bowl Set'
          },
          {
            url: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
            alt: 'Bowl Detail'
          }
        ],
        inventory: { total: 15, available: 12, reserved: 3 },
        dimensions: { length: 30, width: 30, height: 15, weight: 1.8, unit: 'cm' },
        materials: ['Clay', 'Cobalt Oxide', 'Quartz', 'Glaze'],
        colors: ['Blue', 'White', 'Turquoise'],
        tags: ['Blue Pottery', 'Bowls', 'Set', 'Traditional', 'Jaipur'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 1.8,
          dimensions: { length: 30, width: 30, height: 15 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 145, likes: 28, shares: 7, orders: 9 },
        rating: { average: 4.4, count: 9 }
      },
      {
        artisanId: artisan2._id,
        name: 'Banarasi Silk Saree',
        description: 'Elegant Banarasi silk saree with intricate golden zari work. Perfect for special occasions. Made with pure silk and traditional weaving techniques from Varanasi.',
        category: 'Textiles',
        price: 8500,
        originalPrice: 12000,
        discount: 29,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1619521441258-501a6b0f1b2a?q=80&w=1887&auto=format&fit=crop',
            alt: 'Banarasi Silk Saree'
          },
          {
            url: 'https://images.unsplash.com/photo-1619521441258-501a6b0f1b2a?q=80&w=1887&auto=format&fit=crop',
            alt: 'Saree Detail'
          }
        ],
        inventory: { total: 5, available: 3, reserved: 2 },
        dimensions: { length: 550, width: 120, height: 1, weight: 0.8, unit: 'cm' },
        materials: ['Silk', 'Gold Zari', 'Silver Thread', 'Natural Dyes'],
        colors: ['Maroon', 'Gold', 'Red'],
        tags: ['Banarasi', 'Silk', 'Saree', 'Special Occasion', 'Varanasi'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 0.8,
          dimensions: { length: 55, width: 12, height: 1 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 189, likes: 34, shares: 9, orders: 4 },
        rating: { average: 4.7, count: 4 }
      },
      {
        artisanId: artisan2._id,
        name: 'Block Print Cotton Kurta',
        description: 'Comfortable cotton kurta with traditional block print patterns. Perfect for everyday wear.',
        category: 'Textiles',
        price: 1200,
        originalPrice: 1500,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop',
            alt: 'Block Print Cotton Kurta'
          }
        ],
        inventory: { total: 25, available: 25, reserved: 0 },
        dimensions: { length: 70, width: 50, height: 2, weight: 0.3, unit: 'cm' },
        materials: ['Cotton', 'Natural Dyes'],
        colors: ['Indigo', 'White', 'Red'],
        tags: ['Cotton', 'Block Print', 'Kurta', 'Casual'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.3,
          dimensions: { length: 70, width: 50, height: 2 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan1._id,
        name: 'Handmade Ceramic Dinner Set',
        description: 'Complete dinner set for 6 people with traditional Rajasthani pottery designs.',
        category: 'Pottery',
        price: 4500,
        originalPrice: 6000,
        discount: 25,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594917862029-31b62ec4be5c?q=80&w=1964&auto=format&fit=crop',
            alt: 'Handmade Ceramic Dinner Set'
          }
        ],
        inventory: { total: 8, available: 8, reserved: 0 },
        dimensions: { length: 40, width: 40, height: 12, weight: 4.2, unit: 'cm' },
        materials: ['Ceramic Clay', 'Glaze'],
        colors: ['White', 'Brown', 'Cream'],
        tags: ['Dinner Set', 'Ceramic', 'Complete Set'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 4.2,
          dimensions: { length: 40, width: 40, height: 12 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Kalamkari Wall Hanging',
        description: 'Beautiful Kalamkari wall hanging depicting mythological scenes with natural dyes.',
        category: 'Textiles',
        price: 3500,
        originalPrice: 4500,
        discount: 22,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1583391734233-e81d8ad8a13c?q=80&w=1964&auto=format&fit=crop',
            alt: 'Kalamkari Wall Hanging'
          }
        ],
        inventory: { total: 12, available: 12, reserved: 0 },
        dimensions: { length: 45, width: 60, height: 1, weight: 0.5, unit: 'cm' },
        materials: ['Cotton', 'Natural Dyes', 'Wooden Frame'],
        colors: ['Red', 'Blue', 'Yellow', 'Green'],
        tags: ['Kalamkari', 'Wall Hanging', 'Art', 'Traditional'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 0.5,
          dimensions: { length: 45, width: 60, height: 5 },
          fragile: true,
          estimatedDays: 6
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Leather Handbag',
        description: 'Handcrafted leather handbag with traditional motifs from Rajasthan.',
        category: 'Leather',
        price: 1800,
        originalPrice: 2200,
        discount: 18,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop',
            alt: 'Leather Handbag'
          }
        ],
        inventory: { total: 12, available: 9, reserved: 0 },
        dimensions: { length: 35, width: 25, height: 15, weight: 0.8, unit: 'cm' },
        materials: ['Leather', 'Brass Hardware'],
        colors: ['Brown', 'Tan', 'Black'],
        tags: ['Leather', 'Handbag', 'Traditional', 'Rajasthan'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.8,
          dimensions: { length: 35, width: 25, height: 15 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan3._id,
        name: 'Bamboo Basket Set',
        description: 'Set of handwoven bamboo baskets for storage and decoration.',
        category: 'Bamboo',
        price: 600,
        originalPrice: 750,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1887&auto=format&fit=crop',
            alt: 'Bamboo Basket Set'
          }
        ],
        inventory: { total: 25, available: 20, reserved: 0 },
        dimensions: { length: 30, width: 30, height: 20, weight: 0.5, unit: 'cm' },
        materials: ['Bamboo', 'Natural Fiber'],
        colors: ['Natural', 'Brown'],
        tags: ['Bamboo', 'Basket', 'Storage', 'Eco-friendly'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.5,
          dimensions: { length: 30, width: 30, height: 20 },
          fragile: false,
          estimatedDays: 4
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan1._id,
        name: 'Stone Carved Statue',
        description: 'Beautiful stone carved statue of traditional deity from Tamil Nadu.',
        category: 'Stone',
        price: 4200,
        originalPrice: 5000,
        discount: 16,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Stone Carved Statue'
          }
        ],
        inventory: { total: 2, available: 1, reserved: 0 },
        dimensions: { length: 25, width: 15, height: 40, weight: 8, unit: 'cm' },
        materials: ['Stone', 'Traditional Finish'],
        colors: ['Gray', 'White', 'Natural'],
        tags: ['Stone', 'Statue', 'Traditional', 'Tamil Nadu'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 8,
          dimensions: { length: 25, width: 15, height: 40 },
          fragile: true,
          estimatedDays: 12
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Glass Decorative Vase',
        description: 'Hand-blown glass vase with intricate patterns from Firozabad.',
        category: 'Glass',
        price: 950,
        originalPrice: 1200,
        discount: 21,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Glass Decorative Vase'
          }
        ],
        inventory: { total: 12, available: 9, reserved: 0 },
        dimensions: { length: 20, width: 20, height: 30, weight: 1.2, unit: 'cm' },
        materials: ['Glass', 'Traditional Patterns'],
        colors: ['Clear', 'Blue', 'Green'],
        tags: ['Glass', 'Vase', 'Traditional', 'Firozabad'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 1.2,
          dimensions: { length: 20, width: 20, height: 30 },
          fragile: true,
          estimatedDays: 6
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan3._id,
        name: 'Handmade Paper Notebook',
        description: 'Eco-friendly handmade paper notebook with traditional binding.',
        category: 'Paper',
        price: 300,
        originalPrice: 400,
        discount: 25,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1887&auto=format&fit=crop',
            alt: 'Handmade Paper Notebook'
          }
        ],
        inventory: { total: 50, available: 45, reserved: 0 },
        dimensions: { length: 21, width: 15, height: 2, weight: 0.3, unit: 'cm' },
        materials: ['Handmade Paper', 'Cotton Thread'],
        colors: ['Natural', 'Brown', 'White'],
        tags: ['Paper', 'Notebook', 'Eco-friendly', 'Traditional'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.3,
          dimensions: { length: 21, width: 15, height: 2 },
          fragile: false,
          estimatedDays: 3
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan1._id,
        name: 'Traditional Wall Hanging',
        description: 'Colorful traditional wall hanging for home decor from Gujarat.',
        category: 'Home Decor',
        price: 750,
        originalPrice: 900,
        discount: 17,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Traditional Wall Hanging'
          }
        ],
        inventory: { total: 18, available: 14, reserved: 0 },
        dimensions: { length: 60, width: 40, height: 1, weight: 0.4, unit: 'cm' },
        materials: ['Fabric', 'Embroidery Thread'],
        colors: ['Red', 'Yellow', 'Green', 'Blue'],
        tags: ['Wall Hanging', 'Traditional', 'Gujarat', 'Decor'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.4,
          dimensions: { length: 60, width: 40, height: 1 },
          fragile: false,
          estimatedDays: 4
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 },
        rating: { average: 0, count: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Clay Cooking Pot',
        description: 'Traditional clay cooking pot for authentic taste from West Bengal.',
        category: 'Kitchenware',
        price: 400,
        originalPrice: 500,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Clay Cooking Pot'
          }
        ],
        inventory: { total: 30, available: 25, reserved: 0 },
        dimensions: { length: 20, width: 20, height: 15, weight: 1.5, unit: 'cm' },
        materials: ['Clay', 'Natural Finish'],
        colors: ['Terracotta', 'Brown'],
        tags: ['Clay', 'Cooking Pot', 'Traditional', 'West Bengal'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 1.5,
          dimensions: { length: 20, width: 20, height: 15 },
          fragile: true,
          estimatedDays: 5
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      }
    ];

    // Add products one by one to handle any individual errors
    let addedProducts = 0;
    for (const productData of products) {
      try {
        await Product.create(productData);
        addedProducts++;
      } catch (productError) {
        console.warn(`Failed to create product: ${productData.name}`, productError.message);
      }
    }

    // Add comprehensive products
    let addedComprehensiveProducts = 0;
    for (const productData of comprehensiveProducts) {
      try {
        await Product.create(productData);
        addedComprehensiveProducts++;
      } catch (productError) {
        console.warn(`Failed to create comprehensive product: ${productData.name}`, productError.message);
      }
    }

    console.log('✅ Development data created successfully!');
    console.log(`Created ${await User.countDocuments()} users`);
    console.log(`Created ${await Artisan.countDocuments()} artisans`);
    console.log(`Created ${addedProducts} sample products`);
    console.log(`Created ${addedComprehensiveProducts} comprehensive products`);
    console.log(`Total products: ${addedProducts + addedComprehensiveProducts}`);
    
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@kalakari.shop / admin123');
    console.log('Customer: priya@gmail.com / password123');
    console.log('Customer: arjun@gmail.com / password123');
    console.log('Artisan: raj@craftville.com / password123');
    console.log('Artisan: sunita@textile.com / password123');
    
    return { success: true };

  } catch (error) {
    console.error('❌ Error creating development data:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { createDevData };
