// Data consistency validator for mock data vs database schema
const validateMockData = () => {
  const errors = [];
  const warnings = [];

  // Import mock data
  const { mockUsers, mockProducts, mockOrders, mockAddresses } = require('../mock-auth');
  const { mockComprehensiveProducts } = require('../mock-comprehensive-products');

  // Validate User data consistency
  const validateUsers = () => {
    const requiredUserFields = ['_id', 'name', 'email', 'phone', 'password', 'role'];
    const validRoles = ['customer', 'artisan', 'admin'];
    
    mockUsers.forEach((user, index) => {
      // Check required fields
      requiredUserFields.forEach(field => {
        if (!user[field]) {
          errors.push(`User ${index}: Missing required field '${field}'`);
        }
      });

      // Validate role
      if (user.role && !validRoles.includes(user.role)) {
        errors.push(`User ${index}: Invalid role '${user.role}'`);
      }

      // Validate email format
      if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push(`User ${index}: Invalid email format '${user.email}'`);
      }

      // Validate phone format (Indian)
      if (user.phone && !/^[6-9]\d{9}$/.test(user.phone)) {
        warnings.push(`User ${index}: Phone number '${user.phone}' may not be valid Indian format`);
      }

      // Check artisan-specific fields
      if (user.role === 'artisan') {
        const artisanFields = ['shopName', 'description', 'location', 'verified'];
        artisanFields.forEach(field => {
          if (!user[field]) {
            warnings.push(`Artisan ${index}: Missing recommended field '${field}'`);
          }
        });
      }
    });
  };

  // Validate Product data consistency
  const validateProducts = () => {
    const products = mockComprehensiveProducts();
    const requiredProductFields = ['_id', 'name', 'description', 'category', 'price', 'artisanId'];
    const validCategories = [
      'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 
      'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor',
      'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other',
      'Diwali Collection', 'Festive Decor', 'Traditional Crafts', 'Paintings'
    ];

    products.forEach((product, index) => {
      // Check required fields
      requiredProductFields.forEach(field => {
        if (!product[field]) {
          errors.push(`Product ${index}: Missing required field '${field}'`);
        }
      });

      // Validate category
      if (product.category && !validCategories.includes(product.category)) {
        errors.push(`Product ${index}: Invalid category '${product.category}'`);
      }

      // Validate price
      if (product.price && (typeof product.price !== 'number' || product.price < 1)) {
        errors.push(`Product ${index}: Invalid price '${product.price}'`);
      }

      // Validate artisanId exists in mockUsers
      if (product.artisanId && !mockUsers.find(u => u._id === product.artisanId)) {
        errors.push(`Product ${index}: Artisan ID '${product.artisanId}' not found in mockUsers`);
      }

      // Validate inventory structure
      if (product.inventory) {
        if (typeof product.inventory.total !== 'number' || product.inventory.total < 0) {
          errors.push(`Product ${index}: Invalid inventory.total '${product.inventory.total}'`);
        }
        if (typeof product.inventory.available !== 'number' || product.inventory.available < 0) {
          errors.push(`Product ${index}: Invalid inventory.available '${product.inventory.available}'`);
        }
      }

      // Validate images structure
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((image, imgIndex) => {
          if (!image.url) {
            errors.push(`Product ${index}: Image ${imgIndex} missing URL`);
          }
        });
      }
    });
  };

  // Validate Order data consistency
  const validateOrders = () => {
    Object.keys(mockOrders).forEach(userId => {
      const userOrders = mockOrders[userId];
      
      // Validate user exists
      if (!mockUsers.find(u => u._id === userId)) {
        errors.push(`Orders for user '${userId}' but user not found in mockUsers`);
        return;
      }

      userOrders.forEach((order, index) => {
        const requiredOrderFields = ['orderId', 'customerId', 'items', 'shippingAddress', 'payment'];
        
        requiredOrderFields.forEach(field => {
          if (!order[field]) {
            errors.push(`Order ${index} for user ${userId}: Missing required field '${field}'`);
          }
        });

        // Validate customerId matches userId
        if (order.customerId !== userId) {
          errors.push(`Order ${index}: customerId '${order.customerId}' doesn't match userId '${userId}'`);
        }

        // Validate items structure
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item, itemIndex) => {
            if (!item.productId || !item.quantity || !item.price) {
              errors.push(`Order ${index} Item ${itemIndex}: Missing required fields`);
            }
          });
        }

        // Validate shipping address structure
        if (order.shippingAddress) {
          const requiredAddressFields = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
          requiredAddressFields.forEach(field => {
            if (!order.shippingAddress[field]) {
              errors.push(`Order ${index}: Shipping address missing '${field}'`);
            }
          });
        }
      });
    });
  };

  // Validate Address data consistency
  const validateAddresses = () => {
    Object.keys(mockAddresses).forEach(userId => {
      const userAddresses = mockAddresses[userId];
      
      // Validate user exists
      if (!mockUsers.find(u => u._id === userId)) {
        errors.push(`Addresses for user '${userId}' but user not found in mockUsers`);
        return;
      }

      userAddresses.forEach((address, index) => {
        const requiredAddressFields = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
        
        requiredAddressFields.forEach(field => {
          if (!address[field]) {
            errors.push(`Address ${index} for user ${userId}: Missing required field '${field}'`);
          }
        });
      });
    });
  };

  // Run all validations
  validateUsers();
  validateProducts();
  validateOrders();
  validateAddresses();

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      usersCount: mockUsers.length,
      productsCount: mockComprehensiveProducts().length,
      ordersCount: Object.values(mockOrders).flat().length,
      addressesCount: Object.values(mockAddresses).flat().length
    }
  };
};

module.exports = {
  validateMockData
};
