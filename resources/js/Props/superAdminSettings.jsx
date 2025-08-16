import React from 'react';
import {
    HomeIcon,
    BuildingOffice2Icon,
    ServerIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    UserGroupIcon,
    ChartBarSquareIcon,
    GlobeAltIcon,
    EnvelopeIcon,
    BellIcon,
    DatabaseIcon,
    CloudIcon,
    CodeBracketIcon,
    WrenchScrewdriverIcon,
    DocumentTextIcon,
    KeyIcon,
    LockClosedIcon,
    ArchiveBoxIcon,
    ComputerDesktopIcon,
    SignalIcon,
    CurrencyDollarIcon,
    TagIcon,
    PhoneIcon,
    ClipboardDocumentListIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    PhotoIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ClockIcon,
    BanknotesIcon,
    ReceiptPercentIcon,
    ChartPieIcon,
    UsersIcon,
    PauseIcon,
    PlayIcon,
    StopIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

// Function to create super admin settings pages array with comprehensive SaaS management
export const getSuperAdminSettingsPages = (permissions = [], auth = null) => {
    const settings = [];

    // Only show super admin settings if user has Super Administrator role
    if (!auth?.roles?.includes('Super Administrator')) {
        return settings;
    }

    // 1. Navigation
    settings.push({
        name: 'Return to Super Admin Dashboard', 
        icon: <Squares2X2Icon className="w-5 h-5" />, 
        route: 'admin.dashboard',
        category: 'navigation',
        priority: 1
    });

    // 2. Platform Configuration
    settings.push({
        name: 'Platform Global Configuration', 
        icon: <Cog6ToothIcon className="w-5 h-5" />, 
        route: 'admin.settings.platform',
        category: 'platform-management',
        priority: 2,
        description: 'Configure global platform settings, branding, and core functionality'
    });

    settings.push({
        name: 'Multi-Tenant Configuration', 
        icon: <BuildingOffice2Icon className="w-5 h-5" />, 
        route: 'admin.settings.tenancy',
        category: 'platform-management',
        priority: 3,
        description: 'Configure tenant isolation, domain management, and multi-tenancy settings'
    });

    settings.push({
        name: 'Feature Toggle Management', 
        icon: <WrenchScrewdriverIcon className="w-5 h-5" />, 
        route: 'admin.settings.features',
        category: 'platform-management',
        priority: 4,
        description: 'Enable/disable platform features and manage feature rollouts'
    });

    // 3. Subscription & Billing Management
    settings.push({
        name: 'Subscription Plan Configuration', 
        icon: <CreditCardIcon className="w-5 h-5" />, 
        route: 'admin.settings.plans',
        category: 'billing-management',
        priority: 5,
        description: 'Configure subscription plans, pricing tiers, and plan features'
    });

    settings.push({
        name: 'Payment Gateway Configuration', 
        icon: <BanknotesIcon className="w-5 h-5" />, 
        route: 'admin.settings.payment-gateways',
        category: 'billing-management',
        priority: 6,
        description: 'Configure payment processors, currencies, and billing cycles'
    });

    settings.push({
        name: 'Billing & Invoice Settings', 
        icon: <DocumentTextIcon className="w-5 h-5" />, 
        route: 'admin.settings.billing',
        category: 'billing-management',
        priority: 7,
        description: 'Configure invoice templates, tax settings, and billing automation'
    });

    settings.push({
        name: 'Revenue & Pricing Strategy', 
        icon: <ChartPieIcon className="w-5 h-5" />, 
        route: 'admin.settings.pricing',
        category: 'billing-management',
        priority: 8,
        description: 'Manage pricing strategies, discounts, and promotional codes'
    });

    // 4. Security & Compliance
    settings.push({
        name: 'Platform Security Configuration', 
        icon: <ShieldCheckIcon className="w-5 h-5" />, 
        route: 'admin.settings.security',
        category: 'security-compliance',
        priority: 9,
        description: 'Configure platform-wide security policies and access controls'
    });

    settings.push({
        name: 'Data Privacy & GDPR Settings', 
        icon: <LockClosedIcon className="w-5 h-5" />, 
        route: 'admin.settings.privacy',
        category: 'security-compliance',
        priority: 10,
        description: 'Configure data privacy settings, GDPR compliance, and data retention'
    });

    settings.push({
        name: 'Audit & Compliance Configuration', 
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />, 
        route: 'admin.settings.audit',
        category: 'security-compliance',
        priority: 11,
        description: 'Configure audit logging, compliance reporting, and data governance'
    });

    settings.push({
        name: 'Backup & Disaster Recovery', 
        icon: <ArchiveBoxIcon className="w-5 h-5" />, 
        route: 'admin.settings.backup',
        category: 'security-compliance',
        priority: 12,
        description: 'Configure automated backups, disaster recovery, and data protection'
    });

    // 5. System Infrastructure
    settings.push({
        name: 'Server & Infrastructure Settings', 
        icon: <ServerIcon className="w-5 h-5" />, 
        route: 'admin.settings.infrastructure',
        category: 'infrastructure-management',
        priority: 13,
        description: 'Configure server settings, load balancing, and infrastructure monitoring'
    });

    settings.push({
        name: 'Database Configuration', 
        icon: <DatabaseIcon className="w-5 h-5" />, 
        route: 'admin.settings.database',
        category: 'infrastructure-management',
        priority: 14,
        description: 'Configure database settings, optimization, and maintenance'
    });

    settings.push({
        name: 'Cloud Services Configuration', 
        icon: <CloudIcon className="w-5 h-5" />, 
        route: 'admin.settings.cloud',
        category: 'infrastructure-management',
        priority: 15,
        description: 'Configure cloud storage, CDN, and third-party cloud services'
    });

    settings.push({
        name: 'Performance & Monitoring', 
        icon: <SignalIcon className="w-5 h-5" />, 
        route: 'admin.settings.monitoring',
        category: 'infrastructure-management',
        priority: 16,
        description: 'Configure performance monitoring, alerts, and system health checks'
    });

    // 6. User & Access Management
    settings.push({
        name: 'Super Admin User Management', 
        icon: <UserGroupIcon className="w-5 h-5" />, 
        route: 'admin.settings.admin-users',
        category: 'user-management',
        priority: 17,
        description: 'Manage super admin users and platform administrator accounts'
    });

    settings.push({
        name: 'Role & Permission Framework', 
        icon: <KeyIcon className="w-5 h-5" />, 
        route: 'admin.settings.permissions',
        category: 'user-management',
        priority: 18,
        description: 'Configure platform-wide roles, permissions, and access control'
    });

    settings.push({
        name: 'Single Sign-On Configuration', 
        icon: <LockClosedIcon className="w-5 h-5" />, 
        route: 'admin.settings.sso',
        category: 'user-management',
        priority: 19,
        description: 'Configure SSO providers, SAML, and authentication methods'
    });

    settings.push({
        name: 'Session & Authentication Settings', 
        icon: <ComputerDesktopIcon className="w-5 h-5" />, 
        route: 'admin.settings.authentication',
        category: 'user-management',
        priority: 20,
        description: 'Configure session management, timeout settings, and authentication policies'
    });

    // 7. Communication & Messaging
    settings.push({
        name: 'Email Service Configuration', 
        icon: <EnvelopeIcon className="w-5 h-5" />, 
        route: 'admin.settings.email',
        category: 'communication-services',
        priority: 21,
        description: 'Configure SMTP settings, email templates, and delivery services'
    });

    settings.push({
        name: 'SMS & Mobile Communication', 
        icon: <PhoneIcon className="w-5 h-5" />, 
        route: 'admin.settings.sms',
        category: 'communication-services',
        priority: 22,
        description: 'Configure SMS providers, mobile notifications, and messaging services'
    });

    settings.push({
        name: 'Push Notification Services', 
        icon: <BellIcon className="w-5 h-5" />, 
        route: 'admin.settings.push-notifications',
        category: 'communication-services',
        priority: 23,
        description: 'Configure push notification providers and delivery settings'
    });

    settings.push({
        name: 'Communication Templates', 
        icon: <DocumentTextIcon className="w-5 h-5" />, 
        route: 'admin.settings.communication-templates',
        category: 'communication-services',
        priority: 24,
        description: 'Manage email templates, SMS templates, and notification content'
    });

    // 8. API & Integration Management
    settings.push({
        name: 'API Configuration & Management', 
        icon: <CodeBracketIcon className="w-5 h-5" />, 
        route: 'admin.settings.api',
        category: 'integration-management',
        priority: 25,
        description: 'Configure API settings, rate limiting, and API documentation'
    });

    settings.push({
        name: 'Third-Party Integrations', 
        icon: <GlobeAltIcon className="w-5 h-5" />, 
        route: 'admin.settings.integrations',
        category: 'integration-management',
        priority: 26,
        description: 'Configure external service integrations and webhook endpoints'
    });

    settings.push({
        name: 'Webhook Configuration', 
        icon: <CodeBracketIcon className="w-5 h-5" />, 
        route: 'admin.settings.webhooks',
        category: 'integration-management',
        priority: 27,
        description: 'Manage webhook endpoints, event subscriptions, and payload formats'
    });

    settings.push({
        name: 'API Key & Token Management', 
        icon: <KeyIcon className="w-5 h-5" />, 
        route: 'admin.settings.api-keys',
        category: 'integration-management',
        priority: 28,
        description: 'Manage API keys, access tokens, and integration credentials'
    });

    // 9. Analytics & Reporting
    settings.push({
        name: 'Analytics Configuration', 
        icon: <ChartBarSquareIcon className="w-5 h-5" />, 
        route: 'admin.settings.analytics',
        category: 'analytics-reporting',
        priority: 29,
        description: 'Configure analytics tracking, KPIs, and reporting dashboards'
    });

    settings.push({
        name: 'Data Export & Import Settings', 
        icon: <ArrowPathIcon className="w-5 h-5" />, 
        route: 'admin.settings.data-transfer',
        category: 'analytics-reporting',
        priority: 30,
        description: 'Configure data export formats, import validation, and data migration'
    });

    settings.push({
        name: 'Custom Report Builder', 
        icon: <DocumentTextIcon className="w-5 h-5" />, 
        route: 'admin.settings.custom-reports',
        category: 'analytics-reporting',
        priority: 31,
        description: 'Configure custom report templates and automated report generation'
    });

    // 10. Content & Brand Management
    settings.push({
        name: 'Brand & White-Label Settings', 
        icon: <PhotoIcon className="w-5 h-5" />, 
        route: 'admin.settings.branding',
        category: 'content-management',
        priority: 32,
        description: 'Configure platform branding, logos, and white-label customization'
    });

    settings.push({
        name: 'Landing Page Configuration', 
        icon: <GlobeAltIcon className="w-5 h-5" />, 
        route: 'admin.settings.landing-pages',
        category: 'content-management',
        priority: 33,
        description: 'Configure marketing pages, pricing pages, and public content'
    });

    settings.push({
        name: 'Documentation & Help Content', 
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />, 
        route: 'admin.settings.documentation',
        category: 'content-management',
        priority: 34,
        description: 'Manage help documentation, user guides, and support content'
    });

    // 11. Localization & Regional Settings
    settings.push({
        name: 'Localization & Language Settings', 
        icon: <GlobeAltIcon className="w-5 h-5" />, 
        route: 'admin.settings.localization',
        category: 'regional-settings',
        priority: 35,
        description: 'Configure supported languages, regional formats, and localization'
    });

    settings.push({
        name: 'Currency & Regional Configuration', 
        icon: <CurrencyDollarIcon className="w-5 h-5" />, 
        route: 'admin.settings.currency',
        category: 'regional-settings',
        priority: 36,
        description: 'Configure supported currencies, tax rates, and regional compliance'
    });

    settings.push({
        name: 'Timezone & Calendar Settings', 
        icon: <ClockIcon className="w-5 h-5" />, 
        route: 'admin.settings.timezone',
        category: 'regional-settings',
        priority: 37,
        description: 'Configure timezone handling, calendar systems, and date formats'
    });

    // 12. Support & Maintenance
    settings.push({
        name: 'Support System Configuration', 
        icon: <PhoneIcon className="w-5 h-5" />, 
        route: 'admin.settings.support',
        category: 'support-maintenance',
        priority: 38,
        description: 'Configure support ticket system, SLA settings, and support workflows'
    });

    settings.push({
        name: 'Maintenance Mode Settings', 
        icon: <WrenchScrewdriverIcon className="w-5 h-5" />, 
        route: 'admin.settings.maintenance',
        category: 'support-maintenance',
        priority: 39,
        description: 'Configure maintenance mode, scheduled updates, and downtime notifications'
    });

    settings.push({
        name: 'System Health Monitoring', 
        icon: <CheckCircleIcon className="w-5 h-5" />, 
        route: 'admin.settings.health-monitoring',
        category: 'support-maintenance',
        priority: 40,
        description: 'Configure health checks, alert thresholds, and monitoring dashboards'
    });

    // 13. Advanced Configuration
    settings.push({
        name: 'Advanced System Configuration', 
        icon: <Cog6ToothIcon className="w-5 h-5" />, 
        route: 'admin.settings.advanced',
        category: 'advanced-configuration',
        priority: 41,
        description: 'Advanced system settings, developer tools, and experimental features'
    });

    settings.push({
        name: 'Environment Variables', 
        icon: <CodeBracketIcon className="w-5 h-5" />, 
        route: 'admin.settings.environment',
        category: 'advanced-configuration',
        priority: 42,
        description: 'Manage environment variables and configuration overrides'
    });

    settings.push({
        name: 'Cache & Performance Optimization', 
        icon: <ArrowPathIcon className="w-5 h-5" />, 
        route: 'admin.settings.cache',
        category: 'advanced-configuration',
        priority: 43,
        description: 'Configure caching layers, performance optimization, and resource management'
    });

    return settings.sort((a, b) => a.priority - b.priority);
};

// Helper function to get super admin settings by category
export const getSuperAdminSettingsByCategory = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    const categories = {};
    
    settings.forEach(setting => {
        const category = setting.category || 'other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(setting);
    });
    
    return categories;
};

