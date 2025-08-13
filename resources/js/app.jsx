import './bootstrap';
import '../css/app.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import { AppStateProvider } from './Contexts/AppStateContext';

// Enhanced axios configuration with interceptors
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Add CSRF token to all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Performance monitoring only in development or when explicitly enabled
const ENABLE_MONITORING = import.meta.env.DEV || 
    (typeof window !== 'undefined' && window.location.search.includes('monitor=true')) ||
    (typeof window !== 'undefined' && localStorage.getItem('enable-monitoring') === 'true');

// Optimized request interceptor
if (ENABLE_MONITORING) {
    axios.interceptors.request.use(
        (config) => {
            config.metadata = { startTime: new Date() };
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor for performance monitoring and error handling
    axios.interceptors.response.use(
        (response) => {
            if (response.config.metadata) {
                const endTime = new Date();
                const duration = endTime - response.config.metadata.startTime;
                
                // Log slow requests (> 2 seconds)
                if (duration > 2000) {
                    console.warn(`Slow API response: ${response.config.url} took ${duration}ms`);
                }
            }
            return response;
        },
        (error) => {
            // Enhanced error logging
            if (error.response) {
                console.error('API Error:', {
                    status: error.response.status,
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.response.data
                });
            }
            if (error.response && error.response.status === 419) {
                window.location.reload();
            }
            return Promise.reject(error);
        }
    );
}

const appName = 'DBEDC ERP';

createInertiaApp({
    progress: {
        color: '#29d',
        delay: 100, // Reduced delay for better SPA feel
        includeCSS: true,
        showSpinner: false,
    },
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Performance monitoring for initial render
        const renderStart = performance.now();
        
        root.render(
            <ErrorBoundary>
                <AppStateProvider>
                    <App {...props} />
                </AppStateProvider>
            </ErrorBoundary>
        );
        
        // Log render performance only in development
        if (ENABLE_MONITORING) {
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;
            
            if (renderTime > 100) { // Log slow renders
                console.warn(`Slow initial render: ${renderTime.toFixed(2)}ms`);
            }
        }
        
        // Track page load performance (optimized)
        if (ENABLE_MONITORING && typeof window !== 'undefined' && 'performance' in window) {
            window.addEventListener('load', () => {
                // Use requestIdleCallback to defer performance logging
                const logPerformance = () => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
                        
                        // Log to backend only if load time is significant and user opted in
                        if (loadTime > 5000 && localStorage.getItem('performance-logging') === 'true') {
                            fetch('/api/log-performance', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': token?.content || ''
                                },
                                body: JSON.stringify({
                                    metric_type: 'page_load',
                                    identifier: window.location.pathname,
                                    execution_time_ms: loadTime,
                                    metadata: {
                                        url: window.location.href,
                                        user_agent: navigator.userAgent.slice(0, 200) // Truncate
                                    }
                                })
                            }).catch(err => console.warn('Failed to log performance:', err));
                        }
                    }
                };
                
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(logPerformance);
                } else {
                    setTimeout(logPerformance, 100);
                }
            });
        }
    },
}).then(() => {
    // Initialize application monitoring only in development
    if (ENABLE_MONITORING && typeof window !== 'undefined') {
        // Monitor memory usage (throttled)
        if ('memory' in performance) {
            let lastMemoryCheck = 0;
            const checkMemory = () => {
                const now = Date.now();
                if (now - lastMemoryCheck < 30000) return; // Throttle to every 30 seconds
                lastMemoryCheck = now;
                
                const memory = performance.memory;
                const memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };
                
                // Log memory warning if usage is high
                if (memoryUsage.used > memoryUsage.limit * 0.8) {
                    console.warn('High memory usage detected:', memoryUsage);
                }
            };
            
            // Check memory on user interaction
            ['click', 'scroll', 'keydown'].forEach(event => {
                document.addEventListener(event, checkMemory, { passive: true, once: false });
            });
        }
        
        // Monitor for unhandled promise rejections (throttled)
        let lastRejectionLog = 0;
        window.addEventListener('unhandledrejection', (event) => {
            const now = Date.now();
            if (now - lastRejectionLog < 5000) return; // Throttle to prevent spam
            lastRejectionLog = now;
            
            console.error('Unhandled promise rejection:', event.reason);
            
            // Log to backend only for critical errors
            if (event.reason && event.reason.toString().includes('ChunkLoadError')) {
                fetch('/api/log-error', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token?.content || ''
                    },
                    body: JSON.stringify({
                        error_id: `unhandled_${Date.now()}`,
                        message: `Unhandled Promise Rejection: ${event.reason}`.slice(0, 500),
                        stack: (event.reason?.stack || 'No stack trace available').slice(0, 1000),
                        component_stack: 'Promise rejection handler',
                        url: window.location.href,
                        user_agent: navigator.userAgent.slice(0, 200),
                        timestamp: new Date().toISOString()
                    })
                }).catch(() => {}); // Silent fail for error logging
            }
        });
        
        // Monitor for JavaScript errors (throttled)
        let lastErrorLog = 0;
        window.addEventListener('error', (event) => {
            const now = Date.now();
            if (now - lastErrorLog < 5000) return; // Throttle to prevent spam
            lastErrorLog = now;
            
            console.error('JavaScript error:', event.error);
            
            // Log critical errors only
            if (event.error && (
                event.error.toString().includes('ChunkLoadError') ||
                event.error.toString().includes('Loading chunk') ||
                event.error.toString().includes('Loading CSS chunk')
            )) {
                fetch('/api/log-error', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token?.content || ''
                    },
                    body: JSON.stringify({
                        error_id: `js_error_${Date.now()}`,
                        message: (event.message || 'Unknown error').slice(0, 500),
                        stack: (event.error?.stack || 'No stack trace available').slice(0, 1000),
                        component_stack: `${event.filename}:${event.lineno}:${event.colno}`,
                        url: window.location.href,
                        user_agent: navigator.userAgent.slice(0, 200),
                        timestamp: new Date().toISOString()
                    })
                }).catch(() => {}); // Silent fail for error logging
            }
        });
    }
});