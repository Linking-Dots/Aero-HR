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
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const getPages = (permissions) => [
  { name: 'Dashboard', icon: <HomeIcon className="h-6 w-6" />, route: 'dashboard' },
  ...(permissions.includes('read employee') ? [
    { name: 'Emails', icon: <EnvelopeIcon className="h-6 w-6" />, route: 'emails' },
  ] : []),
  { name: 'Leaves', icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />, route: 'leaves-employee' },
  { name: 'Attendances', icon: <CalendarDaysIcon className="h-6 w-6" />, route: 'attendance-employee' },
  ...(permissions.includes('read employee') ? [{
    name: 'Employees',
    icon: <UserGroupIcon className="h-6 w-6" />,
    subMenu: [
      ...(permissions.includes('read employee') ? [{ name: 'All Employees', icon: <UserGroupIcon className="ml-2 h-5 w-5" />, route: 'employees' }] : []),
      ...(permissions.includes('read holidays') ? [{ name: 'Holidays', icon: <CalendarIcon className="ml-2 h-5 w-5" />, route: 'holidays' }] : []),
      ...(permissions.includes('read leaves') ? [
        { name: 'Leaves (Admin)', icon: <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5" />, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } },
        { name: 'Leaves Summary (Admin)', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'leave-summary', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } },
        { name: 'Leave Settings', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'leave-settings' },
      ] : []),
      ...(permissions.includes('read attendances') ? [{ name: 'Attendances (Admin)', icon: <CalendarDaysIcon className="ml-2 h-5 w-5" />, route: 'attendances' }] : []),
      ...(permissions.includes('read departments') ? [{ name: 'Departments', icon: <HomeIcon className="ml-2 h-5 w-5" />, route: 'departments' }] : []),
      ...(permissions.includes('read designations') ? [{ name: 'Designations', icon: <BriefcaseIcon className="ml-2 h-5 w-5" />, route: 'designations' }] : []),
    ]
  }] : []),
  {
    name: 'Projects',
    icon: <BriefcaseIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Daily Works', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'daily-works' },
      { name: 'Daily Work Summary', icon: <DocumentTextIcon className="ml-2 h-5 w-5" />, route: 'daily-works-summary' }
    ]
  },
  ...(permissions.includes('read users') ? [{
    name: 'Documents',
    icon: <FolderOpenIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Letters', icon: <EnvelopeIcon className="ml-2 h-5 w-5" />, route: 'letters' },
    ]
  }] : []),
  ...(permissions.includes('admin') || permissions.includes('read settings') ? [{
    name: 'Administration',
    icon: <Cog6ToothIcon className="h-6 w-6" />,
    subMenu: [
      { name: 'Admin Dashboard', icon: <HomeIcon className="ml-2 h-5 w-5" />, route: 'admin-dashboard' },
      { name: 'Performance Monitor', icon: <ChartBarIcon className="ml-2 h-5 w-5" />, route: 'performance-dashboard' },
      { name: 'User Management', icon: <UsersIcon className="ml-2 h-5 w-5" />, route: 'users' },
      { name: 'System Settings', icon: <Cog6ToothIcon className="ml-2 h-5 w-5" />, route: 'company-settings' },
    ]
  }] : []),
  ...(permissions.includes('read users') && !permissions.includes('admin') ? [{ name: 'Users', icon: <UsersIcon className="h-6 w-6" />, route: 'users' }] : []),
  ...(permissions.includes('read settings') && !permissions.includes('admin') ? [{ name: 'Settings', icon: <Cog6ToothIcon className="h-6 w-6" />, route: 'company-settings' }] : []),
];
