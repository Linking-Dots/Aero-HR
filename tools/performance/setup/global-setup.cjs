const { chromium } = require('@playwright/test');

/**
 * Glass ERP Performance Testing Global Setup
 * Initializes environment for performance testing
 */

async function globalSetup(config) {
  console.log('🚀 Initializing Glass ERP Performance Testing Suite...');
  
  // Launch browser for warmup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Warmup request to ensure server is ready
    console.log('🔥 Warming up application server...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
    console.log('✅ Server warmup complete');
  } catch (error) {
    console.warn('⚠️ Server warmup failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('✅ Performance testing environment ready');
}

module.exports = globalSetup;
