/**
 * Checkbox - Atom Component
 * Modern Checkbox component with label support
 * Phase 6: Complete frontend migration
 */

import React from 'react';

const Checkbox = ({ 
    checked = false,
    onChange,
    label = '',
    name = '',
    id = '',
    disabled = false,
    className = '',
    ...props 
}) => {
    const checkboxId = id || name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <div className={`flex items-center ${className}`}>
            <input
                id={checkboxId}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`
                    h-4 w-4 text-blue-600 border-gray-300 rounded
                    focus:ring-blue-500 focus:ring-2 focus:ring-offset-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                `}
                {...props}
            />
            {label && (
                <label 
                    htmlFor={checkboxId}
                    className={`
                        ml-2 text-sm text-gray-700 cursor-pointer
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

export { Checkbox };
