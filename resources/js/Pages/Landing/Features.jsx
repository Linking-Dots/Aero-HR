import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Button, Card, CardBody, Divider, Chip, Tab, Tabs } from "@heroui/react";
import { motion } from 'framer-motion';
import { HeroUIProvider } from "@heroui/react";
import { 
    BuildingOffice2Icon,
    UserGroupIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    CogIcon,
    GlobeAltIcon,
    LockClosedIcon,
    CloudIcon,
    DevicePhoneMobileIcon,
    DocumentTextIcon,
    BellIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    CubeTransparentIcon,
    PlayCircleIcon,
    EyeIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';

export default function Features({ title }) {
    const [selectedCategory, setSelectedCategory] = useState('tenant-management');

    const featureCategories = [
        {
            id: 'tenant-management',
            name: 'Tenant Management',
            icon: <BuildingOffice2Icon className="w-5 h-5" />,
            description: 'Multi-tenant architecture and organization management'
        },
        {
            id: 'security',
            name: 'Security & Compliance',
            icon: <ShieldCheckIcon className="w-5 h-5" />,
            description: 'Enterprise-grade security and compliance features'
        },
        {
            id: 'analytics',
            name: 'Analytics & Insights',
            icon: <ChartBarIcon className="w-5 h-5" />,
            description: 'Advanced analytics and AI-powered insights'
        },
        {
            id: 'integrations',
            name: 'Integrations',
            icon: <GlobeAltIcon className="w-5 h-5" />,
            description: 'Connect with 200+ enterprise tools and systems'
        },
        {
            id: 'hr-core',
            name: 'HR Core Features',
            icon: <UserGroupIcon className="w-5 h-5" />,
            description: 'Comprehensive HR management capabilities'
        }
    ];

    const features = {
        'tenant-management': [
            {
                icon: <BuildingOffice2Icon className="w-8 h-8" />,
                title: 'Multi-Tenant Architecture',
                description: 'Secure, isolated environments for unlimited organizations with complete data separation and customizable settings.',
                highlights: ['Unlimited Organizations', 'Data Isolation', 'Custom Configurations', 'Tenant-specific Branding'],
                image: '/assets/images/features/tenant-management.png'
            },
            {
                icon: <UserGroupIcon className="w-8 h-8" />,
                title: 'Organization Hierarchy',
                description: 'Create complex organizational structures with departments, teams, and reporting relationships.',
                highlights: ['Nested Departments', 'Team Management', 'Reporting Lines', 'Role Hierarchies'],
                image: '/assets/images/features/org-hierarchy.png'
            },
            {
                icon: <CogIcon className="w-8 h-8" />,
                title: 'Custom Workflows',
                description: 'Design and implement custom approval workflows for leave, expenses, and other HR processes.',
                highlights: ['Visual Workflow Builder', 'Approval Chains', 'Automated Notifications', 'SLA Tracking'],
                image: '/assets/images/features/workflows.png'
            }
        ],
        'security': [
            {
                icon: <ShieldCheckIcon className="w-8 h-8" />,
                title: 'Enterprise Security',
                description: 'SOC 2 Type II and ISO 27001 certified security with end-to-end encryption and advanced threat protection.',
                highlights: ['SOC 2 Compliance', 'ISO 27001 Certified', 'End-to-End Encryption', 'Threat Detection'],
                image: '/assets/images/features/security.png'
            },
            {
                icon: <LockClosedIcon className="w-8 h-8" />,
                title: 'Role-Based Access Control',
                description: 'Granular permission system with custom roles, hierarchical access, and comprehensive audit trails.',
                highlights: ['Custom Roles', 'Permission Matrix', 'Audit Trails', 'Session Management'],
                image: '/assets/images/features/rbac.png'
            },
            {
                icon: <DocumentTextIcon className="w-8 h-8" />,
                title: 'Compliance Management',
                description: 'Built-in compliance tools for GDPR, CCPA, and other regulatory requirements.',
                highlights: ['GDPR Compliance', 'Data Privacy', 'Consent Management', 'Compliance Reports'],
                image: '/assets/images/features/compliance.png'
            }
        ],
        'analytics': [
            {
                icon: <ChartBarIcon className="w-8 h-8" />,
                title: 'Advanced Analytics',
                description: 'AI-powered insights with predictive analytics, custom dashboards, and real-time reporting.',
                highlights: ['Predictive Analytics', 'Custom Dashboards', 'Real-time Data', 'AI Insights'],
                image: '/assets/images/features/analytics.png'
            },
            {
                icon: <EyeIcon className="w-8 h-8" />,
                title: 'Performance Intelligence',
                description: 'Track employee performance, engagement, and productivity with advanced metrics and benchmarking.',
                highlights: ['Performance Metrics', 'Engagement Scores', 'Productivity Analysis', 'Benchmarking'],
                image: '/assets/images/features/performance.png'
            },
            {
                icon: <DocumentTextIcon className="w-8 h-8" />,
                title: 'Custom Reports',
                description: 'Create detailed reports with drag-and-drop builder, scheduled delivery, and export options.',
                highlights: ['Report Builder', 'Scheduled Reports', 'Multiple Formats', 'Data Export'],
                image: '/assets/images/features/reports.png'
            }
        ],
        'integrations': [
            {
                icon: <GlobeAltIcon className="w-8 h-8" />,
                title: 'Enterprise Integrations',
                description: 'Pre-built connectors for 200+ enterprise tools including ERP, HRIS, and communication platforms.',
                highlights: ['200+ Integrations', 'Pre-built Connectors', 'Real-time Sync', 'Data Mapping'],
                image: '/assets/images/features/integrations.png'
            },
            {
                icon: <CommandLineIcon className="w-8 h-8" />,
                title: 'API & Webhooks',
                description: 'RESTful API with comprehensive documentation, webhooks, and SDK support for custom integrations.',
                highlights: ['RESTful API', 'Webhooks', 'SDK Support', 'API Documentation'],
                image: '/assets/images/features/api.png'
            },
            {
                icon: <CloudIcon className="w-8 h-8" />,
                title: 'Cloud Connectivity',
                description: 'Seamless integration with major cloud providers and enterprise software ecosystems.',
                highlights: ['Cloud Providers', 'Enterprise Software', 'Single Sign-On', 'Directory Services'],
                image: '/assets/images/features/cloud.png'
            }
        ],
        'hr-core': [
            {
                icon: <CalendarIcon className="w-8 h-8" />,
                title: 'Leave Management',
                description: 'Comprehensive leave management with automated workflows, balance tracking, and policy enforcement.',
                highlights: ['Multiple Leave Types', 'Automated Approvals', 'Balance Tracking', 'Policy Engine'],
                image: '/assets/images/features/leave.png'
            },
            {
                icon: <ClockIcon className="w-8 h-8" />,
                title: 'Time & Attendance',
                description: 'Advanced time tracking with biometric integration, geofencing, and flexible scheduling.',
                highlights: ['Biometric Integration', 'Geofencing', 'Flexible Schedules', 'Overtime Tracking'],
                image: '/assets/images/features/attendance.png'
            },
            {
                icon: <CurrencyDollarIcon className="w-8 h-8" />,
                title: 'Payroll Integration',
                description: 'Seamless payroll processing with tax calculations, benefits management, and compliance.',
                highlights: ['Tax Calculations', 'Benefits Management', 'Compliance Checks', 'Direct Deposits'],
                image: '/assets/images/features/payroll.png'
            },
            {
                icon: <AcademicCapIcon className="w-8 h-8" />,
                title: 'Learning & Development',
                description: 'Training programs, skill tracking, certification management, and career development planning.',
                highlights: ['Training Programs', 'Skill Tracking', 'Certifications', 'Career Planning'],
                image: '/assets/images/features/learning.png'
            }
        ]
    };

    const stats = [
        { number: '99.9%', label: 'Uptime SLA', icon: <CloudIcon className="w-6 h-6" /> },
        { number: '200+', label: 'Integrations', icon: <GlobeAltIcon className="w-6 h-6" /> },
        { number: '24/7', label: 'Support', icon: <BellIcon className="w-6 h-6" /> },
        { number: 'SOC 2', label: 'Compliant', icon: <ShieldCheckIcon className="w-6 h-6" /> }
    ];

    return (
        <>
            <Head title={title} />
            <HeroUIProvider>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
                    
                    {/* Navigation */}
                    <motion.nav 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed top-0 left-0 right-0 z-50 p-4"
                    >
                        <GlassCard className="mx-auto max-w-7xl">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center space-x-8">
                                    <Link href="/" className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <CubeTransparentIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Aero-HR Enterprise
                                        </span>
                                    </Link>
                                    <div className="hidden md:flex items-center space-x-6">
                                        <Link href="/features" className="text-blue-600 font-medium">Features</Link>
                                        <Link href="/landing-pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
                                        <Link href="/#integrations" className="text-gray-700 hover:text-blue-600 transition-colors">Integrations</Link>
                                        <Link href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Button
                                        as={Link}
                                        href="/login"
                                        variant="light"
                                        className="text-gray-700 hover:text-blue-600"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        as={Link}
                                        href="/register"
                                        color="primary"
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                        startContent={<ArrowRightIcon className="w-4 h-4" />}
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.nav>

                    {/* Hero Section */}
                    <section className="pt-32 pb-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Chip
                                    variant="flat"
                                    color="primary"
                                    startContent={<BuildingOffice2Icon className="w-4 h-4" />}
                                    className="mb-6 bg-blue-100 text-blue-700"
                                >
                                    Enterprise Features
                                </Chip>
                                <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Powerful Features for
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Enterprise HR
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                                    Discover the comprehensive suite of features designed to transform your enterprise HR operations with advanced multi-tenant capabilities.
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button
                                        as={Link}
                                        href="/register"
                                        size="lg"
                                        color="primary"
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3"
                                        startContent={<ArrowRightIcon className="w-5 h-5" />}
                                    >
                                        Start Free Trial
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="bordered"
                                        className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-8 py-3"
                                        startContent={<PlayCircleIcon className="w-5 h-5" />}
                                    >
                                        Watch Demo
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                {stats.map((stat, index) => (
                                    <GlassCard key={index} className="p-6 text-center">
                                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600">
                                            {stat.icon}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </GlassCard>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* Feature Categories */}
                    <section className="pb-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <GlassCard className="p-8">
                                <Tabs
                                    selectedKey={selectedCategory}
                                    onSelectionChange={setSelectedCategory}
                                    aria-label="Feature categories"
                                    className="w-full"
                                    variant="bordered"
                                    color="primary"
                                >
                                    {featureCategories.map((category) => (
                                        <Tab
                                            key={category.id}
                                            title={
                                                <div className="flex items-center space-x-2">
                                                    {category.icon}
                                                    <span className="hidden sm:inline">{category.name}</span>
                                                </div>
                                            }
                                        >
                                            <div className="mt-8">
                                                <div className="text-center mb-12">
                                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h2>
                                                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
                                                </div>

                                                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                                    {features[category.id]?.map((feature, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, y: 30 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                                        >
                                                            <GlassCard className="p-6 h-full hover:scale-105 transition-transform duration-300">
                                                                <div className="mb-6">
                                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4">
                                                                        {feature.icon}
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                                                    <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {feature.highlights.map((highlight, idx) => (
                                                                        <div key={idx} className="flex items-center space-x-2">
                                                                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                            <span className="text-sm text-gray-700">{highlight}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Feature Image Placeholder */}
                                                                <div className="mt-6 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                                                    <div className="text-center">
                                                                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600">
                                                                            {feature.icon}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">Feature Preview</div>
                                                                    </div>
                                                                </div>
                                                            </GlassCard>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Tab>
                                    ))}
                                </Tabs>
                            </GlassCard>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                                    Ready to Experience These Features?
                                </h2>
                                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                    Start your free trial today and see how our enterprise features can transform your HR operations.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button
                                        as={Link}
                                        href="/register"
                                        size="lg"
                                        color="warning"
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-8 py-3"
                                        startContent={<ArrowRightIcon className="w-5 h-5" />}
                                    >
                                        Start Free Trial
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="bordered"
                                        className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
                                        startContent={<PlayCircleIcon className="w-5 h-5" />}
                                    >
                                        Schedule Demo
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center mt-8 space-x-6 text-blue-100">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">30-day free trial</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">No credit card required</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">Setup in 24 hours</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="bg-gray-900 text-white py-16 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                <div>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <CubeTransparentIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xl font-bold">Aero-HR Enterprise</span>
                                    </div>
                                    <p className="text-gray-300 mb-6">
                                        The complete multi-tenant HR solution for modern enterprises.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Product</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="/features" className="text-gray-300 hover:text-blue-400 transition">Features</Link></li>
                                        <li><Link href="/landing-pricing" className="text-gray-300 hover:text-blue-400 transition">Pricing</Link></li>
                                        <li><Link href="/#integrations" className="text-gray-300 hover:text-blue-400 transition">Integrations</Link></li>
                                        <li><Link href="#security" className="text-gray-300 hover:text-blue-400 transition">Security</Link></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Company</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="/#about" className="text-gray-300 hover:text-blue-400 transition">About Us</Link></li>
                                        <li><Link href="#contact" className="text-gray-300 hover:text-blue-400 transition">Contact</Link></li>
                                        <li><Link href="#blog" className="text-gray-300 hover:text-blue-400 transition">Blog</Link></li>
                                        <li><Link href="#careers" className="text-gray-300 hover:text-blue-400 transition">Careers</Link></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Legal</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="#privacy" className="text-gray-300 hover:text-blue-400 transition">Privacy Policy</Link></li>
                                        <li><Link href="#terms" className="text-gray-300 hover:text-blue-400 transition">Terms of Service</Link></li>
                                        <li><Link href="#security" className="text-gray-300 hover:text-blue-400 transition">Security</Link></li>
                                        <li><Link href="#compliance" className="text-gray-300 hover:text-blue-400 transition">Compliance</Link></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <Divider className="my-8 bg-gray-800" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <p className="text-gray-400 mb-4 md:mb-0">
                                    © {new Date().getFullYear()} Aero-HR Enterprise. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                        <span>SOC 2 Compliant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </HeroUIProvider>
        </>
    );
}
