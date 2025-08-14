import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Enhanced Loading Component with Better UX
 * 
 * Features:
 * - Consistent loading states across the app
 * - Smooth animations
 * - Accessibility support
 * - Multiple variants for different contexts
 * - Performance optimized
 */

const LoadingSpinner = React.memo(({ 
    size = 40, 
    thickness = 4, 
    color = 'primary',
    className = '' 
}) => (
    <CircularProgress 
        size={size} 
        thickness={thickness} 
        color={color}
        className={className}
        role="status"
        aria-label="Loading"
    />
));

LoadingSpinner.displayName = 'LoadingSpinner';

const LoadingOverlay = React.memo(({ 
    message = 'Loading...', 
    subtitle = '',
    backdrop = true,
    className = ''
}) => (
    <Box
        className={`${className} fixed inset-0 z-50 flex flex-col items-center justify-center`}
        sx={{
            background: backdrop 
                ? 'linear-gradient(135deg, rgba(15, 20, 25, 0.9) 0%, rgba(20, 25, 30, 0.8) 100%)' 
                : 'transparent',
            backdropFilter: backdrop ? 'blur(8px)' : 'none',
            transition: 'all 0.3s ease'
        }}
        role="status"
        aria-live="polite"
        aria-label={message}
    >
        <Box className="text-center">
            <LoadingSpinner size={60} thickness={3} />
            
            <Typography 
                variant="h6" 
                className="mt-4 text-white font-medium"
                component="div"
            >
                {message}
            </Typography>
            
            {subtitle && (
                <Typography 
                    variant="body2" 
                    className="mt-2 text-white/70"
                    component="div"
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
));

LoadingOverlay.displayName = 'LoadingOverlay';

const SkeletonCard = React.memo(({ 
    height = 200, 
    className = '',
    animated = true 
}) => (
    <Box
        className={`${className} bg-white/10 rounded-xl border border-white/20`}
        sx={{ 
            height: `${height}px`,
            animation: animated ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
        role="status"
        aria-label="Loading content"
    >
        <Box className="p-6 space-y-4">
            <Box className="h-4 bg-white/20 rounded w-3/4"></Box>
            <Box className="h-4 bg-white/20 rounded w-1/2"></Box>
            <Box className="h-4 bg-white/20 rounded w-2/3"></Box>
        </Box>
    </Box>
));

SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTable = React.memo(({ 
    rows = 5, 
    columns = 4,
    className = '' 
}) => (
    <Box className={`${className} bg-white/10 rounded-xl border border-white/20 overflow-hidden`}>
        {/* Header */}
        <Box className="p-4 border-b border-white/10">
            <Box className="grid gap-4" sx={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <Box 
                        key={i} 
                        className="h-4 bg-white/20 rounded animate-pulse" 
                    />
                ))}
            </Box>
        </Box>
        
        {/* Rows */}
        <Box className="divide-y divide-white/10">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <Box key={rowIndex} className="p-4">
                    <Box className="grid gap-4" sx={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Box 
                                key={colIndex} 
                                className="h-3 bg-white/15 rounded animate-pulse"
                                sx={{ 
                                    animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    </Box>
));

SkeletonTable.displayName = 'SkeletonTable';

const InlineLoader = React.memo(({ 
    size = 20, 
    className = '',
    message = 'Loading...' 
}) => (
    <Box className={`${className} flex items-center gap-2`} role="status">
        <LoadingSpinner size={size} thickness={4} />
        <Typography variant="body2" className="text-gray-600">
            {message}
        </Typography>
    </Box>
));

InlineLoader.displayName = 'InlineLoader';

const PageLoader = React.memo(({ 
    message = 'Loading page...', 
    subtitle = 'Please wait while we prepare your content',
    className = '' 
}) => (
    <Box 
        className={`${className} min-h-screen flex flex-col items-center justify-center p-8`}
        role="status"
        aria-live="polite"
    >
        <Box className="text-center max-w-md">
            <LoadingSpinner size={80} thickness={2} />
            
            <Typography 
                variant="h5" 
                className="mt-6 font-semibold text-gray-800 dark:text-white"
                component="h1"
            >
                {message}
            </Typography>
            
            {subtitle && (
                <Typography 
                    variant="body1" 
                    className="mt-3 text-gray-600 dark:text-gray-300"
                    component="p"
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
));

PageLoader.displayName = 'PageLoader';

// CSS animations for better performance
const loadingStyles = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = loadingStyles;
    document.head.appendChild(styleSheet);
}

export {
    LoadingSpinner,
    LoadingOverlay,
    SkeletonCard,
    SkeletonTable,
    InlineLoader,
    PageLoader
};

export default LoadingSpinner;
