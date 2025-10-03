const axios = require('axios');

const setupData = async () => {
  try {
    console.log('🚀 Setting up sample data...');
    const response = await axios.post('http://localhost:5000/api/dev/seeded');
    
    if (response.data.success) {
      console.log('✅ Sample data setup complete!');
      console.log('\n📝 You can now login with these credentials:');
      console.log('Admin: admin@kalakari.shop / admin123');
      console.log('Customer: priya@gmail.com / password123');
      console.log('Customer: arjun@gmail.com / password123');
      console.log('Artisan: raj@craftville.com / password123');
      console.log('Artisan: sunita@textile.com / password123');
    } else {
      console.log('❌ Setup failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
};

setupData();
