/**
 * Glass ERP Performance Testing Global Teardown
 * Cleanup after performance testing
 */

async function globalTeardown(config) {
  console.log('🧹 Cleaning up performance testing environment...');
  
  // Cleanup logic here if needed
  // For now, just log completion
  
  console.log('✅ Performance testing cleanup complete');
}

module.exports = globalTeardown;
