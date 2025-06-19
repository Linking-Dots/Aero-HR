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
  FolderOpenIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export const getPages = (permissions) => [
  // Dashboard
  { 
    name: 'Dashboard', 
    icon: <HomeIcon className="h-6 w-6" />, 
    route: 'dashboard' 
  },

  // My Workspace
  {
    name: 'My Workspace',
    icon: <UserGroupIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'My Attendance', icon: <CalendarDaysIcon className="ml-2 h-5 w-5" />, route: 'attendance-employee' },
      { name: 'My Leaves', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'leaves-employee' },
      ...(permissions.includes('read employee') ? [
        { name: 'My Emails', icon: <EnvelopeIcon className="ml-2 h-5 w-5" />, route: 'emails' },
      ] : []),
    ]
  },

  // CRM (Customer Relationship Management)
  ...(permissions.includes('read customers') ? [{
    name: 'Customer Management',
    icon: <UsersIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Customers', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'customers' },
      { name: 'Leads & Opportunities', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'leads' },
      { name: 'Customer Feedback', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'feedback' },
    ]
  }] : []),

  // Project Management
  {
    name: 'Project Management',
    icon: <BriefcaseIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Daily Work Logs', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'daily-works' },
      { name: 'Work Summary Reports', icon: <ChartBarIcon className="ml-2 h-5 w-5" />, route: 'daily-works-summary' },
      { name: 'Project Planner', icon: <CalendarIcon className="ml-2 h-5 w-5" />, route: 'project-planner' }
    ]
  },

  // Inventory Management System (IMS)
  ...(permissions.includes('read inventory') ? [{
    name: 'Inventory Management',
    icon: <FolderOpenIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Stock Overview', icon: <ClipboardDocumentCheckIcon className="ml-2 h-5 w-5" />, route: 'inventory-overview' },
      { name: 'Suppliers', icon: <BuildingOffice2Icon className="ml-2 h-5 w-5" />, route: 'suppliers' },
      { name: 'Purchase Orders', icon: <DocumentDuplicateIcon className="ml-2 h-5 w-5" />, route: 'purchase-orders' },
      { name: 'Warehousing', icon: <WrenchScrewdriverIcon className="ml-2 h-5 w-5" />, route: 'warehousing' }
    ]
  }] : []),

  // POS (Point of Sale)
  ...(permissions.includes('read pos') ? [{
    name: 'Point of Sale',
    icon: <ShoppingBagIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Sales Terminal', icon: <CreditCardIcon className="ml-2 h-5 w-5" />, route: 'sales-terminal' },
      { name: 'Transaction History', icon: <ChartBarIcon className="ml-2 h-5 w-5" />, route: 'sales-history' }
    ]
  }] : []),

  // Finance & Accounting
  ...(permissions.includes('read finance') ? [{
    name: 'Finance & Accounting',
    icon: <BanknotesIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Accounts Payable', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'accounts-payable' },
      { name: 'Accounts Receivable', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'accounts-receivable' },
      { name: 'General Ledger', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'ledger' },
      { name: 'Financial Reports', icon: <ChartBarIcon className="ml-2 h-5 w-5" />, route: 'financial-reports' }
    ]
  }] : []),

  // Human Resources
  ...(permissions.includes('read employee') ? [{
    name: 'Human Resources',
    icon: <UserGroupIcon className="h-6 w-6" />,
    subMenu: [
      ...(permissions.includes('read employee') ? [{ name: 'Employee Directory', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'employees' }] : []),
      ...(permissions.includes('read departments') ? [{ name: 'Departments', icon: <HomeIcon className="ml-2 h-5 w-5" />, route: 'departments' }] : []),
      ...(permissions.includes('read designations') ? [{ name: 'Job Positions', icon: <BriefcaseIcon className="ml-2 h-5 w-5" />, route: 'designations' }] : []),
      ...(permissions.includes('read attendances') ? [{ name: 'Attendance Management', icon: <CalendarDaysIcon className="ml-2 h-5 w-5" />, route: 'attendances' }] : []),
      ...(permissions.includes('read holidays') ? [{ name: 'Holiday Calendar', icon: <CalendarIcon className="ml-2 h-5 w-5" />, route: 'holidays' }] : []),
      ...(permissions.includes('read leaves') ? [
        { name: 'Leave Applications', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'leaves' },
        { name: 'Leave Analytics', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'leave-summary' },
        { name: 'Leave Policies', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'leave-settings' },
      ] : []),
    ]
  }] : []),

  // Document Center
  ...(permissions.includes('read users') ? [{
    name: 'Document Center',
    icon: <FolderOpenIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Official Letters', icon: <EnvelopeIcon className="ml-2 h-5 w-5" />, route: 'letters' },
    ]
  }] : []),

  // System Administration
  ...(permissions.includes('read admin') || permissions.includes('read settings') || permissions.includes('read roles') ? [{
    name: 'System Administration',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    subMenu: [
      ...(permissions.includes('read admin') ? [{ name: 'Administrative Dashboard', icon: <HomeIcon className="ml-2 h-5 w-5" />, route: 'admin-dashboard' }] : []),
      ...(permissions.includes('read admin') ? [{ name: 'Performance Analytics', icon: <ChartBarIcon className="ml-2 h-5 w-5" />, route: 'performance-dashboard' }] : []),
      ...(permissions.includes('read users') ? [{ name: 'User Administration', icon: <UsersIcon className="ml-2 h-5 w-5" />, route: 'users' }] : []),
      ...(permissions.includes('read roles') ? [{ name: 'Role Management', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'admin.roles-management' }] : []),
      ...(permissions.includes('read settings') ? [{ name: 'System Configuration', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'company-settings' }] : []),
    ]
  }] : []),
];
