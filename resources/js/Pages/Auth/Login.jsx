import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    EnvelopeIcon, 
    LockClosedIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Input, Button as HeroButton, Checkbox as HeroCheckbox } from '@heroui/react';
import AuthLayout from '@/Components/AuthLayout';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import { Typography } from '@mui/material';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showAlert, setShowAlert] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (status) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const submit = (e) => {
        e.preventDefault();
        
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Welcome back"
         
        >
            <Head title="Log in" />

            {/* Status Alert */}
            {status && showAlert && (
                <motion.div
                    className="mb-6 p-4 rounded-xl border"
                    style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderColor: 'rgba(34, 197, 94, 0.3)',
                        backdropFilter: 'blur(10px)'
                    }}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring" }}
                >
                    <div className="flex items-center">
                        <motion.div
                            className="flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                        >
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </motion.div>
                        <div className="ml-3">
                            <motion.p
                                className="text-sm font-medium text-green-800"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {status}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}

            <form onSubmit={submit} className="auth-form-spacing">{/* Using responsive spacing class */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Input
                        type="email"
                        label="Email address"
                        placeholder="Enter your email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                        autoComplete="username"
                        autoFocus
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
                                "shadow-xl",
                                "bg-default-200/50",
                                "dark:bg-default/60",
                                "backdrop-blur-xl",
                                "backdrop-saturate-200",
                                "hover:bg-default-200/70",
                                "dark:hover:bg-default/70",
                                "group-data-[focused=true]:bg-default-200/50",
                                "dark:group-data-[focused=true]:bg-default/60",
                                "!cursor-text",
                            ],
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Input
                        type={isPasswordVisible ? "text" : "password"}
                        label="Password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password}
                        autoComplete="current-password"
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
                                "shadow-xl",
                                "bg-default-200/50",
                                "dark:bg-default/60",
                                "backdrop-blur-xl",
                                "backdrop-saturate-200",
                                "hover:bg-default-200/70",
                                "dark:hover:bg-default/70",
                                "group-data-[focused=true]:bg-default-200/50",
                                "dark:group-data-[focused=true]:bg-default/60",
                                "!cursor-text",
                            ],
                        }}
                    />
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Checkbox
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        label="Remember me"
                        description="Keep me signed in for 30 days"
                    />

                    {canResetPassword && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium transition-colors duration-200 hover:underline"
                                style={{ color: 'var(--theme-primary)' }}
                            >
                                Forgot password?
                            </Link>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={processing}
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                            <Link
                                href={route('register')}
                                className="font-medium transition-colors duration-200 hover:underline"
                                style={{ color: 'var(--theme-primary)' }}
                            >
                                Sign up here
                            </Link>
                        </motion.span>
                    </p>
                </motion.div>
                {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                            className="mt-3"
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                                sx={{ opacity: 0.6, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            >
                                © 2025 Emam Hosen. All rights reserved.
                            </Typography>
                        </motion.div>
                
            </form>

           
        </AuthLayout>
    );
}
