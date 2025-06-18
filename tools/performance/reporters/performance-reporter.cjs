/**
 * Glass ERP Performance Reporter
 * Custom Playwright reporter for performance testing
 */

class PerformanceReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = [];
  }

  onBegin(config, suite) {
    console.log(`🎯 Starting ${suite.allTests().length} performance tests`);
  }

  onTestEnd(test, result) {
    const testName = test.title;
    const status = result.status;
    const duration = result.duration;
    
    this.results.push({
      name: testName,
      status,
      duration,
      passed: status === 'passed'
    });
    
    const statusIcon = status === 'passed' ? '✅' : '❌';
    console.log(`${statusIcon} ${testName} (${duration}ms)`);
  }

  onEnd(result) {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log(`\n📊 Performance Test Results:`);
    console.log(`✅ Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('🎉 All performance tests passed!');
    } else {
      console.log('⚠️ Some performance tests failed');
    }
  }
}

module.exports = PerformanceReporter;
