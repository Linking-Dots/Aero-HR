import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserIcon,
    EnvelopeIcon, 
    LockClosedIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOfficeIcon,
    GlobeAltIcon,
    CreditCardIcon,
    CheckIcon,
    ArrowLeftIcon,
    StarIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

import { Input, Tabs, Tab } from '@heroui/react';
import axios from 'axios';
import AuthLayout from '@/Components/AuthLayout';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import GlassCard from '@/Components/GlassCard';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

export default function Register({ plans = [], features = {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        // Company Information
        company_name: '',
        domain: '',
        
        // Owner Information
        owner_name: '',
        owner_email: '',
        password: '',
        password_confirmation: '',
        
        // Plan Selection
        plan_id: '',
        billing_cycle: 'monthly',
        
        // Settings
        timezone: 'UTC',
        currency: 'USD',
        
        // Legal
        terms: false,
    });
    
    // Set max form width for consistent sizing across all steps
    const maxFormWidth = "max-w-6xl mx-auto"; // Increased from max-w-3xl to max-w-4xl for wider layout

    // Determine if we're on a tenant domain
    const isTenantDomain = () => {
        if (typeof window === 'undefined') return false;
        
        const host = window.location.hostname;
        const pathname = window.location.pathname;
        
        // Development: check for path-based routing
        if (host === '127.0.0.1' || host === 'localhost') {
            return pathname.startsWith('/tenant/');
        }
        
        // Production: check if it's not a central domain
        const centralDomains = ['aero-hr.com', 'aero-hr.local', 'aero.com'];
        return !centralDomains.includes(host);
    };

    const getCurrentTenantInfo = () => {
        if (!isTenantDomain()) return null;
        
        const host = window.location.hostname;
        const pathname = window.location.pathname;
        
        // Development: extract from path
        if (host === '127.0.0.1' || host === 'localhost') {
            const match = pathname.match(/\/tenant\/([^\/]+)/);
            return match ? { domain: match[1], name: match[1] } : null;
        }
        
        // Production: extract from subdomain
        const parts = host.split('.');
        if (parts.length >= 3) {
            return { domain: parts[0], name: parts[0] };
        }
        
        return null;
    };

    const tenantInfo = getCurrentTenantInfo();

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState(null);
    const [domainChecking, setDomainChecking] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [step, setStep] = useState(1);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'bank'
    const theme = useTheme();

    // Initialize with first plan if available
    useEffect(() => {
        if (plans.length > 0 && !data.plan_id) {
            const defaultPlan = plans.find(p => p.name === 'Starter') || plans[0];
            setData('plan_id', String(defaultPlan.id));
            setSelectedPlan(defaultPlan);
        }
    }, [plans]);

    // Keep selectedPlan in sync when billing cycle or plan changes
    useEffect(() => {
        if (!plans.length) return;
        const selected = plans.find(p => String(p.id) === String(data.plan_id));
        if (!selected) {
            const byCycle = plans.filter(p => p.billing_cycle === data.billing_cycle);
            if (byCycle[0]) {
                setData('plan_id', String(byCycle[0].id));
                setSelectedPlan(byCycle[0]);
            }
            return;
        }
        if (selected.billing_cycle !== data.billing_cycle) {
            const byCycle = plans.filter(p => p.billing_cycle === data.billing_cycle);
            if (byCycle[0]) {
                setData('plan_id', String(byCycle[0].id));
                setSelectedPlan(byCycle[0]);
            }
        } else {
            setSelectedPlan(selected);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.billing_cycle, data.plan_id, plans]);

    // Check domain availability
    const checkDomainAvailability = async (domain) => {
        if (!domain || domain.length < 3) {
            setDomainAvailable(null);
            setData(prevData => ({
                ...prevData,
                domainError: null
            }));
            return;
        }
        
        setDomainChecking(true);
        try {
            const response = await axios.post(route('check-domain'), { domain });
            setDomainAvailable(response.data.available);
            setData(prevData => ({
                ...prevData,
                domainError: null
            }));
        } catch (error) {
            console.error('Domain check failed:', error);
            
            if (error.response && error.response.status === 422) {
                // Handle validation errors from the API
                const errorData = error.response.data;
                setDomainAvailable(false);
                
                // Set the specific error message from the API
                const domainError = errorData.message || 
                                  (errorData.errors && errorData.errors.domain && errorData.errors.domain[0]) ||
                                  'Domain validation failed';
                                  
                setData(prevData => ({
                    ...prevData,
                    domainError: domainError
                }));
            } else {
                // Handle other types of errors (network, etc.)
                setDomainAvailable(null);
                setData(prevData => ({
                    ...prevData,
                    domainError: 'Unable to check domain availability. Please try again.'
                }));
            }
        } finally {
            setDomainChecking(false);
        }
    };

    // Debounced domain check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.domain) {
                checkDomainAvailability(data.domain);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [data.domain]);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setData('password', password);
        setPasswordStrength(calculatePasswordStrength(password));
    };

    const handlePlanSelect = (planId) => {
        const plan = plans.find(p => String(p.id) === String(planId));
        if (plan) {
            setSelectedPlan(plan);
            setData('plan_id', String(planId));
        }
    };

    const formatDomain = (value) => {
        return value.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 30);
    };

    const handleDomainChange = (e) => {
        const formatted = formatDomain(e.target.value);
        setData(prevData => ({
            ...prevData,
            domain: formatted,
            domainError: null // Clear any previous domain errors
        }));
        // Reset domain availability state when user types
        setDomainAvailable(null);
    };

    const handleCompanyNameChange = (e) => {
        const companyName = e.target.value;
        setData('company_name', companyName);
        
        if (companyName && !data.domain) {
            const domainSuggestion = formatDomain(companyName);
            setData('domain', domainSuggestion);
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return 'Very weak';
            case 2:
                return 'Weak';
            case 3:
                return 'Fair';
            case 4:
                return 'Good';
            case 5:
                return 'Strong';
            default:
                return '';
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return theme.palette.error.main;
            case 2:
                return '#f59e0b';
            case 3:
                return '#eab308';
            case 4:
                return theme.palette.primary.main;
            case 5:
                return theme.palette.success.main;
            default:
                return theme.palette.grey[300];
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        
        if (step === 1) {
            if (!data.company_name || !data.domain || domainAvailable === false) {
                return;
            }
            setStep(2);
            return;
        }
        
        if (step === 2) {
            if (!data.owner_name || !data.owner_email || !data.password || !data.password_confirmation) {
                return;
            }
            setStep(3);
            return;
        }
        
        if (step === 3) {
            if (!data.plan_id || !data.terms) {
                return;
            }
            // Check if it's a paid plan that requires payment
            const selectedPlan = plans.find(p => p.id === parseInt(data.plan_id));
            if (selectedPlan && selectedPlan.price > 0) {
                setStep(4); // Go to payment step
                return;
            } else {
                // Free plan, proceed directly to registration
                // Fall through to registration processing
            }
        }
        
        // Step 4 (Payment) or Free plan registration
        try {
            // Clear any previous domain errors
            if (data.domainError) {
                setData(prevData => ({
                    ...prevData,
                    domainError: undefined
                }));
            }
            
            // Final validations before submission
            if (data.password !== data.password_confirmation) {
                alert('Passwords do not match.');
                return;
            }
            
            if (passwordStrength < 3) {
                alert('Password must be stronger. Please include uppercase, lowercase, numbers, and special characters.');
                return;
            }
            
            // Get CSRF token before submitting the form
            if (window.initCsrfToken) {
                await window.initCsrfToken();
            } else {
                // Fallback method
                try {
                    await axios.get('/sanctum/csrf-cookie');
                    console.log('CSRF token cookie initialized');
                } catch (error) {
                    console.error('Failed to initialize CSRF token:', error);
                }
            }
            
            post(route('register.store'), {
                onFinish: () => reset('password', 'password_confirmation'),
                onSuccess: (page) => {
                    // Success will be handled by the backend redirect
                    console.log('Registration submitted successfully');
                },
                onError: (errors) => {
                    console.error('Registration errors:', errors);
                    
                    // Handle specific error cases
                    if (errors.domain) {
                        setDomainAvailable(false);
                    }
                    
                    // Show user-friendly error message if generic error
                    if (errors.error && !Object.keys(errors).some(key => key !== 'error')) {
                        alert(errors.error);
                    }
                }
            });
        } catch (error) {
            console.error('Registration failed:', error);
            // Show error to user
            alert('Registration failed. Please check your network connection and try again.');
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const canProceedStep1 = data.company_name && data.domain && domainAvailable === true;
    const canProceedStep2 = data.owner_name && data.owner_email && isValidEmail(data.owner_email) && 
                           data.password && data.password_confirmation && passwordStrength >= 3 &&
                           data.password === data.password_confirmation;
    const canProceedStep3 = canProceedStep2 && data.plan_id && data.terms;
    const canSubmit = step === 3 ? canProceedStep3 : (step === 4 ? canProceedStep3 : canProceedStep2);

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Company Information";
            case 2: return "Account Details";
            case 3: return "Choose Your Plan";
            case 4: return "Payment Details";
            default: return "Registration";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Let's start by setting up your company profile and subdomain";
            case 2: return "Create your admin account to manage your HR platform";
            case 3: return "Select the perfect plan for your organization's needs";
            case 4: return "Complete your payment to activate your HR platform";
            default: return "";
        }
    };

    return (
        <AuthLayout
            title="Create Your Platform"
            subtitle="Complete the steps below to set up your company's AIO platform"
        >
            <Head title="Register - Aero Enterprise Suite" />

            {/* Progress Indicator with improved alignment - more compact */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4"
            >
                <div className="flex justify-between">
                    {[1, 2, 3, 4].map((stepNumber) => (
                        <motion.div
                            key={stepNumber}
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: stepNumber * 0.1 }}
                        >
                            <div
                                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                    step >= stepNumber
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                {step > stepNumber ? (
                                    <CheckIcon className="w-3.5 h-3.5" />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            <span className="text-xs font-medium mt-1 text-center text-gray-600 dark:text-gray-400">
                                {stepNumber === 1 ? 'Company' : stepNumber === 2 ? 'Account' : stepNumber === 3 ? 'Plan' : 'Payment'}
                            </span>
                        </motion.div>
                    ))}
                </div>
                
                <div className="relative w-full h-0.5 mt-2">
                    <div className={`absolute left-0 right-0 h-0.5 top-0 bg-gray-100 dark:bg-gray-700 rounded-full`}></div>
                    <div 
                        className={`absolute left-0 h-0.5 top-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500`}
                        style={{ width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }}
                    ></div>
                </div>
            </motion.div>

            {/* Form with consistent width matching screenshots */}
            <form onSubmit={submit} className="mx-auto">
                {/* Step Title - more compact */}
                <motion.div
                    key={`title-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-3"
                >
                    <h2 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-gray-800 to-blue-700 dark:from-gray-200 dark:to-blue-300 bg-clip-text text-transparent">
                        {getStepTitle()}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {getStepDescription()}
                    </p>
                </motion.div>
                
                <AnimatePresence>
                    
                    {/* Step 1: Company Information */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5 w-full"
                        >
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="text"
                                        label="Company Name"
                                        placeholder="Enter your company name"
                                        value={data.company_name}
                                        onChange={handleCompanyNameChange}
                                        isInvalid={!!errors.company_name}
                                        errorMessage={errors.company_name}
                                        autoComplete="organization"
                                        autoFocus
                                        required
                                        startContent={
                                            <BuildingOfficeIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                        }
                                        classNames={{
                                            base: "w-full",
                                            mainWrapper: "w-full",
                                            input: [
                                                "bg-transparent",
                                                "text-black dark:text-white",
                                                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                            ],
                                            innerWrapper: "bg-transparent",
                                            inputWrapper: [
                                                "shadow-lg",
                                                "bg-default-200/50",
                                                "dark:bg-default/60",
                                                "backdrop-blur-xl",
                                                "backdrop-saturate-200",
                                                "hover:bg-default-200/70",
                                                "dark:hover:bg-default/70",
                                                "group-data-[focused=true]:bg-default-200/50",
                                                "dark:group-data-[focused=true]:bg-default/60",
                                                "!cursor-text",
                                                "border-0",
                                            ],
                                        }}
                                    />
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        label="Subdomain"
                                        placeholder="your-company"
                                        value={data.domain}
                                        onChange={handleDomainChange}
                                        isInvalid={!!errors.domain || domainAvailable === false || !!data.domainError}
                                        errorMessage={
                                            errors.domain || 
                                            data.domainError || 
                                            (domainAvailable === false ? 'Domain is already taken' : '')
                                        }
                                        description={`Your platform will be accessible at: ${data.domain || 'your-company'}.aerohraznil.com`}
                                        endContent={
                                            <div className="flex items-center">
                                                {domainChecking && (
                                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                                                )}
                                                {domainAvailable === true && !data.domainError && (
                                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                                )}
                                                {(domainAvailable === false || data.domainError) && (
                                                    <span className="text-red-500 text-sm">✕</span>
                                                )}
                                            </div>
                                        }
                                        startContent={
                                            <GlobeAltIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                        }
                                        classNames={{
                                            base: "w-full",
                                            mainWrapper: "w-full",
                                            input: [
                                                "bg-transparent",
                                                "text-black dark:text-white",
                                                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                            ],
                                            innerWrapper: "bg-transparent",
                                            inputWrapper: [
                                                "shadow-lg",
                                                "bg-default-200/50",
                                                "dark:bg-default/60",
                                                "backdrop-blur-xl",
                                                "backdrop-saturate-200",
                                                "hover:bg-default-200/70",
                                                "dark:hover:bg-default/70",
                                                "group-data-[focused=true]:bg-default-200/50",
                                                "dark:group-data-[focused=true]:bg-default/60",
                                                "!cursor-text",
                                                "border-0",
                                            ],
                                        }}
                                    />

                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={!canProceedStep1}
                            >
                                Continue 
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Account Details */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                        >
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium mb-2"
                            >
                                <ArrowLeftIcon className="w-3 h-3 mr-1" />
                                Back
                            </button>

                            {/* Two-column layout for contact info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input
                                    type="text"
                                    label="Your Full Name"
                                    placeholder="Enter your full name"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    isInvalid={!!errors.owner_name}
                                    errorMessage={errors.owner_name}
                                    autoComplete="name"
                                    required
                                    startContent={
                                        <UserIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                    }
                                    classNames={{
                                        base: "w-full",
                                        mainWrapper: "w-full",
                                        input: [
                                            "bg-transparent",
                                            "text-black dark:text-white",
                                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                        ],
                                        innerWrapper: "bg-transparent",
                                        inputWrapper: [
                                            "shadow-lg",
                                            "bg-default-200/50",
                                            "dark:bg-default/60",
                                            "backdrop-blur-xl",
                                            "backdrop-saturate-200",
                                            "hover:bg-default-200/70",
                                            "dark:hover:bg-default/70",
                                            "group-data-[focused=true]:bg-default-200/50",
                                            "dark:group-data-[focused=true]:bg-default/60",
                                            "!cursor-text",
                                            "border-0",
                                        ],
                                    }}
                                />

                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="Enter your email address"
                                    value={data.owner_email}
                                    onChange={(e) => setData('owner_email', e.target.value)}
                                    isInvalid={!!errors.owner_email || (data.owner_email && !isValidEmail(data.owner_email))}
                                    errorMessage={errors.owner_email || (data.owner_email && !isValidEmail(data.owner_email) ? 'Please enter a valid email address' : '')}
                                    autoComplete="email"
                                    required
                                    startContent={
                                        <EnvelopeIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                    }
                                    classNames={{
                                        base: "w-full",
                                        mainWrapper: "w-full",
                                        input: [
                                            "bg-transparent",
                                            "text-black dark:text-white",
                                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                        ],
                                        innerWrapper: "bg-transparent",
                                        inputWrapper: [
                                            "shadow-lg",
                                            "bg-default-200/50",
                                            "dark:bg-default/60",
                                            "backdrop-blur-xl",
                                            "backdrop-saturate-200",
                                            "hover:bg-default-200/70",
                                            "dark:hover:bg-default/70",
                                            "group-data-[focused=true]:bg-default-200/50",
                                            "dark:group-data-[focused=true]:bg-default/60",
                                            "!cursor-text",
                                            "border-0",
                                        ],
                                    }}
                                />
                            </div>

                            {/* Password fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Input
                                        type={isPasswordVisible ? "text" : "password"}
                                        label="Password"
                                        placeholder="Create a strong password"
                                        value={data.password}
                                        onChange={handlePasswordChange}
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password}
                                        autoComplete="new-password"
                                        required
                                        startContent={
                                            <LockClosedIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                        }
                                        endContent={
                                            <button
                                                className="focus:outline-none"
                                                type="button"
                                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                            >
                                                {isPasswordVisible ? (
                                                    <EyeSlashIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                                ) : (
                                                    <EyeIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                        classNames={{
                                            base: "w-full",
                                            mainWrapper: "w-full",
                                            input: [
                                                "bg-transparent",
                                                "text-black dark:text-white",
                                                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                            ],
                                            innerWrapper: "bg-transparent",
                                            inputWrapper: [
                                                "shadow-lg",
                                                "bg-default-200/50",
                                                "dark:bg-default/60",
                                                "backdrop-blur-xl",
                                                "backdrop-saturate-200",
                                                "hover:bg-default-200/70",
                                                "dark:hover:bg-default/70",
                                                "group-data-[focused=true]:bg-default-200/50",
                                                "dark:group-data-[focused=true]:bg-default/60",
                                                "!cursor-text",
                                                "border-0",
                                            ],
                                        }}
                                    />
                                    
                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                                                >
                                                    <motion.div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ backgroundColor: getPasswordStrengthColor() }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <motion.span
                                                    className="text-xs font-medium w-12 text-right"
                                                    style={{ color: getPasswordStrengthColor() }}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    {getPasswordStrengthText()}
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <Input
                                    type={isConfirmPasswordVisible ? "text" : "password"}
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    isInvalid={!!errors.password_confirmation || (data.password_confirmation && data.password !== data.password_confirmation)}
                                    errorMessage={errors.password_confirmation || (data.password_confirmation && data.password !== data.password_confirmation ? 'Passwords do not match' : '')}
                                    autoComplete="new-password"
                                    required
                                    startContent={
                                        <ShieldCheckIcon className="w-4 h-4 text-default-400 pointer-events-none flex-shrink-0" />
                                    }
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        >
                                            {isConfirmPasswordVisible ? (
                                                <EyeSlashIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                            ) : (
                                                <EyeIcon className="w-4 h-4 text-default-400 pointer-events-none" />
                                            )}
                                        </button>
                                    }
                                    classNames={{
                                        base: "w-full",
                                        mainWrapper: "w-full",
                                        input: [
                                            "bg-transparent",
                                            "text-black dark:text-white",
                                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                        ],
                                        innerWrapper: "bg-transparent",
                                        inputWrapper: [
                                            "shadow-lg",
                                            "bg-default-200/50",
                                            "dark:bg-default/60",
                                            "backdrop-blur-xl",
                                            "backdrop-saturate-200",
                                            "hover:bg-default-200/70",
                                            "dark:hover:bg-default/70",
                                            "group-data-[focused=true]:bg-default-200/50",
                                            "dark:group-data-[focused=true]:bg-default/60",
                                            "!cursor-text",
                                            "border-0",
                                        ],
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={!canProceedStep2}
                            >
                                Continue 
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Plan Selection */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium mb-2"
                            >
                                <ArrowLeftIcon className="w-3 h-3 mr-1" />
                                Back
                            </button>

                            {/* Billing Cycle Toggle */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-white dark:bg-slate-800 p-1 rounded-full flex shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setData('billing_cycle', 'monthly')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            data.billing_cycle === 'monthly'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('billing_cycle', 'yearly')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            data.billing_cycle === 'yearly'
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                        }`}
                                    >
                                        Yearly
                                        <span className="ml-1 inline-flex items-center px-1 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                                            -20%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Plans - Tab buttons layout */}
                            <div className="w-full space-y-4">
                                {/* Plan tab buttons */}
                                <div className="bg-white/80 dark:bg-slate-800/80 rounded-full p-1 flex shadow-sm">
                                    {plans
                                        .filter(p => p.billing_cycle === data.billing_cycle)
                                        .map((p) => (
                                            <button
                                                key={String(p.id)}
                                                type="button"
                                                onClick={() => handlePlanSelect(String(p.id))}
                                                className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all ${
                                                    String(p.id) === data.plan_id
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                </div>
                                
                                {/* Selected plan details */}
                                {selectedPlan && (
                                    <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/80 dark:bg-slate-800/80 shadow-sm backdrop-blur-sm">
                                        <div className="flex items-baseline justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedPlan.name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Best for {selectedPlan.name === 'Starter' ? 'small teams' : selectedPlan.name === 'Professional' ? 'growing companies' : 'large organizations'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">${selectedPlan.price}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">/{data.billing_cycle === 'monthly' ? 'mo' : 'yr'}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Employees</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name === 'Enterprise' ? 'Unlimited' : (selectedPlan.name === 'Professional' ? '100' : '10')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Storage</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name === 'Enterprise' ? '1TB' : (selectedPlan.name === 'Professional' ? '10GB' : '1GB')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Support</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name === 'Enterprise' ? '24/7' : (selectedPlan.name === 'Professional' ? 'Priority' : 'Email')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Email</span>
                                                <span className="font-medium text-gray-900 dark:text-white">✓</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Integrations</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name === 'Enterprise' ? 'Unlimited' : (selectedPlan.name === 'Professional' ? '20+' : '5')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-600 dark:text-gray-400">Analytics</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name === 'Enterprise' ? 'Advanced' : (selectedPlan.name === 'Professional' ? 'Standard' : 'Basic')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox"
                                    id="terms-checkbox"
                                    checked={data.terms}
                                    onChange={(e) => setData('terms', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="terms-checkbox" className="text-xs">
                                    I agree to the{' '}
                                    <Link
                                        href="/terms"
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link
                                        href="/privacy"
                                        className="text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                                {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!canSubmit || processing}
                            >
                                {selectedPlan && selectedPlan.price > 0 ? 'Continue to Payment' : (processing ? 'Creating your platform...' : 'Create My HR Platform')}
                            </button>

                            {/* Form errors */}
                            {(errors.error || errors.message) && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                                        {errors.error || errors.message}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 4: Payment (for paid plans only) */}
                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white text-center">
                                Complete Payment
                            </h2>
                            
                            {selectedPlan && (
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.name} Plan</span>
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            ${selectedPlan.price}
                                            <span className="text-sm text-gray-500">/{data.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.description}</p>
                                </div>
                            )}

                            {/* Payment Method Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                                            paymentMethod === 'card'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <CreditCardIcon className="w-5 h-5 mx-auto mb-1" />
                                        Credit Card
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('bank')}
                                        className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                                            paymentMethod === 'bank'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <BuildingOfficeIcon className="w-5 h-5 mx-auto mb-1" />
                                        Bank Transfer
                                    </button>
                                </div>
                            </div>

                            {/* Payment Form (Stripe Elements would go here) */}
                            {paymentMethod === 'card' && (
                                <div className="space-y-3">
                                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                            🔒 Stripe payment form will be integrated here
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                                            Secure payment processing powered by Stripe
                                        </p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'bank' && (
                                <div className="space-y-3">
                                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                            Bank transfer instructions will be provided after registration
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Error */}
                            {paymentError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                                        {paymentError}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={paymentProcessing || processing}
                                >
                                    {paymentProcessing ? 'Processing Payment...' : processing ? 'Creating Platform...' : 'Complete Registration'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
            
            {/* Login Link */}
            <div className="text-center mt-4">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href={
                            isTenantDomain() && tenantInfo
                                ? route('tenant.login', { tenant: tenantInfo.domain })
                                : route('central.login')
                        }
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>
    
            {/* Footer */}
            <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                display="block"
                sx={{ opacity: 0.6, fontSize: { xs: '0.65rem', sm: '0.7rem' }, mt: 4 }}
            >
                © 2025 Emam Hosen. All rights reserved.
            </Typography>
        </AuthLayout>
    );
}