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
  ComputerDesktopIcon
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
  // 6. Admin (System Administration)
  ...(permissions.includes('users.view') || permissions.includes('settings.view') || permissions.includes('roles.view') ? [{
    name: 'Admin',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    priority: 6,
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