// Utility functions for super admin settings management

// Get settings by management area
export const getSuperAdminSettingsByArea = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    return {
        'Platform Management': settings.filter(s => s.category === 'platform-management'),
        'Billing & Revenue': settings.filter(s => s.category === 'billing-management'),
        'Security & Compliance': settings.filter(s => s.category === 'security-compliance'),
        'Infrastructure': settings.filter(s => s.category === 'infrastructure-management'),
        'User Management': settings.filter(s => s.category === 'user-management'),
        'Communications': settings.filter(s => s.category === 'communication-services'),
        'Integrations': settings.filter(s => s.category === 'integration-management'),
        'Analytics': settings.filter(s => s.category === 'analytics-reporting'),
        'Content': settings.filter(s => s.category === 'content-management'),
        'Regional': settings.filter(s => s.category === 'regional-settings'),
        'Support': settings.filter(s => s.category === 'support-maintenance'),
        'Advanced': settings.filter(s => s.category === 'advanced-configuration')
    };
};

// Get settings by priority level
export const getSuperAdminSettingsByPriority = (permissions = [], auth = null) => {
    return getSuperAdminSettingsPages(permissions, auth).sort((a, b) => a.priority - b.priority);
};

// Search super admin settings by name or description
export const searchSuperAdminSettings = (searchTerm, permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    const term = searchTerm.toLowerCase();
    return settings.filter(setting => 
        setting.name.toLowerCase().includes(term) ||
        (setting.description && setting.description.toLowerCase().includes(term))
    );
};

// Get critical super admin settings for initial setup
export const getCriticalSuperAdminSettings = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    const critical = [
        'Platform Global Configuration',
        'Multi-Tenant Configuration', 
        'Subscription Plan Configuration',
        'Platform Security Configuration',
        'Email Service Configuration'
    ];
    return settings.filter(setting => critical.includes(setting.name));
};

// Get settings for specific management areas
export const getBillingManagementSettings = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    return settings.filter(setting => setting.category === 'billing-management');
};

export const getSecurityManagementSettings = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    return settings.filter(setting => setting.category === 'security-compliance');
};

export const getInfrastructureManagementSettings = (permissions = [], auth = null) => {
    const settings = getSuperAdminSettingsPages(permissions, auth);
    return settings.filter(setting => setting.category === 'infrastructure-management');
};
