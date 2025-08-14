import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { 
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard';
import { useAuthThemeSync } from '@/Hooks/useThemeSync';
// Import theme CSS files to ensure background patterns work on auth pages
import '../../css/theme-transitions.css';
import '../../css/smooth-animations.css';
import logo from '../../../public/assets/images/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
    const theme = useTheme();
    const [isDesktop, setIsDesktop] = useState(false);
    
    // Use the enhanced theme sync hook for authentication pages
    useAuthThemeSync();

    // Check if screen is desktop for showing floating elements
    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth > 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 1, sm: 2 },
                position: 'relative',
                overflow: 'hidden',
                // Let the document/body handle the themed background
                // No background override - preserves theme background patterns
            }}
        >
            {/* Floating Background Elements - Responsive positioning */}
            {isDesktop && (
                <>
                    <motion.div
                        className="absolute w-12 h-12 rounded-full"
                        style={{
                            top: '10%',
                            left: '8%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                            backdropFilter: 'blur(8px)'
                        }}
                        animate={{ 
                            y: [-10, 10, -10],
                            rotate: [0, 180, 360] 
                        }}
                        transition={{ 
                            duration: 12, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute w-8 h-8 rounded-full"
                        style={{
                            bottom: '15%',
                            right: '10%',
                            background: `linear-gradient(135deg, ${theme.palette.secondary.main}20, ${theme.palette.primary.main}20)`,
                            backdropFilter: 'blur(6px)'
                        }}
                        animate={{ 
                            x: [-8, 8, -8],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </>
            )}

            <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '100vh', sm: '80vh' },
                        py: { xs: 2, sm: 4 }
                    }}
                >
                    {/* Auth Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full"
                        style={{ maxWidth: '420px' }}
                    >
                        <GlassCard
                            sx={{
                                p: { xs: 2.5, sm: 3, md: 4 },
                                position: 'relative',
                                overflow: 'visible',
                                width: '100%',
                                borderRadius: { xs: 3, sm: 4 }
                            }}
                        >
                            {/* Logo at top of form card */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                style={{ textAlign: 'center', marginBottom: theme.spacing(3) }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1.5, sm: 2 } }}>
                                    <motion.div
                                        className="inline-flex items-center justify-center rounded-xl"
                                       
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <img 
                                            src={logo} 
                                            alt="Logo" 
                                            style={{
                                                width: '160px',
                                                height: '160px',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                // Fallback to text logo if image fails to load
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                       
                                    </motion.div>
                                </Box>
                            </motion.div>

                            {/* Header */}
                            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        fontWeight="600"
                                        gutterBottom
                                        sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                            mb: { xs: 1, sm: 1.5 }
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    {subtitle && (
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ 
                                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                                                lineHeight: 1.4,
                                                px: { xs: 1, sm: 0 }
                                            }}
                                        >
                                            {subtitle}
                                        </Typography>
                                    )}
                                </motion.div>
                            </Box>

                            {/* Form Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                {children}
                            </motion.div>

                            {/* Decorative Elements - Minimized */}
                            <motion.div
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    opacity: 0.4
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                                    opacity: 0.4
                                }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                            />
                        </GlassCard>

                       

                        
                    </motion.div>
                </Box>
            </Container>
        </Box>
    );
};

export default AuthLayout;
