import React from 'react';
import {
    HomeIcon,
    BuildingOfficeIcon,
    ClockIcon,
    PhotoIcon,
    KeyIcon,
    AtSymbolIcon,
    ChartBarIcon,
    HandThumbUpIcon,
    PencilIcon,
    CurrencyDollarIcon,
    BellIcon,
    LockClosedIcon,
    WrenchScrewdriverIcon,
    ChatBubbleLeftRightIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

// Function to create settings pages array
export const getSettingsPages = () => [
    { name: 'Back to Dashboard', icon: <Squares2X2Icon className="w-5 h-5" />, route: 'dashboard' },
    { name: 'Company Settings', icon: <BuildingOfficeIcon className="w-5 h-5" />, route: 'company-settings' },
    { name: 'Attendance Settings', icon: <ClockIcon className="w-5 h-5" />, route: 'attendance-settings' },
    { name: 'Localization', icon: <ClockIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Theme Settings', icon: <PhotoIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Roles & Permissions', icon: <KeyIcon className="w-5 h-5" />, route: 'roles-settings' },
    { name: 'Email Settings', icon: <AtSymbolIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Performance Settings', icon: <ChartBarIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Approval Settings', icon: <HandThumbUpIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Invoice Settings', icon: <PencilIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Salary Settings', icon: <CurrencyDollarIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Notifications', icon: <BellIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Change Password', icon: <LockClosedIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Leave Type', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'ToxBox Settings', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, route: 'employees' },
    { name: 'Cron Settings', icon: <RocketLaunchIcon className="w-5 h-5" />, route: 'employees' }
];
