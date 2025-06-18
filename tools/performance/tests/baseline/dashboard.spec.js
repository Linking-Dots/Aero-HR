const { test, expect } = require('@playwright/test');
const { performanceUtils } = require('../../performance.test.config');

/**
 * Glass ERP Dashboard Performance Baseline Test
 * Establishes performance baseline for the main dashboard
 */

test.describe('Dashboard Performance Baseline', () => {
  test('Dashboard load time should be under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Assert load time
    expect(loadTime).toBeLessThan(2000);
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('Dashboard Core Web Vitals should meet targets', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const vitals = await performanceUtils.measureWebVitals(page);
    
    // Assert Core Web Vitals thresholds
    if (vitals.FCP) {
      expect(vitals.FCP.value).toBeLessThan(performanceUtils.thresholds.FCP.poor);
      console.log(`FCP: ${vitals.FCP.value}ms`);
    }
    
    if (vitals.LCP) {
      expect(vitals.LCP.value).toBeLessThan(performanceUtils.thresholds.LCP.poor);
      console.log(`LCP: ${vitals.LCP.value}ms`);
    }
    
    if (vitals.CLS) {
      expect(vitals.CLS.value).toBeLessThan(performanceUtils.thresholds.CLS.poor);
      console.log(`CLS: ${vitals.CLS.value}`);
    }
  });

  test('Dashboard bundle size should be optimized', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const bundleSize = await performanceUtils.measureBundleSize(page);
    
    // Assert reasonable bundle sizes
    expect(bundleSize.jsSize).toBeLessThan(500 * 1024); // 500KB
    expect(bundleSize.cssSize).toBeLessThan(100 * 1024); // 100KB
    
    console.log(`JS Bundle: ${Math.round(bundleSize.jsSize / 1024)}KB`);
    console.log(`CSS Bundle: ${Math.round(bundleSize.cssSize / 1024)}KB`);
  });
});
