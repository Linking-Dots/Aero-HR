import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhotoIcon from '@mui/icons-material/Photo';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BarChartIcon from '@mui/icons-material/BarChart';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import ChatIcon from '@mui/icons-material/Chat';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from "@mui/icons-material/Dashboard";

// Function to create settings pages array
export const getSettingsPages = () => [
    // { name: 'Back to Home', icon: <HomeIcon />, route: 'admin-dashboard' },
    // { name: 'Settings', isTitle: true }, // Title separator
    // { name: 'Company Settings', icon: <BusinessIcon />, route: 'settings', active: true },
    // { name: 'Localization', icon: <AccessTimeIcon />, route: 'localization' },
    // { name: 'Theme Settings', icon: <PhotoIcon />, route: 'theme-settings' },
    // { name: 'Roles & Permissions', icon: <VpnKeyIcon />, route: 'roles-permissions' },
    // { name: 'Email Settings', icon: <AlternateEmailIcon />, route: 'email-settings' },
    // { name: 'Performance Settings', icon: <BarChartIcon />, route: 'performance-setting' },
    // { name: 'Approval Settings', icon: <ThumbUpAltIcon />, route: 'approval-setting' },
    // { name: 'Invoice Settings', icon: <EditIcon />, route: 'invoice-settings' },
    // { name: 'Salary Settings', icon: <MonetizationOnIcon />, route: 'salary-settings' },
    // { name: 'Notifications', icon: <NotificationsIcon />, route: 'notifications-settings' },
    // { name: 'Change Password', icon: <LockIcon />, route: 'change-password' },
    // { name: 'Leave Type', icon: <BuildIcon />, route: 'leave-type' },
    // { name: 'ToxBox Settings', icon: <ChatIcon />, route: 'toxbox-setting' },
    // { name: 'Cron Settings', icon: <RocketLaunchIcon />, route: 'cron-setting' }

    { name: 'Back to Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
    // { name: 'Settings', isTitle: true }, // Title separator
    { name: 'Company Settings', icon: <BusinessIcon />, route: 'company-settings', active: true },
    { name: 'Localization', icon: <AccessTimeIcon />, route: 'employees' },
    { name: 'Theme Settings', icon: <PhotoIcon />, route: 'employees' },
    { name: 'Roles & Permissions', icon: <VpnKeyIcon />, route: 'employees' },
    { name: 'Email Settings', icon: <AlternateEmailIcon />, route: 'employees' },
    { name: 'Performance Settings', icon: <BarChartIcon />, route: 'employees' },
    { name: 'Approval Settings', icon: <ThumbUpAltIcon />, route: 'employees' },
    { name: 'Invoice Settings', icon: <EditIcon />, route: 'employees' },
    { name: 'Salary Settings', icon: <MonetizationOnIcon />, route: 'employees' },
    { name: 'Notifications', icon: <NotificationsIcon />, route: 'employees' },
    { name: 'Change Password', icon: <LockIcon />, route: 'employees' },
    { name: 'Leave Type', icon: <BuildIcon />, route: 'employees' },
    { name: 'ToxBox Settings', icon: <ChatIcon />, route: 'employees' },
    { name: 'Cron Settings', icon: <RocketLaunchIcon />, route: 'employees' }

];
