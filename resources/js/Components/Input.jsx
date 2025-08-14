import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useTheme } from '@mui/material/styles';

const Input = forwardRef(({ 
    type = 'text', 
    label, 
    error, 
    icon: Icon,
    className = '',
    showPasswordToggle = false,
    ...props 
}, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const theme = useTheme();
    
    const inputType = showPasswordToggle && type === 'password' 
        ? (isPasswordVisible ? 'text' : 'password')
        : type;

    return (
        <div className="space-y-1.5">{/* Reduced spacing from space-y-2 */}
            {label && (
                <motion.label 
                    className="block text-sm font-medium"
                    style={{ color: theme.palette.text.primary }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {label}
                </motion.label>
            )}
            
            <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon 
                            className="h-5 w-5 transition-colors duration-200" 
                            style={{ 
                                color: isFocused 
                                    ? theme.palette.primary.main 
                                    : theme.palette.text.secondary 
                            }}
                        />
                    </div>
                )}
                
                <motion.input
                    ref={ref}
                    type={inputType}
                    className={clsx(
                        'block w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none',
                        'placeholder:opacity-70 placeholder:font-normal',
                        theme.palette.mode === 'dark' 
                            ? 'placeholder:text-white/60' 
                            : 'placeholder:text-black/60',
                        Icon && 'pl-12',
                        showPasswordToggle && 'pr-12',
                        className
                    )}
                    style={{
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                        border: isFocused
                            ? `2px solid ${theme.palette.primary.main}40`
                            : error
                            ? `2px solid ${theme.palette.error.main}40`
                            : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Force proper contrast
                        caretColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', // Ensure cursor is visible
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        boxShadow: isFocused
                            ? `0 0 0 4px ${theme.palette.primary.main}15, 0 4px 12px rgba(0, 0, 0, 0.1)`
                            : error
                            ? `0 0 0 4px ${theme.palette.error.main}15, 0 2px 8px rgba(0, 0, 0, 0.05)`
                            : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        '--placeholder-color': theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.5)' 
                            : 'rgba(0, 0, 0, 0.5)',
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    whileFocus={{ 
                        scale: 1.02,
                        transition: { type: "spring", stiffness: 300, damping: 30 }
                    }}
                    {...props}
                />
                
                {showPasswordToggle && type === 'password' && (
                    <motion.button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200"
                        style={{ 
                            color: isFocused 
                                ? theme.palette.primary.main 
                                : theme.palette.text.secondary 
                        }}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isPasswordVisible ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </motion.button>
                )}
                
                {/* Animated border gradient on focus */}
                {isFocused && (
                    <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}30)`,
                            padding: '2px'
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div 
                            className="w-full h-full rounded-xl"
                            style={{
                                background: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px) saturate(180%)',
                            }}
                        />
                    </motion.div>
                )}
            </motion.div>
            
            {error && (
                <motion.p
                    className="text-sm flex items-center gap-2"
                    style={{ color: theme.palette.error.main }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
