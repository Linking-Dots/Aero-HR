import './bootstrap';
import '../css/app.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

// Legacy Performance Monitoring (will be replaced)
import webVitalsMonitor from './utils/webVitals';

// Phase 6: Migration support - check if modern architecture is available
const ENABLE_MODERN_ARCHITECTURE = true; // Feature flag for gradual migration

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
    resolve: (name) => {
        // Phase 6: Try modern architecture first, fallback to legacy
        if (ENABLE_MODERN_ARCHITECTURE) {
            try {
                // Check if we have a modern page component
                const modernComponent = import.meta.glob('../../src/frontend/features/**/pages/**/*.jsx');
                const modernPath = `../../src/frontend/features/${name.toLowerCase()}/pages/${name}Page.jsx`;
                
                if (modernComponent[modernPath]) {
                    console.log(`🆕 Loading modern component: ${name}`);
                    return modernComponent[modernPath]();
                }
            } catch (error) {
                console.log(`🔄 Fallback to legacy: ${name}`);
            }
        }
        
        // Fallback to legacy pages
        return resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Performance monitoring setup
        if (process.env.NODE_ENV === 'production') {
            console.log('🚀 Glass ERP Production Performance Monitoring Active');
        }
        
        // Phase 6: Enhanced app wrapper with migration support
        const AppWithMigrationSupport = (appProps) => {
            // Check if we should use modern layout
            if (ENABLE_MODERN_ARCHITECTURE && window.modernWebVitalsMonitor) {
                console.log('🎯 Using modern architecture features');
            }
            
            return <App {...appProps} />;
        };
        
        root.render(<AppWithMigrationSupport {...props} />);
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
