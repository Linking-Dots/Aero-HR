/**
 * @fileoverview Authentication Template Footer Component
 * @description Footer component for authentication pages with legal links and company info
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * @compliance
 * - ISO 25010: Usability, accessibility, performance efficiency
 * - WCAG 2.1 AA: Accessibility compliance with proper link structure
 * - GDPR: Privacy policy and terms of service links
 * 
 * @features
 * - Legal compliance links
 * - Company information
 * - Social media links
 * - Responsive design
 * - Glass morphism styling
 * - Accessibility navigation
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Utilities
import { AUTH_TEMPLATE_CONFIG } from './config';

/**
 * Authentication Template Footer Component
 * 
 * Provides footer functionality for authentication pages including:
 * - Legal compliance links (Privacy Policy, Terms of Service)
 * - Company contact information
 * - Social media links
 * - Copyright information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showSocialLinks - Whether to show social media links
 * @param {boolean} props.showContactInfo - Whether to show contact information
 * @param {boolean} props.showLegalLinks - Whether to show legal compliance links
 * @param {Object} props.branding - Company branding configuration
 * @param {Object} props.socialLinks - Social media links configuration
 * @param {Object} props.contactInfo - Company contact information
 * @param {Array} props.legalLinks - Legal compliance links
 * @returns {JSX.Element} Rendered footer component
 */
const AuthTemplateFooter = memo(({
  showSocialLinks = true,
  showContactInfo = true,
  showLegalLinks = true,
  branding = AUTH_TEMPLATE_CONFIG.branding,
  socialLinks = AUTH_TEMPLATE_CONFIG.socialLinks,
  contactInfo = AUTH_TEMPLATE_CONFIG.contactInfo,
  legalLinks = AUTH_TEMPLATE_CONFIG.legalLinks,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  // Animation variants
  const footerVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, delay: 0.2 }
    }
  };

  const linkVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.2 }
    },
    hover: {
      x: 2,
      transition: { duration: 0.2 }
    }
  };

  // Social media icon mapping
  const socialIcons = {
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    linkedin: LinkedInIcon,
    instagram: InstagramIcon,
    email: EmailIcon,
    phone: PhoneIcon
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      <Box
        sx={{
          mt: 'auto',
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 4 },
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.02)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
            zIndex: -1
          }
        }}
      >
        {/* Main Footer Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3,
            mb: 3
          }}
        >
          {/* Company Information */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 1
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              {branding.companyName}
            </Typography>
            
            {branding.tagline && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ 
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: 300
                }}
              >
                {branding.tagline}
              </Typography>
            )}

            {/* Contact Information */}
            {showContactInfo && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                {contactInfo.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Link
                      href={`mailto:${contactInfo.email}`}
                      color="text.secondary"
                      underline="hover"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {contactInfo.email}
                    </Link>
                  </Box>
                )}
                
                {contactInfo.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Link
                      href={`tel:${contactInfo.phone}`}
                      color="text.secondary"
                      underline="hover"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {contactInfo.phone}
                    </Link>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Legal Links */}
          {showLegalLinks && legalLinks.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 2, md: 1 }
              }}
            >
              {legalLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  variants={linkVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Link
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </Box>
          )}

          {/* Social Media Links */}
          {showSocialLinks && Object.keys(socialLinks).length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}
            >
              {Object.entries(socialLinks).map(([platform, url]) => {
                const IconComponent = socialIcons[platform];
                if (!IconComponent || !url) return null;

                return (
                  <motion.div
                    key={platform}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${platform}`}
                      sx={{
                        backgroundColor: alpha(theme.palette.action.hover, 0.1),
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <IconComponent sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </motion.div>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Divider */}
        <Divider sx={{ backgroundColor: alpha(theme.palette.divider, 0.1) }} />

        {/* Copyright */}
        <Box
          sx={{
            pt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: { xs: 'center', md: 'left' } }}
          >
            © {currentYear} {branding.companyName}. All rights reserved.
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              textAlign: { xs: 'center', md: 'right' },
              fontSize: '0.75rem'
            }}
          >
            Built with ❤️ using glassERP
          </Typography>
        </Box>
      </Box>
    </motion.footer>
  );
});

AuthTemplateFooter.displayName = 'AuthTemplateFooter';

AuthTemplateFooter.propTypes = {
  showSocialLinks: PropTypes.bool,
  showContactInfo: PropTypes.bool,
  showLegalLinks: PropTypes.bool,
  branding: PropTypes.shape({
    companyName: PropTypes.string.isRequired,
    tagline: PropTypes.string
  }),
  socialLinks: PropTypes.object,
  contactInfo: PropTypes.shape({
    email: PropTypes.string,
    phone: PropTypes.string
  }),
  legalLinks: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired
  }))
};

export default AuthTemplateFooter;
