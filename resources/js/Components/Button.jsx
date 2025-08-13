import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
        ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-green-500',
    };
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    const isDisabled = disabled || loading;

    // If using Link component, don't pass type and disabled props
    const componentProps = Component === 'button' 
        ? { type, disabled: isDisabled, ...props }
        : props;

    return (
        <motion.div
            ref={ref}
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            <Component
                className="w-full h-full flex items-center justify-center"
                {...componentProps}
            >
                {loading && (
                    <motion.div
                        className="mr-2"
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
                    <Icon className="w-4 h-4 mr-2" />
                )}
                
                {children}
                
                {Icon && iconPosition === 'right' && !loading && (
                    <Icon className="w-4 h-4 ml-2" />
                )}
            </Component>
        </motion.div>
    );
});

Button.displayName = 'Button';

export default Button;
