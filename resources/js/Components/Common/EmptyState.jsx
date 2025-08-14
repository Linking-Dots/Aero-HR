import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ 
    title, 
    description, 
    icon, 
    action,
    actionText,
    onAction 
}) => {
    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            textAlign="center"
            py={8}
            px={4}
        >
            {icon && (
                <Box mb={3} className="opacity-50">
                    {icon}
                </Box>
            )}
            
            <Typography 
                variant="h6" 
                className="text-gray-800 dark:text-white font-semibold mb-2"
            >
                {title}
            </Typography>
            
            {description && (
                <Typography 
                    variant="body2" 
                    className="text-gray-600 dark:text-gray-300 mb-4 max-w-md"
                >
                    {description}
                </Typography>
            )}
            
            {action && actionText && onAction && (
                <Button
                    variant="contained"
                    onClick={onAction}
                    sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                        }
                    }}
                >
                    {actionText}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;
