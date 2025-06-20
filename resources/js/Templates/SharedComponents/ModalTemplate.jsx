import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Divider
} from "@heroui/react";
import { Typography, Alert, Box } from '@mui/material';
import {
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";

/**
 * ModalTemplate - A reusable template for consistent modal layouts
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Modal subtitle
 * @param {React.ReactNode} props.icon - Modal icon
 * @param {React.ReactNode} props.children - Modal content
 * @param {Array} props.actions - Modal actions configuration
 * @param {string} props.size - Modal size ('xs', 'sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.isDismissable - Whether modal can be dismissed
 * @param {boolean} props.hideCloseButton - Hide close button
 * @param {string} props.placement - Modal placement
 * @param {boolean} props.scrollBehavior - Scroll behavior ('inside' | 'outside')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.warning - Warning message
 * @param {string} props.success - Success message
 * @param {string} props.info - Info message
 */
export const ModalTemplate = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon: Icon,
    children,
    actions = [],
    size = 'md',
    isDismissable = true,
    hideCloseButton = false,
    placement = 'center',
    scrollBehavior = 'inside',
    className = '',
    loading = false,
    error = null,
    warning = null,
    success = null,
    info = null,
    ...props
}) => {
    const renderAlert = (message, type) => {
        if (!message) return null;

        const iconMap = {
            error: ExclamationCircleIcon,
            warning: ExclamationTriangleIcon,
            success: CheckCircleIcon,
            info: InformationCircleIcon
        };

        const AlertIcon = iconMap[type];

        return (
            <Alert 
                severity={type} 
                sx={{ mb: 2 }}
                icon={AlertIcon && <AlertIcon className="w-5 h-5" />}
            >
                {message}
            </Alert>
        );
    };

    const renderActions = () => {
        if (actions.length === 0) return null;

        return (
            <ModalFooter>
                <div className="flex gap-2 justify-end w-full">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || 'solid'}
                            color={action.color || 'primary'}
                            size={action.size || 'md'}
                            disabled={action.disabled || loading}
                            isLoading={action.loading || (action.loadingOnSubmit && loading)}
                            startContent={action.icon && <action.icon className="w-4 h-4" />}
                            onPress={action.onPress}
                            className={action.className}
                            auto={action.auto}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </ModalFooter>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={size}
            isDismissable={isDismissable}
            hideCloseButton={hideCloseButton}
            placement={placement}
            scrollBehavior={scrollBehavior}
            className={className}
            {...props}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                        {Icon && (
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-primary-500/20">
                                    <Icon className="w-5 h-5 text-primary-600" />
                                </div>
                            </div>
                        )}
                        <div className="flex-1">
                            <Typography variant="h6" className="text-gray-900 font-semibold">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" className="text-gray-600 mt-1">
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody>
                    {renderAlert(error, 'error')}
                    {renderAlert(warning, 'warning')}
                    {renderAlert(success, 'success')}
                    {renderAlert(info, 'info')}
                    
                    {children}
                </ModalBody>

                {renderActions()}
            </ModalContent>
        </Modal>
    );
};

/**
 * ConfirmationModal - A specialized modal for confirmations
 */
export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'danger',
    loading = false,
    ...props
}) => {
    const actions = [
        {
            label: cancelText,
            variant: 'bordered',
            color: 'default',
            onPress: onClose,
            disabled: loading
        },
        {
            label: confirmText,
            variant: 'solid',
            color: confirmColor,
            onPress: onConfirm,
            loading: loading,
            loadingOnSubmit: true
        }
    ];

    return (
        <ModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            actions={actions}
            loading={loading}
            icon={ExclamationTriangleIcon}
            {...props}
        >
            <Typography variant="body1" className="text-gray-700">
                {message}
            </Typography>
        </ModalTemplate>
    );
};

/**
 * InfoModal - A specialized modal for displaying information
 */
export const InfoModal = ({
    isOpen,
    onClose,
    title = 'Information',
    message,
    okText = 'OK',
    ...props
}) => {
    const actions = [
        {
            label: okText,
            variant: 'solid',
            color: 'primary',
            onPress: onClose
        }
    ];

    return (
        <ModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            actions={actions}
            icon={InformationCircleIcon}
            {...props}
        >
            <Typography variant="body1" className="text-gray-700">
                {message}
            </Typography>
        </ModalTemplate>
    );
};

/**
 * FormModal - A specialized modal for forms
 */
export const FormModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    subtitle,
    children,
    submitText = 'Save',
    cancelText = 'Cancel',
    submitColor = 'primary',
    loading = false,
    disabled = false,
    ...props
}) => {
    const actions = [
        {
            label: cancelText,
            variant: 'bordered',
            color: 'default',
            onPress: onClose,
            disabled: loading
        },
        {
            label: submitText,
            variant: 'solid',
            color: submitColor,
            onPress: onSubmit,
            disabled: disabled || loading,
            loading: loading,
            loadingOnSubmit: true
        }
    ];

    return (
        <ModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            size="lg"
            actions={actions}
            loading={loading}
            {...props}
        >
            {children}
        </ModalTemplate>
    );
};

export default ModalTemplate;
