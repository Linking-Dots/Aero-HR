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

        /* Loading Screen */
        #app-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f5841f 0%, #134e9d 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.3s ease-out;
        }

        #app-loading.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-text {
            color: white;
            font-size: 1.1rem;
            font-weight: 500;
            text-align: center;
            margin-top: 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* App container initially hidden */
        #app {
            opacity: 0;
            transition: opacity 0.3s ease-in;
        }

        #app.loaded {
            opacity: 1;
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

    <!-- Loading Screen -->
    <div id="app-loading" aria-label="Loading application">
        <div class="loading-content">
            <div class="loading-spinner" role="status" aria-label="Loading"></div>
            <div class="loading-text">Loading DBEDC ERP...</div>
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
        // Global loading manager
        window.AppLoader = {
            hideLoading: function() {
                const loading = document.getElementById('app-loading');
                const app = document.getElementById('app');

                if (loading && app) {
                    loading.classList.add('hidden');
                    app.classList.add('loaded');

                    // Remove loading screen from DOM after transition
                    setTimeout(() => {
                        if (loading.classList.contains('hidden')) {
                            loading.remove();
                        }
                    }, 300);
                }
            },

            showLoading: function() {
                const loading = document.getElementById('app-loading');
                const app = document.getElementById('app');

                if (loading && app) {
                    loading.classList.remove('hidden');
                    app.classList.remove('loaded');
                }
            }
        };



        // Inertia.js progress and loading management
        document.addEventListener('DOMContentLoaded', function() {
            // Listen for Inertia events
            document.addEventListener('inertia:start', function(event) {
                // Only show loading for non-visit events or slow visits
                if (event.detail.visit.method !== 'get') {
                    window.AppLoader.showLoading();
                }
            });

            document.addEventListener('inertia:progress', function(event) {
                // Update loading progress if needed
                const loading = document.getElementById('app-loading');
                if (loading && event.detail.progress) {
                    // You can add a progress bar here if needed
                    console.log('Loading progress:', event.detail.progress.percentage + '%');
                }
            });

            document.addEventListener('inertia:finish', function(event) {
                // Small delay to ensure React components are mounted
                setTimeout(() => {
                    window.AppLoader.hideLoading();
                }, 100);
            });

            // Fallback: Hide loading after a reasonable time
            setTimeout(() => {
                window.AppLoader.hideLoading();
            }, 3000);

            // Hide loading when React app is ready (if available)
            if (window.React) {
                setTimeout(() => {
                    window.AppLoader.hideLoading();
                }, 500);
            }
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

        // Error boundary for unhandled errors
        window.addEventListener('error', function(e) {
            console.error('Unhandled error:', e.error);
            // Hide loading screen on error
            window.AppLoader.hideLoading();
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
                }, 100);
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