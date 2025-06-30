// tailwind.config.js
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'glass': {
                    'light': 'rgba(255, 255, 255, 0.1)',
                    'medium': 'rgba(255, 255, 255, 0.2)',
                    'dark': 'rgba(0, 0, 0, 0.1)',
                },
                'accent': {
                    'blue': '#3b82f6',
                    'purple': '#8b5cf6',
                    'pink': '#ec4899',
                    'cyan': '#06b6d4',
                },
            },
            fontFamily: {
                'sans': ['Inter', 'Aptos', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
                    '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            backdropBlur: {
                'xs': '2px',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                'neon': '0 0 20px rgba(59, 130, 246, 0.4)',
                'neon-hover': '0 0 40px rgba(59, 130, 246, 0.6)',
            },
        },
    },
    darkMode: "class",
    plugins: [
        nextui({
            themes: {
                light: {
                    colors: {
                        background: "rgba(248, 250, 252, 0.8)",
                        primary: {
                            50: "#eff6ff",
                            100: "#dbeafe",
                            200: "#bfdbfe",
                            300: "#93c5fd",
                            400: "#60a5fa",
                            500: "#3b82f6",
                            600: "#2563eb",
                            700: "#1d4ed8",
                            800: "#1e40af",
                            900: "#1e3a8a",
                            DEFAULT: "#3b82f6",
                        },
                    },
                },
                dark: {
                    colors: {
                        background: "rgba(15, 23, 42, 0.9)",
                        primary: {
                            50: "#1e293b",
                            100: "#334155",
                            200: "#475569",
                            300: "#64748b",
                            400: "#94a3b8",
                            500: "#cbd5e1",
                            600: "#e2e8f0",
                            700: "#f1f5f9",
                            800: "#f8fafc",
                            900: "#ffffff",
                            DEFAULT: "#60a5fa",
                        },
                    },
                },
            },
        })
    ]
}
