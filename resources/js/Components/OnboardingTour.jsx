import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    UserGroupIcon,
    CogIcon,
    ChartBarIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

const OnboardingTour = ({ show, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Your HR Platform! 🎉",
            description: "Let's take a quick tour to get you started with the essential features.",
            icon: <UserGroupIcon className="w-8 h-8" />,
            action: "Let's start",
        },
        {
            title: "Company Profile Setup",
            description: "First, complete your company profile with basic information, policies, and branding.",
            icon: <CogIcon className="w-8 h-8" />,
            action: "Go to Settings",
            route: "settings.company",
        },
        {
            title: "Add Your First Employees",
            description: "Start building your team by adding employee profiles and setting up their roles.",
            icon: <UserGroupIcon className="w-8 h-8" />,
            action: "Add Employees",
            route: "users.create",
        },
        {
            title: "Configure Policies",
            description: "Set up leave policies, attendance rules, and other HR policies for your organization.",
            icon: <DocumentTextIcon className="w-8 h-8" />,
            action: "Configure Policies",
            route: "settings.leave",
        },
        {
            title: "Explore Analytics",
            description: "Monitor your HR metrics with comprehensive reports and analytics dashboards.",
            icon: <ChartBarIcon className="w-8 h-8" />,
            action: "View Reports",
            route: "reports.index",
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleActionClick = () => {
        const step = steps[currentStep];
        if (step.route) {
            window.location.href = route(step.route);
        } else {
            handleNext();
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                >
                    {/* Close button */}
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                            <button
                                onClick={onSkip}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Skip tour
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center"
                        >
                            {/* Icon */}
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-4">
                                <div className="text-blue-600 dark:text-blue-400">
                                    {steps[currentStep].icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {steps[currentStep].title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {steps[currentStep].description}
                            </p>

                            {/* Action buttons */}
                            <div className="flex space-x-3">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                        Previous
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleActionClick}
                                    className={`${currentStep === 0 ? 'w-full' : 'flex-1'} px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center font-medium`}
                                >
                                    {steps[currentStep].action}
                                    {currentStep < steps.length - 1 ? (
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    ) : (
                                        <CheckIcon className="w-4 h-4 ml-2" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
