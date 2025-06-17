import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import path from 'path';

// Vite configuration
export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',
                'src/frontend/main.jsx' // New entry point
            ],
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
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@frontend': path.resolve(__dirname, './src/frontend'),
            '@components': path.resolve(__dirname, './src/frontend/components'),
            '@features': path.resolve(__dirname, './src/frontend/features'),
            '@shared': path.resolve(__dirname, './src/frontend/shared'),
            '@atoms': path.resolve(__dirname, './src/frontend/components/atoms'),
            '@molecules': path.resolve(__dirname, './src/frontend/components/molecules'),
            '@organisms': path.resolve(__dirname, './src/frontend/components/organisms'),
            '@templates': path.resolve(__dirname, './src/frontend/components/templates'),
        },
    },
    build: {
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
