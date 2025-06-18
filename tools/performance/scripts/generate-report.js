import fs from 'fs';
import path from 'path';

/**
 * Glass ERP Performance Report Generator
 * Generate comprehensive performance reports for Phase 5 optimization tracking
 */

console.log('📊 Glass ERP - Performance Report Generator');
console.log('📅 Date:', new Date().toLocaleDateString());
console.log('⏰ Time:', new Date().toLocaleTimeString());
console.log('');

const config = {
    performanceDir: path.join(process.cwd(), 'storage', 'app', 'performance'),
    outputDir: path.join(process.cwd(), 'storage', 'app', 'reports'),
    baselineFile: path.join(process.cwd(), 'storage', 'app', 'performance', 'baseline.json'),
    comparisonFile: path.join(process.cwd(), 'storage', 'app', 'performance', 'comparison.json'),
    lighthouseDir: path.join(process.cwd(), 'storage', 'app'),
    bundleStatsFile: path.join(process.cwd(), 'storage', 'app', 'bundle-stats.json')
};

async function generateComprehensiveReport() {
    console.log('📋 Generating comprehensive performance report...');
    
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Gather all available data
    const reportData = await gatherReportData();
    
    // Generate different report formats
    console.log('📄 Generating executive summary...');
    await generateExecutiveSummary(reportData);
    
    console.log('📊 Generating detailed technical report...');
    await generateTechnicalReport(reportData);
    
    console.log('📈 Generating performance dashboard...');
    await generatePerformanceDashboard(reportData);
    
    console.log('💾 Generating JSON data export...');
    await generateJSONExport(reportData);
    
    console.log('✅ Performance report generation completed!');
    console.log(`📁 Reports available in: ${config.outputDir}`);
    
    return reportData;
}

async function gatherReportData() {
    const data = {
        timestamp: new Date().toISOString(),
        baseline: null,
        comparison: null,
        lighthouse: null,
        bundleAnalysis: null,
        summary: {
            overallScore: 0,
            criticalIssues: 0,
            improvements: 0,
            regressions: 0
        }
    };

    // Load baseline data
    if (fs.existsSync(config.baselineFile)) {
        console.log('📖 Loading baseline data...');
        data.baseline = JSON.parse(fs.readFileSync(config.baselineFile, 'utf8'));
        data.summary.overallScore = data.baseline.overall.performanceScore;
    }

    // Load comparison data
    if (fs.existsSync(config.comparisonFile)) {
        console.log('📖 Loading comparison data...');
        data.comparison = JSON.parse(fs.readFileSync(config.comparisonFile, 'utf8'));
        data.summary.improvements = data.comparison.summary.improvements.length;
        data.summary.regressions = data.comparison.summary.regressions.length;
        data.summary.overallScore = data.comparison.current.performanceScore;
    }

    // Load Lighthouse data (if available)
    const lighthouseFiles = ['lighthouse-desktop.html', 'lighthouse-mobile.html'];
    lighthouseFiles.forEach(file => {
        const filePath = path.join(config.lighthouseDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`📖 Found Lighthouse report: ${file}`);
            // In a real implementation, we'd parse the Lighthouse JSON report
            if (!data.lighthouse) data.lighthouse = {};
            data.lighthouse[file.replace('.html', '')] = { available: true, path: filePath };
        }
    });

    // Load bundle analysis (if available)
    if (fs.existsSync(config.bundleStatsFile)) {
        console.log('📖 Loading bundle analysis...');
        data.bundleAnalysis = JSON.parse(fs.readFileSync(config.bundleStatsFile, 'utf8'));
    }

    // Calculate critical issues
    if (data.baseline) {
        data.summary.criticalIssues = Object.values(data.baseline.features)
            .reduce((sum, feature) => sum + feature.issues.filter(issue => issue.severity === 'high').length, 0);
    }

    return data;
}

