import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    LockClosedIcon,
    KeyIcon,
    ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import AuthLayout from '@/Components/AuthLayout';
import Input from '@/Components/Input';
import Button from '@/Components/Button';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        verification_code: '',
        password: '',
        password_confirmation: '',
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
        post(route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Set new password"
            subtitle="Enter the verification code and create a new password"
        >
            <Head title="Reset Password" />

            <form onSubmit={submit} className="space-y-6">
                {/* Email Display */}
                <motion.div
                    className="p-3 bg-gray-50 rounded-lg border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-sm text-gray-600">
                        Resetting password for: <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Input
                        label="Verification code"
                        type="text"
                        value={data.verification_code}
                        onChange={(e) => setData('verification_code', e.target.value)}
                        error={errors.verification_code}
                        icon={KeyIcon}
                        placeholder="Enter 6-digit code from email"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength="6"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Check your email for the 6-digit verification code
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div>
                        <Input
                            label="New password"
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
                        label="Confirm new password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        icon={LockClosedIcon}
                        placeholder="Confirm your new password"
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
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={processing}
                        disabled={processing}
                    >
                        {processing ? 'Updating password...' : 'Update password'}
                    </Button>
                </motion.div>
            </form>

            {/* Security Notice */}
            <motion.div
                className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Secure Password Reset
                        </h3>
                        <div className="text-sm text-green-700 mt-2 space-y-1">
                            <p>• Your password reset is protected with two-factor verification</p>
                            <p>• All sessions will be invalidated after password change</p>
                            <p>• This activity is logged for security monitoring</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AuthLayout>
    );
}
