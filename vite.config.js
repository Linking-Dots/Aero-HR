import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite configuration optimized for large projects
export default defineConfig({
    optimizeDeps: {
        exclude: ['styled-components'],
        include: [
            '@heroui/react',
            '@heroui/theme',
            '@mui/material',
            'framer-motion',
            'react',
            'react-dom'
        ],
        force: true,
        // Ensure React is processed first
        esbuildOptions: {
            target: 'esnext'
        }
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
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            overlay: false
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React and Animation bundle - keep together to avoid dependency issues
                    'react-core': ['react', 'react-dom', 'framer-motion'],
                    
                    // UI Libraries chunk
                    'ui-libraries': [
                        '@heroui/react', 
                        '@heroui/theme',
                        '@headlessui/react'
                    ],
                    
                    // Material UI chunk
                    'mui-libraries': [
                        '@mui/material', 
                        '@mui/system',
                        '@emotion/react',
                        '@emotion/styled'
                    ],
                    
                    // Chart libraries
                    'chart-libraries': ['react-chartjs-2', 'recharts'],
                    
                    // Utility libraries (no React dependency)
                    'utilities': [
                        'lodash', 
                        'axios', 
                        'date-fns',
                        'dayjs'
                    ],
                    
                    // Form libraries
                    'form-libraries': [
                        'react-hook-form',
                        '@hookform/resolvers',
                        'zod'
                    ]
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            },
            // Increase max chunk size to reduce number of files
            maxParallelFileOps: 2
        },
        target: 'esnext',
        sourcemap: false,
        minify: 'esbuild',
        chunkSizeWarningLimit: 2000,
        assetsInlineLimit: 8192,
        // Reduce concurrent file operations
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    esbuild: {
        // Optimize esbuild for better memory usage
        target: 'esnext',
        logOverride: {
            'this-is-undefined-in-esm': 'silent'
        }
    }
});