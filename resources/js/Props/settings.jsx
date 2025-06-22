import React from 'react';
import {
    HomeIcon,
    BuildingOfficeIcon,
    ClockIcon,
    PhotoIcon,
    KeyIcon,
    AtSymbolIcon,
    ChartBarIcon,
    HandThumbUpIcon,
    PencilIcon,
    CurrencyDollarIcon,
    BellIcon,
    LockClosedIcon,
    WrenchScrewdriverIcon,
    ChatBubbleLeftRightIcon,
    RocketLaunchIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    DocumentChartBarIcon,
    Cog8ToothIcon
} from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

// Function to create settings pages array with enhanced organization aligned with ISO standards
export const getSettingsPages = (permissions = []) => {
    const settings = [];
    // 1. Navigation
    if (permissions.includes('dashboard.view')) {
        settings.push({
            name: 'Return to Dashboard', 
            icon: <Squares2X2Icon className="w-5 h-5" />, 
            route: 'dashboard',
            category: 'navigation',
            priority: 1
        });
    }
    // 2. Organization
    if (permissions.includes('company.settings')) {
        settings.push({
            name: 'Organization Configuration', 
            icon: <BuildingOfficeIcon className="w-5 h-5" />, 
            route: 'admin.settings.company',
            category: 'organization',
            priority: 2,
            description: 'Configure organizational structure and company information'
        });
    }
    if (permissions.includes('attendance.settings')) {
        settings.push({
            name: 'Time & Attendance Configuration', 
            icon: <ClockIcon className="w-5 h-5" />, 
            route: 'attendance-settings.index',
            category: 'organization',
            priority: 3,
            description: 'Configure attendance tracking and workforce management'
        });
    }
    if (permissions.includes('leave-settings.view')) {
        settings.push({
            name: 'Leave Policy Management', 
            icon: <HandThumbUpIcon className="w-5 h-5" />, 
            route: 'leave-settings',
            category: 'organization',
            priority: 4,
            description: 'Manage leave types and approval workflows'
        });
    }
    // 3. Security
    if (permissions.includes('roles.view')) {
        settings.push({
            name: 'Identity & Access Management', 
            icon: <KeyIcon className="w-5 h-5" />, 
            route: 'admin.roles-management',
            category: 'security',
            priority: 5,
            description: 'Manage user roles and permission system'
        });
    }
    if (permissions.includes('users.view')) {
        settings.push({
            name: 'User Account Administration', 
            icon: <UserGroupIcon className="w-5 h-5" />, 
            route: 'users',
            category: 'security',
            priority: 6,
            description: 'Manage user accounts and access control'
        });
    }
    // if (permissions.includes('audit.view')) {
    //     settings.push({
    //         name: 'Security Audit & Compliance', 
    //         icon: <ShieldCheckIcon className="w-5 h-5" />, 
    //         route: 'admin.audit.index',
    //         category: 'security',
    //         priority: 7,
    //         description: 'View audit trails and compliance reports'
    //     });
    // }
    // // 4. Services
    // if (permissions.includes('email.settings')) {
    //     settings.push({
    //         name: 'Communication Services', 
    //         icon: <AtSymbolIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.email',
    //         category: 'services',
    //         priority: 8,
    //         description: 'Configure email templates and communication services'
    //     });
    // }
    // if (permissions.includes('notification.settings')) {
    //     settings.push({
    //         name: 'Notification Management', 
    //         icon: <BellIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.notifications',
    //         category: 'services',
    //         priority: 9,
    //         description: 'Manage notification preferences and delivery channels'
    //     });
    // }
    // if (permissions.includes('settings.view')) {
    //     settings.push({
    //         name: 'Internal Messaging System', 
    //         icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.toxbox',
    //         category: 'services',
    //         priority: 10,
    //         description: 'Configure internal communication and messaging'
    //     });
    // }
    // // 5. Interface
    // if (permissions.includes('theme.settings')) {
    //     settings.push({
    //         name: 'User Interface & Branding', 
    //         icon: <PhotoIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.theme',
    //         category: 'interface',
    //         priority: 11,
    //         description: 'Customize application appearance and corporate branding'
    //     });
    // }
    // if (permissions.includes('localization.settings')) {
    //     settings.push({
    //         name: 'Regional & Localization Settings', 
    //         icon: <ClockIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.localization',
    //         category: 'interface',
    //         priority: 12,
    //         description: 'Configure language, timezone, and regional preferences'
    //     });
    // }
    // // 6. Business Process
    // if (permissions.includes('performance.settings')) {
    //     settings.push({
    //         name: 'Performance Management Configuration', 
    //         icon: <ChartBarIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.performance',
    //         category: 'business-process',
    //         priority: 13,
    //         description: 'Configure performance evaluation and review processes'
    //     });
    // }
    // if (permissions.includes('approval.settings')) {
    //     settings.push({
    //         name: 'Workflow & Approval Management', 
    //         icon: <HandThumbUpIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.approval',
    //         category: 'business-process',
    //         priority: 14,
    //         description: 'Manage approval workflows and business processes'
    //     });
    // }
    // if (permissions.includes('invoice.settings')) {
    //     settings.push({
    //         name: 'Financial Process Configuration', 
    //         icon: <PencilIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.invoice',
    //         category: 'business-process',
    //         priority: 15,
    //         description: 'Configure invoicing and financial processes'
    //     });
    // }
    // if (permissions.includes('salary.settings')) {
    //     settings.push({
    //         name: 'Compensation & Benefits Management', 
    //         icon: <CurrencyDollarIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.salary',
    //         category: 'business-process',
    //         priority: 16,
    //         description: 'Manage payroll and compensation structures'
    //     });
    // }
    // // 7. System Administration
    // if (permissions.includes('system.settings')) {
    //     settings.push({
    //         name: 'System Architecture Configuration', 
    //         icon: <Cog8ToothIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.system',
    //         category: 'system-administration',
    //         priority: 17,
    //         description: 'Advanced system configuration and maintenance'
    //     });
    // }
    // if (permissions.includes('leave-settings.view')) {
    //     settings.push({
    //         name: 'Policy Framework Management', 
    //         icon: <WrenchScrewdriverIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.leave-types',
    //         category: 'system-administration',
    //         priority: 18,
    //         description: 'Define and manage organizational policies'
    //     });
    // }
    // if (permissions.includes('system.settings')) {
    //     settings.push({
    //         name: 'Automated Process Management', 
    //         icon: <RocketLaunchIcon className="w-5 h-5" />, 
    //         route: 'admin.settings.cron',
    //         category: 'system-administration',
    //         priority: 19,
    //         description: 'Configure automated tasks and scheduled operations'
    //     });
    // }
    // // 8. Personal Security
    // settings.push({
    //     name: 'Personal Security Settings', 
    //     icon: <LockClosedIcon className="w-5 h-5" />, 
    //     route: 'profile.password',
    //     category: 'personal-security',
    //     priority: 20,
    //     description: 'Update personal password and security preferences'
    // });
    return settings.sort((a, b) => a.priority - b.priority);
};

