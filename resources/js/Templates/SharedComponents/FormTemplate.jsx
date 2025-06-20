import React, { useState } from 'react';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Button,
    Divider
} from "@heroui/react";
import { 
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Typography, Box, Alert } from '@mui/material';
import GlassCard from '@/Components/GlassCard';

/**
 * FormTemplate - A reusable template for consistent form layouts
 * 
 * @param {Object} props
 * @param {string} props.title - Form title
 * @param {string} props.description - Form description
 * @param {React.ReactNode} props.icon - Form icon
 * @param {React.ReactNode} props.children - Form fields
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {Array} props.actions - Form actions configuration
 * @param {Function} props.onSubmit - Form submit handler
 * @param {Function} props.onCancel - Form cancel handler
 * @param {boolean} props.isDirty - Whether form has unsaved changes
 * @param {Object} props.validation - Validation errors
 * @param {boolean} props.showDividers - Show dividers between sections
 * @param {Array} props.sections - Form sections configuration
 */
export const FormTemplate = ({
    title,
    description,
    icon: Icon,
    children,
    loading = false,
    error = null,
    success = null,
    actions = [],
    onSubmit,
    onCancel,
    isDirty = false,
    validation = {},
    showDividers = false,
    sections = [],
    className = '',
    ...props
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit && !loading && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await onSubmit(e);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const hasValidationErrors = Object.keys(validation).length > 0;

    const renderFormActions = () => {
        if (actions.length === 0 && !onSubmit && !onCancel) return null;

        const defaultActions = [];
        if (onCancel) {
            defaultActions.push({
                label: 'Cancel',
                variant: 'bordered',
                color: 'default',
                onPress: onCancel
            });
        }
        if (onSubmit) {
            defaultActions.push({
                label: 'Save',
                variant: 'solid',
                color: 'primary',
                type: 'submit',
                disabled: loading || isSubmitting || hasValidationErrors
            });
        }

        const allActions = actions.length > 0 ? actions : defaultActions;

        return (
            <div className="flex justify-end gap-3 pt-6">
                {allActions.map((action, index) => (
                    <Button
                        key={index}
                        type={action.type}
                        variant={action.variant || 'solid'}
                        color={action.color || 'primary'}
                        size={action.size || 'md'}
                        disabled={action.disabled || loading || isSubmitting}
                        isLoading={action.loading || (action.type === 'submit' && (loading || isSubmitting))}
                        startContent={action.icon && <action.icon className="w-4 h-4" />}
                        onPress={action.onPress}
                        className={action.className}
                    >
                        {action.label}
                    </Button>
                ))}
            </div>
        );
    };

    const renderAlert = (message, type) => {
        if (!message) return null;

        const alertProps = {
            severity: type,
            sx: { mb: 3 }
        };

        return (
            <Alert {...alertProps}>
                {message}
            </Alert>
        );
    };

    const renderFormSections = () => {
        if (sections.length === 0) {
            return children;
        }

        return sections.map((section, index) => (
            <div key={index}>
                {section.title && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" className="text-gray-900">
                            {section.title}
                        </Typography>
                        {section.description && (
                            <Typography variant="body2" className="text-gray-600 mt-1">
                                {section.description}
                            </Typography>
                        )}
                    </Box>
                )}
                <div className="space-y-4">
                    {section.content}
                </div>
                {showDividers && index < sections.length - 1 && (
                    <Divider className="my-6" />
                )}
            </div>
        ));
    };

    return (
        <GlassCard className={`max-w-4xl mx-auto ${className}`}>
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    {Icon && (
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-primary-500/20">
                                <Icon className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    )}
                    <div className="flex-1">
                        <Typography variant="h5" className="text-gray-900 font-semibold">
                            {title}
                        </Typography>
                        {description && (
                            <Typography variant="body2" className="text-gray-600 mt-1">
                                {description}
                            </Typography>
                        )}
                        {isDirty && (
                            <Typography variant="caption" className="text-warning-600 mt-2 flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                You have unsaved changes
                            </Typography>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} {...props}>
                    {renderAlert(error, 'error')}
                    {renderAlert(success, 'success')}
                    
                    {hasValidationErrors && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            Please correct the following errors:
                            <ul className="mt-2 ml-4 list-disc">
                                {Object.entries(validation).map(([field, errors]) => (
                                    <li key={field} className="text-sm">
                                        {Array.isArray(errors) ? errors[0] : errors}
                                    </li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    <div className="space-y-6">
                        {renderFormSections()}
                    </div>

                    {renderFormActions()}
                </form>
            </CardBody>
        </GlassCard>
    );
};

/**
 * FormSection - A reusable component for form sections
 */
export const FormSection = ({
    title,
    description,
    children,
    collapsible = false,
    collapsed = false,
    onToggle,
    className = ''
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    const handleToggle = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (onToggle) onToggle(newState);
    };

    return (
        <div className={`form-section ${className}`}>
            {title && (
                <div className={`flex items-center justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`} 
                     onClick={collapsible ? handleToggle : undefined}>
                    <div>
                        <Typography variant="h6" className="text-gray-900">
                            {title}
                        </Typography>
                        {description && (
                            <Typography variant="body2" className="text-gray-600 mt-1">
                                {description}
                            </Typography>
                        )}
                    </div>
                    {collapsible && (
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={handleToggle}
                        >
                            {isCollapsed ? '+' : '-'}
                        </Button>
                    )}
                </div>
            )}
            {(!collapsible || !isCollapsed) && (
                <div className="space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
};

/**
 * FormFieldGroup - Groups related form fields
 */
export const FormFieldGroup = ({
    title,
    children,
    columns = 1,
    className = ''
}) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`form-field-group ${className}`}>
            {title && (
                <Typography variant="subtitle1" className="text-gray-800 mb-3 font-medium">
                    {title}
                </Typography>
            )}
            <div className={`grid gap-4 ${gridCols[columns] || gridCols[1]}`}>
                {children}
            </div>
        </div>
    );
};

export default FormTemplate;
