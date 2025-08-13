<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="ltr">

<head>
    <!-- Essential Meta Tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=yes maximum-scale=1 user-scalable=yes">
    <meta http-equiv=" X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <!-- Security & Performance -->
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">

    <!-- SEO & Social Meta -->
    <meta name="description" content="DBEDC ERP - Comprehensive Enterprise Resource Planning System for efficient business management">
    <meta name="keywords" content="ERP, Enterprise Resource Planning, Business Management, HR Management, DBEDC">
    <meta name="author" content="Emam Hosen">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#134e9d">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name', 'DBEDC ERP') }}">
    <meta property="og:description" content="Comprehensive Enterprise Resource Planning System">
    <meta property="og:image" content="{{ asset('assets/images/og-image.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:site_name" content="{{ config('app.name', 'DBEDC ERP') }}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'DBEDC ERP') }}">
    <meta name="twitter:description" content="Comprehensive Enterprise Resource Planning System">
    <meta name="twitter:image" content="{{ asset('assets/images/twitter-card.png') }}">

    <!-- PWA Configuration -->
    <link rel="manifest" href="{{ asset('/manifest.json') }}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'DBEDC ERP') }}">

    <!-- Icons & Favicons -->
    <link rel="icon" type="image/x-icon" href="{{ asset('assets/images/favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('assets/images/favicon-16x16.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('assets/images/favicon-32x32.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('assets/images/apple-touch-icon.png') }}">
    <link rel="mask-icon" href="{{ asset('assets/images/safari-pinned-tab.svg') }}" color="#134e9d">

    <!-- DNS Prefetch for Performance -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Font Loading with Display Swap -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fredoka:wght@300..700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Title -->
    <title inertia>{{ config('app.name', 'DBEDC ERP') }}</title>

    <!-- Critical CSS Inline (Optimized) -->
    <style>
        /* Critical CSS for immediate rendering */
        * {
            box-sizing: border-box;
        }

        html {
            line-height: 1.15;
            -webkit-text-size-adjust: 100%;
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: var(--font-primary, 'Inter', sans-serif);
            font-size: 16px;
            line-height: 1.6;
            color: var(--text-color, #333);
            background-color: var(--bg-color, #ffffff);
            min-height: 100vh;
            overflow-x: hidden;
            transition: color 0.3s ease, background-color 0.3s ease;
        }

        /* Essential CSS Custom Properties */
        :root {
            --primary-color: #134e9d;
            --secondary-color: #f5841f;
            --text-color: #333;
            --bg-color: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            --border-radius: 8px;
            --transition: all 0.3s ease;
            --font-primary: 'Inter', 'Segoe UI', sans-serif;
        }

        /* Dark mode variables */
        [data-theme-mode="dark"] {
            --text-color: #ffffff;
            --bg-color: #0f1419;
            --shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        /* Screen Reader Only */
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }

        /* Enhanced Background System - Theme-based patterns load immediately */
        body {
            /* Default fallback - will be overridden by theme patterns */
            background: rgba(248, 250, 252, 1);
            min-height: 100vh;
            transition: background 0.3s ease;
        }

        /* Dark mode fallback */
        [data-theme-mode="dark"] body {
            background: rgba(15, 20, 25, 1);
        }

        /* Modern Loading Screen - Glassmorphism Design */
        #app-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(135deg, rgba(20, 30, 48, 0.95) 0%, rgba(36, 59, 85, 0.9) 50%, rgba(59, 130, 246, 0.85) 100%),
                radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 70%),
                url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80&fm=webp');
            background-size: cover, 800px 800px, 600px 600px, 1000px 1000px, cover;
            background-position: center, 20% 20%, 80% 80%, 50% 50%, center;
            background-attachment: fixed;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            overflow: hidden;
        }

        #app-loading.hidden {
            opacity: 0;
            pointer-events: none;
            transform: scale(1.1);
        }

        /* Animated background particles */
        #app-loading::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 30%),
                radial-gradient(circle at 40% 60%, rgba(14, 165, 233, 0.1) 0%, transparent 40%);
            animation: floating 6s ease-in-out infinite;
            pointer-events: none;
        }

        .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.3),
                0 16px 64px rgba(0, 0, 0, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
            animation: contentFloat 4s ease-in-out infinite;
            max-width: 420px;
            text-align: center;
        }

        /* Advanced Loading Animation */
        .loading-spinner {
            width: 120px;
            height: 120px;
            position: relative;
            margin-bottom: 2rem;
            animation: spinContainer 3s linear infinite;
        }

        .loading-spinner::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top: 3px solid rgba(14, 165, 233, 0.8);
            border-right: 3px solid rgba(168, 85, 247, 0.6);
            border-radius: 50%;
            animation: spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            box-shadow: 0 0 40px rgba(14, 165, 233, 0.4);
        }

        .loading-spinner::after {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            width: calc(100% - 30px);
            height: calc(100% - 30px);
            border: 2px solid transparent;
            border-bottom: 2px solid rgba(34, 197, 94, 0.7);
            border-left: 2px solid rgba(255, 200, 87, 0.5);
            border-radius: 50%;
            animation: spin 1.5s linear infinite reverse;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }

        /* Pulsing center dot */
        .loading-spinner-center {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(168, 85, 247, 1) 100%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pulse 2s ease-in-out infinite;
            box-shadow: 
                0 0 20px rgba(14, 165, 233, 0.6),
                0 0 40px rgba(168, 85, 247, 0.4);
        }

        .loading-text {
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 0.75rem;
            letter-spacing: 1px;
            background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShimmer 3s ease-in-out infinite;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .loading-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            font-weight: 400;
            text-align: center;
            margin-bottom: 1.5rem;
            animation: subtitleFade 2s ease-in-out infinite alternate;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        /* Progress bar */
        .loading-progress {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
            margin-top: 1rem;
        }

        .loading-progress::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(14, 165, 233, 0.8) 50%, 
                rgba(168, 85, 247, 0.6)
            );
            animation: progressSlide 2s ease-in-out infinite;
        }

        /* Feature dots */
        .loading-dots {
            display: flex;
            gap: 8px;
            margin-top: 1rem;
        }

        .loading-dot {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            animation: dotPulse 1.5s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        .loading-dot:nth-child(4) { animation-delay: 0.6s; }

        /* Animated Logo Styles */
        .loading-logo {
            width: 100px;
            height: 100px;
            margin-bottom: 1.5rem;
            position: relative;
            animation: logoFloat 3s ease-in-out infinite;
        }

        .logo-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 
                0 0 40px rgba(14, 165, 233, 0.4),
                0 0 80px rgba(59, 130, 246, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2);
            animation: logoGlow 2s ease-in-out infinite alternate;
        }

        .logo-text {
            color: white;
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 1.2rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 1px;
            animation: logoTextPulse 2s ease-in-out infinite;
        }

        .logo-ring {
            position: absolute;
            width: 120%;
            height: 120%;
            border: 2px solid rgba(14, 165, 233, 0.3);
            border-radius: 50%;
            top: -10%;
            left: -10%;
            animation: logoRingRotate 4s linear infinite;
        }

        .logo-ring::before {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: linear-gradient(45deg, #0ea5e9, #8b5cf6);
            border-radius: 50%;
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 0 10px rgba(14, 165, 233, 0.6);
        }

        .logo-particles {
            position: absolute;
            width: 150%;
            height: 150%;
            top: -25%;
            left: -25%;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(14, 165, 233, 0.6);
            border-radius: 50%;
            animation: particleFloat 3s ease-in-out infinite;
        }

        .particle:nth-child(1) { 
            top: 20%; left: 10%; 
            animation-delay: 0s;
            background: rgba(14, 165, 233, 0.8);
        }
        .particle:nth-child(2) { 
            top: 60%; right: 15%; 
            animation-delay: 0.5s;
            background: rgba(59, 130, 246, 0.6);
        }
        .particle:nth-child(3) { 
            bottom: 30%; left: 20%; 
            animation-delay: 1s;
            background: rgba(139, 92, 246, 0.7);
        }
        .particle:nth-child(4) { 
            top: 40%; right: 10%; 
            animation-delay: 1.5s;
            background: rgba(14, 165, 233, 0.5);
        }

        @keyframes logoFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.02); }
        }

        @keyframes logoGlow {
            0% { 
                box-shadow: 
                    0 0 40px rgba(14, 165, 233, 0.4),
                    0 0 80px rgba(59, 130, 246, 0.2),
                    inset 0 2px 4px rgba(255, 255, 255, 0.2);
            }
            100% { 
                box-shadow: 
                    0 0 60px rgba(14, 165, 233, 0.6),
                    0 0 120px rgba(59, 130, 246, 0.3),
                    inset 0 2px 4px rgba(255, 255, 255, 0.3);
            }
        }

        @keyframes logoTextPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes logoRingRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes particleFloat {
            0%, 100% { 
                transform: translateY(0px) scale(1);
                opacity: 0.6;
            }
            25% { 
                transform: translateY(-10px) scale(1.2);
                opacity: 1;
            }
            50% { 
                transform: translateY(-5px) scale(0.8);
                opacity: 0.8;
            }
            75% { 
                transform: translateY(-15px) scale(1.1);
                opacity: 0.9;
            }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes spinContainer {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
            0%, 100% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            50% { 
                transform: translate(-50%, -50%) scale(1.3);
                opacity: 0.7;
            }
        }

        @keyframes floating {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.02); }
        }

        @keyframes contentFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        @keyframes textShimmer {
            0%, 100% { 
                background-position: 0% 50%;
                opacity: 1;
            }
            50% { 
                background-position: 100% 50%;
                opacity: 0.9;
            }
        }

        @keyframes subtitleFade {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
        }

        @keyframes progressSlide {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        @keyframes dotPulse {
            0%, 100% { 
                transform: scale(1);
                opacity: 0.4;
            }
            50% { 
                transform: scale(1.5);
                opacity: 1;
            }
        }

        @keyframes fadeInUp {
            0% { 
                opacity: 0; 
                transform: translateY(20px);
            }
            100% { 
                opacity: 1; 
                transform: translateY(0);
            }
        }

        .loading-content {
            animation: fadeInUp 0.6s ease-out;
        }

        /* App container styling for persistent layout */
        #app {
            opacity: 0;
            transition: opacity 0.3s ease-in;
        }

        #app.loaded {
            opacity: 1;
        }

        /* Persistent layout optimizations */
        .persistent-layout {
            contain: layout style paint;
            will-change: contents;
        }

        .content-area {
            contain: layout;
            isolation: isolate;
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .loading-content {
                padding: 2rem 1.5rem;
                margin: 1rem;
                border-radius: 20px;
                max-width: 90vw;
            }

            .loading-logo {
                width: 80px;
                height: 80px;
                margin-bottom: 1rem;
            }

            .logo-text {
                font-size: 1rem;
            }

            .loading-spinner {
                width: 80px;
                height: 80px;
                margin-bottom: 1.5rem;
            }

            .loading-text {
                font-size: 1.25rem;
            }

            .loading-subtitle {
                font-size: 0.9rem;
            }

            #app-loading {
                background-size: cover, 400px 400px, 300px 300px, 500px 500px, cover;
            }
        }

        @media (max-width: 480px) {
            .loading-content {
                padding: 1.5rem 1rem;
                margin: 0.5rem;
            }

            .loading-logo {
                width: 60px;
                height: 60px;
            }

            .logo-text {
                font-size: 0.8rem;
            }

            .loading-spinner {
                width: 60px;
                height: 60px;
            }

            .loading-text {
                font-size: 1.1rem;
            }

            .loading-subtitle {
                font-size: 0.8rem;
            }
        }

        /* Focus management */
        :focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }

        /* Print styles */
        @media print {
            body { background: white !important; color: black !important; }
            #app-loading { display: none !important; }
        }
    </style>
