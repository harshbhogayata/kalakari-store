const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Product = require('./models/Product');

const seedComprehensiveData = async () => {
  try {
    logger.info('🌱 Starting comprehensive database seeding...');

    // Connect to MongoDB (with error handling)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kalakari';
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      logger.error('💡 Please check your MongoDB connection and try again');
      process.exit(1);
    }

    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    logger.info('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    logger.info('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@kalakari.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'admin'
    });

    // Define states and their artisans
    const stateData = [
      {
        state: 'Rajasthan',
        artisans: [
          {
            name: 'Rajesh Kumar',
            email: 'rajesh.rajasthan@kalakari.com',
            phone: '9876543211',
            businessName: 'Royal Rajasthani Crafts',
            craftType: 'Pottery',
            city: 'Jaipur',
            experience: 15,
            languages: ['Hindi', 'English']
          },
          {
            name: 'Sunita Devi',
            email: 'sunita.rajasthan@kalakari.com',
            phone: '9876543212',
            businessName: 'Desert Textiles',
            craftType: 'Textiles',
            city: 'Jodhpur',
            experience: 12,
            languages: ['Hindi', 'English']
          }
        ]
      },
      {
        state: 'Gujarat',
        artisans: [
          {
            name: 'Arjun Patel',
            email: 'arjun.gujarat@kalakari.com',
            phone: '9876543213',
            businessName: 'Gujarati Heritage',
            craftType: 'Woodwork',
            city: 'Ahmedabad',
            experience: 18,
            languages: ['Gujarati', 'Hindi', 'English']
          },
          {
            name: 'Priya Shah',
            email: 'priya.gujarat@kalakari.com',
            phone: '9876543214',
            businessName: 'Patola Palace',
            craftType: 'Jewelry',
            city: 'Surat',
            experience: 14,
            languages: ['Gujarati', 'Hindi', 'English']
          }
        ]
      },
      {
        state: 'Karnataka',
        artisans: [
          {
            name: 'Kumar Swamy',
            email: 'kumar.karnataka@kalakari.com',
            phone: '9876543215',
            businessName: 'Mysore Sandalwood',
            craftType: 'Woodwork',
            city: 'Mysore',
            experience: 20,
            languages: ['Kannada', 'Hindi', 'English']
          },
          {
            name: 'Lakshmi Reddy',
            email: 'lakshmi.karnataka@kalakari.com',
            phone: '9876543216',
            businessName: 'Silk Heritage',
            craftType: 'Textiles',
            city: 'Bangalore',
            experience: 16,
            languages: ['Kannada', 'Hindi', 'English']
          }
        ]
      },
      {
        state: 'Tamil Nadu',
        artisans: [
          {
            name: 'Raman Iyer',
            email: 'raman.tamilnadu@kalakari.com',
            phone: '9876543217',
            businessName: 'Tamil Traditional Arts',
            craftType: 'Metalwork',
            city: 'Chennai',
            experience: 17,
            languages: ['Tamil', 'Hindi', 'English']
          },
          {
            name: 'Meera Sundaram',
            email: 'meera.tamilnadu@kalakari.com',
            phone: '9876543218',
            businessName: 'Tanjore Paintings',
            craftType: 'Other',
            city: 'Thanjavur',
            experience: 13,
            languages: ['Tamil', 'Hindi', 'English']
          }
        ]
      },
      {
        state: 'West Bengal',
        artisans: [
          {
            name: 'Sourav Das',
            email: 'sourav.westbengal@kalakari.com',
            phone: '9876543219',
            businessName: 'Bengal Handicrafts',
            craftType: 'Leather',
            city: 'Kolkata',
            experience: 19,
            languages: ['Bengali', 'Hindi', 'English']
          },
          {
            name: 'Rina Banerjee',
            email: 'rina.westbengal@kalakari.com',
            phone: '9876543220',
            businessName: 'Terracotta Treasures',
            craftType: 'Pottery',
            city: 'Krishnanagar',
            experience: 11,
            languages: ['Bengali', 'Hindi', 'English']
          }
        ]
      }
    ];

    // Create users and artisans
    console.log('👥 Creating users and artisans...');
    const artisans = [];

    for (const stateInfo of stateData) {
      for (const artisanData of stateInfo.artisans) {
        // Create user
        const user = await User.create({
          name: artisanData.name,
          email: artisanData.email,
          phone: artisanData.phone,
          password: hashedPassword,
          role: 'artisan'
        });

        // Create artisan profile
        const artisan = await Artisan.create({
          userId: user._id,
          businessName: artisanData.businessName,
          description: `Traditional ${artisanData.craftType.toLowerCase()} from ${stateInfo.state} with ${artisanData.experience} years of experience`,
          craftType: artisanData.craftType,
          state: stateInfo.state,
          city: artisanData.city,
          experience: artisanData.experience,
          languages: artisanData.languages,
          isVerified: true,
          isApproved: true,
          commissionRate: Math.floor(Math.random() * 10) + 10, // 10-20%
          totalSales: 0,
          rating: {
            average: Math.random() * 1.5 + 3.5, // 3.5-5.0
            count: Math.floor(Math.random() * 50) + 10 // 10-60
          }
        });

        artisans.push(artisan);
      }
    }

    console.log(`✅ Created ${artisans.length} artisans`);

    // Define categories and their products
    const categories = [
      'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork',
      'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor',
      'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other',
      'Home Decor', 'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other'
    ];

    // Create products for each category
    console.log('🛍️ Creating products for each category...');

    const products = [];

    for (const category of categories) {
      console.log(`Creating products for ${category}...`);

      // Get artisans for this category
      const categoryArtisans = artisans.filter(a => a.craftType === category);

      // If no artisans for this category, use random artisans
      const availableArtisans = categoryArtisans.length > 0 ? categoryArtisans : artisans;

      for (let i = 0; i < 4; i++) {
        const artisan = availableArtisans[i % availableArtisans.length];

        const productData = generateProductData(category, artisan, i + 1);
        const product = await Product.create(productData);
        products.push(product);
      }
    }

    console.log(`✅ Created ${products.length} products`);

    // Create some sample customers
    console.log('👥 Creating sample customers...');
    const customers = [
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543301',
        role: 'customer'
      },
      {
        name: 'Arjun Singh',
        email: 'arjun@example.com',
        phone: '9876543302',
        role: 'customer'
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        phone: '9876543303',
        role: 'customer'
      }
    ];

    for (const customerData of customers) {
      await User.create({
        ...customerData,
        password: hashedPassword
      });
    }

    console.log('✅ Created sample customers');

    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Admin: admin@kalakari.com / password123`);
    console.log(`👥 Users: ${await User.countDocuments()} total`);
    console.log(`🎨 Artisans: ${await Artisan.countDocuments()} from ${stateData.length} states`);
    console.log(`🛍️ Products: ${await Product.countDocuments()} across ${categories.length} categories`);
    console.log(`📊 Categories: ${categories.join(', ')}`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@kalakari.com / password123');
    console.log('Artisans: [email] / password123');
    console.log('Customers: [email] / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Helper function to map product names to specific images
function getProductImage(category, productName) {
  const name = productName.toLowerCase();
  const basePath = '/images/products';

  // Specific mappings based on product name keywords
  if (name.includes('blue pottery') || name.includes('ceramic')) return `${basePath}/pottery_blue_bowl.png`;
  if (name.includes('terracotta') || name.includes('clay') || name.includes('hand-painted pot')) return `${basePath}/pottery_terracotta_vase.png`;

  if (name.includes('saree')) return `${basePath}/textile_silk_saree.png`;
  if (name.includes('block print') || name.includes('cotton') || name.includes('kurta')) return `${basePath}/textile_block_print.png`;
  if (name.includes('shawl')) return `${basePath}/textile_silk_saree.png`; // Fallback for shawl -> silk texture

  if (name.includes('earrings')) return `${basePath}/jewelry_gold_earrings.png`;
  if (name.includes('necklace') || name.includes('silver')) return `${basePath}/jewelry_silver_necklace.png`;
  if (name.includes('bracelet') || name.includes('ring')) return `${basePath}/jewelry_gold_earrings.png`; // Fallback

  if (name.includes('table') || name.includes('box') || name.includes('wood')) return `${basePath}/wood_carved_table.png`;

  if (name.includes('brass') || name.includes('copper') || name.includes('metal')) return `${basePath}/metal_brass_vase.png`;
  if (name.includes('statue') || name.includes('utensils')) return `${basePath}/metal_brass_vase.png`;

  if (name.includes('leather') || name.includes('bag') || name.includes('wallet')) return `${basePath}/leather_bag.png`;
  if (name.includes('shoes') || name.includes('sandals') || name.includes('boots') || name.includes('slippers')) return `${basePath}/leather_bag.png`; // Fallback if no footwear image

  if (name.includes('bamboo') || name.includes('basket') || name.includes('cane')) return `${basePath}/bamboo_basket.png`;

  if (name.includes('stone') || name.includes('sculpture') || name.includes('idol')) return `${basePath}/stone_sculpture.png`;

  if (name.includes('glass')) return `${basePath}/glass_vase.png`;

  if (name.includes('paper')) return `${basePath}/paper_handmade.png`;

  if (name.includes('wall hanging') || name.includes('painting') || name.includes('art')) return `${basePath}/painting_traditional.png`;
  if (name.includes('decor') || name.includes('centerpiece')) return `${basePath}/decor_wall_hanging.png`;

  // Category-based fallbacks
  switch (category) {
    case 'Pottery': return `${basePath}/pottery_terracotta_vase.png`;
    case 'Textiles':
    case 'Clothing': return `${basePath}/textile_block_print.png`;
    case 'Jewelry': return `${basePath}/jewelry_gold_earrings.png`;
    case 'Woodwork': return `${basePath}/wood_carved_table.png`;
    case 'Metalwork': return `${basePath}/metal_brass_vase.png`;
    case 'Leather':
    case 'Footwear':
    case 'Accessories': return `${basePath}/leather_bag.png`;
    case 'Bamboo': return `${basePath}/bamboo_basket.png`;
    case 'Stone': return `${basePath}/stone_sculpture.png`;
    case 'Glass': return `${basePath}/glass_vase.png`;
    case 'Paper': return `${basePath}/paper_handmade.png`;
    case 'Home Decor':
    case 'Festive Decor': return `${basePath}/decor_wall_hanging.png`;
    case 'Paintings':
    case 'Traditional Crafts': return `${basePath}/painting_traditional.png`;
    default: return '/images/placeholder-product.png';
  }
}

// Helper function to generate product data
function generateProductData(category, artisan, index) {
  const productTemplates = {
    'Pottery': [
      { name: 'Blue Pottery Bowl', price: 850, materials: ['Clay', 'Cobalt Oxide'] },
      { name: 'Terracotta Vase', price: 1200, materials: ['Clay', 'Natural Dyes'] },
      { name: 'Ceramic Dinner Set', price: 2500, materials: ['Ceramic Clay', 'Glaze'] },
      { name: 'Hand-painted Pot', price: 650, materials: ['Clay', 'Mineral Colors'] }
    ],
    'Textiles': [
      { name: 'Silk Saree', price: 3500, materials: ['Silk', 'Gold Thread'] },
      { name: 'Cotton Kurta', price: 1200, materials: ['Cotton', 'Natural Dyes'] },
      { name: 'Block Print Fabric', price: 800, materials: ['Cotton', 'Vegetable Dyes'] },
      { name: 'Embroidered Shawl', price: 1800, materials: ['Wool', 'Silk Thread'] }
    ],
    'Jewelry': [
      { name: 'Gold Earrings', price: 4500, materials: ['Gold', 'Gemstones'] },
      { name: 'Silver Necklace', price: 2800, materials: ['Silver', 'Pearls'] },
      { name: 'Beaded Bracelet', price: 650, materials: ['Glass Beads', 'Thread'] },
      { name: 'Traditional Ring', price: 1200, materials: ['Gold', 'Enamel'] }
    ],
    'Woodwork': [
      { name: 'Carved Table', price: 8500, materials: ['Teak Wood', 'Varnish'] },
      { name: 'Wooden Box', price: 1200, materials: ['Rosewood', 'Brass'] },
      { name: 'Sculpture', price: 3500, materials: ['Sandalwood', 'Oil'] },
      { name: 'Decorative Panel', price: 1800, materials: ['Pine Wood', 'Paint'] }
    ],
    'Metalwork': [
      { name: 'Brass Vase', price: 1500, materials: ['Brass', 'Polish'] },
      { name: 'Copper Bowl', price: 800, materials: ['Copper', 'Hammer'] },
      { name: 'Steel Utensils', price: 1200, materials: ['Stainless Steel', 'Finish'] },
      { name: 'Bronze Statue', price: 4500, materials: ['Bronze', 'Patina'] }
    ],
    'Leather': [
      { name: 'Leather Bag', price: 2500, materials: ['Leather', 'Thread'] },
      { name: 'Footwear', price: 1800, materials: ['Leather', 'Rubber'] },
      { name: 'Wallet', price: 650, materials: ['Leather', 'Zipper'] },
      { name: 'Belt', price: 450, materials: ['Leather', 'Buckle'] }
    ],
    'Bamboo': [
      { name: 'Bamboo Basket', price: 350, materials: ['Bamboo', 'Rope'] },
      { name: 'Storage Container', price: 650, materials: ['Bamboo', 'Cane'] },
      { name: 'Decorative Item', price: 450, materials: ['Bamboo', 'Paint'] },
      { name: 'Kitchen Utensil', price: 250, materials: ['Bamboo', 'Finish'] }
    ],
    'Stone': [
      { name: 'Stone Sculpture', price: 5500, materials: ['Marble', 'Polish'] },
      { name: 'Decorative Stone', price: 1200, materials: ['Granite', 'Carving'] },
      { name: 'Stone Bowl', price: 800, materials: ['Soapstone', 'Finish'] },
      { name: 'Garden Stone', price: 1800, materials: ['Limestone', 'Weathering'] }
    ],
    'Glass': [
      { name: 'Glass Vase', price: 1200, materials: ['Glass', 'Color'] },
      { name: 'Decorative Glass', price: 650, materials: ['Glass', 'Pattern'] },
      { name: 'Glass Bowl', price: 450, materials: ['Glass', 'Shape'] },
      { name: 'Glass Art', price: 2500, materials: ['Glass', 'Design'] }
    ],
    'Paper': [
      { name: 'Handmade Paper', price: 150, materials: ['Paper', 'Natural Fibers'] },
      { name: 'Decorative Paper', price: 250, materials: ['Paper', 'Dyes'] },
      { name: 'Paper Crafts', price: 350, materials: ['Paper', 'Adhesive'] },
      { name: 'Paper Art', price: 650, materials: ['Paper', 'Paint'] }
    ],
    'Home Decor': [
      { name: 'Wall Hanging', price: 1200, materials: ['Fabric', 'Wood'] },
      { name: 'Decorative Item', price: 800, materials: ['Mixed Materials'] },
      { name: 'Centerpiece', price: 1500, materials: ['Ceramic', 'Metal'] },
      { name: 'Room Divider', price: 3500, materials: ['Wood', 'Fabric'] }
    ],
    'Kitchenware': [
      { name: 'Cooking Utensil', price: 650, materials: ['Steel', 'Wood'] },
      { name: 'Serving Bowl', price: 450, materials: ['Ceramic', 'Glaze'] },
      { name: 'Storage Container', price: 350, materials: ['Clay', 'Finish'] },
      { name: 'Kitchen Tool', price: 250, materials: ['Metal', 'Handle'] }
    ],
    'Accessories': [
      { name: 'Handbag', price: 1800, materials: ['Leather', 'Hardware'] },
      { name: 'Scarf', price: 650, materials: ['Silk', 'Print'] },
      { name: 'Hat', price: 450, materials: ['Straw', 'Band'] },
      { name: 'Belt', price: 350, materials: ['Leather', 'Buckle'] }
    ],
    'Clothing': [
      { name: 'Traditional Dress', price: 2500, materials: ['Cotton', 'Embroidery'] },
      { name: 'Casual Wear', price: 1200, materials: ['Cotton', 'Dye'] },
      { name: 'Formal Wear', price: 3500, materials: ['Silk', 'Tailoring'] },
      { name: 'Ethnic Wear', price: 1800, materials: ['Fabric', 'Design'] }
    ],
    'Footwear': [
      { name: 'Traditional Shoes', price: 1200, materials: ['Leather', 'Sole'] },
      { name: 'Sandals', price: 650, materials: ['Leather', 'Straps'] },
      { name: 'Boots', price: 1800, materials: ['Leather', 'Lining'] },
      { name: 'Slippers', price: 350, materials: ['Rubber', 'Fabric'] }
    ],
    'Other': [
      { name: 'Miscellaneous Item', price: 650, materials: ['Mixed Materials'] },
      { name: 'Custom Product', price: 1200, materials: ['Various'] },
      { name: 'Special Item', price: 1800, materials: ['Unique Materials'] },
      { name: 'Handmade Item', price: 800, materials: ['Natural Materials'] }
    ],

    'Festive Decor': [
      { name: 'Festive Garland', price: 450, materials: ['Flowers', 'Thread'] },
      { name: 'Decorative Lights', price: 1200, materials: ['Metal', 'LED'] },
      { name: 'Festive Banner', price: 350, materials: ['Fabric', 'Print'] },
      { name: 'Celebration Item', price: 650, materials: ['Mixed Materials'] }
    ],
    'Traditional Crafts': [
      { name: 'Traditional Art', price: 2500, materials: ['Natural Materials'] },
      { name: 'Heritage Item', price: 1800, materials: ['Traditional Materials'] },
      { name: 'Cultural Product', price: 1200, materials: ['Local Materials'] },
      { name: 'Ancestral Craft', price: 3500, materials: ['Traditional Techniques'] }
    ],
    'Paintings': [
      { name: 'Traditional Painting', price: 4500, materials: ['Canvas', 'Natural Colors'] },
      { name: 'Folk Art', price: 1800, materials: ['Paper', 'Mineral Colors'] },
      { name: 'Miniature Art', price: 3500, materials: ['Paper', 'Gold Leaf'] },
      { name: 'Contemporary Art', price: 2500, materials: ['Canvas', 'Acrylic'] }
    ]
  };

  const templates = productTemplates[category] || productTemplates['Other'];
  const template = templates[index - 1] || templates[0];

  const colors = ['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Brown', 'Black', 'White'];
  const tags = [category.toLowerCase(), artisan.state.toLowerCase(), artisan.city.toLowerCase(), 'handmade', 'traditional'];

  const totalInventory = Math.floor(Math.random() * 50) + 10;
  const availableInventory = Math.floor(Math.random() * totalInventory) + 1;

  return {
    artisanId: artisan._id,
    name: `${template.name} - ${artisan.state}`,
    description: `Beautiful ${template.name.toLowerCase()} from ${artisan.state}, crafted by ${artisan.businessName}. Made with traditional techniques and premium materials.`,
    category: category,
    price: template.price,
    originalPrice: Math.round(template.price * 1.2),
    discount: Math.floor(Math.random() * 20) + 10, // 10-30%
    images: [
      {
        url: getProductImage(category, template.name),
        alt: `${template.name} from ${artisan.state}`
      }
    ],
    inventory: {
      total: totalInventory,
      available: availableInventory,
      reserved: 0
    },
    dimensions: {
      length: Math.floor(Math.random() * 30) + 10,
      width: Math.floor(Math.random() * 30) + 10,
      height: Math.floor(Math.random() * 20) + 5,
      weight: Math.random() * 2 + 0.5,
      unit: 'cm'
    },
    materials: template.materials,
    colors: colors.slice(0, Math.floor(Math.random() * 3) + 1),
    tags: tags,
    isActive: true,
    isApproved: true,
    isFeatured: Math.random() > 0.7, // 30% chance of being featured
    shipping: {
      weight: Math.random() * 2 + 0.5,
      dimensions: {
        length: Math.floor(Math.random() * 30) + 10,
        width: Math.floor(Math.random() * 30) + 10,
        height: Math.floor(Math.random() * 20) + 5
      },
      fragile: Math.random() > 0.5,
      estimatedDays: Math.floor(Math.random() * 7) + 3 // 3-10 days
    },
    stats: {
      views: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20),
      orders: Math.floor(Math.random() * 10)
    }
  };
}

// Run the seeding
seedComprehensiveData();