// Helper function to get settings by category with ISO-aligned organization
export const getSettingsByCategory = (permissions = []) => {
    const settings = getSettingsPages(permissions);
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

// Utility functions for settings management

// Get settings by ISO standard
export const getSettingsByISOStandard = (permissions = []) => {
    const settings = getSettingsPages(permissions);
    return {
        'ISO 9001 - Quality Management': settings.filter(s => s.category === 'organization'),
        'ISO 27001 - Information Security': settings.filter(s => s.category === 'security'),
        'ISO 20000 - IT Service Management': settings.filter(s => s.category === 'services'),
        'ISO 14001 - Interface Management': settings.filter(s => s.category === 'interface'),
        'Business Process Management': settings.filter(s => s.category === 'business-process'),
        'System Administration': settings.filter(s => s.category === 'system-administration'),
        'Personal Security': settings.filter(s => s.category === 'personal-security')
    };
};

// Get settings by priority level
export const getSettingsByPriority = (permissions = []) => {
    return getSettingsPages(permissions).sort((a, b) => a.priority - b.priority);
};

// Search settings by name or description
export const searchSettings = (searchTerm, permissions = []) => {
    const settings = getSettingsPages(permissions);
    const term = searchTerm.toLowerCase();
    return settings.filter(setting => 
        setting.name.toLowerCase().includes(term) ||
        (setting.description && setting.description.toLowerCase().includes(term))
    );
};

// Get recommended settings for new system setup
export const getRecommendedSettings = (permissions = []) => {
    const settings = getSettingsPages(permissions);
    const recommended = ['Organization Configuration', 'Identity & Access Management', 'User Account Administration'];
    return settings.filter(setting => recommended.includes(setting.name));
};
