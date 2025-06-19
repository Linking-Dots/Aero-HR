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
export const getSettingsPages = () => [
    // Navigation
    { 
        name: 'Return to Dashboard', 
        icon: <Squares2X2Icon className="w-5 h-5" />, 
        route: 'dashboard',
        category: 'navigation',
        priority: 1
    },
    
    // ISO 9001 - Quality Management System Configuration
    { 
        name: 'Organization Configuration', 
        icon: <BuildingOfficeIcon className="w-5 h-5" />, 
        route: 'admin.settings.company',
        category: 'organization',
        priority: 2,
        description: 'Configure organizational structure and company information'
    },
    { 
        name: 'Time & Attendance Configuration', 
        icon: <ClockIcon className="w-5 h-5" />, 
        route: 'attendance-settings.index',
        category: 'organization',
        priority: 3,
        description: 'Configure attendance tracking and workforce management'
    },
    { 
        name: 'Leave Policy Management', 
        icon: <HandThumbUpIcon className="w-5 h-5" />, 
        route: 'leave-settings',
        category: 'organization',
        priority: 4,
        description: 'Manage leave types and approval workflows'
    },
    
    // ISO 27001 - Information Security Management
    { 
        name: 'Identity & Access Management', 
        icon: <KeyIcon className="w-5 h-5" />, 
        route: 'admin.roles-management',
        category: 'security',
        priority: 5,
        description: 'Manage user roles and permission system'
    },
    { 
        name: 'User Account Administration', 
        icon: <UserGroupIcon className="w-5 h-5" />, 
        route: 'users',
        category: 'security',
        priority: 6,
        description: 'Manage user accounts and access control'
    },
    { 
        name: 'Security Audit & Compliance', 
        icon: <ShieldCheckIcon className="w-5 h-5" />, 
        route: 'admin.audit.index',
        category: 'security',
        priority: 7,
        description: 'View audit trails and compliance reports'
    },
    
    // ISO 20000 - IT Service Management
    { 
        name: 'Communication Services', 
        icon: <AtSymbolIcon className="w-5 h-5" />, 
        route: 'admin.settings.email',
        category: 'services',
        priority: 8,
        description: 'Configure email templates and communication services'
    },
    { 
        name: 'Notification Management', 
        icon: <BellIcon className="w-5 h-5" />, 
        route: 'admin.settings.notifications',
        category: 'services',
        priority: 9,
        description: 'Manage notification preferences and delivery channels'
    },
    { 
        name: 'Internal Messaging System', 
        icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, 
        route: 'admin.settings.toxbox',
        category: 'services',
        priority: 10,
        description: 'Configure internal communication and messaging'
    },
    
    // ISO 14001 - User Experience & Interface Management
    { 
        name: 'User Interface & Branding', 
        icon: <PhotoIcon className="w-5 h-5" />, 
        route: 'admin.settings.theme',
        category: 'interface',
        priority: 11,
        description: 'Customize application appearance and corporate branding'
    },
    { 
        name: 'Regional & Localization Settings', 
        icon: <ClockIcon className="w-5 h-5" />, 
        route: 'admin.settings.localization',
        category: 'interface',
        priority: 12,
        description: 'Configure language, timezone, and regional preferences'
    },
    
    // ISO 31000 - Risk Management & Business Process
    { 
        name: 'Performance Management Configuration', 
        icon: <ChartBarIcon className="w-5 h-5" />, 
        route: 'admin.settings.performance',
        category: 'business-process',
        priority: 13,
        description: 'Configure performance evaluation and review processes'
    },
    { 
        name: 'Workflow & Approval Management', 
        icon: <HandThumbUpIcon className="w-5 h-5" />, 
        route: 'admin.settings.approval',
        category: 'business-process',
        priority: 14,
        description: 'Manage approval workflows and business processes'
    },
    { 
        name: 'Financial Process Configuration', 
        icon: <PencilIcon className="w-5 h-5" />, 
        route: 'admin.settings.invoice',
        category: 'business-process',
        priority: 15,
        description: 'Configure invoicing and financial processes'
    },
    { 
        name: 'Compensation & Benefits Management', 
        icon: <CurrencyDollarIcon className="w-5 h-5" />, 
        route: 'admin.settings.salary',
        category: 'business-process',
        priority: 16,
        description: 'Manage payroll and compensation structures'
    },
    
    // ISO 38500 - IT Governance & System Administration
    { 
        name: 'System Architecture Configuration', 
        icon: <Cog8ToothIcon className="w-5 h-5" />, 
        route: 'admin.settings.system',
        category: 'system-administration',
        priority: 17,
        description: 'Advanced system configuration and maintenance'
    },
    { 
        name: 'Policy Framework Management', 
        icon: <WrenchScrewdriverIcon className="w-5 h-5" />, 
        route: 'admin.settings.leave-types',
        category: 'system-administration',
        priority: 18,
        description: 'Define and manage organizational policies'
    },
    { 
        name: 'Automated Process Management', 
        icon: <RocketLaunchIcon className="w-5 h-5" />, 
        route: 'admin.settings.cron',
        category: 'system-administration',
        priority: 19,
        description: 'Configure automated tasks and scheduled operations'
    },
    
    // ISO 27001 - Personal Security Management
    { 
        name: 'Personal Security Settings', 
        icon: <LockClosedIcon className="w-5 h-5" />, 
        route: 'profile.password',
        category: 'personal-security',
        priority: 20,
        description: 'Update personal password and security preferences'
    }
];

