import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

// Vite configuration
export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        createHtmlPlugin({
            minify: true, // Minify HTML output
        }),
        ViteMinifyPlugin(), // Additional minification
    ],
    build: {
        minify: 'terser', // Use terser for minification
        terserOptions: {
            compress: {
                drop_console: true, // Remove console logs in production
            },
            mangle: true, // Mangle names
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    // Example: separate vendor and common code
                    vendor: ['react', 'react-dom', '@mui/material'],
                },
            },
        },
    },
    optimizeDeps: {
        include: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/material/Tooltip',
        ],
    },
});
