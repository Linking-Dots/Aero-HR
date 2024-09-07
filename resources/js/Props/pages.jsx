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

// Function to create pages array
export const getPages = (userIsAdmin) => [
    { name: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
    { name: 'Leaves', icon: <LogoutIcon />, route: 'leaves-employee' },
    { name: 'Attendance', icon: <CalendarTodayIcon />, route: 'attendance-employee' },
    ...(userIsAdmin ? [{
        name: 'Employees', icon: <PeopleIcon />, subMenu: [
            { name: 'All Employees', icon: <PeopleIcon />, route: 'employees' },
            { name: 'Holidays', icon: <EventNoteIcon />, route: 'holidays' },
            { name: 'Leaves', icon: <LogoutIcon />, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } },
            { name: 'Leave Types', icon: <SettingsIcon />, route: 'leave-settings' },
            { name: 'Attendances', icon: <CalendarTodayIcon />, route: 'attendances' },
            { name: 'Departments', icon: <HomeIcon />, route: 'departments' },
            { name: 'Designations', icon: <WorkIcon />, route: 'designations' },
            { name: 'Timesheet', icon: <ListAltIcon />, route: 'timesheet' },
        ]
    }] : []),
    {
        name: 'Projects', icon: <WorkIcon />, subMenu: [
            { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
            { name: 'Daily Works', icon: <ListAltIcon />, route: 'dailyWorks' },
            { name: 'Daily Work Summary', icon: <ListIcon />, route: 'dailyWorkSummary' }
        ]
    },
    { name: 'Blog', icon: <ArticleIcon />, route: 'dashboard' }
];