// Helper function to get settings by category with ISO-aligned organization
export const getSettingsByCategory = () => {
    const settings = getSettingsPages();
    const categories = {
        navigation: { 
            name: 'Navigation', 
            icon: HomeIcon, 
            items: [],
            description: 'System navigation and accessibility',
            isoReference: 'ISO 9241 - Ergonomics of human-system interaction'
        },
        organization: { 
            name: 'Organization Management', 
            icon: BuildingOfficeIcon, 
            items: [],
            description: 'Organizational structure and configuration',
            isoReference: 'ISO 9001 - Quality Management Systems'
        },
        security: { 
            name: 'Security & Access Control', 
            icon: ShieldCheckIcon, 
            items: [],
            description: 'Information security and access management',
            isoReference: 'ISO 27001 - Information Security Management'
        },
        services: { 
            name: 'Service Management', 
            icon: AtSymbolIcon, 
            items: [],
            description: 'IT services and communication management',
            isoReference: 'ISO 20000 - IT Service Management'
        },
        interface: { 
            name: 'User Experience Management', 
            icon: PhotoIcon, 
            items: [],
            description: 'User interface and experience configuration',
            isoReference: 'ISO 9241 - User interface design'
        },
        'business-process': { 
            name: 'Business Process Management', 
            icon: ChartBarIcon, 
            items: [],
            description: 'Business workflow and process optimization',
            isoReference: 'ISO 31000 - Risk Management & Business Processes'
        },
        'system-administration': { 
            name: 'System Administration', 
            icon: WrenchScrewdriverIcon, 
            items: [],
            description: 'Advanced system configuration and governance',
            isoReference: 'ISO 38500 - IT Governance'
        },
        'personal-security': { 
            name: 'Personal Security', 
            icon: LockClosedIcon, 
            items: [],
            description: 'Individual security and privacy settings',
            isoReference: 'ISO 27001 - Personal Information Security'
        }
    };
    
    settings.forEach(setting => {
        const category = setting.category || 'organization';
        if (categories[category]) {
            categories[category].items.push(setting);
        }
    });
    
    // Sort items within each category by priority
    Object.keys(categories).forEach(categoryKey => {
        categories[categoryKey].items.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    });
    
    return categories;
};

// Utility functions for settings management

// Get settings by ISO standard
export const getSettingsByISOStandard = () => {
    const settings = getSettingsPages();
    const isoGroups = {
        'ISO 9001': settings.filter(s => s.category === 'organization'),
        'ISO 27001': settings.filter(s => s.category === 'security' || s.category === 'personal-security'),
        'ISO 20000': settings.filter(s => s.category === 'services'),
        'ISO 9241': settings.filter(s => s.category === 'interface' || s.category === 'navigation'),
        'ISO 31000': settings.filter(s => s.category === 'business-process'),
        'ISO 38500': settings.filter(s => s.category === 'system-administration')
    };
    
    return isoGroups;
};

// Get settings by priority level
export const getSettingsByPriority = () => {
    return getSettingsPages().sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

// Search settings by name or description
export const searchSettings = (searchTerm) => {
    const settings = getSettingsPages();
    const term = searchTerm.toLowerCase();
    
    return settings.filter(setting => 
        setting.name.toLowerCase().includes(term) ||
        (setting.description && setting.description.toLowerCase().includes(term))
    );
};

// Get recommended settings for new system setup
export const getRecommendedSettings = () => {
    const settings = getSettingsPages();
    const recommended = ['Organization Configuration', 'Identity & Access Management', 'Time & Attendance Configuration'];
    
    return settings.filter(setting => recommended.includes(setting.name));
};
