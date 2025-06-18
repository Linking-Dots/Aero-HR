/**
 * UI Components Index
 * Shared UI components for the modern architecture
 * Phase 6: Complete frontend migration
 */

// Re-export common UI components from atoms
export { Input } from '../../../components/atoms/input';
export { Button } from '../../../components/atoms/button';
export { Checkbox } from '../../../components/atoms/checkbox';
export { Alert } from '../../../components/atoms/alert';
export { Loader } from '../../../components/atoms/loader';

// Loading component
export const Loading = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8', 
        lg: 'h-12 w-12'
    };
    
    return (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]} ${className}`}>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

// Badge component
export const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800'
    };
    
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Card component
export const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`} {...props}>
            {children}
        </div>
    );
};

// Modal component
export const Modal = ({ 
    open = false, 
    onClose, 
    title = '', 
    children, 
    size = 'md',
    className = '' 
}) => {
    if (!open) return null;
    
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />
                
                <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]} ${className}`}>
                    {title && (
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {title}
                            </h3>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};