async function generateExecutiveSummary(data) {
    const reportPath = path.join(config.outputDir, 'executive-summary.md');
    
    const report = `# Glass ERP Performance Executive Summary

**Report Generated:** ${new Date().toLocaleString()}  
**Phase:** Phase 5 - Production Optimization  
**Status:** ${getOverallStatus(data)}

## 🎯 Key Performance Indicators

| Metric | Value | Status | Trend |
|--------|--------|--------|-------|
| **Overall Performance Score** | ${data.summary.overallScore}/100 | ${getScoreStatus(data.summary.overallScore)} | ${getTrendIndicator(data)} |
| **Critical Issues** | ${data.summary.criticalIssues} | ${data.summary.criticalIssues === 0 ? '✅ None' : data.summary.criticalIssues < 5 ? '⚠️ Some' : '❌ Many'} | - |
| **Performance Improvements** | ${data.summary.improvements} | ${data.summary.improvements > 0 ? '✅ Active' : '➡️ None'} | - |
| **Performance Regressions** | ${data.summary.regressions} | ${data.summary.regressions === 0 ? '✅ None' : '⚠️ Present'} | - |

## 📊 Core Web Vitals Status

${data.baseline ? generateWebVitalsTable(data.baseline.overall.coreWebVitals) : 'Baseline data not available'}

## 🏢 Business Impact Assessment

### User Experience Impact
${getUXImpactAssessment(data)}

### Performance Risk Level
${getPerformanceRiskLevel(data)}

### Optimization ROI
${getOptimizationROI(data)}

## 📈 Recommendations for Leadership

${generateExecutiveRecommendations(data)}

## 🗓️ Next Review Date

**Recommended:** ${getNextReviewDate()}

---
*This executive summary provides a high-level overview of Glass ERP's performance status for business decision-making.*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Executive summary generated: ${reportPath}`);
}

async function generateTechnicalReport(data) {
    const reportPath = path.join(config.outputDir, 'technical-report.md');
    
    const report = `# Glass ERP Technical Performance Report

**Generated:** ${new Date().toLocaleString()}  
**Environment:** Production-Ready Phase 5  
**Analysis Period:** ${data.baseline ? new Date(data.baseline.timestamp).toLocaleDateString() : 'N/A'} - ${new Date().toLocaleDateString()}

## 🔧 Technical Performance Analysis

### Performance Baseline Summary
${data.baseline ? generateBaselineTechnicalSummary(data.baseline) : 'No baseline data available'}

### Performance Comparison Analysis
${data.comparison ? generateComparisonTechnicalSummary(data.comparison) : 'No comparison data available'}

### Bundle Analysis
${data.bundleAnalysis ? generateBundleAnalysisSummary(data.bundleAnalysis) : 'Bundle analysis not available'}

## 📦 Feature Module Performance Detail

${data.baseline ? generateFeatureModuleDetails(data.baseline.features) : 'Feature module data not available'}

## 🎯 Core Web Vitals Deep Dive

${data.baseline ? generateCoreWebVitalsAnalysis(data.baseline.overall.coreWebVitals) : 'Core Web Vitals data not available'}

## 🔍 Performance Issues Analysis

${data.baseline ? generateIssuesAnalysis(data.baseline.features) : 'Issues analysis not available'}

## 💡 Technical Optimization Recommendations

${generateTechnicalRecommendations(data)}

## 📊 Performance Monitoring Setup

### Current Monitoring Status
- **Web Vitals Monitoring:** ${data.baseline ? '✅ Active' : '❌ Not Setup'}
- **Real-time Dashboard:** ${data.baseline ? '✅ Available' : '❌ Not Available'}
- **Automated Alerts:** ${data.comparison ? '✅ Configured' : '⚠️ Manual Only'}
- **Performance Budgets:** ${data.baseline ? '✅ Defined' : '❌ Not Set'}

### Recommended Monitoring Enhancements
1. **Real-time Performance Alerts**
2. **Automated Performance Regression Detection**
3. **User-centric Performance Metrics**
4. **Performance Budget Enforcement**

## 🚀 Phase 5 Optimization Progress

### Completed Optimizations
- ✅ Performance monitoring infrastructure
- ✅ Web Vitals integration
- ✅ Bundle analysis configuration
- ✅ Baseline establishment
- ✅ Automated reporting

### In Progress
- 🔄 Feature-based code splitting
- 🔄 Critical resource optimization
- 🔄 Performance regression testing
- 🔄 Production deployment pipeline

### Planned
- 📅 Advanced caching strategies
- 📅 CDN optimization
- 📅 Server-side performance tuning
- 📅 Third-party service optimization

---
*This technical report provides detailed performance analysis for development and operations teams.*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📊 Technical report generated: ${reportPath}`);
}

