import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from "@heroui/react";
import GlassCard from './GlassCard.jsx';

/**
 * Enhanced Glass Feature Card with animations and hover effects
 */
const GlassFeatureCard = ({ 
    icon, 
    title, 
    description, 
    highlights = [], 
    color = "from-blue-400 to-indigo-600",
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
            }}
            {...props}
        >
            <GlassCard className="p-8 h-full relative overflow-hidden group">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white flex-shrink-0`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
                            {highlights.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {highlights.map((highlight, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

/**
 * Glass Statistics Card with animated counter
 */
const GlassStatsCard = ({ 
    number, 
    label, 
    icon, 
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            {...props}
        >
            <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600">
                    {icon}
                </div>
                <motion.div 
                    className="text-3xl font-bold text-gray-900 mb-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: delay + 0.3 }}
                >
                    {number}
                </motion.div>
                <div className="text-sm text-gray-600">{label}</div>
            </GlassCard>
        </motion.div>
    );
};

/**
 * Glass Testimonial Card with user avatar
 */
const GlassTestimonialCard = ({ 
    content, 
    author, 
    role, 
    company, 
    avatar, 
    rating = 5,
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            {...props}
        >
            <GlassCard className="p-8 h-full">
                {/* Rating Stars */}
                <div className="flex justify-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                            key={i}
                            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                
                {/* Testimonial Content */}
                <blockquote className="text-lg text-gray-700 mb-6 text-center leading-relaxed">
                    "{content}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center justify-center space-x-4">
                    <img
                        src={avatar}
                        alt={author}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${author}&background=4F46E5&color=fff`;
                        }}
                    />
                    <div className="text-left">
                        <div className="font-semibold text-gray-900">{author}</div>
                        <div className="text-sm text-gray-600">{role}</div>
                        <div className="text-sm text-blue-600 font-medium">{company}</div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

/**
 * Glass Pricing Card with features list
 */
const GlassPricingCard = ({ 
    name, 
    description, 
    price, 
    period, 
    features = [], 
    popular = false, 
    cta, 
    onCTAClick,
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className={`relative ${popular ? 'scale-105' : ''}`}
            {...props}
        >
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                    </span>
                </div>
            )}
            
            <GlassCard 
                className={`p-8 h-full relative overflow-hidden transition-all duration-300 ${
                    popular ? 'border-2 border-blue-500/30' : 'hover:scale-105'
                }`}
            >
                {/* Plan Header */}
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
                    <p className="text-gray-600 mb-6">{description}</p>
                    
                    <div className="mb-6">
                        <div className="flex items-center justify-center">
                            <span className="text-4xl font-bold text-gray-900">${price}</span>
                            <span className="text-gray-600 ml-2">/{period}</span>
                        </div>
                    </div>

                    <button
                        onClick={onCTAClick}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                            popular 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' 
                                : 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                        }`}
                    >
                        {cta}
                    </button>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                            <svg 
                                className={`w-5 h-5 flex-shrink-0 ${
                                    feature.included ? 'text-green-500' : 'text-gray-300'
                                }`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                {feature.included ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                )}
                            </svg>
                            <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                                {feature.name}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export {
    GlassFeatureCard,
    GlassStatsCard,
    GlassTestimonialCard,
    GlassPricingCard
};
