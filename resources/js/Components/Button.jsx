import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTheme } from '@mui/material/styles';

const Button = forwardRef(({ 
    children, 
    as: Component = 'button',
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    icon: Icon,
    iconPosition = 'left',
    ...props 
}, ref) => {
    const theme = useTheme();
    
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: theme.palette.primary.contrastText,
                    border: 'none',
                    boxShadow: `0 4px 15px ${theme.palette.primary.main}30, 0 2px 8px rgba(0, 0, 0, 0.1)`,
                    '&:hover': {
                        boxShadow: `0 6px 20px ${theme.palette.primary.main}40, 0 4px 12px rgba(0, 0, 0, 0.15)`,
                        transform: 'translateY(-2px)'
                    }
                };
            case 'secondary':
                return {
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px) saturate(180%)',
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-1px)'
                    }
                };
            case 'outline':
                return {
                    background: 'transparent',
                    color: theme.palette.primary.main,
                    border: `2px solid ${theme.palette.primary.main}40`,
                    backdropFilter: 'blur(5px)',
                    '&:hover': {
                        background: `${theme.palette.primary.main}10`,
                        border: `2px solid ${theme.palette.primary.main}60`,
                        transform: 'translateY(-1px)'
                    }
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: theme.palette.text.primary,
                    border: 'none',
                    '&:hover': {
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)',
                    }
                };
            case 'danger':
                return {
                    background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                    color: theme.palette.error.contrastText,
                    border: 'none',
                    boxShadow: `0 4px 15px ${theme.palette.error.main}30, 0 2px 8px rgba(0, 0, 0, 0.1)`,
                    '&:hover': {
                        boxShadow: `0 6px 20px ${theme.palette.error.main}40, 0 4px 12px rgba(0, 0, 0, 0.15)`,
                        transform: 'translateY(-2px)'
                    }
                };
            case 'success':
                return {
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    color: theme.palette.success.contrastText,
                    border: 'none',
                    boxShadow: `0 4px 15px ${theme.palette.success.main}30, 0 2px 8px rgba(0, 0, 0, 0.1)`,
                    '&:hover': {
                        boxShadow: `0 6px 20px ${theme.palette.success.main}40, 0 4px 12px rgba(0, 0, 0, 0.15)`,
                        transform: 'translateY(-2px)'
                    }
                };
            default:
                return {};
        }
    };
    
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    const isDisabled = disabled || loading;
    const variantStyles = getVariantStyles();

    // If using Link component, don't pass type and disabled props
    const componentProps = Component === 'button' 
        ? { type, disabled: isDisabled, ...props }
        : props;

    return (
        <motion.div
            className={clsx(baseStyles, sizes[size], className)}
            style={variantStyles}
            whileHover={!isDisabled ? { 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 30 }
            } : undefined}
            whileTap={!isDisabled ? { 
                scale: 0.98,
                transition: { type: "spring", stiffness: 400, damping: 30 }
            } : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Shimmer effect for primary buttons */}
            {variant === 'primary' && !isDisabled && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                    }}
                />
            )}
            
            <Component
                ref={ref}
                className="w-full h-full flex items-center justify-center relative z-10"
                {...componentProps}
            >
                {loading && (
                    <motion.div
                        className="mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </motion.div>
                )}
                
                {Icon && iconPosition === 'left' && !loading && (
                    <motion.div
                        className="mr-2"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Icon className="w-4 h-4" />
                    </motion.div>
                )}
                
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {children}
                </motion.span>
                
                {Icon && iconPosition === 'right' && !loading && (
                    <motion.div
                        className="ml-2"
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Icon className="w-4 h-4" />
                    </motion.div>
                )}
            </Component>
        </motion.div>
    );
});

Button.displayName = 'Button';

export default Button;
