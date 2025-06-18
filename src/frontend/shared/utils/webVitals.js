/**
 * Glass ERP - Modern Web Vitals Performance Monitoring
 * Phase 6: Shared utility for performance tracking across all features
 * 
 * This is the modern version that will replace the legacy webVitals.js
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * Modern Web Vitals Monitor - Phase 6
 * Enhanced performance monitoring for the new architecture
 */
class ModernWebVitalsMonitor {
    constructor() {
        this.metrics = {};
        this.callbacks = [];
        this.isProduction = process.env.NODE_ENV === 'production';
        this.featureMetrics = new Map();
        
        this.init();
    }

    init() {
        if (typeof window === 'undefined') return;
        
        this.setupCoreWebVitals();
        this.setupFeatureTracking();
        this.initializeSession();
        
        console.log('🚀 Modern Web Vitals Monitor Active - Phase 6');
    }

    setupCoreWebVitals() {
        // First Contentful Paint
        onFCP((metric) => {
            this.handleMetric('FCP', metric, {
                good: 1800,
                needsImprovement: 3000
            });
        });

        // Largest Contentful Paint
        onLCP((metric) => {
            this.handleMetric('LCP', metric, {
                good: 2500,
                needsImprovement: 4000
            });
        });

        // Interaction to Next Paint (replaces FID)
        onINP((metric) => {
            this.handleMetric('INP', metric, {
                good: 200,
                needsImprovement: 500
            });
        });

        // Cumulative Layout Shift
        onCLS((metric) => {
            this.handleMetric('CLS', metric, {
                good: 0.1,
                needsImprovement: 0.25
            });
        });

        // Time to First Byte
        onTTFB((metric) => {
            this.handleMetric('TTFB', metric, {
                good: 800,
                needsImprovement: 1800
            });
        });
    }

    setupFeatureTracking() {
        // Track feature-specific performance
        this.trackFeatureLoad = (featureName, startTime) => {
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            this.featureMetrics.set(featureName, {
                loadTime,
                timestamp: Date.now(),
                type: 'feature-load'
            });

            console.log(`⚡ Feature Load: ${featureName} - ${loadTime.toFixed(2)}ms`);
            
            if (loadTime > 1000) {
                console.warn(`🐌 Slow feature load: ${featureName}`);
            }
            
            return loadTime;
        };

        // Track component render performance
        this.trackComponentRender = (componentName) => {
            const startTime = performance.now();
            
            return () => {
                const endTime = performance.now();
                const renderTime = endTime - startTime;
                
                console.log(`🎨 Component Render: ${componentName} - ${renderTime.toFixed(2)}ms`);
                
                if (renderTime > 16) { // 60fps threshold
                    console.warn(`🐌 Slow component render: ${componentName}`);
                }
                
                return renderTime;
            };
        };
    }

    handleMetric(name, metric, thresholds) {
        const rating = this.getRating(metric.value, thresholds);
        
        this.metrics[name] = {
            ...metric,
            rating,
            timestamp: Date.now(),
            feature: this.getCurrentFeature()
        };

        // Log performance issues
        if (rating === 'poor') {
            console.warn(`⚠️ Performance Issue - ${name}: ${metric.value}ms (threshold: ${thresholds.good}ms)`);
        }

        // Send to analytics in production
        if (this.isProduction) {
            this.sendToAnalytics(name, metric, rating);
        }

        // Trigger callbacks
        this.callbacks.forEach(callback => callback(name, metric, rating));

        // Update real-time dashboard
        this.updateDashboard(name, metric, rating);
    }

    getCurrentFeature() {
        if (typeof window === 'undefined') return 'unknown';
        
        const path = window.location.pathname;
        
        // Map to modern features
        const featureMap = {
            '/dashboard': 'Dashboard',
            '/employees': 'Employee Management',
            '/attendance': 'Attendance',
            '/projects': 'Project Management',
            '/communication': 'Communication',
            '/events': 'Events',
            '/auth': 'Authentication'
        };

        for (const [route, feature] of Object.entries(featureMap)) {
            if (path.startsWith(route)) {
                return feature;
            }
        }

        return path === '/' ? 'Dashboard' : 'Unknown';
    }

    getRating(value, thresholds) {
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    sendToAnalytics(metricName, metric, rating) {
        const analyticsData = {
            sessionId: this.sessionId,
            metricName,
            value: metric.value,
            rating,
            feature: this.getCurrentFeature(),
            timestamp: Date.now(),
            architecture: 'modern-frontend',
            phase: 6
        };

        // Send to analytics endpoint
        if (window.fetch) {
            fetch('/api/analytics/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(analyticsData)
            }).catch(err => {
                console.warn('Analytics reporting failed:', err);
            });
        }
    }

    updateDashboard(metricName, metric, rating) {
        // Dispatch event for real-time dashboard updates
        const event = new CustomEvent('modernWebVitalsUpdate', {
            detail: {
                metricName,
                metric,
                rating,
                feature: this.getCurrentFeature(),
                timestamp: Date.now(),
                phase: 6
            }
        });

        window.dispatchEvent(event);
    }

    initializeSession() {
        this.sessionId = `modern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.sessionStart = Date.now();
        
        console.log(`🔍 Modern Performance Session Started: ${this.sessionId}`);
    }

    // Public API
    onMetric(callback) {
        this.callbacks.push(callback);
    }

    getCurrentMetrics() {
        return this.metrics;
    }

    getFeatureMetrics() {
        return Object.fromEntries(this.featureMetrics);
    }

    generateReport() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.sessionStart,
            coreMetrics: this.metrics,
            featureMetrics: this.getFeatureMetrics(),
            architecture: 'modern-frontend',
            phase: 6,
            summary: this.generateSummary()
        };
    }

    generateSummary() {
        const summary = {
            overallRating: 'good',
            criticalIssues: 0,
            improvements: [],
            architecture: 'modern'
        };

        // Analyze metrics
        Object.entries(this.metrics).forEach(([name, metric]) => {
            if (metric.rating === 'poor') {
                summary.criticalIssues += 1;
                summary.overallRating = 'poor';
                summary.improvements.push(`Optimize ${name}: ${metric.value}ms`);
            }
        });

        return summary;
    }
}

// Create singleton instance
const modernWebVitalsMonitor = new ModernWebVitalsMonitor();

// Export for use throughout the modern architecture
export default modernWebVitalsMonitor;

// Named exports for specific functionality
export const {
    onMetric,
    getCurrentMetrics,
    getFeatureMetrics,
    generateReport,
    trackFeatureLoad,
    trackComponentRender
} = modernWebVitalsMonitor;

// Global access for debugging
if (typeof window !== 'undefined') {
    window.modernWebVitalsMonitor = modernWebVitalsMonitor;
}
