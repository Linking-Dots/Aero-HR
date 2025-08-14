import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    CreditCardIcon,
    CheckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CalendarDaysIcon,
    BanknotesIcon,
    DocumentTextIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody, Button, Switch, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Typography } from '@mui/material';
import App from "@/Layouts/App.jsx";

export default function Subscription({ 
    auth, 
    tenant, 
    subscription, 
    availablePlans, 
    paymentMethods, 
    invoices,
    usage,
    upcomingInvoice
}) {
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState(subscription?.plan?.billing_cycle || 'monthly');
    const [processing, setProcessing] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'trialing': return 'primary';
            case 'past_due': return 'warning';
            case 'canceled': return 'danger';
            case 'incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'trialing': return 'Trial';
            case 'past_due': return 'Past Due';
            case 'canceled': return 'Canceled';
            case 'incomplete': return 'Incomplete';
            default: return status;
        }
    };

    const handlePlanChange = (planId) => {
        setSelectedPlanId(planId);
        setIsChangingPlan(true);
    };

    const confirmPlanChange = () => {
        setProcessing(true);
        router.post(route('subscription.change-plan'), {
            plan_id: selectedPlanId,
            billing_cycle: billingCycle
        }, {
            onFinish: () => {
                setProcessing(false);
                setIsChangingPlan(false);
                setSelectedPlanId(null);
            }
        });
    };

    const handleCancelSubscription = () => {
        setProcessing(true);
        router.post(route('subscription.cancel'), {}, {
            onFinish: () => {
                setProcessing(false);
                setIsCancelModalOpen(false);
            }
        });
    };

    const handleResumeSubscription = () => {
        setProcessing(true);
        router.post(route('subscription.resume'), {}, {
            onFinish: () => setProcessing(false)
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount / 100);
    };

    return (
        <App>
            <Head title="Subscription Management" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Subscription Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Manage your plan, billing, and payment methods
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Current Subscription */}
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {subscription?.plan?.name || 'No Active Plan'}
                                        </h2>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <Chip color={getStatusColor(subscription?.status)} size="sm">
                                                {getStatusText(subscription?.status)}
                                            </Chip>
                                            {subscription?.trial_ends_at && (
                                                <span className="text-sm text-gray-500">
                                                    Trial ends {formatDate(subscription.trial_ends_at)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {subscription?.plan && (
                                        <>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(subscription.plan.price)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                per {subscription.plan.billing_cycle}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {subscription?.current_period_end && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Current Period</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                Ends {formatDate(subscription.current_period_end)}
                                            </p>
                                        </div>
                                        {subscription.status === 'active' && (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Auto Renewal</p>
                                                <p className="font-semibold text-green-600">Enabled</p>
                                            </div>
                                        )}
                                        <div className="md:text-right">
                                            {subscription.status === 'canceled' ? (
                                                <Button 
                                                    color="primary" 
                                                    onPress={handleResumeSubscription}
                                                    isLoading={processing}
                                                    startContent={<ArrowPathIcon className="w-4 h-4" />}
                                                >
                                                    Resume Subscription
                                                </Button>
                                            ) : (
                                                <Button 
                                                    color="danger" 
                                                    variant="bordered"
                                                    onPress={() => setIsCancelModalOpen(true)}
                                                >
                                                    Cancel Subscription
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Available Plans */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Available Plans
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Monthly</span>
                            <Switch 
                                isSelected={billingCycle === 'yearly'}
                                onValueChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                            />
                            <span className="text-sm text-gray-600">Yearly (Save 20%)</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availablePlans?.map((plan) => (
                            <Card 
                                key={plan.id} 
                                className={`relative hover:shadow-lg transition-shadow ${
                                    plan.id === subscription?.plan?.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            >
                                {plan.id === subscription?.plan?.id && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Chip color="primary" size="sm">Current Plan</Chip>
                                    </div>
                                )}
                                
                                <CardBody className="p-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price)}
                                        </div>
                                        <p className="text-gray-500 text-sm">per {billingCycle === 'yearly' ? 'year' : 'month'}</p>
                                        {billingCycle === 'yearly' && plan.yearly_price < plan.monthly_price * 12 && (
                                            <p className="text-green-600 text-xs mt-1">
                                                Save {formatCurrency((plan.monthly_price * 12) - plan.yearly_price)} per year!
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features?.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-3">
                                                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="w-full"
                                        color={plan.id === subscription?.plan?.id ? "default" : "primary"}
                                        variant={plan.id === subscription?.plan?.id ? "bordered" : "solid"}
                                        onPress={() => plan.id !== subscription?.plan?.id && handlePlanChange(plan.id)}
                                        isDisabled={plan.id === subscription?.plan?.id}
                                    >
                                        {plan.id === subscription?.plan?.id ? 'Current Plan' : 'Upgrade to ' + plan.name}
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Billing Information */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Payment Methods */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Payment Methods
                                </h3>
                                
                                {paymentMethods && paymentMethods.length > 0 ? (
                                    <div className="space-y-3">
                                        {paymentMethods.map((method, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <CreditCardIcon className="w-6 h-6 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            •••• •••• •••• {method.last4}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {method.brand} • Expires {method.exp_month}/{method.exp_year}
                                                        </p>
                                                    </div>
                                                </div>
                                                {method.is_default && (
                                                    <Chip color="primary" size="sm">Default</Chip>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No payment methods added</p>
                                    </div>
                                )}

                                <Button 
                                    className="w-full mt-4" 
                                    variant="bordered"
                                    startContent={<CreditCardIcon className="w-4 h-4" />}
                                >
                                    Add Payment Method
                                </Button>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Recent Invoices */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Recent Invoices
                                </h3>
                                
                                {invoices && invoices.length > 0 ? (
                                    <div className="space-y-3">
                                        {invoices.slice(0, 5).map((invoice, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(invoice.amount)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(invoice.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Chip 
                                                        color={invoice.status === 'paid' ? 'success' : 'warning'} 
                                                        size="sm"
                                                    >
                                                        {invoice.status}
                                                    </Chip>
                                                    <Button 
                                                        size="sm" 
                                                        variant="light"
                                                        className="ml-2"
                                                        startContent={<DocumentTextIcon className="w-4 h-4" />}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No invoices yet</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>

                {/* Usage Summary */}
                {usage && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Current Usage
                                </h3>
                                
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {usage.employees || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">Active Employees</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {Math.round((usage.storage_used || 0) / (1024 * 1024))} MB
                                        </p>
                                        <p className="text-sm text-gray-500">Storage Used</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {usage.api_calls || 0}
                                        </p>
                                        <p className="text-sm text-gray-500">API Calls This Month</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </motion.div>

            {/* Plan Change Modal */}
            <Modal isOpen={isChangingPlan} onClose={() => setIsChangingPlan(false)} size="lg">
                <ModalContent>
                    <ModalHeader>Confirm Plan Change</ModalHeader>
                    <ModalBody>
                        <p className="text-gray-600 dark:text-gray-300">
                            Are you sure you want to change your plan? Your billing will be prorated for the remaining time in your current billing cycle.
                        </p>
                        
                        {selectedPlanId && availablePlans && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h4 className="font-semibold mb-2">New Plan Details:</h4>
                                {(() => {
                                    const selectedPlan = availablePlans.find(p => p.id === selectedPlanId);
                                    return selectedPlan ? (
                                        <div>
                                            <p><strong>Plan:</strong> {selectedPlan.name}</p>
                                            <p><strong>Price:</strong> {formatCurrency(billingCycle === 'yearly' ? selectedPlan.yearly_price : selectedPlan.monthly_price)} per {billingCycle === 'yearly' ? 'year' : 'month'}</p>
                                            <p><strong>Billing Cycle:</strong> {billingCycle}</p>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setIsChangingPlan(false)}>
                            Cancel
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={confirmPlanChange}
                            isLoading={processing}
                        >
                            Confirm Change
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Cancel Subscription Modal */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
                <ModalContent>
                    <ModalHeader className="text-red-600">Cancel Subscription</ModalHeader>
                    <ModalBody>
                        <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium mb-2">
                                    Are you sure you want to cancel your subscription?
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    You'll continue to have access until the end of your current billing period ({subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'end of period'}). After that, your account will be downgraded to the free plan.
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setIsCancelModalOpen(false)}>
                            Keep Subscription
                        </Button>
                        <Button 
                            color="danger" 
                            onPress={handleCancelSubscription}
                            isLoading={processing}
                        >
                            Cancel Subscription
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </App>
    );
}
