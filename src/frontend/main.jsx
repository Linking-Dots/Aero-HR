/**
 * Glass ERP - Modern Frontend Entry Point
 * Phase 6: Complete migration to src/frontend architecture
 * 
 * This is the new main entry point that uses the modern component architecture
 * while maintaining compatibility with the existing Inertia.js/Laravel setup.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Modern architecture imports
import { AppLayout } from '@templates/app-layout';
import webVitalsMonitor from '@shared/utils/webVitals';

// Global styles
import './shared/styles/app.css';

const appName = 'DBEDC ERP';

createInertiaApp({
    progress: {
        color: '#29d',
    },
    title: (title) => `${title} - ${appName}`,    resolve: (name) => {
        // Modern page mapping - map legacy names to modern architecture
        const modernPageMap = {
            'Dashboard': 'dashboard/pages/DashboardPage',
            'AttendanceAdmin': 'attendance/pages/AttendanceAdminPage',
            'AttendanceEmployee': 'attendance/pages/AttendanceEmployeePage',
            'LeavesAdmin': 'leave-management/pages/LeaveAdminPage',
            'LeavesEmployee': 'leave-management/pages/LeaveEmployeePage',
            'Emails': 'communication/pages/EmailsPage',
            'Letters': 'communication/pages/LettersPage',
            'PicnicParticipants': 'events/pages/PicnicParticipantsPage',
            'RolesSettings': 'administration/pages/RoleSettingsPage',
            'UsersList': 'employee-management/pages/EmployeeListPage',
            'PerformanceDashboard': 'administration/pages/DashboardPage',
            // Auth pages
            'Auth/Login': 'authentication/pages/LoginPage',
            'Auth/Register': 'authentication/pages/RegisterPage',
            'Auth/ForgotPassword': 'authentication/pages/ForgotPasswordPage',
            'Auth/ResetPassword': 'authentication/pages/ResetPasswordPage',
            'Auth/VerifyEmail': 'authentication/pages/VerifyEmailPage',
            'Auth/ConfirmPassword': 'authentication/pages/ConfirmPasswordPage'
        };

        // First try modern architecture
        if (modernPageMap[name]) {
            try {
                return resolvePageComponent(
                    `./features/${modernPageMap[name]}.jsx`,
                    import.meta.glob('./features/**/pages/**/*.jsx')
                );
            } catch (error) {
                console.log(`🔄 Modern component not found for ${name}, falling back to legacy`);
            }
        }
        
        // Fallback to legacy pages
        return resolvePageComponent(
            `../resources/js/Pages/${name}.jsx`,
            import.meta.glob('../resources/js/Pages/**/*.jsx')
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Performance monitoring setup
        if (process.env.NODE_ENV === 'production') {
            console.log('🚀 Glass ERP Modern Architecture Active - Phase 6');
        }
        
        // Wrap app with modern layout
        const ModernApp = (appProps) => (
            <AppLayout>
                <App {...appProps} />
            </AppLayout>
        );
        
        root.render(<ModernApp {...props} />);
    }
}).then(() => {
    console.log('✅ Glass ERP Modern Frontend Initialized - Phase 6');
    
    // Initialize performance monitoring
    if (webVitalsMonitor) {
        webVitalsMonitor.onMetric((name, metric, rating) => {
            if (rating === 'poor') {
                console.warn(`⚠️ Performance Alert: ${name} needs optimization`);
            }
        });
    }
    
    // Signal to window loader that modern app is ready
    if (window.AppLoader) {
        setTimeout(() => {
            window.AppLoader.hideLoading();
        }, 200);
    }
});
