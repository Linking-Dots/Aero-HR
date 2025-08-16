import React from 'react';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ServerIcon,
  DocumentTextIcon,
  UsersIcon,
  BanknotesIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  QueueListIcon,
  UserIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  KeyIcon,
  DatabaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ArchiveBoxIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Super Admin Navigation Configuration
 * This defines the navigation structure for Super Administrator users
 * managing the multi-tenant SaaS platform
 */
export const getSuperAdminPages = (permissions = [], auth = null) => [
  // 1. Dashboard (Main Overview)
  {
    name: 'Dashboard',
    icon: <HomeIcon className="" />, 
    route: 'admin.dashboard',
    priority: 1,
    module: 'admin-core',
    description: 'System overview and key metrics'
  },

  // 2. Tenant Management
  {
    name: 'Tenants',
    icon: <BuildingOfficeIcon className="" />,
    priority: 2,
    module: 'tenant-management',
    description: 'Manage all company tenants',
    subMenu: [
      { 
        name: 'All Tenants', 
        icon: <QueueListIcon />, 
        route: 'superadmin.tenants.index',
        description: 'View and manage all tenants'
      },
      { 
        name: 'Create Tenant', 
        icon: <PlusIcon />, 
        route: 'superadmin.tenants.create',
        description: 'Add new tenant manually'
      },
      { 
        name: 'Active Tenants', 
        icon: <CheckCircleIcon />, 
        route: 'superadmin.tenants.index',
        params: { status: 'active' },
        description: 'View active subscriptions'
      },
      { 
        name: 'Trial Tenants', 
        icon: <ClockIcon />, 
        route: 'superadmin.tenants.index',
        params: { status: 'trial' },
        description: 'Manage trial accounts'
      },
      { 
        name: 'Suspended', 
        icon: <XCircleIcon />, 
        route: 'superadmin.tenants.index',
        params: { status: 'suspended' },
        description: 'Suspended accounts'
      }
    ]
  },

  // 3. User Management (Cross-Tenant)
  {
    name: 'Users',
    icon: <UserGroupIcon className="" />,
    priority: 3,
    module: 'user-management',
    description: 'Manage users across all tenants',
    subMenu: [
      { 
        name: 'All Users', 
        icon: <UsersIcon />, 
        route: 'superadmin.users.index',
        description: 'View all users across tenants'
      },
      { 
        name: 'Create User', 
        icon: <PlusIcon />, 
        route: 'superadmin.users.create',
        description: 'Create new user for any tenant'
      },
      { 
        name: 'Tenant Owners', 
        icon: <ShieldCheckIcon />, 
        route: 'superadmin.users.index',
        params: { is_owner: 'true' },
        description: 'Manage tenant administrators'
      },
      { 
        name: 'User Analytics', 
        icon: <ChartBarSquareIcon />, 
        route: 'superadmin.users.analytics',
        description: 'User engagement statistics'
      }
    ]
  },

  // 4. Plans & Pricing Management
  {
    name: 'Plans',
    icon: <CreditCardIcon className="" />,
    priority: 4,
    module: 'plan-management',
    description: 'Manage subscription plans and pricing',
    subMenu: [
      { 
        name: 'All Plans', 
        icon: <QueueListIcon />, 
        route: 'superadmin.plans.index',
        description: 'View and manage all plans'
      },
      { 
        name: 'Create Plan', 
        icon: <PlusIcon />, 
        route: 'superadmin.plans.create',
        description: 'Create new subscription plan'
      },
      { 
        name: 'Active Plans', 
        icon: <CheckCircleIcon />, 
        route: 'superadmin.plans.index',
        params: { status: 'active' },
        description: 'Currently available plans'
      },
      { 
        name: 'Plan Analytics', 
        icon: <ChartBarSquareIcon />, 
        route: 'superadmin.plans.analytics',
        description: 'Plan performance metrics'
      }
    ]
  },

  // 5. Revenue & Billing
  {
    name: 'Revenue',
    icon: <CurrencyDollarIcon className="" />,
    priority: 5,
    module: 'billing-management',
    description: 'Financial management and billing',
    subMenu: [
      { 
        name: 'Revenue Dashboard', 
        icon: <ArrowTrendingUpIcon />, 
        route: 'admin.billing.dashboard',
        description: 'Revenue overview and trends'
      },
      { 
        name: 'Subscriptions', 
        icon: <DocumentTextIcon />, 
        route: 'admin.billing.subscriptions',
        description: 'Active subscription management'
      },
      { 
        name: 'Invoices', 
        icon: <ClipboardDocumentListIcon />, 
        route: 'admin.billing.invoices',
        description: 'Invoice management'
      },
      { 
        name: 'Payment Methods', 
        icon: <BanknotesIcon />, 
        route: 'admin.billing.payment-methods',
        description: 'Payment processing'
      },
      { 
        name: 'Failed Payments', 
        icon: <ExclamationTriangleIcon />, 
        route: 'admin.billing.failed-payments',
        description: 'Handle payment failures'
      }
    ]
  },

  // 6. Analytics & Reports
  {
    name: 'Analytics',
    icon: <ChartBarSquareIcon className="" />,
    priority: 6,
    module: 'analytics',
    description: 'System-wide analytics and insights',
    subMenu: [
      { 
        name: 'System Overview', 
        icon: <HomeIcon />, 
        route: 'admin.analytics',
        description: 'High-level system metrics'
      },
      { 
        name: 'Growth Metrics', 
        icon: <ArrowTrendingUpIcon />, 
        route: 'admin.analytics.growth',
        description: 'User and revenue growth'
      },
      { 
        name: 'Usage Statistics', 
        icon: <CpuChipIcon />, 
        route: 'admin.analytics.usage',
        description: 'Platform usage insights'
      },
      { 
        name: 'Custom Reports', 
        icon: <DocumentTextIcon />, 
        route: 'admin.analytics.reports',
        description: 'Generate custom reports'
      }
    ]
  },

  // 7. System Management
  {
    name: 'System',
    icon: <ServerIcon className="" />,
    priority: 7,
    module: 'system-management',
    description: 'System administration and monitoring',
    subMenu: [
      { 
        name: 'System Status', 
        icon: <CheckCircleIcon />, 
        route: 'admin.system-status',
        description: 'Real-time system health'
      },
      { 
        name: 'Performance', 
        icon: <CpuChipIcon />, 
        route: 'admin.system.performance',
        description: 'Performance monitoring'
      },
      { 
        name: 'Database', 
        icon: <DatabaseIcon />, 
        route: 'admin.system.database',
        description: 'Database management'
      },
      { 
        name: 'Storage', 
        icon: <ArchiveBoxIcon />, 
        route: 'admin.system.storage',
        description: 'Storage management'
      },
      { 
        name: 'Logs', 
        icon: <DocumentTextIcon />, 
        route: 'admin.system.logs',
        description: 'System logs and errors'
      },
      { 
        name: 'Backups', 
        icon: <CloudIcon />, 
        route: 'admin.system.backups',
        description: 'Backup management'
      }
    ]
  },

  // 8. Security & Compliance
  {
    name: 'Security',
    icon: <ShieldCheckIcon className="" />,
    priority: 8,
    module: 'security',
    description: 'Security monitoring and compliance',
    subMenu: [
      { 
        name: 'Security Dashboard', 
        icon: <ShieldExclamationIcon />, 
        route: 'admin.security.dashboard',
        description: 'Security overview'
      },
      { 
        name: 'Access Logs', 
        icon: <KeyIcon />, 
        route: 'admin.security.access-logs',
        description: 'User access monitoring'
      },
      { 
        name: 'Failed Logins', 
        icon: <XCircleIcon />, 
        route: 'admin.security.failed-logins',
        description: 'Security incident tracking'
      },
      { 
        name: 'Permissions', 
        icon: <AdjustmentsHorizontalIcon />, 
        route: 'admin.security.permissions',
        description: 'System-wide permissions'
      }
    ]
  },

  // 9. Communications
  {
    name: 'Communications',
    icon: <EnvelopeIcon className="" />,
    priority: 9,
    module: 'communications',
    description: 'System-wide communication management',
    subMenu: [
      { 
        name: 'System Notifications', 
        icon: <BellIcon />, 
        route: 'admin.communications.notifications',
        description: 'Manage system notifications'
      },
      { 
        name: 'Email Templates', 
        icon: <DocumentTextIcon />, 
        route: 'admin.communications.email-templates',
        description: 'Email template management'
      },
      { 
        name: 'Announcements', 
        icon: <InformationCircleIcon />, 
        route: 'admin.communications.announcements',
        description: 'Platform-wide announcements'
      },
      { 
        name: 'Support Center', 
        icon: <UserIcon />, 
        route: 'admin.communications.support',
        description: 'Customer support management'
      }
    ]
  },

  // 10. Platform Settings
  {
    name: 'Settings',
    icon: <Cog6ToothIcon className="" />,
    priority: 10,
    module: 'platform-settings',
    description: 'Platform-wide configuration',
    category: 'settings',
    subMenu: [
      { 
        name: 'General Settings', 
        icon: <AdjustmentsHorizontalIcon />, 
        route: 'admin.settings.general',
        description: 'Basic platform settings'
      },
      { 
        name: 'Feature Flags', 
        icon: <StarIcon />, 
        route: 'admin.settings.features',
        description: 'Enable/disable features'
      },
      { 
        name: 'Integration Settings', 
        icon: <GlobeAltIcon />, 
        route: 'admin.settings.integrations',
        description: 'Third-party integrations'
      },
      { 
        name: 'Email Configuration', 
        icon: <EnvelopeIcon />, 
        route: 'admin.settings.email',
        description: 'Email server settings'
      },
      { 
        name: 'Payment Gateway', 
        icon: <CreditCardIcon />, 
        route: 'admin.settings.payment',
        description: 'Payment processor settings'
      }
    ]
  }
];

