/**
 * Multi-Tenant Enterprise Suite Marketing Content Configuration
 * Structured for easy localization and content management
 */

export const MARKETING_CONTENT = {
    // Multi-language support structure
    languages: {
        en: 'English',
        es: 'Español',
        fr: 'Français',
        de: 'Deutsch',
        zh: '中文',
        ja: '日本語'
    },

    // Brand configuration
    brand: {
        name: 'Aero-HR Enterprise',
        tagline: 'The Complete Multi-Tenant HR Suite',
        description: 'Empower thousands of organizations with our scalable, secure, and intelligent multi-tenant HR platform designed for enterprise excellence.',
        logo: '/assets/images/logo.png',
        primaryColor: '#3B82F6',
        secondaryColor: '#6366F1'
    },

    // Hero section content
    hero: {
        en: {
            badge: 'Enterprise Multi-Tenant HR Suite',
            title: 'Transform Your Enterprise',
            highlight: 'HR Operations',
            subtitle: 'Empower thousands of organizations with our scalable, secure, and intelligent multi-tenant HR platform designed for enterprise excellence.',
            cta_primary: 'Start Enterprise Trial',
            cta_secondary: 'Schedule Demo',
            features: [
                {
                    icon: 'BuildingOffice2Icon',
                    title: 'Multi-Tenant Architecture',
                    description: 'Secure isolation for unlimited organizations'
                },
                {
                    icon: 'ShieldCheckIcon',
                    title: 'Enterprise Security',
                    description: 'SOC 2 compliant with advanced encryption'
                },
                {
                    icon: 'ChartBarIcon',
                    title: 'Advanced Analytics',
                    description: 'AI-powered insights and predictive analytics'
                },
                {
                    icon: 'CogIcon',
                    title: 'Seamless Integration',
                    description: 'Connect with 200+ enterprise tools'
                }
            ]
        }
    },

    // Enterprise features
    enterpriseFeatures: {
        en: {
            title: 'Enterprise-Grade Features',
            subtitle: 'Built for scale, security, and seamless multi-tenant operations',
            features: [
                {
                    id: 'tenant-management',
                    icon: 'UserGroupIcon',
                    title: 'Tenant Management Panel',
                    description: 'Comprehensive dashboard for managing multiple organizations, users, and permissions with granular control.',
                    color: 'from-blue-400 to-cyan-400',
                    highlights: ['Unlimited Organizations', 'Role-Based Access', 'Custom Branding'],
                    benefits: [
                        'Centralized organization management',
                        'Automated provisioning and deprovisioning',
                        'Custom domain and branding support',
                        'Hierarchical organization structures'
                    ]
                },
                {
                    id: 'rbac',
                    icon: 'LockClosedIcon',
                    title: 'Role-Based Access Control',
                    description: 'Enterprise-grade permission matrix with custom roles, hierarchical access, and audit trails.',
                    color: 'from-purple-400 to-pink-400',
                    highlights: ['Custom Roles', 'Audit Trails', 'SSO Integration'],
                    benefits: [
                        'Granular permission controls',
                        'Custom role definitions',
                        'Comprehensive audit logging',
                        'Single Sign-On integration'
                    ]
                },
                {
                    id: 'analytics',
                    icon: 'ChartBarIcon',
                    title: 'Analytics & Insights',
                    description: 'AI-powered analytics with predictive insights, custom reports, and real-time dashboards.',
                    color: 'from-green-400 to-emerald-400',
                    highlights: ['Predictive Analytics', 'Custom Reports', 'Real-time Data'],
                    benefits: [
                        'AI-powered workforce insights',
                        'Predictive turnover analysis',
                        'Custom KPI dashboards',
                        'Real-time performance metrics'
                    ]
                },
                {
                    id: 'integrations',
                    icon: 'GlobeAltIcon',
                    title: 'Global Integrations',
                    description: 'Connect seamlessly with 200+ enterprise tools including ERP, HRIS, and communication platforms.',
                    color: 'from-orange-400 to-red-400',
                    highlights: ['200+ Integrations', 'API Access', 'Webhook Support'],
                    benefits: [
                        'Pre-built enterprise connectors',
                        'RESTful API with full documentation',
                        'Real-time webhook notifications',
                        'Custom integration support'
                    ]
                }
            ]
        }
    },

    // Testimonials
    testimonials: {
        en: [
            {
                id: 1,
                name: 'Sarah Chen',
                role: 'Head of HR Operations',
                company: 'TechCorp Global',
                content: "Aero-HR's multi-tenant architecture allowed us to manage 15+ subsidiaries seamlessly. The glassmorphism interface is intuitive and professional.",
                avatar: 'https://i.pravatar.cc/150?img=1',
                rating: 5,
                stats: {
                    employees: '5,000+',
                    subsidiaries: '15',
                    timeToValue: '2 weeks'
                }
            },
            {
                id: 2,
                name: 'Marcus Rodriguez',
                role: 'Chief People Officer',
                company: 'Enterprise Solutions Inc.',
                content: 'The enterprise-grade security and role-based access controls give us complete confidence in managing sensitive HR data across multiple tenants.',
                avatar: 'https://i.pravatar.cc/150?img=2',
                rating: 5,
                stats: {
                    employees: '12,000+',
                    countries: '25',
                    compliance: '100%'
                }
            },
            {
                id: 3,
                name: 'Dr. Lisa Wang',
                role: 'VP Human Resources',
                company: 'Global Innovations',
                content: 'Implementation was seamless, and the analytics dashboard provides insights we never had before. ROI was evident within the first quarter.',
                avatar: 'https://i.pravatar.cc/150?img=3',
                rating: 5,
                stats: {
                    roi: '320%',
                    timeToImplement: '3 weeks',
                    efficiency: '45% increase'
                }
            }
        ]
    },

    // Pricing plans
    pricing: {
        en: {
            title: 'Choose Your Enterprise Plan',
            subtitle: 'Scalable, transparent pricing designed for organizations of all sizes',
            billing_toggle: {
                monthly: 'Monthly',
                annual: 'Annual',
                save_badge: 'Save 20%'
            },
            plans: [
                {
                    id: 'starter',
                    name: 'Starter',
                    description: 'Perfect for small organizations getting started',
                    monthlyPrice: 29,
                    annualPrice: 290,
                    color: 'from-gray-400 to-gray-600',
                    popular: false,
                    target: 'Small Teams',
                    employeeLimit: '50',
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
                    annualPrice: 790,
                    color: 'from-blue-400 to-indigo-600',
                    popular: true,
                    target: 'Growing Companies',
                    employeeLimit: '500',
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
                    annualPrice: 1490,
                    color: 'from-purple-400 to-pink-600',
                    popular: false,
                    target: 'Enterprise',
                    employeeLimit: 'Unlimited',
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
            ]
        }
    },

    // Integration partners
    integrations: {
        categories: [
            {
                name: 'Identity & Access',
                partners: [
                    { name: 'Microsoft Azure AD', logo: '/assets/images/partners/azure-ad.png' },
                    { name: 'Okta', logo: '/assets/images/partners/okta.png' },
                    { name: 'Auth0', logo: '/assets/images/partners/auth0.png' }
                ]
            },
            {
                name: 'Productivity & Communication',
                partners: [
                    { name: 'Microsoft 365', logo: '/assets/images/partners/microsoft-365.png' },
                    { name: 'Google Workspace', logo: '/assets/images/partners/google-workspace.png' },
                    { name: 'Slack', logo: '/assets/images/partners/slack.png' },
                    { name: 'Zoom', logo: '/assets/images/partners/zoom.png' }
                ]
            },
            {
                name: 'ERP & Finance',
                partners: [
                    { name: 'SAP', logo: '/assets/images/partners/sap.png' },
                    { name: 'Oracle', logo: '/assets/images/partners/oracle.png' },
                    { name: 'NetSuite', logo: '/assets/images/partners/netsuite.png' },
                    { name: 'Salesforce', logo: '/assets/images/partners/salesforce.png' }
                ]
            }
        ]
    },

    // FAQs
    faqs: {
        en: [
            {
                category: 'Multi-Tenant Architecture',
                questions: [
                    {
                        question: 'What is multi-tenant architecture?',
                        answer: 'Multi-tenant architecture allows multiple organizations to use the same application while keeping their data completely isolated and secure. Each tenant has their own dedicated space with customizable settings, ensuring data privacy and allowing for organization-specific configurations.'
                    },
                    {
                        question: 'How is data isolated between tenants?',
                        answer: 'We implement tenant isolation at multiple levels: database-level separation, application-level security, and network-level controls. Each tenant\'s data is encrypted with unique keys and stored in isolated environments.'
                    }
                ]
            },
            {
                category: 'Security & Compliance',
                questions: [
                    {
                        question: 'What security certifications do you have?',
                        answer: 'We are SOC 2 Type II compliant and ISO 27001 certified. We also maintain GDPR compliance and regularly undergo third-party security audits to ensure the highest level of data protection.'
                    },
                    {
                        question: 'How do you handle data encryption?',
                        answer: 'All data is encrypted both in transit and at rest using industry-standard encryption (AES-256). We also implement end-to-end encryption for sensitive data and use separate encryption keys for each tenant.'
                    }
                ]
            },
            {
                category: 'Implementation & Support',
                questions: [
                    {
                        question: 'How long does implementation take?',
                        answer: 'Standard implementation takes 2-4 weeks depending on complexity. Our dedicated implementation team works with you to ensure a smooth transition with minimal disruption to your operations.'
                    },
                    {
                        question: 'What level of support do you provide?',
                        answer: 'We provide tiered support based on your plan: email support for Starter, priority support for Professional, and 24/7 premium support with dedicated account managers for Enterprise customers.'
                    }
                ]
            }
        ]
    },

    // Call-to-action messages
    ctas: {
        en: {
            primary: {
                title: 'Ready to Transform Your Enterprise HR?',
                subtitle: 'Join thousands of organizations already using Aero-HR to manage their multi-tenant workforce efficiently and securely.',
                benefits: [
                    '30-day free trial',
                    'No credit card required',
                    'Setup in 24 hours'
                ]
            },
            contact: {
                title: 'Need a Custom Enterprise Solution?',
                subtitle: 'Our team is ready to discuss custom pricing, implementation, and enterprise features tailored to your organization.',
                benefits: [
                    'Custom pricing available',
                    'Dedicated implementation',
                    '24/7 enterprise support'
                ]
            }
        }
    }
};

// Helper functions for content management
export const getContent = (section, language = 'en') => {
    return MARKETING_CONTENT[section]?.[language] || MARKETING_CONTENT[section]?.en || {};
};

export const getLocalizedContent = (section, key, language = 'en') => {
    const content = getContent(section, language);
    return content[key] || '';
};

export const getBrandInfo = () => {
    return MARKETING_CONTENT.brand;
};

export default MARKETING_CONTENT;
