import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Button, Card, CardBody, Divider, Image, Chip, Avatar, User, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { motion, AnimatePresence } from 'framer-motion';
import { HeroUIProvider } from "@heroui/react";
import { 
    BuildingOffice2Icon,
    ShieldCheckIcon,
    ChartBarIcon,
    CogIcon,
    UserGroupIcon,
    GlobeAltIcon,
    BoltIcon,
    ClockIcon,
    DocumentTextIcon,
    LockClosedIcon,
    PlayCircleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    StarIcon,
    EyeIcon,
    CubeTransparentIcon,
    CloudIcon,
    DevicePhoneMobileIcon,
    ServerIcon,
    UserPlusIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';

export default function Home({ title }) {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isVisible, setIsVisible] = useState({});

    // Multi-language support placeholders
    const content = {
        en: {
            hero: {
                badge: "Enterprise Multi-Tenant Suite",
                title: "Transform Your Enterprise",
                highlight: "Operations",
                subtitle: "Empower thousands of organizations with our scalable, secure, and intelligent multi-tenant HR platform designed for enterprise excellence.",
                cta1: "Start Enterprise Trial",
                cta2: "Schedule Demo"
            },
            features: {
                title: "Enterprise-Grade Features",
                subtitle: "Built for scale, security, and seamless multi-tenant operations"
            }
        }
    };

    const currentLang = 'en'; // Future multi-language implementation

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Head of HR Operations",
            company: "TechCorp Global",
            content: "Aero-HR's multi-tenant architecture allowed us to manage 15+ subsidiaries seamlessly. The glassmorphism interface is intuitive and professional.",
            avatar: "https://i.pravatar.cc/150?img=1",
            rating: 5
        },
        {
            name: "Marcus Rodriguez",
            role: "Chief People Officer",
            company: "Enterprise Solutions Inc.",
            content: "The enterprise-grade security and role-based access controls give us complete confidence in managing sensitive HR data across multiple tenants.",
            avatar: "https://i.pravatar.cc/150?img=2",
            rating: 5
        },
        {
            name: "Dr. Lisa Wang",
            role: "VP Human Resources",
            company: "Global Innovations",
            content: "Implementation was seamless, and the analytics dashboard provides insights we never had before. ROI was evident within the first quarter.",
            avatar: "https://i.pravatar.cc/150?img=3",
            rating: 5
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const heroFeatures = [
        {
            icon: <BuildingOffice2Icon className="w-6 h-6" />,
            title: "Multi-Tenant Architecture",
            description: "Secure isolation for unlimited organizations"
        },
        {
            icon: <ShieldCheckIcon className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "SOC 2 compliant with advanced encryption"
        },
        {
            icon: <ChartBarIcon className="w-6 h-6" />,
            title: "Advanced Analytics",
            description: "AI-powered insights and predictive analytics"
        },
        {
            icon: <CogIcon className="w-6 h-6" />,
            title: "Seamless Integration",
            description: "Connect with 200+ enterprise tools"
        }
    ];

    const enterpriseFeatures = [
        {
            icon: <UserGroupIcon className="w-8 h-8" />,
            title: "Tenant Management Panel",
            description: "Comprehensive dashboard for managing multiple organizations, users, and permissions with granular control.",
            color: "from-blue-400 to-cyan-400",
            highlights: ["Unlimited Organizations", "Role-Based Access", "Custom Branding"]
        },
        {
            icon: <LockClosedIcon className="w-8 h-8" />,
            title: "Role-Based Access Control",
            description: "Enterprise-grade permission matrix with custom roles, hierarchical access, and audit trails.",
            color: "from-purple-400 to-pink-400",
            highlights: ["Custom Roles", "Audit Trails", "SSO Integration"]
        },
        {
            icon: <ChartBarIcon className="w-8 h-8" />,
            title: "Analytics & Insights",
            description: "AI-powered analytics with predictive insights, custom reports, and real-time dashboards.",
            color: "from-green-400 to-emerald-400",
            highlights: ["Predictive Analytics", "Custom Reports", "Real-time Data"]
        },
        {
            icon: <GlobeAltIcon className="w-8 h-8" />,
            title: "Global Integrations",
            description: "Connect seamlessly with 200+ enterprise tools including ERP, HRIS, and communication platforms.",
            color: "from-orange-400 to-red-400",
            highlights: ["200+ Integrations", "API Access", "Webhook Support"]
        }
    ];

    // Use a more reliable integration logos approach with fallbacks
    const integrationLogos = [
        { name: "Salesforce", logo: "/assets/images/partners/salesforce.svg" },
        { name: "Microsoft", logo: "/assets/images/partners/microsoft-365.svg" },
        { name: "Google Workspace", logo: "/assets/images/partners/google-workspace.svg" },
        { name: "Slack", logo: "/assets/images/partners/slack.svg" },
        { name: "Zoom", logo: "/assets/images/partners/zoom.svg" },
        { name: "SAP", logo: "/assets/images/partners/sap.svg" }
    ];

    return (
        <>
            <Head title={title} />
            <HeroUIProvider>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
                    
                    {/* Enhanced Navigation */}
                    <motion.nav 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed top-0 left-0 right-0 z-50 p-4"
                    >
                        <GlassCard className="mx-auto max-w-7xl">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center space-x-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <CubeTransparentIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Aero-HR Enterprise
                                        </span>
                                    </div>
                                    <div className="hidden md:flex items-center space-x-6">
                                        <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</Link>
                                        <Link href="/landing-pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
                                        <Link href="#integrations" className="text-gray-700 hover:text-blue-600 transition-colors">Integrations</Link>
                                        <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Button
                                        as={Link}
                                        href="/login"
                                        variant="light"
                                        className="text-gray-700 hover:text-blue-600 transition-all duration-200"
                                        startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        as={Link}
                                        href="/register"
                                        color="primary"
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        startContent={<UserPlusIcon className="w-4 h-4" />}
                                    >
                                        Start Free Trial
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.nav>

                    {/* Hero Section with Advanced Glassmorphism */}
                    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full opacity-10"
                                    style={{
                                        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))`,
                                        width: `${Math.random() * 200 + 100}px`,
                                        height: `${Math.random() * 200 + 100}px`,
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        y: [0, -30, 0],
                                        x: [0, 20, 0],
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.3, 0.1]
                                    }}
                                    transition={{
                                        duration: 8 + i * 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>

                        <div className="max-w-7xl mx-auto relative z-10">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Hero Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-6"
                                    >
                                        <Chip
                                            variant="flat"
                                            color="primary"
                                            startContent={<BuildingOffice2Icon className="w-4 h-4" />}
                                            className="bg-blue-100 text-blue-700 border-blue-200"
                                        >
                                            {content[currentLang].hero.badge}
                                        </Chip>
                                    </motion.div>

                                    <motion.h1
                                        className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            {content[currentLang].hero.title}
                                        </span>
                                        <br />
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {content[currentLang].hero.highlight}
                                        </span>
                                    </motion.h1>

                                    <motion.p
                                        className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        {content[currentLang].hero.subtitle}
                                    </motion.p>

                                    <motion.div
                                        className="flex flex-col sm:flex-row gap-4 mb-12"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <Button
                                            as={Link}
                                            href="/register"
                                            size="lg"
                                            color="primary"
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3"
                                            startContent={<BoltIcon className="w-5 h-5" />}
                                        >
                                            {content[currentLang].hero.cta1}
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="bordered"
                                            className="border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-8 py-3"
                                            startContent={<PlayCircleIcon className="w-5 h-5" />}
                                        >
                                            {content[currentLang].hero.cta2}
                                        </Button>
                                    </motion.div>

                                    {/* Hero Feature Pills */}
                                    <motion.div
                                        className="grid grid-cols-2 gap-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.0 }}
                                    >
                                        {heroFeatures.map((feature, index) => (
                                            <GlassCard key={index} className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-blue-600">
                                                        {feature.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                                                        <p className="text-xs text-gray-600">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </motion.div>
                                </motion.div>

                                {/* Hero Visual */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="relative"
                                >
                                    <GlassCard className="p-8 relative overflow-hidden">
                                        {/* Dashboard Mockup */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
                                                    <div>
                                                        <div className="w-20 h-3 bg-gray-300 rounded"></div>
                                                        <div className="w-16 h-2 bg-gray-200 rounded mt-1"></div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                    <div key={i} className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                                                        <div className={`h-2 bg-gray-200 rounded ${i === 0 ? 'w-32' : i === 1 ? 'w-24' : i === 2 ? 'w-28' : 'w-20'}`}></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                    {/* Enterprise Features Section */}
                    <section className="py-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <Chip
                                    variant="flat"
                                    color="primary"
                                    className="mb-4 bg-blue-100 text-blue-700"
                                >
                                    {content[currentLang].features.title}
                                </Chip>
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Enterprise-Grade Multi-Tenant Platform
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    {content[currentLang].features.subtitle}
                                </p>
                            </motion.div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {enterpriseFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <GlassCard className="p-8 h-full hover:scale-105 transition-transform duration-300">
                                            <div className="flex items-start space-x-4">
                                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                                                    {feature.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                                    <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {feature.highlights.map((highlight, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                size="sm"
                                                                variant="flat"
                                                                className="bg-gray-100 text-gray-700"
                                                                startContent={<CheckCircleIcon className="w-3 h-3" />}
                                                            >
                                                                {highlight}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Trusted by Enterprise Leaders
                                </h2>
                                <p className="text-xl text-gray-600">
                                    See how organizations worldwide transform their HR operations
                                </p>
                            </motion.div>

                            <GlassCard className="p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTestimonial}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center"
                                    >
                                        <div className="flex justify-center mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <blockquote className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
                                            "{testimonials[currentTestimonial].content}"
                                        </blockquote>
                                        <div className="flex items-center justify-center space-x-4">
                                            <Avatar
                                                src={testimonials[currentTestimonial].avatar}
                                                size="lg"
                                                className="w-16 h-16"
                                            />
                                            <div className="text-left">
                                                <div className="font-semibold text-gray-900">
                                                    {testimonials[currentTestimonial].name}
                                                </div>
                                                <div className="text-gray-600">
                                                    {testimonials[currentTestimonial].role}
                                                </div>
                                                <div className="text-sm text-blue-600 font-medium">
                                                    {testimonials[currentTestimonial].company}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex justify-center mt-8 space-x-2">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentTestimonial(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${
                                                index === currentTestimonial 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </section>

                    {/* Integrations Section */}
                    <section id="integrations" className="py-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Seamless Enterprise Integrations
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Connect with your existing enterprise tools and workflows
                                </p>
                            </motion.div>

                            <GlassCard className="p-12">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
                                    {integrationLogos.map((integration, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 0.6, scale: 1 }}
                                            whileHover={{ opacity: 1, scale: 1.1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <img
                                                src={integration.logo}
                                                alt={integration.name}
                                                className="h-12 object-contain grayscale hover:grayscale-0 transition-all"
                                                onError={(e) => {
                                                    // Use a data URL as fallback instead of external placeholder service
                                                    const canvas = document.createElement('canvas');
                                                    canvas.width = 120;
                                                    canvas.height = 40;
                                                    const ctx = canvas.getContext('2d');
                                                    ctx.fillStyle = '#4F46E5';
                                                    ctx.fillRect(0, 0, 120, 40);
                                                    ctx.fillStyle = '#FFFFFF';
                                                    ctx.font = '12px Arial';
                                                    ctx.textAlign = 'center';
                                                    ctx.fillText(integration.name, 60, 25);
                                                    e.target.src = canvas.toDataURL();
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="text-center mt-8">
                                    <Button
                                        variant="light"
                                        color="primary"
                                        endContent={<ArrowRightIcon className="w-4 h-4" />}
                                    >
                                        View All 200+ Integrations
                                    </Button>
                                </div>
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
                                    Ready to Transform Your Enterprise HR?
                                </h2>
                                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                    Join thousands of organizations already using Aero-HR to manage their multi-tenant workforce efficiently and securely.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button
                                        as={Link}
                                        href="/register"
                                        size="lg"
                                        color="warning"
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-8 py-3"
                                        startContent={<BoltIcon className="w-5 h-5" />}
                                    >
                                        Start Enterprise Trial
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

                    {/* Enhanced Footer */}
                    <footer className="bg-gray-900 text-white py-16 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <CubeTransparentIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-xl font-bold">Aero-HR Enterprise</span>
                                    </div>
                                    <p className="text-gray-300 mb-6 max-w-md">
                                        The complete multi-tenant HR solution for modern enterprises. Secure, scalable, and designed for global organizations.
                                    </p>
                                    <div className="flex space-x-4">
                                        {['twitter', 'linkedin', 'facebook', 'github'].map((social) => (
                                            <a 
                                                key={social}
                                                href="#" 
                                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                                            >
                                                <i className={`fab fa-${social}`}></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Product</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="/features" className="text-gray-300 hover:text-blue-400 transition">Features</Link></li>
                                        <li><Link href="/landing-pricing" className="text-gray-300 hover:text-blue-400 transition">Pricing</Link></li>
                                        <li><Link href="#integrations" className="text-gray-300 hover:text-blue-400 transition">Integrations</Link></li>
                                        <li><Link href="#security" className="text-gray-300 hover:text-blue-400 transition">Security</Link></li>
                                        <li><Link href="#api" className="text-gray-300 hover:text-blue-400 transition">API</Link></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Company</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="#about" className="text-gray-300 hover:text-blue-400 transition">About Us</Link></li>
                                        <li><Link href="#careers" className="text-gray-300 hover:text-blue-400 transition">Careers</Link></li>
                                        <li><Link href="#contact" className="text-gray-300 hover:text-blue-400 transition">Contact</Link></li>
                                        <li><Link href="#blog" className="text-gray-300 hover:text-blue-400 transition">Blog</Link></li>
                                        <li><Link href="#partners" className="text-gray-300 hover:text-blue-400 transition">Partners</Link></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-6 text-blue-400">Legal</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="#privacy" className="text-gray-300 hover:text-blue-400 transition">Privacy Policy</Link></li>
                                        <li><Link href="#terms" className="text-gray-300 hover:text-blue-400 transition">Terms of Service</Link></li>
                                        <li><Link href="#security" className="text-gray-300 hover:text-blue-400 transition">Security</Link></li>
                                        <li><Link href="#compliance" className="text-gray-300 hover:text-blue-400 transition">Compliance</Link></li>
                                        <li><Link href="#gdpr" className="text-gray-300 hover:text-blue-400 transition">GDPR</Link></li>
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
                                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                                        <LockClosedIcon className="w-4 h-4 text-green-400" />
                                        <span>ISO 27001 Certified</span>
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