import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    CheckIcon,
    XMarkIcon,
    StarIcon,
    RocketLaunchIcon,
    BuildingOfficeIcon,
    UsersIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Typography, Box } from '@mui/material';
import { Button, Card, CardBody, Switch } from '@heroui/react';
import AuthLayout from '@/Components/AuthLayout';

export default function Pricing({ plans = [] }) {
    const [billingCycle, setBillingCycle] = useState('monthly');
    
    // Group plans by billing cycle
    const monthlyPlans = plans.filter(plan => plan.billing_cycle === 'monthly');
    const yearlyPlans = plans.filter(plan => plan.billing_cycle === 'yearly');
    
    const currentPlans = billingCycle === 'monthly' ? monthlyPlans : yearlyPlans;

    // Plan features mapping
    const planFeatures = {
        'Starter': {
            icon: RocketLaunchIcon,
            color: 'from-blue-500 to-cyan-500',
            badge: null,
            description: 'Perfect for small teams getting started',
            features: [
                { name: 'Up to 10 employees', included: true },
                { name: '1GB storage', included: true },
                { name: 'Basic HR reports', included: true },
                { name: 'Email support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'Custom branding', included: false },
                { name: 'API access', included: false },
                { name: 'Advanced reports', included: false },
                { name: 'Priority support', included: false }
            ]
        },
        'Professional': {
            icon: BuildingOfficeIcon,
            color: 'from-purple-500 to-pink-500',
            badge: 'Most Popular',
            description: 'Ideal for growing businesses',
            features: [
                { name: 'Up to 100 employees', included: true },
                { name: '10GB storage', included: true },
                { name: 'Basic HR reports', included: true },
                { name: 'Email support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'Custom branding', included: true },
                { name: 'API access', included: true },
                { name: 'Advanced reports', included: true },
                { name: 'Priority support', included: false }
            ]
        },
        'Enterprise': {
            icon: ShieldCheckIcon,
            color: 'from-emerald-500 to-teal-500',
            badge: 'Best Value',
            description: 'For large organizations with advanced needs',
            features: [
                { name: 'Unlimited employees', included: true },
                { name: '100GB storage', included: true },
                { name: 'Basic HR reports', included: true },
                { name: 'Email support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'Custom branding', included: true },
                { name: 'API access', included: true },
                { name: 'Advanced reports', included: true },
                { name: 'Priority support', included: true },
                { name: 'Dedicated account manager', included: true },
                { name: 'Custom integrations', included: true }
            ]
        }
    };

    const calculateYearlySavings = (planName) => {
        const monthlyPlan = monthlyPlans.find(p => p.name === planName);
        const yearlyPlan = yearlyPlans.find(p => p.name === planName);
        
        if (monthlyPlan && yearlyPlan) {
            const monthlyTotal = monthlyPlan.price * 12;
            const savings = monthlyTotal - yearlyPlan.price;
            const savingsPercentage = Math.round((savings / monthlyTotal) * 100);
            return { savings, savingsPercentage };
        }
        return { savings: 0, savingsPercentage: 0 };
    };

    return (
        <AuthLayout
            title="Choose Your Plan"
        >
            <Head title="Pricing Plans - Aero-HR SaaS Platform" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Choose the perfect plan for your business. Start your free trial today and upgrade as you grow.
                    </p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center space-x-4 mb-8"
                    >
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <Switch
                            checked={billingCycle === 'yearly'}
                            onChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                            color="primary"
                        />
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            Yearly
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Save up to 20%
                            </span>
                        )}
                    </motion.div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {currentPlans.map((plan, index) => {
                        const planConfig = planFeatures[plan.name];
                        const IconComponent = planConfig?.icon || RocketLaunchIcon;
                        const yearlyData = calculateYearlySavings(plan.name);

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="relative"
                            >
                                {/* Popular Badge */}
                                {planConfig?.badge && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                                            {planConfig.badge}
                                        </span>
                                    </div>
                                )}

                                <Card
                                    className={`h-full ${
                                        planConfig?.badge 
                                            ? 'ring-2 ring-purple-500 shadow-xl scale-105' 
                                            : 'hover:shadow-lg'
                                    } transition-all duration-300`}
                                >
                                    <CardBody className="p-8">
                                        {/* Plan Header */}
                                        <div className="text-center mb-8">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${planConfig?.color || 'from-gray-400 to-gray-600'} mb-4`}>
                                                <IconComponent className="w-8 h-8 text-white" />
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                {plan.name}
                                            </h3>
                                            
                                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                {planConfig?.description}
                                            </p>

                                            {/* Pricing */}
                                            <div className="mb-6">
                                                <div className="flex items-baseline justify-center">
                                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                        ${plan.price}
                                                    </span>
                                                    <span className="text-gray-500 ml-1">
                                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                                    </span>
                                                </div>
                                                
                                                {billingCycle === 'yearly' && yearlyData.savingsPercentage > 0 && (
                                                    <p className="text-green-600 text-sm mt-1">
                                                        Save ${yearlyData.savings} ({yearlyData.savingsPercentage}%) annually
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                as={Link}
                                                href={route('register')}
                                                color={planConfig?.badge ? 'primary' : 'default'}
                                                variant={planConfig?.badge ? 'solid' : 'bordered'}
                                                size="lg"
                                                className="w-full mb-6"
                                            >
                                                Start Free Trial
                                            </Button>
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                What's included:
                                            </h4>
                                            <ul className="space-y-3">
                                                {planConfig?.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center">
                                                        {feature.included ? (
                                                            <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                                        ) : (
                                                            <XMarkIcon className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                                                        )}
                                                        <span className={`text-sm ${
                                                            feature.included 
                                                                ? 'text-gray-700 dark:text-gray-200' 
                                                                : 'text-gray-400 line-through'
                                                        }`}>
                                                            {feature.name}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Frequently Asked Questions
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Do you offer a free trial?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Yes! All plans include a 14-day free trial. No credit card required to start.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Can I change plans anytime?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                We accept all major credit cards, PayPal, and bank transfers for annual plans.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Is my data secure?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Yes! We use enterprise-grade security with SSL encryption and regular backups.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12"
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to transform your HR processes?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Join thousands of companies already using Aero-HR to streamline their operations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            as={Link}
                            href={route('register')}
                            color="primary"
                            size="lg"
                            endContent={<RocketLaunchIcon className="w-5 h-5" />}
                        >
                            Start Your Free Trial
                        </Button>
                        <Button
                            as={Link}
                            href="/contact"
                            variant="bordered"
                            size="lg"
                        >
                            Contact Sales
                        </Button>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="mt-16 text-center"
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ opacity: 0.6 }}
                    >
                        All plans include 24/7 support and a 30-day money-back guarantee
                    </Typography>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
