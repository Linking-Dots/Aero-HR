import './bootstrap';
import '../css/app.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createInertiaApp} from '@inertiajs/react';
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';
import App from '@/Layouts/App.jsx';

// Add this once globally, typically in your main JavaScript file
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Optionally, add this to include the CSRF token automatically if using Laravel's XSRF-TOKEN cookie.
axios.defaults.withCredentials = true;



const appName =  'DBEDC ERP';


createInertiaApp({
    progress: false,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // If the page defines a layout, use it; otherwise, use the default App layout
        const renderPage = props.initialPage.props.layout
            ? props.initialPage.props.layout((<App {...props} />))
            : (<App {...props} />);

        root.render(renderPage);
    },
});

