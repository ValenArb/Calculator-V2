#!/usr/bin/env node

/**
 * Test script for Manuals API integrations
 * 
 * Usage: node scripts/test-apis.js [manufacturer] [product-code]
 * 
 * Examples:
 * node scripts/test-apis.js abb ACS880-01
 * node scripts/test-apis.js siemens G120C
 * node scripts/test-apis.js all
 */

import { manualsAPIService } from '../src/services/manuals/manualsAPI.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const manufacturers = [
  'abb',
  'siemens', 
  'schneider',
  'rockwell',
  'phoenix',
  'eaton',
  'danfoss',
  'mitsubishi',
  'omron'
];

const testCases = {
  abb: ['ACS880-01', 'ACS550-01', 'ACS880-11'],
  siemens: ['G120C', 'G120P', 'S7-1200', 'S120-CU320'],
  schneider: ['ATV32H', 'ATV71H', 'ATV32HU'],
  rockwell: ['PowerFlex525', 'CompactLogix', 'ControlLogix'],
  phoenix: ['TRIO-PS', 'PSI-2S-24DC', 'REL-MR'],
  eaton: ['PowerXL-DE1', '9130-UPS', 'XV-102'],
  danfoss: ['FC51', 'VLT2800', 'FC302'],
  mitsubishi: ['FR-E720', 'FR-A800', 'FX5U'],
  omron: ['CP1E', 'NX-series', 'E5CC']
};

async function testManufacturer(manufacturer, productCode = null) {
  console.log(`\n🔧 Testing ${manufacturer.toUpperCase()} API...`);
  console.log(`📡 Base URL: ${manualsAPIService.baseURLs[manufacturer] || 'Not configured'}`);
  
  try {
    const searchParams = {
      productCode: productCode || testCases[manufacturer]?.[0] || '',
      query: productCode || '',
      category: '',
      language: 'en'
    };

    console.log(`🔍 Searching for: ${searchParams.productCode || searchParams.query}`);
    
    const startTime = Date.now();
    const results = await manualsAPIService.searchManuals(manufacturer, searchParams);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Success! Found ${results.length} manuals in ${duration}ms`);
    
    if (results.length > 0) {
      const manual = results[0];
      console.log(`📖 Sample Result:`);
      console.log(`   Title: ${manual.title}`);
      console.log(`   Product Code: ${manual.productCode}`);
      console.log(`   Size: ${manual.fileSize}`);
      console.log(`   Pages: ${manual.pages}`);
      console.log(`   Version: ${manual.version}`);
    }

    // Test rate limiting
    const rateLimitInfo = manualsAPIService.rateLimits[manufacturer];
    console.log(`🚦 Rate Limit: ${rateLimitInfo.calls}/${rateLimitInfo.limit} calls used`);
    
    return { success: true, count: results.length, duration };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllManufacturers() {
  console.log('🧪 Testing All Manufacturer APIs\n');
  console.log('=' * 50);
  
  const results = {};
  
  for (const manufacturer of manufacturers) {
    const result = await testManufacturer(manufacturer);
    results[manufacturer] = result;
    
    // Wait between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Summary:');
  console.log('=' * 30);
  
  let successCount = 0;
  let totalManuals = 0;
  
  for (const [manufacturer, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const info = result.success 
      ? `${result.count} manuals, ${result.duration}ms`
      : result.error;
    
    console.log(`${status} ${manufacturer.padEnd(12)} - ${info}`);
    
    if (result.success) {
      successCount++;
      totalManuals += result.count || 0;
    }
  }
  
  console.log(`\n🎯 Results: ${successCount}/${manufacturers.length} APIs working`);
  console.log(`📚 Total manuals found: ${totalManuals}`);
  
  if (successCount === manufacturers.length) {
    console.log('🎉 All APIs are working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some APIs need attention. Check configuration.');
    process.exit(1);
  }
}

async function testEnvironmentVariables() {
  console.log('🔐 Checking Environment Variables...\n');
  
  const requiredVars = {
    'ABB': ['ABB_API_BASE'],
    'Siemens': ['SIEMENS_API_KEY', 'SIEMENS_API_BASE'],
    'Schneider': ['SCHNEIDER_API_KEY', 'SCHNEIDER_CLIENT_ID', 'SCHNEIDER_API_BASE'],
    'Rockwell': ['ROCKWELL_API_KEY', 'ROCKWELL_API_BASE'],
    'Phoenix Contact': ['PHOENIX_API_KEY', 'PHOENIX_CLIENT_ID', 'PHOENIX_API_BASE'],
    'Eaton': ['EATON_CLIENT_ID', 'EATON_CLIENT_SECRET', 'EATON_API_BASE'],
    'Danfoss': ['DANFOSS_API_KEY', 'DANFOSS_PARTNER_ID', 'DANFOSS_API_BASE'],
    'Mitsubishi': ['MITSUBISHI_API_KEY', 'MITSUBISHI_API_BASE'],
    'Omron': ['OMRON_CLIENT_ID', 'OMRON_CLIENT_SECRET', 'OMRON_API_BASE']
  };
  
  for (const [manufacturer, vars] of Object.entries(requiredVars)) {
    console.log(`${manufacturer}:`);
    
    for (const varName of vars) {
      const value = process.env[varName];
      const status = value ? '✅' : (varName.includes('API_BASE') ? '⚠️' : '❌');
      const info = value ? 'Configured' : 'Not set';
      
      console.log(`  ${status} ${varName.padEnd(25)} - ${info}`);
    }
    
    console.log();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const manufacturer = args[0];
  const productCode = args[1];
  
  console.log('🔧 Manuals API Test Suite');
  console.log('========================\n');
  
  // Check environment first
  await testEnvironmentVariables();
  
  if (!manufacturer || manufacturer === 'help') {
    console.log('Usage Examples:');
    console.log('  node scripts/test-apis.js all                    - Test all manufacturers');
    console.log('  node scripts/test-apis.js abb                    - Test ABB API');
    console.log('  node scripts/test-apis.js siemens G120C          - Test Siemens with specific product');
    console.log('  node scripts/test-apis.js env                    - Check environment variables');
    return;
  }
  
  if (manufacturer === 'env') {
    return; // Already checked above
  }
  
  if (manufacturer === 'all') {
    await testAllManufacturers();
  } else if (manufacturers.includes(manufacturer)) {
    await testManufacturer(manufacturer, productCode);
  } else {
    console.log(`❌ Unknown manufacturer: ${manufacturer}`);
    console.log(`Available: ${manufacturers.join(', ')}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});