async function generatePerformanceDashboard(data) {
    const dashboardPath = path.join(config.outputDir, 'performance-dashboard.html');
    
    const dashboard = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glass ERP Performance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #1f2937; }
        .metric-label { color: #6b7280; margin-bottom: 10px; }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-error { color: #ef4444; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-item { padding: 10px; margin: 5px 0; background: #f9fafb; border-radius: 4px; border-left: 4px solid #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Glass ERP Performance Dashboard</h1>
            <p>Real-time performance monitoring for Phase 5 optimization</p>
            <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Performance Score</div>
                <div class="metric-value ${getScoreColorClass(data.summary.overallScore)}">${data.summary.overallScore}/100</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Critical Issues</div>
                <div class="metric-value ${data.summary.criticalIssues === 0 ? 'status-good' : 'status-error'}">${data.summary.criticalIssues}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Improvements</div>
                <div class="metric-value status-good">${data.summary.improvements}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Regressions</div>
                <div class="metric-value ${data.summary.regressions === 0 ? 'status-good' : 'status-warning'}">${data.summary.regressions}</div>
            </div>
        </div>

        ${data.baseline ? generateWebVitalsDashboard(data.baseline.overall.coreWebVitals) : ''}

        ${data.baseline ? generateFeaturePerformanceDashboard(data.baseline.features) : ''}

        <div class="chart-container">
            <h3>🔗 Additional Resources</h3>
            <ul>
                <li><a href="../performance/baseline.json">Download Baseline Data (JSON)</a></li>
                <li><a href="../performance/comparison.json">Download Comparison Data (JSON)</a></li>
                ${data.lighthouse ? Object.keys(data.lighthouse).map(key => 
                    `<li><a href="../${key}.html">View ${key} Lighthouse Report</a></li>`
                ).join('') : ''}
                <li><a href="executive-summary.md">Executive Summary Report</a></li>
                <li><a href="technical-report.md">Technical Performance Report</a></li>
            </ul>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => {
            location.reload();
        }, 300000);
        
        // Performance data for potential charts
        window.performanceData = ${JSON.stringify(data, null, 2)};
    </script>
</body>
</html>`;

    fs.writeFileSync(dashboardPath, dashboard);
    console.log(`📈 Performance dashboard generated: ${dashboardPath}`);
}

async function generateJSONExport(data) {
    const exportPath = path.join(config.outputDir, 'performance-export.json');
    
    const exportData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            version: '1.0.0',
            phase: 'Phase 5 - Production Optimization',
            reportType: 'comprehensive'
        },
        summary: data.summary,
        baseline: data.baseline,
        comparison: data.comparison,
        recommendations: generateAllRecommendations(data),
        nextSteps: generateNextSteps(data)
    };

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`💾 JSON export generated: ${exportPath}`);
}

// Helper functions
function getOverallStatus(data) {
    if (data.summary.overallScore >= 90) return '🟢 Excellent';
    if (data.summary.overallScore >= 70) return '🟡 Good';
    if (data.summary.overallScore >= 50) return '🟠 Needs Improvement';
    return '🔴 Poor';
}

function getScoreStatus(score) {
    if (score >= 90) return '✅ Excellent';
    if (score >= 70) return '✅ Good';
    if (score >= 50) return '⚠️ Needs Improvement';
    return '❌ Poor';
}

function getScoreColorClass(score) {
    if (score >= 90) return 'status-good';
    if (score >= 70) return 'status-good';
    if (score >= 50) return 'status-warning';
    return 'status-error';
}

function getTrendIndicator(data) {
    if (!data.comparison) return '➡️';
    return data.comparison.summary.overallTrend === 'improving' ? '📈' : 
           data.comparison.summary.overallTrend === 'declining' ? '📉' : '➡️';
}

function generateWebVitalsTable(vitals) {
    return `| Metric | Value | Status |
|--------|--------|--------|
| **FCP** | ${Math.round(vitals.FCP)}ms | ${vitals.FCP < 1800 ? '✅ Good' : vitals.FCP < 3000 ? '⚠️ Needs Improvement' : '❌ Poor'} |
| **LCP** | ${Math.round(vitals.LCP)}ms | ${vitals.LCP < 2500 ? '✅ Good' : vitals.LCP < 4000 ? '⚠️ Needs Improvement' : '❌ Poor'} |
| **FID** | ${Math.round(vitals.FID)}ms | ${vitals.FID < 100 ? '✅ Good' : vitals.FID < 300 ? '⚠️ Needs Improvement' : '❌ Poor'} |
| **INP** | ${Math.round(vitals.INP || 0)}ms | ${(vitals.INP || 0) < 200 ? '✅ Good' : (vitals.INP || 0) < 500 ? '⚠️ Needs Improvement' : '❌ Poor'} |
| **CLS** | ${vitals.CLS.toFixed(3)} | ${vitals.CLS < 0.1 ? '✅ Good' : vitals.CLS < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor'} |
| **TTFB** | ${Math.round(vitals.TTFB)}ms | ${vitals.TTFB < 800 ? '✅ Good' : vitals.TTFB < 1800 ? '⚠️ Needs Improvement' : '❌ Poor'} |`;
}

function getUXImpactAssessment(data) {
    if (data.summary.overallScore >= 80) {
        return '**✅ Positive Impact:** Users experience fast, responsive interface with minimal delays.';
    } else if (data.summary.overallScore >= 60) {
        return '**⚠️ Moderate Impact:** Some users may experience delays, but overall usability remains acceptable.';
    } else {
        return '**❌ Negative Impact:** Performance issues significantly affect user experience and productivity.';
    }
}

function getPerformanceRiskLevel(data) {
    const criticalIssues = data.summary.criticalIssues;
    const regressions = data.summary.regressions;
    
    if (criticalIssues === 0 && regressions === 0) {
        return '**🟢 Low Risk:** Performance is stable with no critical issues.';
    } else if (criticalIssues < 3 && regressions < 3) {
        return '**🟡 Medium Risk:** Some performance concerns require attention.';
    } else {
        return '**🔴 High Risk:** Multiple critical issues require immediate action.';
    }
}

function getOptimizationROI(data) {
    if (data.summary.improvements > data.summary.regressions) {
        return '**📈 Positive ROI:** Optimization efforts are yielding measurable improvements.';
    } else if (data.summary.improvements === data.summary.regressions) {
        return '**➡️ Neutral ROI:** Optimization efforts maintaining current performance levels.';
    } else {
        return '**📉 Negative ROI:** Performance declining, optimization strategy needs review.';
    }
}

function generateExecutiveRecommendations(data) {
    const recommendations = [];
    
    if (data.summary.overallScore < 70) {
        recommendations.push('**Immediate Action Required:** Invest in comprehensive performance optimization to improve user satisfaction.');
    }
    
    if (data.summary.criticalIssues > 0) {
        recommendations.push('**Resource Allocation:** Assign dedicated development resources to address critical performance issues.');
    }
    
    if (data.summary.improvements > 0) {
        recommendations.push('**Continue Investment:** Current optimization efforts showing positive results, maintain current resource allocation.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('**Maintain Excellence:** Performance is meeting targets, continue monitoring and proactive optimization.');
    }
    
    return recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
}

function getNextReviewDate() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toLocaleDateString();
}

function generateAllRecommendations(data) {
    // Combine all recommendations from various sources
    const recommendations = [];
    
    if (data.baseline?.overall?.recommendations) {
        recommendations.push(...data.baseline.overall.recommendations);
    }
    
    if (data.comparison?.recommendations) {
        recommendations.push(...data.comparison.recommendations);
    }
    
    return recommendations;
}

function generateNextSteps(data) {
    return [
        'Review and address critical performance issues',
        'Implement recommended optimizations',
        'Continue monitoring performance trends',
        'Schedule next performance review',
        'Update performance baselines as improvements are made'
    ];
}

// Helper functions for technical report generation
function generateBaselineTechnicalSummary(baseline) {
    return `
**Performance Score:** ${baseline.overall.performanceScore}/100  
**Average Load Time:** ${baseline.overall.averageLoadTime.toFixed(0)}ms  
**Total Features:** ${Object.keys(baseline.features).length}  
**Total Issues:** ${baseline.overall.totalIssues}  

**Core Web Vitals Baseline:**
- FCP: ${baseline.overall.coreWebVitals.FCP.toFixed(0)}ms
- LCP: ${baseline.overall.coreWebVitals.LCP.toFixed(0)}ms  
- FID: ${baseline.overall.coreWebVitals.FID.toFixed(0)}ms
- CLS: ${baseline.overall.coreWebVitals.CLS.toFixed(3)}
- TTFB: ${baseline.overall.coreWebVitals.TTFB.toFixed(0)}ms
`;
}

function generateComparisonTechnicalSummary(comparison) {
    return `
**Performance Score Change:** ${comparison.baseline.performanceScore} → ${comparison.current.performanceScore} (${(comparison.current.performanceScore - comparison.baseline.performanceScore).toFixed(0)})  
**Overall Trend:** ${comparison.summary.overallTrend.toUpperCase()}  
**Total Changes:** ${comparison.summary.totalChanges}  
**Improvements:** ${comparison.summary.improvements.length}  
**Regressions:** ${comparison.summary.regressions.length}  

**Core Web Vitals Changes:**
${Object.entries(comparison.changes.coreWebVitals).map(([metric, data]) => 
    `- ${metric}: ${formatMetricValue(metric, data.baseline)} → ${formatMetricValue(metric, data.current)} (${data.change.toFixed(1)}%)`
).join('\n')}
`;
}

function generateBundleAnalysisSummary(bundleAnalysis) {
    return `
**Bundle Analysis Summary:**
- Total bundle size optimization opportunities identified
- Feature-based code splitting recommendations available
- Critical resource loading optimization potential detected
`;
}

function generateFeatureModuleDetails(features) {
    return Object.entries(features).map(([name, feature]) => `
### ${name} (${feature.priority} priority)
- **Average Load Time:** ${feature.averageLoadTime.toFixed(0)}ms
- **Target:** ${feature.target}ms
- **Status:** ${feature.averageLoadTime <= feature.target ? '✅ Meeting Target' : '⚠️ Exceeds Target'}
- **Routes:** ${Object.keys(feature.routes).length}
- **Issues:** ${feature.issues.length}

**Route Performance:**
${Object.entries(feature.routes).map(([route, data]) => 
    `- ${route}: ${data.loadTime}ms`
).join('\n')}
`).join('\n');
}

function generateCoreWebVitalsAnalysis(vitals) {
    return `
| Metric | Value | Status | Recommendation |
|--------|--------|--------|----------------|
| **FCP** | ${Math.round(vitals.FCP)}ms | ${vitals.FCP < 1800 ? '✅ Good' : vitals.FCP < 3000 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${vitals.FCP > 1800 ? 'Optimize critical resource delivery' : 'Maintain current performance'} |
| **LCP** | ${Math.round(vitals.LCP)}ms | ${vitals.LCP < 2500 ? '✅ Good' : vitals.LCP < 4000 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${vitals.LCP > 2500 ? 'Optimize largest contentful elements' : 'Maintain current performance'} |
| **FID** | ${Math.round(vitals.FID)}ms | ${vitals.FID < 100 ? '✅ Good' : vitals.FID < 300 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${vitals.FID > 100 ? 'Reduce JavaScript execution time' : 'Maintain current performance'} |
| **INP** | ${Math.round(vitals.INP || 0)}ms | ${(vitals.INP || 0) < 200 ? '✅ Good' : (vitals.INP || 0) < 500 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${(vitals.INP || 0) > 200 ? 'Optimize interaction responsiveness' : 'Maintain current performance'} |
| **CLS** | ${vitals.CLS.toFixed(3)} | ${vitals.CLS < 0.1 ? '✅ Good' : vitals.CLS < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${vitals.CLS > 0.1 ? 'Set explicit dimensions for dynamic content' : 'Maintain current performance'} |
| **TTFB** | ${Math.round(vitals.TTFB)}ms | ${vitals.TTFB < 800 ? '✅ Good' : vitals.TTFB < 1800 ? '⚠️ Needs Improvement' : '❌ Poor'} | ${vitals.TTFB > 800 ? 'Optimize server response time' : 'Maintain current performance'} |
`;
}

function generateIssuesAnalysis(features) {
    const allIssues = Object.values(features).flatMap(feature => 
        feature.issues.map(issue => ({ ...issue, feature: feature.name }))
    );
    
    if (allIssues.length === 0) {
        return '✅ No performance issues detected in the current baseline.';
    }
    
    const criticalIssues = allIssues.filter(issue => issue.severity === 'high');
    const mediumIssues = allIssues.filter(issue => issue.severity === 'medium');
    
    return `
**Critical Issues (${criticalIssues.length}):**
${criticalIssues.length === 0 ? 'None' : criticalIssues.map(issue => 
    `- **${issue.feature}:** ${issue.type} - ${issue.route} (${issue.value}ms vs ${issue.target}ms target)`
).join('\n')}

**Medium Priority Issues (${mediumIssues.length}):**
${mediumIssues.length === 0 ? 'None' : mediumIssues.map(issue => 
    `- **${issue.feature}:** ${issue.type} - ${issue.route} (${issue.value}ms vs ${issue.target}ms target)`
).join('\n')}
`;
}

function generateTechnicalRecommendations(data) {
    const recommendations = [];
    
    if (data.baseline) {
        if (data.baseline.overall.performanceScore < 80) {
            recommendations.push({
                priority: 'High',
                category: 'Overall Performance',
                action: 'Implement comprehensive performance optimization strategy',
                technical: 'Review bundle splitting, lazy loading, and critical resource optimization'
            });
        }
        
        // Check for slow features
        Object.values(data.baseline.features).forEach(feature => {
            if (feature.averageLoadTime > feature.target * 1.2) {
                recommendations.push({
                    priority: 'High',
                    category: `${feature.name} Optimization`,
                    action: 'Optimize feature loading performance',
                    technical: 'Implement feature-specific code splitting and resource optimization'
                });
            }
        });
    }
    
    if (data.comparison && data.comparison.summary.regressions.length > 0) {
        recommendations.push({
            priority: 'Critical',
            category: 'Performance Regression',
            action: 'Address performance regressions immediately',
            technical: 'Review recent changes and implement performance monitoring alerts'
        });
    }
    
    if (recommendations.length === 0) {
        return '✅ No specific technical recommendations at this time. Continue monitoring and proactive optimization.';
    }
    
    return recommendations.map(rec => `
### ${rec.priority}: ${rec.category}
**Action:** ${rec.action}  
**Technical Details:** ${rec.technical}
`).join('');
}

// Additional helper functions for dashboard generation
function generateWebVitalsDashboard(vitals) {
    return `
        <div class="chart-container">
            <h3>🎯 Core Web Vitals Performance</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">First Contentful Paint (FCP)</div>
                    <div class="metric-value ${vitals.FCP < 1800 ? 'status-good' : vitals.FCP < 3000 ? 'status-warning' : 'status-error'}">${Math.round(vitals.FCP)}ms</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 1.8s</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Largest Contentful Paint (LCP)</div>
                    <div class="metric-value ${vitals.LCP < 2500 ? 'status-good' : vitals.LCP < 4000 ? 'status-warning' : 'status-error'}">${Math.round(vitals.LCP)}ms</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 2.5s</div>
                </div>                <div class="metric-card">
                    <div class="metric-label">First Input Delay (FID)</div>
                    <div class="metric-value ${vitals.FID < 100 ? 'status-good' : vitals.FID < 300 ? 'status-warning' : 'status-error'}">${Math.round(vitals.FID)}ms</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 100ms</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Interaction to Next Paint (INP)</div>
                    <div class="metric-value ${(vitals.INP || 0) < 200 ? 'status-good' : (vitals.INP || 0) < 500 ? 'status-warning' : 'status-error'}">${Math.round(vitals.INP || 0)}ms</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 200ms</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Cumulative Layout Shift (CLS)</div>
                    <div class="metric-value ${vitals.CLS < 0.1 ? 'status-good' : vitals.CLS < 0.25 ? 'status-warning' : 'status-error'}">${vitals.CLS.toFixed(3)}</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 0.1</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Time to First Byte (TTFB)</div>
                    <div class="metric-value ${vitals.TTFB < 800 ? 'status-good' : vitals.TTFB < 1800 ? 'status-warning' : 'status-error'}">${Math.round(vitals.TTFB)}ms</div>
                    <div style="font-size: 0.8em; color: #6b7280;">Target: &lt; 800ms</div>
                </div>
            </div>
        </div>`;
}

function generateFeaturePerformanceDashboard(features) {
    return `
        <div class="chart-container">
            <h3>📦 Feature Module Performance</h3>
            <ul class="feature-list">
                ${Object.entries(features).map(([name, feature]) => `
                    <li class="feature-item">
                        <strong>${name}</strong> (${feature.priority} priority)
                        <br>
                        Average Load Time: <span class="${feature.averageLoadTime <= feature.target ? 'status-good' : 'status-warning'}">${feature.averageLoadTime.toFixed(0)}ms</span>
                        | Target: ${feature.target}ms
                        | Routes: ${Object.keys(feature.routes).length}
                        | Issues: ${feature.issues.length}
                    </li>
                `).join('')}
            </ul>
        </div>`;
}

function formatMetricValue(metric, value) {
    switch (metric) {
        case 'CLS':
            return value.toFixed(3);
        case 'FCP':
        case 'LCP':
        case 'FID':
        case 'TTFB':
            return `${Math.round(value)}ms`;
        default:
            return value.toString();
    }
}

// Main execution
generateComprehensiveReport().catch(error => {
    console.error('❌ Error generating performance report:', error);
    process.exit(1);
});