/**
 * Get filtered super admin pages based on permissions
 * This ensures only authorized sections are shown
 */
export const getFilteredSuperAdminPages = (permissions = [], auth = null) => {
  // For super admin, show all pages by default
  // In the future, you can implement more granular permissions
  if (auth?.roles?.includes('Super Administrator')) {
    return getSuperAdminPages(permissions, auth);
  }
  
  // For non-super admin users, return empty array
  return [];
};

/**
 * Get super admin pages by module for better organization
 */
export const getSuperAdminPagesByModule = (permissions = [], auth = null) => {
  const pages = getFilteredSuperAdminPages(permissions, auth);
  const modules = {};
  
  pages.forEach(page => {
    const module = page.module || 'core';
    if (!modules[module]) {
      modules[module] = [];
    }
    modules[module].push(page);
  });
  
  return modules;
};

/**
 * Get super admin pages sorted by priority
 */
export const getSuperAdminPagesByPriority = (permissions = [], auth = null) => {
  return getFilteredSuperAdminPages(permissions, auth)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

/**
 * Check if current user should see super admin navigation
 */
export const shouldShowSuperAdminNav = (auth = null) => {
  return auth?.roles?.includes('Super Administrator') || false;
};

/**
 * Get navigation breadcrumb path for super admin
 */
export const getSuperAdminNavigationPath = (currentRoute, permissions = [], auth = null) => {
  const pages = getFilteredSuperAdminPages(permissions, auth);
  
  const findPageInMenu = (menuItems, targetRoute, currentPath = []) => {
    for (const item of menuItems) {
      const newPath = [...currentPath, item];
      if (item.route === targetRoute) {
        return newPath;
      }
      if (item.subMenu) {
        const result = findPageInMenu(item.subMenu, targetRoute, newPath);
        if (result) return result;
      }
    }
    return null;
  };
  
  return findPageInMenu(pages, currentRoute) || [];
};

export default getSuperAdminPages;
