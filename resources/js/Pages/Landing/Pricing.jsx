import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Button, Card, CardBody, Divider, Chip, Switch } from "@heroui/react";
import { motion } from 'framer-motion';
import { HeroUIProvider } from "@heroui/react";
import { 
    CheckCircleIcon,
    XMarkIcon,
    StarIcon,
    CubeTransparentIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    CogIcon,
    ArrowRightIcon,
    QuestionMarkCircleIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';

export default function Pricing({ title }) {
    const [isAnnual, setIsAnnual] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState('enterprise');

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for small organizations getting started',
            monthlyPrice: 29,
            annualPrice: 290, // 2 months free
            color: 'from-gray-400 to-gray-600',
            popular: false,
            features: [
                { name: 'Up to 50 employees', included: true },
                { name: 'Basic tenant management', included: true },
                { name: 'Standard reporting', included: true },
                { name: 'Email support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'Advanced analytics', included: false },
                { name: 'Custom integrations', included: false },
                { name: 'Priority support', included: false },
                { name: 'Custom branding', included: false },
                { name: 'API access', included: false }
            ],
            cta: 'Start Free Trial'
        },
        {
            id: 'professional',
            name: 'Professional',
            description: 'Ideal for growing organizations with multiple departments',
            monthlyPrice: 79,
            annualPrice: 790, // 2 months free
            color: 'from-blue-400 to-indigo-600',
            popular: true,
            features: [
                { name: 'Up to 500 employees', included: true },
                { name: 'Advanced tenant management', included: true },
                { name: 'Advanced reporting & analytics', included: true },
                { name: 'Priority support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'Basic integrations', included: true },
                { name: 'Custom workflows', included: true },
                { name: 'Custom branding', included: false },
                { name: 'API access', included: false },
                { name: 'Dedicated account manager', included: false }
            ],
            cta: 'Start Free Trial'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Complete solution for large organizations and enterprises',
            monthlyPrice: 149,
            annualPrice: 1490, // 2 months free
            color: 'from-purple-400 to-pink-600',
            popular: false,
            features: [
                { name: 'Unlimited employees', included: true },
                { name: 'Full multi-tenant architecture', included: true },
                { name: 'Advanced analytics & AI insights', included: true },
                { name: '24/7 premium support', included: true },
                { name: 'Mobile app access', included: true },
                { name: 'All integrations', included: true },
                { name: 'Custom workflows & automation', included: true },
                { name: 'Full custom branding', included: true },
                { name: 'Full API access', included: true },
                { name: 'Dedicated account manager', included: true }
            ],
            cta: 'Contact Sales'
        }
    ];

    const faqs = [
        {
            question: 'What is multi-tenant architecture?',
            answer: 'Multi-tenant architecture allows multiple organizations to use the same application while keeping their data completely isolated and secure. Each tenant has their own dedicated space with customizable settings.'
        },
        {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can change your plan at any time. When upgrading, changes take effect immediately. When downgrading, changes take effect at your next billing cycle.'
        },
        {
            question: 'Is there a free trial available?',
            answer: 'Yes, we offer a 30-day free trial for all plans. No credit card required to start your trial.'
        },
        {
            question: 'What kind of support do you provide?',
            answer: 'We provide email support for Starter plans, priority support for Professional plans, and 24/7 premium support with dedicated account managers for Enterprise plans.'
        },
        {
            question: 'How secure is my data?',
            answer: 'We take security seriously with SOC 2 compliance, ISO 27001 certification, end-to-end encryption, and regular security audits. Your data is hosted in enterprise-grade data centers.'
        }
    ];

    const additionalFeatures = [
        {
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            title: 'Enterprise Security',
            description: 'SOC 2 & ISO 27001 compliant with advanced encryption'
        },
        {
            icon: <ChartBarIcon className="w-8 h-8" />,
            title: 'Advanced Analytics',
            description: 'AI-powered insights and predictive analytics'
        },
        {
            icon: <CogIcon className="w-8 h-8" />,
            title: 'Custom Integrations',
            description: 'Connect with 200+ enterprise tools and custom APIs'
        },
        {
            icon: <UserGroupIcon className="w-8 h-8" />,
            title: 'Dedicated Support',
            description: '24/7 support with dedicated account managers'
        }
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
                                        <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</Link>
                                        <Link href="/landing-pricing" className="text-blue-600 font-medium">Pricing</Link>
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
                        <div className="max-w-7xl mx-auto text-center">
                            <motion.div
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
                                    Enterprise Pricing
                                </Chip>
                                <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Choose Your Enterprise Plan
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                    Scalable, transparent pricing designed for organizations of all sizes. Start your transformation today.
                                </p>

                                {/* Billing Toggle */}
                                <div className="flex items-center justify-center space-x-4 mb-12">
                                    <span className={`text-lg ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        Monthly
                                    </span>
                                    <Switch
                                        isSelected={isAnnual}
                                        onValueChange={setIsAnnual}
                                        color="primary"
                                        size="lg"
                                    />
                                    <span className={`text-lg ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        Annual
                                    </span>
                                    <Chip
                                        variant="flat"
                                        color="success"
                                        size="sm"
                                        className="ml-2 bg-green-100 text-green-700"
                                    >
                                        Save 20%
                                    </Chip>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Pricing Cards */}
                    <section className="pb-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-3 gap-8">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="relative"
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                                <Chip
                                                    variant="solid"
                                                    color="warning"
                                                    startContent={<StarIcon className="w-4 h-4" />}
                                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold"
                                                >
                                                    Most Popular
                                                </Chip>
                                            </div>
                                        )}
                                        
                                        <GlassCard 
                                            className={`p-8 h-full relative overflow-hidden transition-all duration-300 ${
                                                plan.popular ? 'scale-105 border-2 border-blue-500/30' : 'hover:scale-105'
                                            }`}
                                        >
                                            {/* Plan Header */}
                                            <div className="text-center mb-8">
                                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                                    <BuildingOffice2Icon className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                                <p className="text-gray-600 mb-6">{plan.description}</p>
                                                
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-center">
                                                        <span className="text-4xl font-bold text-gray-900">
                                                            ${isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                                                        </span>
                                                        <span className="text-gray-600 ml-2">/month</span>
                                                    </div>
                                                    {isAnnual && (
                                                        <div className="text-sm text-green-600 mt-1">
                                                            Save ${(plan.monthlyPrice * 12) - plan.annualPrice} annually
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    as={Link}
                                                    href={plan.id === 'enterprise' ? '#contact' : '/register'}
                                                    color={plan.popular ? 'primary' : 'default'}
                                                    variant={plan.popular ? 'solid' : 'bordered'}
                                                    className={`w-full font-semibold ${
                                                        plan.popular 
                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                                                            : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                                                    }`}
                                                    size="lg"
                                                >
                                                    {plan.cta}
                                                </Button>
                                            </div>

                                            {/* Features List */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                                                {plan.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center space-x-3">
                                                        {feature.included ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <XMarkIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                                        )}
                                                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                                                            {feature.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Additional Features */}
                    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Enterprise-Grade Features
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Every plan includes these powerful enterprise features
                                </p>
                            </motion.div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {additionalFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <GlassCard className="p-6 text-center h-full">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600">
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                            <p className="text-gray-600 text-sm">{feature.description}</p>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="py-20 px-6">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Got questions? We've got answers.
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                {faqs.map((faq, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <GlassCard className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact Sales CTA */}
                    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                                    Need a Custom Enterprise Solution?
                                </h2>
                                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                                    Our team is ready to discuss custom pricing, implementation, and enterprise features tailored to your organization.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Button
                                        size="lg"
                                        color="warning"
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-8 py-3"
                                        startContent={<PhoneIcon className="w-5 h-5" />}
                                    >
                                        Schedule a Call
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="bordered"
                                        className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
                                        startContent={<EnvelopeIcon className="w-5 h-5" />}
                                    >
                                        Contact Sales
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center mt-8 space-x-6 text-blue-100">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">Custom pricing available</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">Dedicated implementation</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">24/7 enterprise support</span>
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
