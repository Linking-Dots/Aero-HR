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
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core vendor libraries
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-heroui': ['@heroui/react'],
                    'vendor-inertia': ['@inertiajs/react', '@inertiajs/inertia'],
                    
                    // Third-party libraries
                    'vendor-charts': ['recharts'],
                    'vendor-date': ['dayjs', '@mui/x-date-pickers'],
                    'vendor-icons': ['@heroicons/react'],
                    'vendor-maps': ['react-leaflet', 'leaflet'],
                    'vendor-utils': ['axios', 'lodash', 'react-toastify'],
                    'vendor-export': ['xlsx', 'jspdf', 'jspdf-autotable'],
                    
                    // Application chunks
                    'app-layouts': [/.*\/Layouts\/.*/],
                    'app-components': [/.*\/Components\/.*/],
                    'app-forms': [/.*\/Forms\/.*/],
                    'app-tables': [/.*\/Tables\/.*/],
                    'app-pages-auth': [/.*\/Pages\/Auth\/.*/],
                    'app-pages-settings': [/.*\/Pages\/Settings\/.*/],
                    'app-pages-project': [/.*\/Pages\/Project\/.*/],
                    'app-pages-employee': [/.*\/Pages\/Employee.*/],
                    'app-utils': [/.*\/utils\/.*/],
                },
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk';
                    return `js/${facadeModuleId}-[hash].js`;
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
        include: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/material/Tooltip',
        ],
    },
});