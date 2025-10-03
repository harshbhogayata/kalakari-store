// Mock comprehensive product data for development with real images
const mockComprehensiveProducts = () => {
  const states = [
    'Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kerala',
    'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Odisha',
    'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Punjab', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Assam', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim',
    'Goa', 'Chhattisgarh', 'Jharkhand', 'Arunachal Pradesh'
  ];

  // Comprehensive product images mapped to specific product types
  const productImages = {
    // POTTERY PRODUCTS
    'Terracotta Vase': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Terracotta vase' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Terracotta vase detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Terracotta vase side view' }
    ],
    'Clay Pot': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay cooking pot' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay pot detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay pot side view' }
    ],
    'Ceramic Bowl': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Ceramic bowl' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Ceramic bowl interior' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Ceramic bowl bottom' }
    ],
    'Earthenware Plate': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Earthenware plate' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Earthenware plate design' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Earthenware plate edge' }
    ],
    'Pottery Sculpture': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Pottery sculpture' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture details' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture base' }
    ],
    'Clay Lamp': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Traditional clay lamp' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay lamp detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay lamp lit' }
    ],
    'Ceramic Mug': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Handmade ceramic mug' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Ceramic mug handle' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Ceramic mug interior' }
    ],
    'Terracotta Figurine': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Terracotta figurine' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine details' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine side view' }
    ],
    'Clay Jar': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Traditional clay jar' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay jar lid' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Clay jar texture' }
    ],
    'Pottery Wall Hanging': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Pottery wall hanging' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Wall hanging design' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Wall hanging texture' }
    ],

    // TEXTILE PRODUCTS
    'Silk Saree': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Traditional silk saree' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Saree border detail' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Saree fabric texture' }
    ],
    'Cotton Kurta': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Cotton kurta' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Kurta embroidery' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Kurta buttons' }
    ],
    'Woolen Shawl': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Woolen shawl' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Shawl pattern' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Shawl fringe' }
    ],
    'Embroidered Dupatta': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Embroidered dupatta' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Dupatta embroidery' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Dupatta edge work' }
    ],
    'Block Print Fabric': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Block print fabric' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Print pattern detail' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Fabric texture' }
    ],
    'Handwoven Rug': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Handwoven rug' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Rug pattern' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Rug fringe' }
    ],
    'Silk Scarf': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Silk scarf' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Scarf pattern' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Scarf texture' }
    ],
    'Cotton Bedsheet': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Cotton bedsheet' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Bedsheet pattern' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Bedsheet corner' }
    ],
    'Embroidered Cushion': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Embroidered cushion' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Cushion embroidery' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Cushion tassels' }
    ],
    'Traditional Shawl': [
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Traditional shawl' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Shawl design' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80', alt: 'Shawl border' }
    ],

    // JEWELRY PRODUCTS
    'Silver Necklace': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Silver necklace' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Necklace pendant' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Necklace clasp' }
    ],
    'Gold Earrings': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Gold earrings' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Earring design' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Earring back' }
    ],
    'Pearl Bracelet': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pearl bracelet' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pearl detail' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Bracelet clasp' }
    ],
    'Gemstone Ring': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Gemstone ring' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Ring gemstone' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Ring band' }
    ],
    'Traditional Pendant': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Traditional pendant' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pendant design' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pendant chain' }
    ],
    'Silver Bangles': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Silver bangles' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Bangle design' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Bangle opening' }
    ],
    'Gold Chain': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Gold chain' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Chain links' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Chain clasp' }
    ],
    'Pearl Necklace': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pearl necklace' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Pearl string' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Necklace closure' }
    ],
    'Gemstone Earrings': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Gemstone earrings' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Earring gemstone' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Earring post' }
    ],
    'Traditional Nose Ring': [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Traditional nose ring' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Nose ring design' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&q=80', alt: 'Nose ring detail' }
    ],

    // WOODWORK PRODUCTS
    'Wooden Table': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Handcrafted wooden table' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Table wood grain' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Table legs detail' }
    ],
    'Carved Chair': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Carved wooden chair' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Chair back carving' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Chair arm detail' }
    ],
    'Wooden Sculpture': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Wooden sculpture' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Sculpture details' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Sculpture base' }
    ],
    'Wooden Bowl': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Handcarved wooden bowl' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bowl interior' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bowl bottom' }
    ],
    'Carved Mirror Frame': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Carved mirror frame' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Frame carving detail' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Frame corners' }
    ],
    'Wooden Jewelry Box': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Wooden jewelry box' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Box interior' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Box hinges' }
    ],
    'Carved Door': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Carved wooden door' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Door panel carving' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Door handle' }
    ],
    'Wooden Lamp': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Wooden table lamp' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Lamp shade' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Lamp base detail' }
    ],
    'Wooden Tray': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Wooden serving tray' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Tray handles' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Tray surface' }
    ],
    'Carved Wall Panel': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Carved wall panel' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Panel design detail' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Panel texture' }
    ],

    // METALWORK PRODUCTS
    'Brass Plate': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Brass serving plate' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Plate engraving' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Plate rim detail' }
    ],
    'Copper Vase': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Copper decorative vase' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Vase hammered texture' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Vase base' }
    ],
    'Silver Spoon': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Silver decorative spoon' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Spoon handle design' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Spoon bowl detail' }
    ],
    'Bronze Sculpture': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bronze sculpture' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture details' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture patina' }
    ],
    'Brass Lamp': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Brass oil lamp' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Lamp wick holder' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Lamp base design' }
    ],
    'Copper Bowl': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Copper serving bowl' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bowl hammered finish' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bowl rim detail' }
    ],
    'Silver Tray': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Silver serving tray' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Tray engraving' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Tray handles' }
    ],
    'Bronze Figurine': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bronze figurine' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine details' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine base' }
    ],
    'Brass Mirror': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Brass hand mirror' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Mirror back design' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Mirror handle' }
    ],
    'Copper Pot': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Copper cooking pot' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Pot lid design' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Pot handles' }
    ],

    // PAINTING PRODUCTS
    'Oil Painting': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Oil painting artwork' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Painting detail' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Painting frame' }
    ],
    'Watercolor Art': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Watercolor painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Watercolor detail' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Art technique' }
    ],
    'Folk Painting': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Traditional folk painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Folk art detail' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Cultural patterns' }
    ],
    'Miniature Painting': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Miniature painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Detailed brushwork' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Intricate design' }
    ],
    'Abstract Art': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Abstract artwork' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Color composition' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Art texture' }
    ],
    'Landscape Painting': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Landscape painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Nature scene' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Painting depth' }
    ],
    'Portrait Art': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Portrait painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Facial features' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Expression detail' }
    ],
    'Traditional Mural': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Traditional mural' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Mural section' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Cultural symbols' }
    ],
    'Modern Art': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Modern artwork' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Contemporary style' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Art technique' }
    ],
    'Religious Painting': [
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Religious painting' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Sacred imagery' },
      { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=80', alt: 'Devotional art' }
    ],

    // BAMBOO PRODUCTS
    'Bamboo Basket': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo basket' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Basket weaving' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo texture' }
    ],
    'Bamboo Lamp': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo table lamp' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Lamp shade' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo structure' }
    ],
    'Bamboo Mat': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo floor mat' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Mat pattern' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Weaving detail' }
    ],
    'Bamboo Furniture': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo furniture' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Furniture joints' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Natural finish' }
    ],
    'Bamboo Decoration': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo decoration' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Decorative element' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Craft detail' }
    ],
    'Bamboo Tray': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo serving tray' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Tray surface' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo handles' }
    ],
    'Bamboo Wall Hanging': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo wall hanging' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Hanging design' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Wall art' }
    ],
    'Bamboo Sculpture': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo sculpture' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Sculpture detail' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Artistic form' }
    ],
    'Bamboo Container': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo container' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Container lid' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Storage design' }
    ],
    'Bamboo Art': [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Bamboo art piece' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Artistic bamboo work' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', alt: 'Craft detail' }
    ],

    // LEATHER PRODUCTS
    'Leather Bag': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Handcrafted leather bag' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Bag interior' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather stitching' }
    ],
    'Leather Wallet': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather wallet' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Wallet compartments' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather texture' }
    ],
    'Leather Shoes': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Handmade leather shoes' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Shoe sole detail' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather upper' }
    ],
    'Leather Belt': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather belt' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Belt buckle' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather grain' }
    ],
    'Leather Jacket': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather jacket' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Jacket zipper' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather collar' }
    ],
    'Leather Purse': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather purse' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Purse strap' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Purse closure' }
    ],
    'Leather Sandals': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather sandals' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Sandals sole' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather straps' }
    ],
    'Leather Gloves': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather gloves' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Glove stitching' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather cuff' }
    ],
    'Leather Case': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather case' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Case interior' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Case hardware' }
    ],
    'Leather Art': [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather art piece' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Art detail' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop&q=80', alt: 'Leather tooling' }
    ],

    // STONE PRODUCTS
    'Stone Sculpture': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone sculpture' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone texture' }
    ],
    'Marble Bowl': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble bowl' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bowl interior' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble veining' }
    ],
    'Granite Statue': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Granite statue' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Statue carving' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Granite texture' }
    ],
    'Stone Lamp': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone lamp' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Lamp base' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone carving' }
    ],
    'Marble Tray': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble serving tray' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Tray surface' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble pattern' }
    ],
    'Stone Figurine': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone figurine' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine details' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone carving' }
    ],
    'Marble Vase': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble vase' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Vase shape' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble finish' }
    ],
    'Stone Wall Hanging': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone wall hanging' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Wall art detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone carving' }
    ],
    'Marble Art': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble art piece' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Art detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Marble texture' }
    ],
    'Stone Decoration': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone decoration' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Decorative carving' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stone finish' }
    ],

    // GLASS PRODUCTS
    'Glass Vase': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass vase' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Vase shape' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass clarity' }
    ],
    'Stained Glass Art': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Stained glass art' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass colors' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Lead work' }
    ],
    'Glass Bowl': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass bowl' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Bowl interior' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass rim' }
    ],
    'Glass Sculpture': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass sculpture' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Sculpture form' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass work' }
    ],
    'Glass Lamp': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass table lamp' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Lamp shade' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass base' }
    ],
    'Glass Decoration': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass decoration' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Decorative element' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass work' }
    ],
    'Glass Mirror': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass mirror' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Mirror frame' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass reflection' }
    ],
    'Glass Tray': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass serving tray' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Tray surface' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass handles' }
    ],
    'Glass Art': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass art piece' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Art detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass technique' }
    ],
    'Glass Figurine': [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass figurine' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Figurine detail' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80', alt: 'Glass work' }
    ]
  };

  // Helper function to get images for specific product types
  const getImagesForProduct = (productName, productId) => {
    // Extract the product type from the full name (e.g., "Arunachal Pradesh Glass Figurine" -> "Glass Figurine")
    const productType = productName.split(' ').slice(1).join(' '); // Remove state name
    
    // Try to find exact product match first
    let selectedImages = productImages[productType];
    
    // If not found, try to find by category and last word (e.g., "Glass Figurine" -> "Figurine")
    if (!selectedImages) {
      const lastWord = productType.split(' ').pop(); // Get last word
      selectedImages = productImages[lastWord];
    }
    
    // If still not found, use category-based fallback
    if (!selectedImages) {
      const category = getCategoryFromProductName(productType);
      switch(category) {
        case 'Pottery':
          selectedImages = productImages['Terracotta Vase'];
          break;
        case 'Textiles':
          selectedImages = productImages['Silk Saree'];
          break;
        case 'Jewelry':
          selectedImages = productImages['Silver Necklace'];
          break;
        case 'Woodwork':
          selectedImages = productImages['Wooden Table'];
          break;
        case 'Metalwork':
          selectedImages = productImages['Brass Plate'];
          break;
        case 'Paintings':
          selectedImages = productImages['Oil Painting'];
          break;
        case 'Bamboo':
          selectedImages = productImages['Bamboo Basket'];
          break;
        case 'Leather':
          selectedImages = productImages['Leather Bag'];
          break;
        case 'Stone':
          selectedImages = productImages['Stone Sculpture'];
          break;
        case 'Glass':
          selectedImages = productImages['Glass Vase'];
          break;
        default:
          selectedImages = productImages['Terracotta Vase']; // ultimate fallback
      }
    }
    
    return [
      {
        url: `${selectedImages[0].url}&sig=${productId}`,
        alt: selectedImages[0].alt
      },
      {
        url: `${selectedImages[1].url}&sig=${productId + 1}`,
        alt: selectedImages[1].alt
      },
      {
        url: `${selectedImages[2].url}&sig=${productId + 2}`,
        alt: selectedImages[2].alt
      }
    ];
  };

  // Helper function to get category from product name
  const getCategoryFromProductName = (productName) => {
    const categoryMap = {
      // POTTERY
      'Terracotta Vase': 'Pottery', 'Clay Pot': 'Pottery', 'Ceramic Bowl': 'Pottery',
      'Earthenware Plate': 'Pottery', 'Pottery Sculpture': 'Pottery', 'Clay Lamp': 'Pottery',
      'Ceramic Mug': 'Pottery', 'Terracotta Figurine': 'Pottery', 'Clay Jar': 'Pottery',
      'Pottery Wall Hanging': 'Pottery',
      
      // TEXTILES
      'Silk Saree': 'Textiles', 'Cotton Kurta': 'Textiles', 'Woolen Shawl': 'Textiles',
      'Embroidered Dupatta': 'Textiles', 'Block Print Fabric': 'Textiles', 'Handwoven Rug': 'Textiles',
      'Silk Scarf': 'Textiles', 'Cotton Bedsheet': 'Textiles', 'Embroidered Cushion': 'Textiles',
      'Traditional Shawl': 'Textiles',
      
      // JEWELRY
      'Silver Necklace': 'Jewelry', 'Gold Earrings': 'Jewelry', 'Pearl Bracelet': 'Jewelry',
      'Gemstone Ring': 'Jewelry', 'Traditional Pendant': 'Jewelry', 'Silver Bangles': 'Jewelry',
      'Gold Chain': 'Jewelry', 'Pearl Necklace': 'Jewelry', 'Gemstone Earrings': 'Jewelry',
      'Traditional Nose Ring': 'Jewelry',
      
      // WOODWORK
      'Wooden Table': 'Woodwork', 'Carved Chair': 'Woodwork', 'Wooden Sculpture': 'Woodwork',
      'Wooden Bowl': 'Woodwork', 'Carved Mirror Frame': 'Woodwork', 'Wooden Jewelry Box': 'Woodwork',
      'Carved Door': 'Woodwork', 'Wooden Lamp': 'Woodwork', 'Wooden Tray': 'Woodwork',
      'Carved Wall Panel': 'Woodwork',
      
      // METALWORK
      'Brass Plate': 'Metalwork', 'Copper Vase': 'Metalwork', 'Silver Spoon': 'Metalwork',
      'Bronze Sculpture': 'Metalwork', 'Brass Lamp': 'Metalwork', 'Copper Bowl': 'Metalwork',
      'Silver Tray': 'Metalwork', 'Bronze Figurine': 'Metalwork', 'Brass Mirror': 'Metalwork',
      'Copper Pot': 'Metalwork',
      
      // PAINTINGS
      'Oil Painting': 'Paintings', 'Watercolor Art': 'Paintings', 'Folk Painting': 'Paintings',
      'Miniature Painting': 'Paintings', 'Abstract Art': 'Paintings', 'Landscape Painting': 'Paintings',
      'Portrait Art': 'Paintings', 'Traditional Mural': 'Paintings', 'Modern Art': 'Paintings',
      'Religious Painting': 'Paintings',
      
      // BAMBOO
      'Bamboo Basket': 'Bamboo', 'Bamboo Lamp': 'Bamboo', 'Bamboo Mat': 'Bamboo',
      'Bamboo Furniture': 'Bamboo', 'Bamboo Decoration': 'Bamboo', 'Bamboo Tray': 'Bamboo',
      'Bamboo Wall Hanging': 'Bamboo', 'Bamboo Sculpture': 'Bamboo', 'Bamboo Container': 'Bamboo',
      'Bamboo Art': 'Bamboo',
      
      // LEATHER
      'Leather Bag': 'Leather', 'Leather Wallet': 'Leather', 'Leather Shoes': 'Leather',
      'Leather Belt': 'Leather', 'Leather Jacket': 'Leather', 'Leather Purse': 'Leather',
      'Leather Sandals': 'Leather', 'Leather Gloves': 'Leather', 'Leather Case': 'Leather',
      'Leather Art': 'Leather',
      
      // STONE
      'Stone Sculpture': 'Stone', 'Marble Bowl': 'Stone', 'Granite Statue': 'Stone',
      'Stone Lamp': 'Stone', 'Marble Tray': 'Stone', 'Stone Figurine': 'Stone',
      'Marble Vase': 'Stone', 'Stone Wall Hanging': 'Stone', 'Marble Art': 'Stone',
      'Stone Decoration': 'Stone',
      
      // GLASS
      'Glass Vase': 'Glass', 'Stained Glass Art': 'Glass', 'Glass Bowl': 'Glass',
      'Glass Sculpture': 'Glass', 'Glass Lamp': 'Glass', 'Glass Decoration': 'Glass',
      'Glass Mirror': 'Glass', 'Glass Tray': 'Glass', 'Glass Art': 'Glass',
      'Glass Figurine': 'Glass'
    };
    
    return categoryMap[productName] || 'Pottery'; // default fallback
  };

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

  const products = [];
  let productId = 1;

  // Helper functions
  const getMaterialsForCategory = (category) => {
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
  };

  const getColorsForCategory = (category) => {
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
  };

  // Create products for each state and category
  for (const [category, productNames] of Object.entries(categories)) {
    for (let stateIndex = 0; stateIndex < states.length; stateIndex++) {
      const state = states[stateIndex];
      const artisanId = `artisan_${(stateIndex % 3) + 1}`; // Cycle through our 3 artisans
      
      for (let i = 0; i < 10; i++) {
        const productName = productNames[i];
        const basePrice = 500 + Math.floor(Math.random() * 5000);
        const discount = Math.floor(Math.random() * 30);
        const originalPrice = Math.floor(basePrice / (1 - discount / 100));
        
        const product = {
          _id: `product_${productId}`,
          artisanId: artisanId,
          name: `${state} ${productName}`,
          description: `Authentic ${productName.toLowerCase()} from ${state}. Handcrafted using traditional techniques passed down through generations. Each piece is unique and reflects the rich cultural heritage of ${state}.`,
          category: category,
          price: basePrice,
          originalPrice: originalPrice,
          discount: discount,
          images: getImagesForProduct(productName, productId),
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
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        products.push(product);
        productId++;
      }
    }
  }

  // Add Diwali products
  const diwaliProducts = [
    {
      _id: 'diwali_1',
      artisanId: 'artisan_1',
      name: 'Handcrafted Brass Diya Set',
      description: 'Traditional brass diyas with intricate engravings - perfect for Diwali celebrations',
      category: 'Diwali Collection',
      subcategory: 'Diyas & Lamps',
      price: 899,
      originalPrice: 1199,
      discount: 25,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3c?q=80&w=800', alt: 'Brass Diya Set', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3c?q=80&w=800', alt: 'Brass Diya Set Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3c?q=80&w=800', alt: 'Brass Diya Set Side View' }
      ],
      variants: [],
      inventory: { total: 25, available: 25, reserved: 0 },
      materials: ['Brass'],
      colors: ['Gold', 'Bronze'],
      tags: ['Diwali', 'Traditional', 'Brass', 'Handcrafted', 'Festive'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 245, likes: 67, shares: 23, orders: 12 },
      rating: { average: 4.8, count: 124 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_2',
      artisanId: 'artisan_2',
      name: 'Terracotta Oil Lamps',
      description: 'Eco-friendly terracotta oil lamps with traditional Indian designs',
      category: 'Diwali Collection',
      subcategory: 'Oil Lamps',
      price: 299,
      originalPrice: 399,
      discount: 25,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3d?q=80&w=800', alt: 'Terracotta Oil Lamps', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3d?q=80&w=800', alt: 'Terracotta Lamps Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3d?q=80&w=800', alt: 'Terracotta Lamps Set' }
      ],
      variants: [],
      inventory: { total: 50, available: 50, reserved: 0 },
      materials: ['Terracotta'],
      colors: ['Brown', 'Red'],
      tags: ['Diwali', 'Eco-Friendly', 'Terracotta', 'Traditional', 'Oil Lamps'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 189, likes: 45, shares: 18, orders: 8 },
      rating: { average: 4.6, count: 89 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_3',
      artisanId: 'artisan_3',
      name: 'Colorful Rangoli Powder Set',
      description: 'Vibrant rangoli colors for creating beautiful Diwali decorations',
      category: 'Diwali Collection',
      subcategory: 'Rangoli Colors',
      price: 199,
      originalPrice: 249,
      discount: 20,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3e?q=80&w=800', alt: 'Rangoli Powder Set', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3e?q=80&w=800', alt: 'Rangoli Colors Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3e?q=80&w=800', alt: 'Rangoli Powder Colors' }
      ],
      variants: [],
      inventory: { total: 30, available: 30, reserved: 0 },
      materials: ['Natural Pigments'],
      colors: ['Red', 'Yellow', 'Green', 'Blue', 'Orange'],
      tags: ['Diwali', 'Rangoli', 'Colors', 'Festive', 'Traditional'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 167, likes: 38, shares: 15, orders: 6 },
      rating: { average: 4.5, count: 67 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_4',
      artisanId: 'artisan_1',
      name: 'Decorative Rangoli Stencils',
      description: 'Reusable stencils for creating intricate rangoli patterns',
      category: 'Diwali Collection',
      subcategory: 'Rangoli Stencils',
      price: 149,
      originalPrice: 199,
      discount: 25,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3f?q=80&w=800', alt: 'Rangoli Stencils', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3f?q=80&w=800', alt: 'Stencil Patterns' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e3f?q=80&w=800', alt: 'Rangoli Templates' }
      ],
      variants: [],
      inventory: { total: 40, available: 40, reserved: 0 },
      materials: ['Plastic'],
      colors: ['Transparent'],
      tags: ['Diwali', 'Stencils', 'Rangoli', 'Decorative', 'Reusable'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 134, likes: 32, shares: 12, orders: 5 },
      rating: { average: 4.4, count: 45 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_5',
      artisanId: 'artisan_2',
      name: 'Golden Toran for Door',
      description: 'Elegant golden toran with traditional motifs for Diwali decoration',
      category: 'Diwali Collection',
      subcategory: 'Door Decorations',
      price: 1299,
      originalPrice: 1699,
      discount: 24,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e40?q=80&w=800', alt: 'Golden Toran', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e40?q=80&w=800', alt: 'Toran Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e40?q=80&w=800', alt: 'Door Decoration' }
      ],
      variants: [],
      inventory: { total: 15, available: 15, reserved: 0 },
      materials: ['Gold Thread', 'Silk'],
      colors: ['Gold', 'Yellow'],
      tags: ['Diwali', 'Toran', 'Golden', 'Door Decoration', 'Traditional'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 278, likes: 78, shares: 34, orders: 15 },
      rating: { average: 4.7, count: 78 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_6',
      artisanId: 'artisan_3',
      name: 'Marigold Flower Toran',
      description: 'Beautiful marigold flower toran bringing festive cheer to your home',
      category: 'Diwali Collection',
      subcategory: 'Flower Decorations',
      price: 599,
      originalPrice: 799,
      discount: 25,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e41?q=80&w=800', alt: 'Marigold Toran', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e41?q=80&w=800', alt: 'Flower Toran Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e41?q=80&w=800', alt: 'Marigold Decorations' }
      ],
      variants: [],
      inventory: { total: 20, available: 20, reserved: 0 },
      materials: ['Marigold Flowers', 'Thread'],
      colors: ['Orange', 'Yellow'],
      tags: ['Diwali', 'Marigold', 'Flowers', 'Festive', 'Natural'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 156, likes: 42, shares: 19, orders: 7 },
      rating: { average: 4.6, count: 56 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_7',
      artisanId: 'artisan_1',
      name: 'Handmade Paper Lanterns',
      description: 'Colorful handmade paper lanterns for festive home decoration',
      category: 'Diwali Collection',
      subcategory: 'Paper Decorations',
      price: 399,
      originalPrice: 499,
      discount: 20,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e42?q=80&w=800', alt: 'Paper Lanterns', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e42?q=80&w=800', alt: 'Lantern Detail' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e42?q=80&w=800', alt: 'Festive Lanterns' }
      ],
      variants: [],
      inventory: { total: 35, available: 35, reserved: 0 },
      materials: ['Paper', 'Bamboo'],
      colors: ['Red', 'Yellow', 'Green', 'Blue'],
      tags: ['Diwali', 'Lanterns', 'Paper', 'Handmade', 'Festive'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 198, likes: 56, shares: 28, orders: 11 },
      rating: { average: 4.5, count: 92 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'diwali_8',
      artisanId: 'artisan_2',
      name: 'Festive Candle Holders',
      description: 'Elegant brass candle holders with traditional Indian designs',
      category: 'Diwali Collection',
      subcategory: 'Candle Holders',
      price: 799,
      originalPrice: 999,
      discount: 20,
      images: [
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e43?q=80&w=800', alt: 'Candle Holders', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e43?q=80&w=800', alt: 'Brass Candle Holder' },
        { url: 'https://images.unsplash.com/photo-1606041011873-8a6d4e4b4e43?q=80&w=800', alt: 'Traditional Design' }
      ],
      variants: [],
      inventory: { total: 18, available: 18, reserved: 0 },
      materials: ['Brass'],
      colors: ['Gold', 'Bronze'],
      tags: ['Diwali', 'Candles', 'Brass', 'Traditional', 'Elegant'],
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isRejected: false,
      stats: { views: 223, likes: 67, shares: 31, orders: 13 },
      rating: { average: 4.8, count: 67 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Add Diwali products to the main products array
  products.push(...diwaliProducts);

  return products;
};

module.exports = { mockComprehensiveProducts };
