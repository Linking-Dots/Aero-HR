import {
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UsersIcon,
  FolderIcon, // Changed from FolderOpenIcon
  ChartBarSquareIcon, // Changed from ChartBarIcon
  CreditCardIcon,
  ShoppingBagIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  UserIcon,
  ArchiveBoxIcon,
  AcademicCapIcon,
  TruckIcon,
  ShoppingCartIcon,
  TicketIcon,
  BeakerIcon,
  CubeIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export const getPages = (permissions, auth = null) => [
  // 1. Dashboard (ISO 9000 - Information Management)
  ...(permissions.includes('dashboard.view') ? [{
    name: 'Dashboard',
    icon: <HomeIcon className="h-6 w-6" />, 
    route: 'dashboard',
    priority: 1,
    module: 'core'
  }] : []),
  // 2. Workspace (Self-Service)
  ...((permissions.includes('attendance.own.view') || permissions.includes('leave.own.view') || permissions.includes('communications.own.view')) ? [{
    name: 'Workspace',
    icon: <UserGroupIcon className="h-6 w-6" />,
    priority: 2,
    module: 'self-service',
    subMenu: [
      ...(permissions.includes('attendance.own.view') ? [
        { name: 'Attendance', icon: <CalendarDaysIcon className="ml-2 h-5 w-5" />, route: 'attendance-employee' }
      ] : []),
      ...(permissions.includes('leave.own.view') ? [
        { name: 'Leaves', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'leaves-employee' }
      ] : []),
      ...(permissions.includes('communications.own.view') ? [
        { name: 'Communications', icon: <EnvelopeIcon className="ml-2 h-5 w-5" />, route: 'emails' },
      ] : []),
    ]
  }] : []),
  // 3. HR (Human Resources)
  ...(permissions.includes('employees.view') ? [{
    name: 'HR',
    icon: <UserGroupIcon className="h-6 w-6" />,
    priority: 3,
    module: 'hrm',
    subMenu: [
      ...(permissions.includes('employees.view') ? [{ name: 'Employees', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'employees' }] : []),
      ...(permissions.includes('departments.view') ? [{ name: 'Departments', icon: <HomeIcon className="ml-2 h-5 w-5" />, route: 'departments' }] : []),
      ...(permissions.includes('designations.view') ? [{ name: 'Positions', icon: <BriefcaseIcon className="ml-2 h-5 w-5" />, route: 'designations' }] : []),
      ...(permissions.includes('attendance.view') ? [{ name: 'Attendance', icon: <CalendarDaysIcon className="ml-2 h-5 w-5" />, route: 'attendances' }] : []),
      ...(permissions.includes('holidays.view') ? [{ name: 'Calendar', icon: <CalendarIcon className="ml-2 h-5 w-5" />, route: 'holidays' }] : []),
      ...(permissions.includes('leaves.view') ? [
        { name: 'Leaves', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'leaves' },
        { name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'leave-summary' },
        { name: 'Policy', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'leave-settings' },
      ] : []),
      ...(permissions.includes('performance-reviews.view') ? [
        { name: 'Performance', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'hr.performance.index' }
      ] : []),
      ...(permissions.includes('training-sessions.view') ? [
        { name: 'Training', icon: <AcademicCapIcon className="ml-2 h-5 w-5" />, route: 'hr.training.index' }
      ] : []),
      ...(permissions.includes('jobs.view') ? [
        { name: 'Recruitment', icon: <BriefcaseIcon className="ml-2 h-5 w-5" />, route: 'hr.recruitment.index' }
      ] : []),
    ]
  }] : []),
  // 4. Projects (Project Management)
  ...(permissions.includes('daily-works.view') ? [{
    name: 'Projects',
    icon: <BriefcaseIcon className="h-6 w-6" />,
    priority: 4,
    module: 'ppm',
    subMenu: [
      ...(permissions.includes('daily-works.view') ? [
        { name: 'Worklog', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'daily-works' }
      ] : []),
      ...(permissions.includes('daily-works.view') ? [
        { name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'daily-works-summary' }
      ] : []),
    ]
  }] : []),
  // 5. DMS (Document Management)
  ...(permissions.includes('letters.view') ? [{
    name: 'DMS',
    icon: <FolderIcon className="h-6 w-6" />,
    priority: 5,
    module: 'dms',
    subMenu: [
      { name: 'Correspondence', icon: <EnvelopeIcon className="ml-2 h-5 w-5" />, route: 'letters' },
    ]
  }] : []),
  // 6. CRM (Customer Relationship Management)
  ...(permissions.includes('crm.view') ? [{
    name: 'CRM',
    icon: <UserIcon className="h-6 w-6" />,
    priority: 6,
    module: 'crm',
    subMenu: [
      ...(permissions.includes('crm.customers.view') ? [{ name: 'Customers', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'crm.customers.index' }] : []),
      ...(permissions.includes('crm.opportunities.view') ? [{ name: 'Opportunities', icon: <BriefcaseIcon className="ml-2 h-5 w-5" />, route: 'crm.opportunities.index' }] : []),
      ...(permissions.includes('crm.interactions.view') ? [{ name: 'Interactions', icon: <PhoneIcon className="ml-2 h-5 w-5" />, route: 'crm.interactions.index' }] : []),
      ...(permissions.includes('crm.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'crm.dashboard' }] : []),
    ]
  }] : []),
  // 7. FMS (Financial Management System)
  ...(permissions.includes('fms.view') ? [{
    name: 'Finance',
    icon: <BanknotesIcon className="h-6 w-6" />,
    priority: 7,
    module: 'fms',
    subMenu: [
      ...(permissions.includes('fms.transactions.view') ? [{ name: 'Transactions', icon: <CreditCardIcon className="ml-2 h-5 w-5" />, route: 'fms.transactions.index' }] : []),
      ...(permissions.includes('fms.accounts.view') ? [{ name: 'Accounts', icon: <BanknotesIcon className="ml-2 h-5 w-5" />, route: 'fms.accounts.index' }] : []),
      ...(permissions.includes('fms.reports.view') ? [{ name: 'Reports', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'fms.reports.index' }] : []),
      ...(permissions.includes('fms.budgets.view') ? [{ name: 'Budgets', icon: <ScaleIcon className="ml-2 h-5 w-5" />, route: 'fms.budgets.index' }] : []),
      ...(permissions.includes('fms.dashboard.view') ? [{ name: 'Dashboard', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'fms.dashboard' }] : []),
    ]
  }] : []),
  // 8. POS (Point of Sale)
  ...(permissions.includes('pos.view') ? [{
    name: 'POS',
    icon: <ShoppingCartIcon className="h-6 w-6" />,
    priority: 8,
    module: 'pos',
    subMenu: [
      ...(permissions.includes('pos.sales.view') ? [{ name: 'Sales', icon: <ShoppingCartIcon className="ml-2 h-5 w-5" />, route: 'pos.sales.index' }] : []),
      ...(permissions.includes('pos.orders.view') ? [{ name: 'Orders', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'pos.orders.index' }] : []),
      ...(permissions.includes('pos.cashier.view') ? [{ name: 'Cashier', icon: <CreditCardIcon className="ml-2 h-5 w-5" />, route: 'pos.cashier' }] : []),
      ...(permissions.includes('pos.dashboard.view') ? [{ name: 'Reports', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'pos.dashboard' }] : []),
    ]
  }] : []),
  // 9. IMS (Inventory Management System)
  ...(permissions.includes('ims.view') ? [{
    name: 'Inventory',
    icon: <ArchiveBoxIcon className="h-6 w-6" />,
    priority: 9,
    module: 'ims',
    subMenu: [
      ...(permissions.includes('ims.items.view') ? [{ name: 'Items', icon: <CubeIcon className="ml-2 h-5 w-5" />, route: 'ims.items.index' }] : []),
      ...(permissions.includes('ims.stock.view') ? [{ name: 'Stock', icon: <ArchiveBoxIcon className="ml-2 h-5 w-5" />, route: 'ims.stock.index' }] : []),
      ...(permissions.includes('ims.transfers.view') ? [{ name: 'Transfers', icon: <TruckIcon className="ml-2 h-5 w-5" />, route: 'ims.transfers.index' }] : []),
      ...(permissions.includes('ims.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'ims.dashboard' }] : []),
    ]
  }] : []),
  // 10. LMS (Learning Management System)
  ...(permissions.includes('lms.view') ? [{
    name: 'Learning',
    icon: <AcademicCapIcon className="h-6 w-6" />,
    priority: 10,
    module: 'lms',
    subMenu: [
      ...(permissions.includes('lms.courses.view') ? [{ name: 'Courses', icon: <AcademicCapIcon className="ml-2 h-5 w-5" />, route: 'lms.courses.index' }] : []),
      ...(permissions.includes('lms.enrollments.view') ? [{ name: 'Enrollments', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'lms.enrollments.index' }] : []),
      ...(permissions.includes('lms.assessments.view') ? [{ name: 'Assessments', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'lms.assessments.index' }] : []),
      ...(permissions.includes('lms.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'lms.dashboard' }] : []),
    ]
  }] : []),
  // 11. SCM (Supply Chain Management)
  ...(permissions.includes('scm.view') ? [{
    name: 'Supply Chain',
    icon: <TruckIcon className="h-6 w-6" />,
    priority: 11,
    module: 'scm',
    subMenu: [
      ...(permissions.includes('scm.suppliers.view') ? [{ name: 'Suppliers', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'scm.suppliers.index' }] : []),
      ...(permissions.includes('scm.purchases.view') ? [{ name: 'Purchases', icon: <ShoppingBagIcon className="ml-2 h-5 w-5" />, route: 'scm.purchases.index' }] : []),
      ...(permissions.includes('scm.logistics.view') ? [{ name: 'Logistics', icon: <TruckIcon className="ml-2 h-5 w-5" />, route: 'scm.logistics.index' }] : []),
      ...(permissions.includes('scm.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'scm.dashboard' }] : []),
    ]
  }] : []),
  // 12. Sales/Retail
  ...(permissions.includes('sales.view') ? [{
    name: 'Sales',
    icon: <ShoppingBagIcon className="h-6 w-6" />,
    priority: 12,
    module: 'sales',
    subMenu: [
      ...(permissions.includes('sales.orders.view') ? [{ name: 'Orders', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'sales.orders.index' }] : []),
      ...(permissions.includes('sales.invoices.view') ? [{ name: 'Invoices', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'sales.invoices.index' }] : []),
      ...(permissions.includes('sales.quotes.view') ? [{ name: 'Quotes', icon: <DocumentDuplicateIcon className="ml-2 h-5 w-5" />, route: 'sales.quotes.index' }] : []),
      ...(permissions.includes('sales.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'sales.dashboard' }] : []),
    ]
  }] : []),
  // 13. Helpdesk
  ...(permissions.includes('helpdesk.view') ? [{
    name: 'Helpdesk',
    icon: <TicketIcon className="h-6 w-6" />,
    priority: 13,
    module: 'helpdesk',
    subMenu: [
      ...(permissions.includes('helpdesk.tickets.view') ? [{ name: 'Tickets', icon: <TicketIcon className="ml-2 h-5 w-5" />, route: 'helpdesk.tickets.index' }] : []),
      ...(permissions.includes('helpdesk.knowledge.view') ? [{ name: 'Knowledge Base', icon: <FolderIcon className="ml-2 h-5 w-5" />, route: 'helpdesk.knowledge.index' }] : []),
      ...(permissions.includes('helpdesk.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'helpdesk.dashboard' }] : []),
    ]
  }] : []),
  // 14. Assets
  ...(permissions.includes('assets.view') ? [{
    name: 'Assets',
    icon: <ComputerDesktopIcon className="h-6 w-6" />,
    priority: 14,
    module: 'assets',
    subMenu: [
      ...(permissions.includes('assets.items.view') ? [{ name: 'Items', icon: <ComputerDesktopIcon className="ml-2 h-5 w-5" />, route: 'assets.items.index' }] : []),
      ...(permissions.includes('assets.maintenance.view') ? [{ name: 'Maintenance', icon: <WrenchScrewdriverIcon className="ml-2 h-5 w-5" />, route: 'assets.maintenance.index' }] : []),
      ...(permissions.includes('assets.dashboard.view') ? [{ name: 'Reports', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'assets.dashboard' }] : []),
    ]
  }] : []),
  // 15. Compliance
  ...(permissions.includes('compliance.view') ? [{
    name: 'Compliance',
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    priority: 15,
    module: 'compliance',
    subMenu: [
      ...(permissions.includes('compliance.documents.view') ? [{ name: 'Documents', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'compliance.documents.index' }] : []),
      ...(permissions.includes('compliance.audits.view') ? [{ name: 'Audits', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'compliance.audits.index' }] : []),
      ...(permissions.includes('compliance.requirements.view') ? [{ name: 'Requirements', icon: <DocumentDuplicateIcon className="ml-2 h-5 w-5" />, route: 'compliance.requirements.index' }] : []),
      ...(permissions.includes('compliance.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'compliance.dashboard' }] : []),
    ]
  }] : []),
  // 16. Procurement
  ...(permissions.includes('procurement.view') ? [{
    name: 'Procurement',
    icon: <ShoppingBagIcon className="h-6 w-6" />,
    priority: 16,
    module: 'procurement',
    subMenu: [
      ...(permissions.includes('procurement.purchase-orders.view') ? [{ name: 'Purchase Orders', icon: <ShoppingCartIcon className="ml-2 h-5 w-5" />, route: 'procurement.purchase-orders.index' }] : []),
      ...(permissions.includes('procurement.vendors.view') ? [{ name: 'Vendors', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'procurement.vendors.index' }] : []),
      ...(permissions.includes('procurement.rfq.view') ? [{ name: 'RFQs', icon: <DocumentDuplicateIcon className="ml-2 h-5 w-5" />, route: 'procurement.rfq.index' }] : []),
      ...(permissions.includes('procurement.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'procurement.dashboard' }] : []),
    ]
  }] : []),
  // 17. Quality Management
  ...(permissions.includes('quality.view') ? [{
    name: 'Quality',
    icon: <BeakerIcon className="h-6 w-6" />,
    priority: 17,
    module: 'quality',
    subMenu: [
      ...(permissions.includes('quality.inspections.view') ? [{ name: 'Inspections', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'quality.inspections.index' }] : []),
      ...(permissions.includes('quality.ncr.view') ? [{ name: 'Non-Conformances', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'quality.ncrs.index' }] : []),
      ...(permissions.includes('quality.calibrations.view') ? [{ name: 'Calibrations', icon: <ScaleIcon className="ml-2 h-5 w-5" />, route: 'quality.calibrations.index' }] : []),
      ...(permissions.includes('quality.dashboard.view') ? [{ name: 'Analytics', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'quality.dashboard' }] : []),
    ]
  }] : []),
  // 18. Analytics
  ...(permissions.includes('analytics.view') ? [{
    name: 'Analytics',
    icon: <ChartBarSquareIcon className="h-6 w-6" />,
    priority: 18,
    module: 'analytics',
    subMenu: [
      ...(permissions.includes('analytics.reports.view') ? [{ name: 'Reports', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'analytics.reports.index' }] : []),
      ...(permissions.includes('analytics.dashboards.view') ? [{ name: 'Dashboards', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'analytics.dashboards.index' }] : []),
      ...(permissions.includes('analytics.kpi.view') ? [{ name: 'KPIs', icon: <ChartBarSquareIcon className="ml-2 h-5 w-5" />, route: 'analytics.kpi.index' }] : []),
    ]
  }] : []),
  // 19. Admin (System Administration)
  ...(permissions.includes('users.view') || permissions.includes('settings.view') || permissions.includes('roles.view') ? [{
    name: 'Admin',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    priority: 19,
    module: 'admin',
    subMenu: [
      ...(permissions.includes('users.view') ? [{ name: 'Users', icon: <UsersIcon className="ml-2 h-5 w-5" />, route: 'users' }] : []),
      ...(permissions.includes('roles.view') ? [
        { name: 'Roles', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'admin.roles-management' }
      ] : []),
      ...(auth?.user && auth?.roles?.includes('Super Administrator') ? [
        { name: 'Monitoring', icon: <ComputerDesktopIcon className="ml-2 h-5 w-5" />, route: 'admin.system-monitoring' }
      ] : []),
      ...(permissions.includes('settings.view') ? [{ name: 'Settings', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'admin.settings.company' }] : []),
    ]
  }] : []),
];

// Utility functions for navigation management

// Get pages by module for better organization
export const getPagesByModule = (permissions) => {
  const pages = getPages(permissions);
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

// Get pages sorted by priority
export const getPagesByPriority = (permissions) => {
  return getPages(permissions).sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

// Get navigation breadcrumb path
export const getNavigationPath = (currentRoute, permissions) => {
  const pages = getPages(permissions);
  const path = [];
  // Find the current page in the navigation structure
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
