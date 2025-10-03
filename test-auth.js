const axios = require('axios');

const testAuth = async () => {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('🧪 Testing authentication...');
    
    // Test login with admin credentials (try mock endpoint first)
    const loginData = {
      email: 'admin@kalakari.shop',
      password: 'password123'  // Changed from admin123 to password123 for consistency
    };
    
    // Try mock endpoint first
    let endpoint = `${baseUrl}/dev/auth/login`;
    console.log(`Trying mock endpoint: ${endpoint}`);
    
    let response;
    try {
      response = await axios.post(endpoint, loginData);
    } catch (mockError) {
      console.log('Mock endpoint failed, trying regular endpoint...');
      endpoint = `${baseUrl}/auth/login`;
      response = await axios.post(endpoint, loginData);
    }
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('User:', response.data.data.user.name);
      console.log('Role:', response.data.data.user.role);
      console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
      
      console.log('\n🎉 Authentication is working! You can now:');
      console.log('- Login on the website');
      console.log('- Browse products');
      console.log('- Add items to cart');
      console.log('- Use all features');
      
      console.log('\n📝 Try these credentials:');
      console.log('Admin: admin@kalakari.shop / password123');
      console.log('Customer: priya@gmail.com / password123');
      console.log('Artisan: raj@craftville.com / password123');
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data.message || error.response.statusText);
    } else {
      console.log('❌ Connection error:', error.message);
      console.log('Make sure the server is running on http://localhost:5000');
    }
  }
};

testAuth();
