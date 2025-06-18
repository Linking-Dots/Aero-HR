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

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const quickLinks = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Employees', href: '/employees' },
        { label: 'Projects', href: '/daily-works' },
        { label: 'Settings', href: '/settings' }
    ];

    const contactInfo = [
        { 
            icon: EnvelopeIcon, 
            label: 'Email', 
            value: 'support@dbedc.com',
            href: 'mailto:support@dbedc.com'
        },
        { 
            icon: PhoneIcon, 
            label: 'Phone', 
            value: '+880 1234 567890',
            href: 'tel:+8801234567890'
        },
        { 
            icon: GlobeAltIcon, 
            label: 'Website', 
            value: 'www.dbedc.com',
            href: 'https://www.dbedc.com'
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
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <Typography 
                                                variant="h6" 
                                                className="font-bold text-white"
                                                style={{ fontFamily: 'monospace' }}
                                            >
                                                D
                                            </Typography>
                                        </div>
                                        <Typography 
                                            variant="h6" 
                                            className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                        >
                                            DBEDC ERP
                                        </Typography>
                                    </div>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        className="leading-relaxed"
                                    >
                                        Enterprise Resource Planning system designed for modern businesses. 
                                        Streamline your operations with our comprehensive solution.
                                    </Typography>
                                    <div className="flex items-center gap-2 text-sm text-default-500">
                                        <span>Made with</span>
                                        <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                                        <span>by Emam Hosen</span>
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
                                    &copy; {currentYear} DBEDC. All rights reserved.
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
