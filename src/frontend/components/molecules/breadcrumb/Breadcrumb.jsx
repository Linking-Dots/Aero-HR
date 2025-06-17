import React from 'react';
import { styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { Link, usePage } from '@inertiajs/react';
import { Box, Grid } from '@mui/material';
import Grow from '@mui/material/Grow';

/**
 * Styled Breadcrumb Chip Component
 * 
 * Custom styled chip component with glassmorphism styling.
 * Matches the application's glass card theme.
 */
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    return {
        backdropFilter: 'blur(16px) saturate(200%)',
        background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
        border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.short,
        }),
        '&:hover, &:focus': {
            cursor: 'pointer',
            backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(17, 25, 40, 0.7)',
            transform: 'translateY(-1px)',
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(17, 25, 40, 0.8)',
            transform: 'translateY(0px)',
        },
    };
});

/**
 * Breadcrumb Component - Atomic Design: Molecule
 * 
 * Navigation breadcrumb component that shows the current page location.
 * Provides users with context about their current position in the application.
 * 
 * Features:
 * - Glass morphism styling consistent with app theme
 * - Home icon link for quick navigation
 * - Current page title display
 * - Responsive design with grow animation
 * - Accessibility-compliant navigation structure
 * 
 * @component
 * @returns {JSX.Element} Rendered Breadcrumb component
 * 
 * @example
 * <Breadcrumb />
 */
const Breadcrumb = () => {
    const { props } = usePage();
    const { title, auth } = props;

    // Get the current route parameters for profile routing
    const getCurrentRouteParams = () => {
        const currentRoute = route().current();
        if (currentRoute === 'profile') {
            return { user: auth.user.id };
        }
        return {};
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                justifyContent: 'center',
                padding: '0px 16px 0px 16px',
                mb: 2
            }}
            component="nav"
            role="navigation"
            aria-label="Breadcrumb navigation"
        >
            <Grow in timeout={300}>
                <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center'
                        }}>
                            <Box>
                                <Breadcrumbs 
                                    aria-label="breadcrumb navigation"
                                    separator="›"
                                    sx={{
                                        '& .MuiBreadcrumbs-separator': {
                                            color: 'text.secondary',
                                            mx: 1
                                        }
                                    }}
                                >
                                    {/* Home Breadcrumb */}
                                    <StyledBreadcrumb
                                        component={Link}
                                        href={route('dashboard')}
                                        label="Home"
                                        icon={<HomeIcon fontSize="small" />}
                                        clickable
                                        aria-label="Navigate to dashboard home"
                                        data-testid="breadcrumb-home"
                                    />
                                    
                                    {/* Current Page Breadcrumb */}
                                    <StyledBreadcrumb
                                        component={Link}
                                        href={route(route().current(), getCurrentRouteParams())}
                                        label={title || 'Page'}
                                        clickable
                                        aria-label={`Current page: ${title || 'Page'}`}
                                        data-testid="breadcrumb-current"
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            }
                                        }}
                                    />
                                </Breadcrumbs>
                            </Box>
                            
                            {/* Future: Additional actions could go here */}
                            <Box>
                                {/* Placeholder for page actions like search, filters, etc. */}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Grow>
        </Box>
    );
};

export default Breadcrumb;
