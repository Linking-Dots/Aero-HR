import React from 'react';
import { Box, Container, Grid, Typography, useMediaQuery } from '@mui/material';
import { Button, Divider, Link } from "@heroui/react";
import { 
  HeartIcon, 
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from "@mui/material/styles";
import GlassCard from '@/Components/GlassCard.jsx';
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const quickLinks = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Employees', href: '/employees' },
        { label: 'Attendance', href: '/attendance-admin' },
        { label: 'Leave Management', href: '/leaves-admin' },
        { label: 'Timesheets', href: '/time-sheet' },
        { label: 'User Management', href: '/users' },
        { label: 'Reports', href: '/reports' },
        { label: 'Settings', href: '/settings' }
    ];

    const contactInfo = [
        { 
            icon: EnvelopeIcon, 
            label: 'Email', 
            value: 'support@aero-hr.com',
            href: 'mailto:support@aero-hr.com'
        },
        { 
            icon: PhoneIcon, 
            label: 'Phone', 
            value: '+1 (555) 123-4567',
            href: 'tel:+15551234567'
        },
        { 
            icon: GlobeAltIcon, 
            label: 'Website', 
            value: 'www.aero-hr.com',
            href: 'https://www.aero-hr.com'
        }
    ];

    return (
        <Box 
            component="footer" 
            role="contentinfo"
            sx={{ 
                py: { xs: 3, md: 4 },
                mt: 'auto',
                borderTop: `1px solid ${theme.palette.divider}`
            }}
        >
            <Container maxWidth="xl">
                <GlassCard className="overflow-hidden">
                    <Box sx={{ p: { xs: 3, md: 4 } }}>
                        {/* Main Footer Content */}
                        <Grid container spacing={{ xs: 3, md: 4 }}>
                            {/* Brand Section */}
                            <Grid item xs={12} md={4}>
                                <Box className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${GRADIENT_PRESETS.iconContainer}`}>
                                            <Typography 
                                                variant="h5" 
                                                className="font-bold text-white"
                                                style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                                A
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography 
                                                variant="h5" 
                                                className={`font-bold ${GRADIENT_PRESETS.gradientText}`}
                                            >
                                                Aero HR
                                            </Typography>
                                            <Typography variant="caption" className="text-default-500">
                                                Enterprise Solution
                                            </Typography>
                                        </div>
                                    </div>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        className="leading-relaxed mt-3"
                                    >
                                        Advanced Human Resource Management system designed for modern enterprises. 
                                        Streamline your HR operations with our comprehensive, cloud-based solution 
                                        featuring employee management, attendance tracking, leave management, and more.
                                    </Typography>
                                    <div className="flex items-center gap-2 text-sm text-default-500 mt-4">
                                        <span>Crafted with</span>
                                        <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                                        <span>by the Aero Team</span>
                                    </div>
                                </Box>
                            </Grid>

                            {/* Quick Links */}
                            <Grid item xs={12} sm={6} md={4}>
                                <Box className="space-y-4">
                                    <Typography 
                                        variant="subtitle1" 
                                        className="font-semibold text-foreground"
                                    >
                                        Quick Links
                                    </Typography>
                                    <div className="grid grid-cols-2 gap-2">
                                        {quickLinks.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.href}
                                                color="foreground"
                                                className="text-sm hover:text-primary transition-colors duration-200"
                                                underline="hover"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </Box>
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12} sm={6} md={4}>
                                <Box className="space-y-4">
                                    <Typography 
                                        variant="subtitle1" 
                                        className="font-semibold text-foreground"
                                    >
                                        Contact Info
                                    </Typography>
                                    <div className="space-y-3">
                                        {contactInfo.map((contact, index) => {
                                            const IconComponent = contact.icon;
                                            return (
                                                <Link
                                                    key={index}
                                                    href={contact.href}
                                                    color="foreground"
                                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors duration-200"
                                                    underline="none"
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{contact.label}</div>
                                                        <div className="text-default-500 text-xs">{contact.value}</div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider className="my-6 bg-white/20" />

                        {/* Bottom Section */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    className="text-center md:text-left"
                                >
                                    &copy; {currentYear} Aero HR Enterprise Solution. All rights reserved.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <div className="flex justify-center md:justify-end gap-4">
                                    <Link
                                        href="/privacy"
                                        color="foreground"
                                        className="text-sm hover:text-primary transition-colors duration-200"
                                        underline="hover"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        href="/terms"
                                        color="foreground"
                                        className="text-sm hover:text-primary transition-colors duration-200"
                                        underline="hover"
                                    >
                                        Terms of Service
                                    </Link>
                                    <Link
                                        href="/support"
                                        color="foreground"
                                        className="text-sm hover:text-primary transition-colors duration-200"
                                        underline="hover"
                                    >
                                        Support
                                    </Link>
                                </div>
                            </Grid>
                        </Grid>
                    </Box>
                </GlassCard>
            </Container>
        </Box>
    );
};

export default Footer;
