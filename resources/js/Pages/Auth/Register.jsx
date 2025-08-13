import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    UserIcon,
    EnvelopeIcon, 
    LockClosedIcon,
    ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const [passwordStrength, setPasswordStrength] = useState(0);

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
                return 'bg-red-500';
            case 2:
                return 'bg-orange-500';
            case 3:
                return 'bg-yellow-500';
            case 4:
                return 'bg-blue-500';
            case 5:
                return 'bg-green-500';
            default:
                return 'bg-gray-200';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Create account"
            subtitle="Join AeroHR and streamline your workforce management"
        >
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Input
                        label="Full name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        icon={UserIcon}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        autoFocus
                        required
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Input
                        label="Email address"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        icon={EnvelopeIcon}
                        placeholder="Enter your email"
                        autoComplete="username"
                        required
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={handlePasswordChange}
                            error={errors.password}
                            icon={LockClosedIcon}
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            showPasswordToggle
                            required
                        />
                        
                        {/* Password Strength Indicator */}
                        {data.password && (
                            <motion.div
                                className="mt-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 w-16">
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Use 8+ characters with letters, numbers, and symbols
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Input
                        label="Confirm password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        icon={LockClosedIcon}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        showPasswordToggle
                        required
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Checkbox
                        checked={data.terms}
                        onChange={(e) => setData('terms', e.target.checked)}
                        error={errors.terms}
                        label={
                            <span>
                                I agree to the{' '}
                                <Link
                                    href="#"
                                    className="text-blue-600 hover:text-blue-500 underline"
                                >
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link
                                    href="#"
                                    className="text-blue-600 hover:text-blue-500 underline"
                                >
                                    Privacy Policy
                                </Link>
                            </span>
                        }
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={processing}
                        disabled={processing}
                    >
                        {processing ? 'Creating account...' : 'Create account'}
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </motion.div>
            </form>

            {/* Security Features */}
            <motion.div
                className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Enterprise Security
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                            Your account is protected with enterprise-grade security including encryption, 
                            audit logging, and advanced threat detection.
                        </p>
                    </div>
                </div>
            </motion.div>
        </AuthLayout>
    );
}
