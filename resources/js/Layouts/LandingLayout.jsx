import React from 'react';
import { Link } from '@inertiajs/react';
import { Button, Divider } from "@heroui/react";
import { 
    CubeTransparentIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';
import { motion } from 'framer-motion';

const LandingLayout = ({ children, currentPage = 'home' }) => {
    const navigation = [
        { name: 'Features', href: '/features', key: 'features' },
        { name: 'Pricing', href: '/landing-pricing', key: 'pricing' },
        { name: 'Integrations', href: '/#integrations', key: 'integrations' },
        { name: 'About', href: '/#about', key: 'about' }
    ];

    return (
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
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <CubeTransparentIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Aero-HR Enterprise
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-6">
                                {navigation.map((item) => (
                                    <Link 
                                        key={item.key}
                                        href={item.href} 
                                        className={`transition-colors ${
                                            currentPage === item.key 
                                                ? 'text-blue-600 font-medium' 
                                                : 'text-gray-700 hover:text-blue-600'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
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

            {/* Main Content */}
            <main>
                {children}
            </main>

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
                                <li><Link href="/#integrations" className="text-gray-300 hover:text-blue-400 transition">Integrations</Link></li>
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
    );
};

export default LandingLayout;
