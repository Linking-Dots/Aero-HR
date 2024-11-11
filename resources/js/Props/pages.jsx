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
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// Function to create pages array
export const getPages = (permissions) => [
    { name: 'Dashboard', icon: <DashboardIcon/>, route: 'dashboard'},
    ...(permissions.includes('read employee') ? [
        { name: 'Emails', icon: <MailOutlineIcon/>, route: 'emails'},
    ] : []),

    { name: 'Leaves', icon: <LogoutIcon/>, route: 'leaves-employee'},
    { name: 'Attendances', icon: <CalendarTodayIcon/>, route: 'attendance-employee'},
    ...(permissions.includes('read employee') ? [
        {
            name: 'Employees', icon: <PeopleIcon/>, subMenu: [
                ...(permissions.includes('read employee') ? [{ name: 'All Employees', icon: <PeopleIcon sx={{ ml: 2 }}/>, route: 'employees'}] : []),
                ...(permissions.includes('read holidays') ? [{ name: 'Holidays', icon: <EventNoteIcon sx={{ ml: 2 }}/>, route: 'holidays'}] : []),
                ...(permissions.includes('read leaves') ? [{ name: 'Leaves (Admin)', icon: <LogoutIcon sx={{ ml: 2 }}/>, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } }] : []),
                ...(permissions.includes('read leaves') ? [{ name: 'Leave Settings', icon: <SettingsIcon sx={{ ml: 2 }}/>, route: 'leave-settings'}] : []),
                ...(permissions.includes('read attendances') ? [{ name: 'Attendances (Admin)', icon: <CalendarTodayIcon sx={{ ml: 2 }}/>, route: 'attendances'}] : []),
                ...(permissions.includes('read departments') ? [{ name: 'Departments', icon: <HomeIcon sx={{ ml: 2 }}/>, route: 'departments'}] : []),
                ...(permissions.includes('read designations') ? [{ name: 'Designations', icon: <WorkIcon sx={{ ml: 2 }}/>, route: 'designations'}] : []),
            ]
        }
    ] : []),
    {
        name: 'Projects', icon: <WorkIcon/>, subMenu: [
            // { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
            { name: 'Daily Works', icon: <ListAltIcon sx={{ ml: 2 }}/>, route: 'daily-works'},
            { name: 'Daily Work Summary', icon: <ListIcon sx={{ ml: 2 }}/>, route: 'daily-works-summary'}
        ]
    },
    ...(permissions.includes('read users') ? [
        {
            name: 'Documents', icon: <FolderOpenIcon/>, subMenu: [
                // { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
                { name: 'Letters', icon: <MailOutlineIcon sx={{ ml: 2 }}/>, route: 'letters' },
            ]
        }
    ] : []),
    ...(permissions.includes('read users') ? [{name: 'Users', icon: <GroupIcon/>, route: 'users'}] : []),
    ...(permissions.includes('read settings') ? [{name: 'Settings', icon: <Settings/>, route: 'company-settings', }] : []),

];


