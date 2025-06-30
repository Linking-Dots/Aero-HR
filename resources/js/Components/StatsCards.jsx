import React from 'react';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { Card, CardHeader, CardBody } from "@heroui/react";

/**
 * Shared statistics cards component with enhanced responsive design for any number of cards
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with structure: 
 *   { title, value, icon, color, description, iconBg?, valueColor?, customStyle? }
 * @param {string} props.gridCols - CSS grid columns classes (optional, auto-calculated if not provided)
 * @param {string} props.className - Additional CSS classes for the container
 * @param {boolean} props.animate - Whether to apply staggered animation (default: true)
 * @param {boolean} props.compact - Use compact layout for smaller cards (default: false)
 */
const StatsCards = ({ stats = [], gridCols, className = "mb-6", animate = true, compact = false, variant = 'default' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    // Listen for theme changes
    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Enhanced grid layout calculation that scales with any number of cards
    const getGridCols = () => {
        if (gridCols) return gridCols;
        
        const count = stats.length;
          if (isMobile) {
            // Mobile: Compact vertical layout - optimized for any number of cards
            if (count <= 2) return 'grid-cols-2';
            if (count <= 4) return 'grid-cols-2';
            if (count <= 6) return 'grid-cols-2'; // 2 columns for up to 6 items
            if (count <= 10) return 'grid-cols-2'; // 2 columns for 7-10 items
            return 'grid-cols-3'; // 3 columns for 11+ items on mobile for extreme cases
        }
        
        if (isTablet) {
            // Tablet: Balance between compactness and readability
            if (count <= 2) return 'grid-cols-2';
            if (count <= 3) return 'grid-cols-3';
            if (count <= 6) return 'grid-cols-3'; // 3 columns for 4-6 items
            if (count <= 9) return 'grid-cols-3'; // Keep 3 columns for 7-9 items
            return 'grid-cols-4'; // 4 columns for 10+ items
        }
        
        if (isLargeTablet) {
            // Large tablet: More space available
            if (count <= 2) return 'grid-cols-2';
            if (count <= 4) return 'grid-cols-4';
            if (count <= 6) return 'grid-cols-3'; // 3x2 grid for 5-6 items
            if (count <= 8) return 'grid-cols-4'; // 4x2 grid for 7-8 items
            return 'grid-cols-4'; // Max 4 columns for 9+ items
        }
        
        // Desktop: Optimal layout for larger screens
        if (count <= 2) return `grid-cols-${count}`;
        if (count <= 4) return 'grid-cols-4';
        if (count <= 6) return 'grid-cols-3'; // 3x2 grid for 5-6 items
        if (count <= 8) return 'grid-cols-4'; // 4x2 grid for 7-8 items
        if (count <= 12) return 'grid-cols-4'; // 4x3 grid for 9-12 items
        return 'grid-cols-5'; // 5 columns for 13+ items
    };

    // Enhanced card styling with glass effects
    const getCardClasses = () => {
        const count = stats.length;
        
        const getVariantStyles = () => {
            switch (variant) {
                case 'elevated':
                    return darkMode
                        ? 'bg-gradient-to-br from-slate-900/70 to-slate-800/50 border-white/15 hover:from-slate-800/80 hover:to-slate-700/60'
                        : 'bg-gradient-to-br from-white/80 to-white/60 border-white/40 hover:from-white/90 hover:to-white/70';
                case 'accent':
                    return darkMode
                        ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/40 border-blue-500/25 hover:from-blue-800/60 hover:to-purple-800/50'
                        : 'bg-gradient-to-br from-blue-50/90 to-purple-50/70 border-blue-200/50 hover:from-blue-100/95 hover:to-purple-100/75';
                default:
                    return darkMode
                        ? 'bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-white/10 hover:from-slate-800/70 hover:to-slate-700/50'
                        : 'bg-gradient-to-br from-white/70 to-white/50 border-white/30 hover:from-white/80 hover:to-white/60';
            }
        };

        const variantClasses = getVariantStyles();
        const backdropClasses = 'backdrop-blur-xl saturate-180';
        const shadowClasses = darkMode 
            ? 'shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30' 
            : 'shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/15';
        const transitionClasses = 'transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/20';
        const roundingClasses = 'rounded-2xl border';
        
        let sizeClasses = '';
        if (isMobile) {
            sizeClasses = count > 6 ? 'min-h-[80px]' : 'min-h-[100px]';
        } else if (isTablet) {
            sizeClasses = count > 8 ? 'min-h-[90px]' : 'min-h-[110px]';
        } else {
            sizeClasses = count > 10 ? 'min-h-[100px]' : 'min-h-[120px]';
        }
        
        return `${variantClasses} ${backdropClasses} ${shadowClasses} ${transitionClasses} ${roundingClasses} ${sizeClasses} relative overflow-hidden`;
    };    if (!stats || stats.length === 0) return null;

    return (
        <div className={className}>
            <div className={`grid gap-4 ${getGridCols()}`}>
                {stats.map((stat, index) => {
                    const {
                        title,
                        value,
                        icon,
                        color = 'text-blue-600',
                        description,
                        iconBg = 'bg-blue-500/20',
                        valueColor,
                        customStyle = {}
                    } = stat;

                    return (
                        <Card 
                            key={index}
                            className={getCardClasses()}
                            style={{
                                position: 'relative',
                                ...(animate ? {
                                    animationDelay: `${index * 100}ms`,
                                    animationDuration: '0.6s',
                                    animationFillMode: 'both',
                                    animationName: 'fadeInUp',
                                } : {}),
                                ...customStyle
                            }}
                        >
                            {/* Glass overlay effect */}
                            <div 
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                style={{
                                    background: darkMode 
                                        ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                                        : 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                                    zIndex: 1
                                }}
                            />
                            <div className="relative z-10">
                            {isMobile && stats.length > 6 ? (
                                // Ultra-compact mobile layout for many cards
                                <CardBody className="p-3">
                                    <div className="flex items-center gap-2">
                                        {icon && (
                                            <div className={`p-1.5 ${iconBg} rounded-md flex-shrink-0`}>
                                                {React.isValidElement(icon) ? (
                                                    React.cloneElement(icon, {
                                                        className: `w-4 h-4 ${color}`,
                                                        ...(icon.props || {})
                                                    })
                                                ) : (
                                                    <div className={`w-4 h-4 ${color}`}>
                                                        {icon}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <Typography 
                                                variant="caption" 
                                                className={`font-medium ${color} text-xs leading-tight`}
                                            >
                                                {title}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                className={`font-bold ${valueColor || color} text-sm leading-tight`}
                                            >
                                                {value}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            ) : (
                                // Standard layout for desktop/tablet or few cards
                                <>
                                    <CardHeader className={`pb-2 ${isMobile ? 'p-3' : 'p-4'}`}>
                                        <div className="flex items-center gap-2">
                                            {icon && (
                                                <div className={`${isMobile ? 'p-1.5' : 'p-2'} ${iconBg} rounded-lg flex-shrink-0`}>
                                                    {React.isValidElement(icon) ? (
                                                        React.cloneElement(icon, {
                                                            className: `${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${color}`,
                                                            ...(icon.props || {})
                                                        })
                                                    ) : (
                                                        <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${color}`}>
                                                            {icon}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <Typography 
                                                variant={isMobile ? "subtitle2" : "h6"} 
                                                className={`font-semibold ${color} ${isMobile ? 'text-sm' : ''}`}
                                            >
                                                {title}
                                            </Typography>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardBody className={`pt-0 ${isMobile ? 'p-3' : 'p-4'}`}>
                                        <Typography 
                                            variant={isMobile ? "h5" : "h4"} 
                                            className={`font-bold ${valueColor || color}`}
                                            style={typeof value === 'string' && value.length > 10 ? {
                                                fontSize: isMobile ? '1rem' : '1.25rem',
                                                lineHeight: '1.2'
                                            } : {}}
                                        >
                                            {value}
                                        </Typography>
                                        {description && (
                                            <Typography 
                                                variant="caption" 
                                                color="textSecondary"
                                                className={isMobile ? 'text-xs' : 'text-sm'}
                                            >
                                                {description}
                                            </Typography>
                                        )}
                                    </CardBody>
                                </>
                            )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsCards;
