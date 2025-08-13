import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter,
    Button,
    Select,
    SelectItem,
    Textarea,
    Switch,
    Divider
} from '@heroui/react';
import { 
    CalendarDaysIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import BulkCalendar from './BulkCalendar';
import BulkValidationPreview from './BulkValidationPreview';

const BulkLeaveModal = ({ 
    open, 
    onClose, 
    onSuccess,
    allUsers = [],
    leavesData = { leaveTypes: [] },
    isAdmin = false 
}) => {
    const { auth } = usePage().props;
    
    // Form state
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(auth?.user?.id?.toString() || '');
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [allowPartialSuccess, setAllowPartialSuccess] = useState(false);
    
    // Validation state
    const [validationResults, setValidationResults] = useState([]);
    const [balanceImpact, setBalanceImpact] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [hasValidated, setHasValidated] = useState(false);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Available leave types
    const leaveTypes = useMemo(() => {
        return leavesData?.leaveTypes || [];
    }, [leavesData]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedDates([]);
            setSelectedUserId(auth?.user?.id?.toString() || '');
            setSelectedLeaveType('');
            setReason('');
            setAllowPartialSuccess(false);
            setValidationResults([]);
            setBalanceImpact(null);
            setHasValidated(false);
        }
    }, [open, auth?.user?.id]);

    // Validate dates
    const handleValidate = useCallback(async () => {
        if (selectedDates.length === 0) {
            toast.error('Please select at least one date');
            return;
        }
        
        if (!selectedLeaveType) {
            toast.error('Please select a leave type');
            return;
        }
        
        if (!reason.trim()) {
            toast.error('Please provide a reason for leave');
            return;
        }

        setIsValidating(true);
        
        try {
            const response = await axios.post(route('leaves.bulk.validate'), {
                user_id: parseInt(selectedUserId),
                dates: selectedDates,
                leave_type_id: parseInt(selectedLeaveType),
                reason: reason.trim()
            });

            if (response.data.success) {
                setValidationResults(response.data.validation_results);
                setBalanceImpact(response.data.estimated_balance_impact);
                setHasValidated(true);
                
                const conflictCount = response.data.validation_results.filter(r => r.status === 'conflict').length;
                const warningCount = response.data.validation_results.filter(r => r.status === 'warning').length;
                
                if (conflictCount > 0) {
                    toast.warning(`${conflictCount} date(s) have conflicts. Please review before submitting.`);
                } else if (warningCount > 0) {
                    toast.info(`${warningCount} date(s) have warnings. You may proceed if acceptable.`);
                } else {
                    toast.success('All dates validated successfully!');
                }
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error(error.response?.data?.message || 'Failed to validate dates');
        } finally {
            setIsValidating(false);
        }
    }, [selectedDates, selectedLeaveType, reason, selectedUserId]);

    // Submit bulk leave request
    const handleSubmit = useCallback(async () => {
        if (!hasValidated) {
            toast.error('Please validate dates before submitting');
            return;
        }

        const conflictCount = validationResults.filter(r => r.status === 'conflict').length;
        if (conflictCount > 0 && !allowPartialSuccess) {
            toast.error('Please resolve conflicts or enable partial success mode');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(route('leaves.bulk.store'), {
                user_id: parseInt(selectedUserId),
                dates: selectedDates,
                leave_type_id: parseInt(selectedLeaveType),
                reason: reason.trim(),
                allow_partial_success: allowPartialSuccess
            });

            if (response.data.success) {
                const { summary, message } = response.data;
                
                if (summary.failed > 0 && summary.successful > 0) {
                    toast.warning(`${message}. ${summary.successful} succeeded, ${summary.failed} failed.`);
                } else if (summary.successful > 0) {
                    toast.success(message);
                } else {
                    toast.error(message);
                }

                onSuccess?.(response.data);
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to create bulk leave request');
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit bulk leave request');
        } finally {
            setIsSubmitting(false);
        }
    }, [hasValidated, validationResults, allowPartialSuccess, selectedUserId, selectedDates, selectedLeaveType, reason, onSuccess, onClose]);

    // Check if form is valid for validation
    const canValidate = selectedDates.length > 0 && selectedLeaveType && reason.trim().length >= 5;
    
    // Check if can submit
    const canSubmit = hasValidated && 
                     (validationResults.filter(r => r.status === 'conflict').length === 0 || allowPartialSuccess);

    return (
        <Modal 
            isOpen={open} 
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            classNames={{
                base: "max-h-[90vh]",
                body: "py-6",
                header: "border-b border-divider",
                footer: "border-t border-divider"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-semibold">Add Bulk Leave</h2>
                    </div>
                    <p className="text-sm text-default-600 font-normal">
                        Select multiple dates and create leave requests in batch
                    </p>
                </ModalHeader>
                
                <ModalBody>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Calendar */}
                        <div>
                            <BulkCalendar
                                selectedDates={selectedDates}
                                onDatesChange={setSelectedDates}
                                existingLeaves={[]} // TODO: Pass existing leaves from props
                                publicHolidays={[]} // TODO: Pass public holidays from props
                            />
                        </div>
                        
                        {/* Right Column: Form and Validation */}
                        <div className="space-y-6">
                            {/* Form Controls */}
                            <div className="space-y-4">
                                {/* User Selection (Admin only) */}
                                {isAdmin && allUsers.length > 0 && (
                                    <Select
                                        label="Select Employee"
                                        placeholder="Choose employee"
                                        selectedKeys={selectedUserId ? [selectedUserId] : []}
                                        onSelectionChange={(keys) => {
                                            const userId = Array.from(keys)[0];
                                            setSelectedUserId(userId);
                                            setHasValidated(false); // Reset validation
                                        }}
                                        isRequired
                                    >
                                        {allUsers.map(user => (
                                            <SelectItem key={user.id.toString()} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                                {/* Leave Type Selection */}
                                <Select
                                    label="Leave Type"
                                    placeholder="Select leave type"
                                    selectedKeys={selectedLeaveType ? [selectedLeaveType] : []}
                                    onSelectionChange={(keys) => {
                                        const leaveTypeId = Array.from(keys)[0];
                                        setSelectedLeaveType(leaveTypeId);
                                        setHasValidated(false); // Reset validation
                                    }}
                                    isRequired
                                >
                                    {leaveTypes.map(leaveType => (
                                        <SelectItem key={leaveType.id.toString()} value={leaveType.id.toString()}>
                                            {leaveType.type} ({leaveType.days} days available)
                                        </SelectItem>
                                    ))}
                                </Select>

                                {/* Reason */}
                                <Textarea
                                    label="Reason for Leave"
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    value={reason}
                                    onValueChange={(value) => {
                                        setReason(value);
                                        setHasValidated(false); // Reset validation
                                    }}
                                    minRows={3}
                                    maxRows={5}
                                    isRequired
                                    description={`${reason.length}/500 characters`}
                                    errorMessage={reason.length < 5 && reason.length > 0 ? "Reason must be at least 5 characters" : ""}
                                />

                                {/* Options */}
                                <div className="space-y-2">
                                    <Switch
                                        isSelected={allowPartialSuccess}
                                        onValueChange={setAllowPartialSuccess}
                                        size="sm"
                                    >
                                        Allow partial success
                                    </Switch>
                                    <p className="text-xs text-default-500">
                                        When enabled, valid dates will be processed even if some dates fail validation
                                    </p>
                                </div>
                            </div>

                            <Divider />

                            {/* Validation and Preview */}
                            <BulkValidationPreview
                                validationResults={validationResults}
                                balanceImpact={balanceImpact}
                                isValidating={isValidating}
                            />
                        </div>
                    </div>
                </ModalBody>
                
                <ModalFooter>
                    <Button 
                        variant="light" 
                        onPress={onClose}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={handleValidate}
                        isLoading={isValidating}
                        isDisabled={!canValidate || isSubmitting}
                        startContent={!isValidating && <ExclamationTriangleIcon className="w-4 h-4" />}
                    >
                        {isValidating ? 'Validating...' : 'Validate Dates'}
                    </Button>
                    
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        isDisabled={!canSubmit || isValidating}
                        startContent={!isSubmitting && <CheckCircleIcon className="w-4 h-4" />}
                    >
                        {isSubmitting ? 'Creating...' : `Create ${selectedDates.length} Leave Request${selectedDates.length !== 1 ? 's' : ''}`}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BulkLeaveModal;
