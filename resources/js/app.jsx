import './bootstrap';
import '../css/app.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

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
        root.render(<App {...props} />);
    },
}).then(r => {
    console.log('Inertia React.js app created');
});
