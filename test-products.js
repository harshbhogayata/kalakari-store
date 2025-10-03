const axios = require('axios');

const testProducts = async () => {
  try {
    console.log('🛍️ Testing products...');
    
    const response = await axios.get('http://localhost:5000/api/dev/products?featured=true');
    
    if (response.data.success) {
      console.log('✅ Products loaded successfully!');
      console.log(`Found ${response.data.data.products.length} featured products:`);
      
      response.data.data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ₹${product.price}`);
      });
      
      console.log('\n🌐 You can now:');
      console.log('- Browse products on the website');
      console.log('- View product details');
      console.log('- Add products to cart');
      console.log('- Make purchases');
      
    } else {
      console.log('❌ Failed to load products:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error loading products:', error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
};

testProducts();
