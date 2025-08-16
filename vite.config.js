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
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            overlay: false
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/login': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/register': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/check-user-type': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            '/check-domain': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            }
        }
    }
});