</head>

<body>
    <!-- Skip Navigation Link for Accessibility -->
    <a href="#main-content" class="sr-only sr-only-focusable" style="position: absolute; top: -40px; left: 6px; z-index: 10001; color: white; background: var(--primary-color); padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Skip to main content
    </a>

    <!-- Enhanced Loading Screen -->
    <div id="app-loading" aria-label="Loading application">
        <div class="loading-content">
            <!-- Animated Logo -->
            <div class="loading-logo">
                <div class="logo-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
                <div class="logo-ring"></div>
                <div class="logo-circle">
                    <div class="logo-text">ERP</div>
                </div>
            </div>
            
            <!-- Loading Spinner -->
            <div class="loading-spinner" role="status" aria-label="Loading">
                <div class="loading-spinner-center"></div>
            </div>
            
            <!-- Text Content -->
            <div class="loading-text">DBEDC ERP</div>
            <div class="loading-subtitle">Preparing your workspace...</div>
            
            <!-- Progress Bar -->
            <div class="loading-progress"></div>
            
            <!-- Loading Dots -->
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    </div>
    <!-- Inertia & Vite Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])

    @inertiaHead
    @inertia

    <!-- Enhanced Loading Management -->
    <script>
        // Enhanced Loading Management for Persistent Layout
        window.AppLoader = {
            hideLoading: function() {
                const loading = document.getElementById('app-loading');
                const app = document.getElementById('app');

                if (loading && app) {
                    // Smooth fade out with delayed removal
                    loading.style.opacity = '0';
                    app.classList.add('loaded');

                    // Remove loading screen from DOM after transition completes
                    setTimeout(() => {
                        if (loading && loading.style.opacity === '0') {
                            loading.remove();
                        }
                    }, 500); // Match the CSS transition duration
                }
            },

            showLoading: function(message = 'Loading...') {
                let loading = document.getElementById('app-loading');
                const app = document.getElementById('app');

                // Create loading screen if it doesn't exist
                if (!loading) {
                    loading = document.createElement('div');
                    loading.id = 'app-loading';
                    loading.setAttribute('aria-label', 'Loading application');
                    loading.innerHTML = `
                        <div class="loading-content">
                            <!-- Animated Logo -->
                            <div class="loading-logo">
                                <div class="logo-particles">
                                    <div class="particle"></div>
                                    <div class="particle"></div>
                                    <div class="particle"></div>
                                    <div class="particle"></div>
                                </div>
                                <div class="logo-ring"></div>
                                <div class="logo-circle">
                                    <div class="logo-text">ERP</div>
                                </div>
                            </div>
                            
                            <!-- Loading Spinner -->
                            <div class="loading-spinner" role="status" aria-label="Loading">
                                <div class="loading-spinner-center"></div>
                            </div>
                            
                            <!-- Text Content -->
                            <div class="loading-text">${message}</div>
                            <div class="loading-subtitle">Please wait...</div>
                            
                            <!-- Progress Bar -->
                            <div class="loading-progress"></div>
                            
                            <!-- Loading Dots -->
                            <div class="loading-dots">
                                <div class="loading-dot"></div>
                                <div class="loading-dot"></div>
                                <div class="loading-dot"></div>
                                <div class="loading-dot"></div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(loading);
                }

                if (loading && app) {
                    loading.style.opacity = '1';
                    loading.style.pointerEvents = 'auto';
                    app.classList.remove('loaded');
                }
            },

            updateLoadingMessage: function(message, subtitle = '') {
                const loadingText = document.querySelector('.loading-text');
                const loadingSubtitle = document.querySelector('.loading-subtitle');
                
                if (loadingText) loadingText.textContent = message;
                if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
            }
        };



        // Optimized Inertia.js progress and loading management for persistent layout
        document.addEventListener('DOMContentLoaded', function() {
            let appReady = false;
            
            // Listen for Inertia events
            document.addEventListener('inertia:start', function(event) {
                // For persistent layout, we only show loading for non-GET requests or slow operations
                if (event.detail.visit.method !== 'get' || event.detail.visit.hasFiles) {
                    window.AppLoader.showLoading('Processing...', 'Please wait while we handle your request');
                }
            });

            document.addEventListener('inertia:progress', function(event) {
                // Update loading progress if needed
                if (event.detail.progress && event.detail.progress.percentage) {
                    const percentage = Math.round(event.detail.progress.percentage);
                    window.AppLoader.updateLoadingMessage(
                        'Loading...', 
                        `${percentage}% complete`
                    );
                }
            });

            document.addEventListener('inertia:finish', function(event) {
                // Hide loading immediately for persistent layout navigation
                if (appReady) {
                    setTimeout(() => {
                        window.AppLoader.hideLoading();
                    }, 100);
                }
            });

            // Initial app loading management
            const initializeApp = () => {
                if (!appReady) {
                    window.AppLoader.updateLoadingMessage(
                        'Initializing DBEDC ERP', 
                        'Setting up your workspace...'
                    );
                    
                    // Hide loading after React app mounts
                    setTimeout(() => {
                        appReady = true;
                        window.AppLoader.hideLoading();
                    }, 800); // Allow time for React to mount and components to load
                }
            };

            // Multiple fallbacks to ensure loading screen disappears
            
            // 1. When DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeApp);
            } else {
                initializeApp();
            }
            
            // 2. When window loads
            window.addEventListener('load', initializeApp);
            
            // 3. When React might be ready
            const checkReactReady = () => {
                if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('#app > *')) {
                    initializeApp();
                    return true;
                }
                return false;
            };
            
            // Check React readiness periodically
            let reactCheckCount = 0;
            const reactCheckInterval = setInterval(() => {
                reactCheckCount++;
                if (checkReactReady() || reactCheckCount > 20) { // Stop after 2 seconds
                    clearInterval(reactCheckInterval);
                }
            }, 100);
            
            // 4. Absolute fallback - hide loading after maximum time
            setTimeout(() => {
                if (!appReady) {
                    console.warn('App loading timed out, forcing hide');
                    appReady = true;
                    window.AppLoader.hideLoading();
                }
            }, 3000);
        });

        // Performance monitoring
        window.addEventListener('load', function() {
            if ('performance' in window) {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page load time:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
                        console.log('DOM ready time:', Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart), 'ms');
                    }
                }, 100);
            }
        });

        // Enhanced error handling
        window.addEventListener('error', function(e) {
            console.error('Unhandled error:', e.error);
            // Hide loading screen on error but show error message
            window.AppLoader.updateLoadingMessage('Error Loading', 'Refreshing page...');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
            // Hide loading screen on error
            window.AppLoader.hideLoading();
        });

        // Page visibility change handling
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                // Ensure loading screen is hidden when page becomes visible
                setTimeout(() => {
                    window.AppLoader.hideLoading();
                }, 200);
            }
        });

        // Detect if user navigates away and back
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                // Page was restored from cache, ensure loading is hidden
                window.AppLoader.hideLoading();
            }
        });
    </script>

    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "{{ config('app.name', 'DBEDC ERP') }}",
            "description": "Comprehensive Enterprise Resource Planning System",
            "url": "{{ url('/') }}",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
                "@type": "Offer",
                "category": "Enterprise Software"
            },
            "author": {
                "@type": "Person",
                "name": "Emam Hosen"
            }
        }
    </script>
</body>

</html>