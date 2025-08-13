import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import path from 'path';

// Vite configuration
export default defineConfig({
    optimizeDeps: {
    exclude: ['styled-components']
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
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
    server: {
        hmr: {
            overlay: false
        }
    },
    build: {
        rollupOptions: {
            external: ['motion-dom'],
            output: {
                manualChunks: undefined,
            }
        }
    }
});