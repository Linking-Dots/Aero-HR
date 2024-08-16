import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import BlogIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LeaveIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import * as React from "react";

export const pages = [
    { name: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
    { name: 'Leaves', icon: <LeaveIcon />, route: 'leaves-employee' },
    { name: 'Attendance', icon: <CalendarTodayIcon />, route: 'attendance-employee' },
    { name: 'Employees', icon: <PeopleIcon />, subMenu: [
            { name: 'All Employees', icon: <PeopleIcon />, route: 'employees' },
            { name: 'Holidays', icon: <EventNoteIcon />, route: 'holidays' },
            { name: 'Leaves', icon: <LeaveIcon />, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } },
            { name: 'Leave Settings', icon: <SettingsIcon />, route: 'leave-settings' },
            { name: 'Attendances', icon: <CalendarTodayIcon />, route: 'attendances' },
            { name: 'Departments', icon: <HomeIcon />, route: 'departments' },
            { name: 'Designations', icon: <WorkIcon />, route: 'designations' },
            { name: 'Timesheet', icon: <ListAltIcon />, route: 'timesheet' },
        ]
    },
    { name: 'Projects', icon: <WorkIcon />, subMenu: [
            { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
            { name: 'Daily Works', icon: <ListAltIcon />, route: 'dailyWorks' }
        ] },
    { name: 'Blog', icon: <BlogIcon />, route: 'dashboard' }
];
