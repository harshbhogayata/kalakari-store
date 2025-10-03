#!/usr/bin/env node

/**
 * Data validation script for mock data
 * Run this to check if mock data is consistent with schemas
 */

const { validateMockData } = require('./utils/dataValidator');

console.log('🔍 Validating mock data against schemas...\n');

try {
  const result = validateMockData();
  
  console.log('📊 VALIDATION SUMMARY:');
  console.log(`   Users: ${result.summary.usersCount}`);
  console.log(`   Products: ${result.summary.productsCount}`);
  console.log(`   Orders: ${result.summary.ordersCount}`);
  console.log(`   Addresses: ${result.summary.addressesCount}`);
  console.log('');
  
  if (result.errors.length > 0) {
    console.log('❌ ERRORS FOUND:');
    result.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
    console.log('');
  }
  
  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ All data is valid and consistent!');
    process.exit(0);
  } else if (result.isValid) {
    console.log('✅ Data is valid with some warnings.');
    process.exit(0);
  } else {
    console.log('❌ Data validation failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('💥 Validation script error:', error.message);
  process.exit(1);
}
