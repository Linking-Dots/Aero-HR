import './bootstrap';
import '../css/app.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

// Glass ERP Performance Monitoring - Phase 5 Production Optimization
import webVitalsMonitor from './utils/webVitals';

// Add this once globally, typically in your main JavaScript file
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Optionally, add this to include the CSRF token automatically if using Laravel's XSRF-TOKEN cookie.
axios.defaults.withCredentials = true;



const appName =  'DBEDC ERP';


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
        
        // Performance monitoring setup
        if (process.env.NODE_ENV === 'production') {
            console.log('🚀 Glass ERP Production Performance Monitoring Active');
        }
        
        root.render(<App {...props} />);
    },
}).then(r => {
    console.log('✅ Glass ERP Inertia React.js app created - Phase 5 Production Ready');
    
    // Initialize performance baseline collection
    if (webVitalsMonitor) {
        webVitalsMonitor.onMetric((name, metric, rating) => {
            if (rating === 'poor') {
                console.warn(`⚠️ Performance Alert: ${name} needs optimization`);
            }
        });
    }
});
