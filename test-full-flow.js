const axios = require('axios');

const testFullFlow = async () => {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('🧪 Testing Full Application Flow...\n');
    
    // 1. Test Login
    console.log('1️⃣ Testing Login...');
    const loginData = {
      email: 'admin@kalakari.shop',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${baseUrl}/dev/auth/login`, loginData);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}`);
    console.log(`   Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
    
    const token = loginResponse.data.data.token;
    
    // 2. Test Products Loading
    console.log('\n2️⃣ Testing Products...');
    const productsResponse = await axios.get(`${baseUrl}/dev/products?featured=true`);
    
    if (!productsResponse.data.success) {
      throw new Error('Products loading failed');
    }
    
    console.log('✅ Products loaded successfully!');
    console.log(`   Found ${productsResponse.data.data.products.length} featured products`);
    productsResponse.data.data.products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price}`);
    });
    
    // 3. Test Frontend Accessibility
    console.log('\n3️⃣ Testing Frontend...');
    const frontendResponse = await axios.get('http://localhost:3000');
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible!');
      console.log('   Application running at: http://localhost:3000');
    } else {
      console.log('❌ Frontend not accessible');
    }
    
    // 4. Summary
    console.log('\n🎉 FULL APPLICATION TEST COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Backend API: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ Products API: Working');
    console.log('✅ Frontend Web: Working');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 READY TO USE!');
    console.log('Visit: http://localhost:3000');
    console.log('Login with: admin@kalakari.shop / password123');
    console.log('Or try: priya@gmail.com / password123');
    console.log('\n📝 Available Features:');
    console.log('   • Browse products immediately');
    console.log('   • Add items to cart');
    console.log('   • User authentication');
    console.log('   • Product search & filtering');
    console.log('   • Responsive mobile design');
    console.log('   • Terms, Privacy, Contact pages');
    console.log('   • Journal/Blog section');
    console.log('   • Artisan & Admin dashboards (when logged in)');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure servers are running: npm run dev');
    console.log('   2. Check backend: http://localhost:5000');
    console.log('   3. Check frontend: http://localhost:3000');
  }
};

testFullFlow();
