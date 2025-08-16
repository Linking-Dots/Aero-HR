import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { 
    CreditCardIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody, Button, Input, Chip, Progress } from '@heroui/react';
import { Link } from '@inertiajs/react';
import AuthLayout from "@/Components/AuthLayout.jsx";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ 
    plan, 
    billingCycle, 
    tenant, 
    clientSecret, 
    onSuccess, 
    onError 
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(null);

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setErrorMessage('');

        const cardNumber = elements.getElement(CardNumberElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardNumber,
                        billing_details: {
                            name: tenant?.name || 'Organization',
                            email: tenant?.email,
                        },
                    },
                }
            );

            if (error) {
                setErrorMessage(error.message);
                onError?.(error);
            } else {
                onSuccess?.(paymentIntent);
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred. Please try again.');
            onError?.(err);
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        const basePrice = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
        const tax = Math.round(basePrice * 0.08); // 8% tax example
        return basePrice + tax;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gray-50 dark:bg-gray-800/50">
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Order Summary
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                                {plan.name} Plan ({billingCycle})
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ${(billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price).toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Tax</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ${Math.round((billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price) * 0.08).toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ${(calculateTotal() / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {billingCycle === 'yearly' && plan.yearly_price < plan.monthly_price * 12 && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300">
                                🎉 You're saving ${((plan.monthly_price * 12 - plan.yearly_price) / 100).toFixed(2)} per year!
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Payment Details */}
            <Card>
                <CardBody className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Payment Details
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Card Number
                            </label>
                            <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                <CardNumberElement options={cardElementOptions} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Expiry Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Expiry Date
                                </label>
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <CardExpiryElement options={cardElementOptions} />
                                </div>
                            </div>

                            {/* CVC */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    CVC
                                </label>
                                <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <CardCvcElement options={cardElementOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                        </div>
                    )}

                    {/* Security Notice */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <LockClosedIcon className="w-5 h-5 text-blue-500" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Your payment information is secure and encrypted. We never store your card details.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Submit Button */}
            <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={processing}
                isDisabled={!stripe || processing}
                startContent={!processing && <CreditCardIcon className="w-5 h-5" />}
            >
                {processing ? 'Processing Payment...' : `Pay $${(calculateTotal() / 100).toFixed(2)}`}
            </Button>
        </form>
    );
};

export default function StripePayment({ 
    auth, 
    plan, 
    billingCycle = 'monthly', 
    tenant, 
    clientSecret,
    returnUrl 
}) {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

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

    const handlePaymentSuccess = (paymentIntent) => {
        setPaymentSuccess(true);
        
        // Redirect to success page after a brief delay
        setTimeout(() => {
            router.visit(returnUrl || route('dashboard.subscription'));
        }, 2000);
    };

    const handlePaymentError = (error) => {
        setPaymentError(error);
    };

    if (paymentSuccess) {
        return (
            <AuthLayout>
                <Head title="Payment Successful" />
                
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="min-h-screen flex items-center justify-center"
                >
                    <motion.div variants={itemVariants} className="max-w-md w-full">
                        <Card className="text-center">
                            <CardBody className="p-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </motion.div>
                                
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Payment Successful!
                                </h1>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Your subscription to the {plan.name} plan has been activated. 
                                    You'll be redirected to your dashboard shortly.
                                </p>
                                
                                <Progress 
                                    value={100} 
                                    color="success" 
                                    className="mb-4"
                                    isIndeterminate
                                />
                                
                                <Link
                                    href={route('dashboard.index')}
                                    className="text-blue-600 hover:text-blue-500 text-sm"
                                >
                                    Go to Dashboard
                                </Link>
                            </CardBody>
                        </Card>
                    </motion.div>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <Head title={`Subscribe to ${plan.name}`} />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="min-h-screen py-12"
            >
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <Link
                            href={route('pricing')}
                            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Pricing
                        </Link>
                        
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Subscribe to {plan.name}
                        </h1>
                        
                        <p className="text-gray-600 dark:text-gray-300">
                            Complete your subscription and start using Aero-HR today
                        </p>
                    </motion.div>

                    {/* Plan Details */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {plan.name} Plan
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {plan.description}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Chip color="primary" size="sm">
                                                {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Billing
                                            </Chip>
                                            {plan.trial_days > 0 && (
                                                <Chip color="success" size="sm">
                                                    {plan.trial_days} Day Free Trial
                                                </Chip>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            ${(billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price) / 100}
                                        </p>
                                        <p className="text-gray-500">per {billingCycle === 'yearly' ? 'year' : 'month'}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Payment Form */}
                    <motion.div variants={itemVariants}>
                        <Elements stripe={stripePromise}>
                            <PaymentForm
                                plan={plan}
                                billingCycle={billingCycle}
                                tenant={tenant}
                                clientSecret={clientSecret}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div variants={itemVariants} className="mt-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-4">
                                Trusted by thousands of organizations worldwide
                            </p>
                            <div className="flex justify-center items-center space-x-6 opacity-60">
                                <img 
                                    src="/assets/stripe-logo.svg" 
                                    alt="Stripe" 
                                    className="h-6"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span className="text-gray-400">256-bit SSL Encryption</span>
                                <span className="text-gray-400">PCI Compliant</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AuthLayout>
    );
}
