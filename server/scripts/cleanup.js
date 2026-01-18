/**
 * Cleanup Script - Remove fragmented files after refactoring
 */

const fs = require('fs');
const path = require('path');

const filesToRemove = [
  // Old middleware files (now consolidated in core/middleware.js)
  'middleware/apiErrorHandler.js',
  'middleware/apiManagement.js', 
  'middleware/apiValidation.js',
  'middleware/apiVersioning.js',
  'middleware/csrf.js',
  'middleware/csrfProtection.js',
  'middleware/databaseHealth.js',
  'middleware/errorHandler.js',
  'middleware/logger.js',
  'middleware/monitoring.js',
  'middleware/performanceOptimizer.js',
  'middleware/secureCookies.js',
  'middleware/security.js',
  'middleware/securityMonitoring.js',
  'middleware/securityValidation.js',
  'middleware/upload.js',
  'middleware/validation.js',
  
  // Old route files (now consolidated in core/routes.js)
  'routes/api-docs.js',
  'routes/addresses.js',
  'routes/admin.js',
  'routes/artisans.js',
  'routes/auth.js',
  'routes/cart.js',
  'routes/contact.js',
  'routes/email.js',
  'routes/health.js',
  'routes/journal.js',
  'routes/newsletter.js',
  'routes/orders.js',
  'routes/payment.js',
  'routes/products.js',
  'routes/reviews.js',
  'routes/search.js',
  'routes/testimonials.js',
  'routes/upload.js',
  'routes/wishlist.js',
  
  // Old utility files (functionality moved to core)
  'utils/databaseValidator.js',
  'utils/dataValidator.js',
  'utils/logger.js',
  'utils/monitoring.js',
  
  // Old data files
  'comprehensive-products.js',
  'dev-data.js',
  'validate-data.js'
];

const directoriesToRemove = [
  'middleware',
  'routes', 
  'utils'
];

console.log('🧹 Starting cleanup of fragmented files...');

let removedCount = 0;
let errorCount = 0;

// Remove individual files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } else {
      console.log(`⏭️  Skipped (not found): ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${file}:`, error.message);
    errorCount++;
  }
});

// Remove empty directories
directoriesToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`✅ Removed empty directory: ${dir}`);
      } else {
        console.log(`⏭️  Directory not empty: ${dir} (${files.length} files remaining)`);
      }
    }
  } catch (error) {
    console.error(`❌ Error removing directory ${dir}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Cleanup Summary:');
console.log(`✅ Files removed: ${removedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📁 Files processed: ${filesToRemove.length}`);

if (errorCount === 0) {
  console.log('\n🎉 Cleanup completed successfully!');
  console.log('\n📋 New Structure:');
  console.log('   ├── server.js (main entry point)');
  console.log('   ├── core/');
  console.log('   │   ├── middleware.js (all middleware)');
  console.log('   │   └── routes.js (all routes)');
  console.log('   ├── models/ (database models)');
  console.log('   ├── services/ (external services)');
  console.log('   └── scripts/ (utility scripts)');
} else {
  console.log('\n⚠️  Cleanup completed with errors. Check logs above.');
}
