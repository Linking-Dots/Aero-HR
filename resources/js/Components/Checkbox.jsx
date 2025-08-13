import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

const Checkbox = forwardRef(({ 
    label, 
    description,
    error,
    checked = false,
    className = '',
    ...props 
}, ref) => {
    return (
        <div className={clsx('space-y-1', className)}>
            <div className="flex items-start">
                <div className="flex items-center h-6">
                    <div className="relative">
                        <input
                            ref={ref}
                            type="checkbox"
                            checked={checked}
                            className="sr-only"
                            {...props}
                        />
                        
                        <motion.div
                            className={clsx(
                                'w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center',
                                checked
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-300 hover:border-blue-400',
                                error && 'border-red-300'
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (props.onChange) {
                                    props.onChange({ target: { checked: !checked } });
                                }
                            }}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: checked ? 1 : 0,
                                    opacity: checked ? 1 : 0,
                                }}
                                transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                            >
                                <CheckIcon className="w-3 h-3 text-white" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
                
                {(label || description) && (
                    <div className="ml-3">
                        {label && (
                            <label 
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                                onClick={() => {
                                    if (props.onChange) {
                                        props.onChange({ target: { checked: !checked } });
                                    }
                                }}
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
            
            {error && (
                <motion.p
                    className="text-sm text-red-600 ml-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
