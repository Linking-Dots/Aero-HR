import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ListIcon from '@mui/icons-material/List';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import GroupIcon from '@mui/icons-material/Group';
import { AccountCircle, ExitToApp, Settings } from '@mui/icons-material';
// Function to create pages array
export const getPages = (permissions) => [
    { name: 'Dashboard', icon: <DashboardIcon sx={{ ml: 2 }}/>, route: 'dashboard' },
    { name: 'Leaves', icon: <LogoutIcon sx={{ ml: 2 }}/>, route: 'leaves-employee' },
    { name: 'Attendances', icon: <CalendarTodayIcon sx={{ ml: 2 }}/>, route: 'attendance-employee' },
    {
        name: 'Employees', icon: <PeopleIcon sx={{ ml: 2 }}/>, subMenu: [
            ...(permissions.includes('read employee') ? [{ name: 'All Employees', icon: <PeopleIcon />, route: 'employees' }] : []),
            ...(permissions.includes('read holidays') ? [{ name: 'Holidays', icon: <EventNoteIcon />, route: 'holidays' }] : []),
            ...(permissions.includes('read leaves') ? [{ name: 'Leaves (Admin)', icon: <LogoutIcon />, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } }] : []),
            ...(permissions.includes('read leaves') ? [{ name: 'Leave Settings', icon: <SettingsIcon />, route: 'leave-settings' }] : []),
            ...(permissions.includes('read attendances') ? [{ name: 'Attendances (Admin)', icon: <CalendarTodayIcon />, route: 'attendances' }] : []),
            ...(permissions.includes('read departments') ? [{ name: 'Departments', icon: <HomeIcon />, route: 'departments' }] : []),
            ...(permissions.includes('read designations') ? [{ name: 'Designations', icon: <WorkIcon />, route: 'designations' }] : []),
            ...(permissions.includes('read timesheet') ? [{ name: 'Timesheet', icon: <ListAltIcon />, route: 'timesheet' }] : []),
        ]
    },
    {
        name: 'Projects', icon: <WorkIcon sx={{ ml: 2 }}/>, subMenu: [
            // { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
            { name: 'Daily Works', icon: <ListAltIcon />, route: 'dailyWorks' },
            { name: 'Daily Work Summary', icon: <ListIcon />, route: 'dailyWorkSummary' }
        ]
    },
    ...(permissions.includes('read users') ? [{name: 'Users', icon: <GroupIcon sx={{ ml: 2 }}/>, route: 'users'}] : []),
    ...(permissions.includes('read settings') ? [{name: 'Settings', icon: <Settings sx={{ ml: 2 }}/>, route: 'company-settings'}] : []),

];
