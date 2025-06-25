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
    },
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            // This supports subfolders, e.g. "Admin/Dashboard"
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
        
        // Log render performance
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        if (renderTime > 100) { // Log slow renders
            console.warn(`Slow initial render: ${renderTime.toFixed(2)}ms`);
        }
        
        // Track page load performance
        if (typeof window !== 'undefined' && 'performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
                        
                        // Log to backend if load time is significant
                        if (loadTime > 3000) {
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
                                        user_agent: navigator.userAgent
                                    }
                                })
                            }).catch(err => console.warn('Failed to log performance:', err));
                        }
                    }
                }, 100);
            });
        }
    },
}).then(r => {
    console.log('Inertia React.js app created');
    
    // Initialize application monitoring
    if (typeof window !== 'undefined') {
        // Monitor memory usage
        if ('memory' in performance) {
            const checkMemory = () => {
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
            
            // Check memory every 30 seconds
            setInterval(checkMemory, 30000);
        }
        
        // Monitor for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Log to backend
            fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token?.content || ''
                },
                body: JSON.stringify({
                    error_id: `unhandled_${Date.now()}`,
                    message: `Unhandled Promise Rejection: ${event.reason}`,
                    stack: event.reason?.stack || 'No stack trace available',
                    component_stack: 'Promise rejection handler',
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.warn('Failed to log unhandled rejection:', err));
        });
        
        // Monitor for JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            
            // Log to backend
            fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token?.content || ''
                },
                body: JSON.stringify({
                    error_id: `js_error_${Date.now()}`,
                    message: event.message,
                    stack: event.error?.stack || 'No stack trace available',
                    component_stack: `${event.filename}:${event.lineno}:${event.colno}`,
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.warn('Failed to log JavaScript error:', err));
        });
        
        // Service Worker registration for offline capability and monitoring
        if ('serviceWorker' in navigator && 'register' in navigator.serviceWorker) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/monitoring-sw.js')
                    .then(registration => {
                        console.log('Monitoring Service Worker registered:', registration);
                        
                        // Listen for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('New version of the app is available');
                                    // Could show a notification to the user here
                                }
                            });
                        });
                    })
                    .catch(registrationError => {
                        console.warn('Monitoring Service Worker registration failed:', registrationError);
                    });
            });
        }
    }
});