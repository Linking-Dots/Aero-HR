import React from 'react';
import {styled} from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import {Link, usePage} from '@inertiajs/react';
import {Box, Grid} from '@mui/material';
import Grow from '@mui/material/Grow';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backdropFilter: 'blur(16px) saturate(200%)',
        background: theme.glassCard.background,
        border: theme.glassCard.color,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            cursor: 'pointer',
            backgroundColor: 'rgba(17, 25, 40, 0.7)',
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: 'rgba(17, 25, 40, 0.7)',
        },
    };
});


const Breadcrumb = ({ }) => {
    const {props} = usePage();
    const {title, auth, job} = props;
    
    // Generate breadcrumb items based on current route
    const generateBreadcrumbs = () => {
        const currentRoute = route().current();
        const breadcrumbs = [];

        // Add home breadcrumb with fallback
        try {
            breadcrumbs.push({
                label: "Home",
                icon: <HomeIcon fontSize="small" />,
                href: route('dashboard'),
                component: "a"
            });
        } catch (error) {
            // Fallback if dashboard route doesn't exist
            breadcrumbs.push({
                label: "Home",
                icon: <HomeIcon fontSize="small" />,
                href: "/",
                component: "a"
            });
        }

        try {
            // Handle different route patterns
            if (currentRoute?.startsWith('hr.recruitment')) {
                // Add HR Recruitment base breadcrumb
                breadcrumbs.push({
                    label: "Recruitment",
                    href: route('hr.recruitment.index'),
                    component: Link
                });

                // Handle specific recruitment routes
                if (currentRoute === 'hr.recruitment.show' && job) {
                    breadcrumbs.push({
                        label: job.title || 'Job Details',
                        href: null, // Current page, no link
                        component: "span"
                    });
                } else if (currentRoute === 'hr.recruitment.applications.index' && job) {
                    // Only add job link if we have a valid job ID
                    if (job.id) {
                        breadcrumbs.push({
                            label: job.title || 'Job',
                            href: route('hr.recruitment.show', { id: job.id }),
                            component: Link
                        });
                    }
                    breadcrumbs.push({
                        label: "Applications",
                        href: null, // Current page, no link
                        component: "span"
                    });
                } else if (currentRoute === 'hr.recruitment.create') {
                    breadcrumbs.push({
                        label: "Create Job",
                        href: null, // Current page, no link
                        component: "span"
                    });
                } else if (currentRoute === 'hr.recruitment.edit' && job && job.id) {
                    breadcrumbs.push({
                        label: job.title || 'Job',
                        href: route('hr.recruitment.show', { id: job.id }),
                        component: Link
                    });
                    breadcrumbs.push({
                        label: "Edit",
                        href: null, // Current page, no link
                        component: "span"
                    });
                }
            } else if (currentRoute === 'profile' && auth?.user?.id) {
                breadcrumbs.push({
                    label: title || 'Profile',
                    href: route('profile', { user: auth.user.id }),
                    component: Link
                });
            } else {
                // Default fallback - just add the title without trying to generate route
                breadcrumbs.push({
                    label: title || 'Page',
                    href: null, // Current page, no link
                    component: "span"
                });
            }
        } catch (error) {
            // Fallback in case of any route generation errors
            console.warn('Breadcrumb route generation error:', error);
            breadcrumbs.push({
                label: title || 'Page',
                href: null,
                component: "span"
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 1.5,
        }}>
            <Grow in>
                <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right' }}>
                            <Box>
                                <Breadcrumbs aria-label="breadcrumb">
                                    {breadcrumbs.map((breadcrumb, index) => (
                                        <StyledBreadcrumb
                                            key={index}
                                            component={breadcrumb.component}
                                            href={breadcrumb.href}
                                            label={breadcrumb.label}
                                            icon={breadcrumb.icon}
                                            onClick={breadcrumb.href ? undefined : (e) => e.preventDefault()}
                                            style={breadcrumb.href ? {} : { cursor: 'default', opacity: 0.8 }}
                                        />
                                    ))}
                                </Breadcrumbs>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Grow>
        </Box>
    );
};

export default Breadcrumb;
