import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import path from 'path';

// Vite configuration - Phase 6: src/frontend migration
export default defineConfig({
    plugins: [          laravel({
            input: [
                'src/frontend/main.jsx'  // Single modern entry point
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
            
            // Feature-specific aliases
            '@auth': path.resolve(__dirname, './src/frontend/features/authentication'),
            '@employee': path.resolve(__dirname, './src/frontend/features/employee-management'),
            '@attendance': path.resolve(__dirname, './src/frontend/features/attendance'),
            '@projects': path.resolve(__dirname, './src/frontend/features/project-management'),
            '@communication': path.resolve(__dirname, './src/frontend/features/communication'),
            '@events': path.resolve(__dirname, './src/frontend/features/events'),
            
            // Utility aliases
            '@utils': path.resolve(__dirname, './src/frontend/shared/utils'),
            '@hooks': path.resolve(__dirname, './src/frontend/shared/hooks'),
            '@types': path.resolve(__dirname, './src/frontend/shared/types'),
            '@constants': path.resolve(__dirname, './src/frontend/shared/constants'),
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
