/**
 * Input - Atom Component
 * Modern Input component with error handling and accessibility
 * Phase 6: Complete frontend migration
 */

import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
    type = 'text',
    error = '',
    className = '',
    placeholder = '',
    disabled = false,
    required = false,
    ...props 
}, ref) => {
    const baseClasses = `
        w-full px-3 py-2 border rounded-lg shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors duration-200
    `;
    
    const errorClasses = error 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300';
    
    return (
        <div className="w-full">
            <input
                ref={ref}
                type={type}
                className={`${baseClasses} ${errorClasses} ${className}`}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${props.id}-error` : undefined}
                {...props}
            />
            {error && (
                <p 
                    id={`${props.id}-error`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
