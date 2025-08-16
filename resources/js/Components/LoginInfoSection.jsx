import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
    UserIcon,
    BuildingOfficeIcon,
    ArrowRightIcon,
    CheckIcon,
    GlobeAltIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard';

const LoginInfoSection = () => {
    const loginMethods = [
        {
            icon: <BuildingOfficeIcon className="w-6 h-6" />,
            title: "Company Employees",
            description: "Login from anywhere - we'll redirect you to your company portal",
            method: "Universal Login",
            url: "/login",
            badge: "Smart Redirect",
            badgeColor: "bg-blue-100 text-blue-700",
            examples: [
                "Use aero-hr.com/login with your work email",
                "Or go directly to yourcompany.aero-hr.com/login"
            ]
        },
        {
            icon: <UserIcon className="w-6 h-6" />,
            title: "System Administrators",
            description: "Access the central admin dashboard to manage all tenants",
            method: "Admin Access",
            url: "/login",
            badge: "Central Dashboard",
            badgeColor: "bg-green-100 text-green-700",
            examples: [
                "Login at aero-hr.com/login with admin credentials",
                "Access tenant management and system monitoring"
            ]
        }
    ];

    const features = [
        {
            icon: <ShieldCheckIcon className="w-5 h-5 text-blue-600" />,
            text: "Secure auto-login with encrypted tokens"
        },
        {
            icon: <GlobeAltIcon className="w-5 h-5 text-blue-600" />,
            text: "Works across all subdomains seamlessly" 
        },
        {
            icon: <CheckIcon className="w-5 h-5 text-blue-600" />,
            text: "Smart user detection and routing"
        }
    ];

    return (
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Universal Login Experience
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        One login page that works for everyone. Whether you're an employee or admin, 
                        we'll get you to the right place automatically.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {loginMethods.map((method, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <GlassCard className="p-8 h-full hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start space-x-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {method.title}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${method.badgeColor}`}>
                                                {method.badge}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            {method.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <h4 className="font-medium text-gray-900">How it works:</h4>
                                    {method.examples.map((example, idx) => (
                                        <div key={idx} className="flex items-start space-x-2">
                                            <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-600">{example}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={method.url}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                                >
                                    {method.method}
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Security Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                        Security & User Experience Features
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                {feature.icon}
                                <span className="text-gray-700">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Call-to-Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center space-x-4 bg-blue-50 rounded-full px-6 py-3">
                        <span className="text-blue-700 font-medium">
                            Don't have an account yet?
                        </span>
                        <Link
                            href="/register"
                            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default LoginInfoSection;
