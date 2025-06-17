/**
 * DailyWorkFormCore Component
 * Core implementation of the construction work management form
 * 
 * @component DailyWorkFormCore
 * @version 1.0.0
 * 
 * Features:
 * - Advanced construction work entry with RFI generation
 * - Multi-section form layout with responsive design
 * - Real-time validation with construction-specific rules
 * - Glass morphism UI with professional aesthetics
 * - Accessibility compliance (WCAG 2.1 AA)
 * 
 * ISO Compliance:
 * - ISO 25010: Usability, accessibility, performance efficiency
 * - ISO 27001: Data input security, validation, audit trails
 * - ISO 9001: Process standardization, quality controls
 */

import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  MapPin, 
  Clock, 
  Tool, 
  Road,
  AlertTriangle,
  CheckCircle,
  Info,
  Layers
} from 'lucide-react';
import { FORM_CONFIG } from '../config';

/**
 * Animation configurations for smooth interactions
 */
const ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  section: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, delay: 0.1 }
  },
  field: {
    focus: { scale: 1.02, transition: { duration: 0.15 } },
    blur: { scale: 1, transition: { duration: 0.15 } }
  },
  error: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 }
  }
};

/**
 * Field component for individual form inputs
 */
const FormField = memo(({ 
  field, 
  value, 
  onChange, 
  onBlur,
  error, 
  warning,
  suggestion,
  disabled = false,
  required = false 
}) => {
  const fieldConfig = FORM_CONFIG.fields[field.name];
  const hasError = !!error;
  const hasWarning = !!warning;

  const getIcon = () => {
    const iconMap = {
      date: Calendar,
      rfi_number: FileText,
      location: MapPin,
      planned_time: Clock,
      type: Tool,
      side: Road,
      qty_layer: Layers
    };
    const IconComponent = iconMap[field.name] || Info;
    return <IconComponent size={20} />;
  };

  const getFieldElement = () => {
    switch (field.type) {
      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-200
              bg-white/70 backdrop-blur-sm focus:bg-white/90
              ${hasError 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : hasWarning 
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
            `}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={hasError}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-200
              bg-white/70 backdrop-blur-sm focus:bg-white/90
              ${hasError 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : hasWarning 
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
            `}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={hasError}
          >
            <option value="">{fieldConfig?.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            rows={3}
            placeholder={fieldConfig?.placeholder || field.placeholder}
            className={`
              w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-200
              bg-white/70 backdrop-blur-sm focus:bg-white/90 resize-y
              ${hasError 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : hasWarning 
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
            `}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={hasError}
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            placeholder={fieldConfig?.placeholder || field.placeholder}
            className={`
              w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-200
              bg-white/70 backdrop-blur-sm focus:bg-white/90
              ${hasError 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : hasWarning 
                  ? 'border-yellow-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
            `}
            aria-describedby={hasError ? `${field.name}-error` : undefined}
            aria-invalid={hasError}
          />
        );
    }
  };

  return (
    <motion.div
      className="space-y-2"
      variants={ANIMATIONS.field}
      whileFocus="focus"
      whileTap="focus"
    >
      <label 
        htmlFor={field.name}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {field.label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {fieldConfig?.description && (
          <span className="text-xs text-gray-500 block font-normal mt-1">
            {fieldConfig.description}
          </span>
        )}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {getIcon()}
        </div>
        {getFieldElement()}
      </div>

      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            key="error"
            variants={ANIMATIONS.error}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2 text-red-600 text-sm"
            id={`${field.name}-error`}
            role="alert"
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
        {hasWarning && !hasError && (
          <motion.div
            key="warning"
            variants={ANIMATIONS.error}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2 text-yellow-600 text-sm"
          >
            <AlertTriangle size={16} />
            <span>{warning}</span>
          </motion.div>
        )}
        {suggestion && !hasError && !hasWarning && (
          <motion.div
            key="suggestion"
            variants={ANIMATIONS.error}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2 text-blue-600 text-sm"
          >
            <Info size={16} />
            <span>{suggestion}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FormField.displayName = 'FormField';

FormField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    options: PropTypes.array
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  warning: PropTypes.string,
  suggestion: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool
};

/**
 * Section header component
 */
const SectionHeader = memo(({ section, isActive, onToggle, completionPercentage }) => (
  <motion.div
    className={`
      flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200
      ${isActive 
        ? 'bg-blue-50 border-2 border-blue-200' 
        : 'bg-white/50 border border-gray-200 hover:bg-white/70'
      }
    `}
    onClick={onToggle}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    <div className="flex items-center gap-3">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
      `}>
        {section.icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{section.title}</h3>
        <p className="text-sm text-gray-600">{section.description}</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className={`
          text-sm font-medium
          ${completionPercentage === 100 ? 'text-green-600' : 'text-gray-600'}
        `}>
          {completionPercentage}% Complete
        </div>
        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
          <div 
            className={`
              h-full rounded-full transition-all duration-300
              ${completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}
            `}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      {completionPercentage === 100 && (
        <CheckCircle className="text-green-500" size={20} />
      )}
    </div>
  </motion.div>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Main DailyWorkFormCore component
 */
const DailyWorkFormCore = memo(({
  formData = {},
  onChange,
  onBlur,
  validation = {},
  suggestions = {},
  disabled = false,
  layout = 'sections',
  showProgress = true,
  allowSectionToggle = true,
  className = '',
  testId = 'daily-work-form-core'
}) => {
  // Form sections configuration
  const sections = useMemo(() => [
    {
      id: 'rfi',
      title: 'RFI Information',
      description: 'Request for Information details',
      icon: <FileText size={20} />,
      fields: ['date', 'rfi_number']
    },
    {
      id: 'work_details',
      title: 'Work Details',
      description: 'Construction work specifications',
      icon: <Tool size={20} />,
      fields: ['type', 'location', 'description']
    },
    {
      id: 'planning',
      title: 'Planning & Time',
      description: 'Work planning and time estimation',
      icon: <Clock size={20} />,
      fields: ['planned_time']
    },
    {
      id: 'specifications',
      title: 'Specifications',
      description: 'Technical specifications and details',
      icon: <Layers size={20} />,
      fields: ['side', 'qty_layer']
    }
  ], []);

  // Active sections state
  const [activeSections, setActiveSections] = React.useState(
    layout === 'sections' ? { rfi: true } : 
    sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );

  // Calculate completion percentage for each section
  const getSectionCompletion = useCallback((section) => {
    const sectionFields = section.fields;
    const completedFields = sectionFields.filter(fieldName => {
      const value = formData[fieldName];
      return value !== undefined && value !== null && value !== '';
    });
    return Math.round((completedFields.length / sectionFields.length) * 100);
  }, [formData]);

  // Get form fields configuration
  const formFields = useMemo(() => {
    return Object.entries(FORM_CONFIG.fields).map(([name, config]) => ({
      name,
      label: config.label,
      type: config.type,
      placeholder: config.placeholder,
      required: config.required,
      options: config.options || []
    }));
  }, []);

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId) => {
    if (!allowSectionToggle) return;

    setActiveSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, [allowSectionToggle]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName, value) => {
    onChange?.(fieldName, value);
  }, [onChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName) => {
    onBlur?.(fieldName);
  }, [onBlur]);

  // Render section layout
  const renderSectionLayout = () => (
    <div className="space-y-6">
      {sections.map((section) => {
        const isActive = activeSections[section.id];
        const completionPercentage = getSectionCompletion(section);

        return (
          <motion.div
            key={section.id}
            variants={ANIMATIONS.section}
            initial="initial"
            animate="animate"
            className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
          >
            <SectionHeader
              section={section}
              isActive={isActive}
              onToggle={() => handleSectionToggle(section.id)}
              completionPercentage={completionPercentage}
            />

            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map(fieldName => {
                      const field = formFields.find(f => f.name === fieldName);
                      if (!field) return null;

                      return (
                        <FormField
                          key={field.name}
                          field={field}
                          value={formData[field.name]}
                          onChange={handleFieldChange}
                          onBlur={() => handleFieldBlur(field.name)}
                          error={validation.fieldErrors?.[field.name]}
                          warning={validation.fieldWarnings?.[field.name]}
                          suggestion={suggestions[field.name]}
                          disabled={disabled}
                          required={field.required}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );

  // Render grid layout
  const renderGridLayout = () => (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formFields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleFieldChange}
            onBlur={() => handleFieldBlur(field.name)}
            error={validation.fieldErrors?.[field.name]}
            warning={validation.fieldWarnings?.[field.name]}
            suggestion={suggestions[field.name]}
            disabled={disabled}
            required={field.required}
          />
        ))}
      </div>
    </div>
  );

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalFields = formFields.length;
    const completedFields = formFields.filter(field => {
      const value = formData[field.name];
      return value !== undefined && value !== null && value !== '';
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [formFields, formData]);

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={ANIMATIONS.container}
      initial="initial"
      animate="animate"
      exit="exit"
      data-testid={testId}
    >
      {showProgress && (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Form Progress</span>
            <span className="text-sm text-gray-600">{overallProgress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {layout === 'sections' ? renderSectionLayout() : renderGridLayout()}
    </motion.div>
  );
});

DailyWorkFormCore.displayName = 'DailyWorkFormCore';

DailyWorkFormCore.propTypes = {
  formData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  validation: PropTypes.shape({
    fieldErrors: PropTypes.object,
    fieldWarnings: PropTypes.object
  }),
  suggestions: PropTypes.object,
  disabled: PropTypes.bool,
  layout: PropTypes.oneOf(['sections', 'grid']),
  showProgress: PropTypes.bool,
  allowSectionToggle: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string
};

export default DailyWorkFormCore;
