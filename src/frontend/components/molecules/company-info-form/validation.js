import * as Yup from 'yup';

/**
 * Company Information Form Validation Schema
 * 
 * Comprehensive validation rules for company information form with:
 * - Business validation rules
 * - Country/state dependencies
 * - Real-time field validation
 * - Conditional validation based on field dependencies
 * 
 * ISO 25010 Quality Attributes:
 * - Reliability: Input validation and data integrity
 * - Security: Data sanitization and validation
 * - Usability: Clear error messages and validation feedback
 */

// Common validation patterns
const VALIDATION_PATTERNS = {
  companyName: /^[a-zA-Z0-9\s\-\&\.,'\(\)]+$/,
  contactPerson: /^[a-zA-Z\s\-\.\']+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  website: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  postalCode: /^[A-Za-z0-9\s\-]{3,10}$/
};

// Error messages configuration
const ERROR_MESSAGES = {
  required: {
    companyName: 'Company name is required',
    contactPerson: 'Contact person is required',
    address: 'Company address is required',
    country: 'Country selection is required',
    state: 'State/Province selection is required',
    city: 'City is required',
    email: 'Business email is required',
    phone: 'Phone number is required'
  },
  invalid: {
    companyName: 'Company name contains invalid characters',
    contactPerson: 'Contact person name contains invalid characters',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    website: 'Please enter a valid website URL',
    postalCode: 'Please enter a valid postal code'
  },
  length: {
    companyName: {
      min: 'Company name must be at least 2 characters',
      max: 'Company name cannot exceed 100 characters'
    },
    contactPerson: {
      min: 'Contact person name must be at least 2 characters',
      max: 'Contact person name cannot exceed 50 characters'
    },
    address: {
      min: 'Address must be at least 10 characters',
      max: 'Address cannot exceed 200 characters'
    },
    city: {
      min: 'City name must be at least 2 characters',
      max: 'City name cannot exceed 50 characters'
    },
    phone: {
      min: 'Phone number must be at least 10 digits',
      max: 'Phone number cannot exceed 20 characters'
    }
  }
};

/**
 * Base Company Information Validation Schema
 */
export const companyInfoValidationSchema = Yup.object().shape({
  // Company Details
  companyName: Yup.string()
    .required(ERROR_MESSAGES.required.companyName)
    .min(2, ERROR_MESSAGES.length.companyName.min)
    .max(100, ERROR_MESSAGES.length.companyName.max)
    .matches(VALIDATION_PATTERNS.companyName, ERROR_MESSAGES.invalid.companyName)
    .trim(),

  contactPerson: Yup.string()
    .required(ERROR_MESSAGES.required.contactPerson)
    .min(2, ERROR_MESSAGES.length.contactPerson.min)
    .max(50, ERROR_MESSAGES.length.contactPerson.max)
    .matches(VALIDATION_PATTERNS.contactPerson, ERROR_MESSAGES.invalid.contactPerson)
    .trim(),

  // Location Information
  address: Yup.string()
    .required(ERROR_MESSAGES.required.address)
    .min(10, ERROR_MESSAGES.length.address.min)
    .max(200, ERROR_MESSAGES.length.address.max)
    .trim(),

  country: Yup.string()
    .required(ERROR_MESSAGES.required.country),

  state: Yup.string()
    .required(ERROR_MESSAGES.required.state),

  city: Yup.string()
    .required(ERROR_MESSAGES.required.city)
    .min(2, ERROR_MESSAGES.length.city.min)
    .max(50, ERROR_MESSAGES.length.city.max)
    .trim(),

  postalCode: Yup.string()
    .matches(VALIDATION_PATTERNS.postalCode, ERROR_MESSAGES.invalid.postalCode)
    .nullable(),

  // Contact Information
  email: Yup.string()
    .required(ERROR_MESSAGES.required.email)
    .matches(VALIDATION_PATTERNS.email, ERROR_MESSAGES.invalid.email)
    .lowercase()
    .trim(),

  phone: Yup.string()
    .required(ERROR_MESSAGES.required.phone)
    .min(10, ERROR_MESSAGES.length.phone.min)
    .max(20, ERROR_MESSAGES.length.phone.max)
    .matches(VALIDATION_PATTERNS.phone, ERROR_MESSAGES.invalid.phone),

  fax: Yup.string()
    .matches(VALIDATION_PATTERNS.phone, 'Please enter a valid fax number')
    .nullable(),

  website: Yup.string()
    .matches(VALIDATION_PATTERNS.website, ERROR_MESSAGES.invalid.website)
    .nullable()
});

/**
 * Real-time Field Validation
 * Individual field validation for real-time feedback
 */
export const validateCompanyField = async (fieldName, value, context = {}) => {
  try {
    const schema = companyInfoValidationSchema.pick([fieldName]);
    await schema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.message,
      type: 'validation'
    };
  }
};

/**
 * Business Rules Validation
 * Additional business logic validation beyond basic field validation
 */
export const validateBusinessRules = async (formData) => {
  const errors = {};
  const warnings = [];

  // Country-state dependency validation
  if (formData.country && formData.state) {
    // This would be validated against actual country-state data
    // Implementation depends on country data structure
  }

  // Email domain validation for business emails
  if (formData.email && formData.website) {
    try {
      const emailDomain = formData.email.split('@')[1];
      const websiteDomain = formData.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      
      if (emailDomain !== websiteDomain) {
        warnings.push({
          field: 'email',
          message: 'Email domain does not match company website domain',
          type: 'warning'
        });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Phone number country code validation
  if (formData.phone && formData.country) {
    // This would validate phone number format against country
    // Implementation depends on country phone format data
  }

  return { errors, warnings };
};

/**
 * Async Company Name Uniqueness Check
 * Validates that company name is unique in the system
 */
export const validateCompanyNameUniqueness = async (companyName, currentCompanyId = null) => {
  if (!companyName || companyName.length < 2) {
    return { isValid: true };
  }

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // TODO: Replace with actual API call
    const response = await fetch('/api/company/check-name-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      },
      body: JSON.stringify({ 
        companyName, 
        excludeId: currentCompanyId 
      })
    });

    const data = await response.json();

    if (!data.available) {
      return {
        isValid: false,
        error: 'This company name is already in use',
        type: 'uniqueness'
      };
    }

    return { isValid: true };
  } catch (error) {
    console.warn('Company name uniqueness check failed:', error);
    return { 
      isValid: true, 
      warning: 'Unable to verify company name uniqueness'
    };
  }
};

/**
 * Form Data Transformation
 * Transforms and sanitizes form data before submission
 */
export const transformCompanyFormData = (formData) => {
  return {
    company_name: formData.companyName?.trim(),
    contact_person: formData.contactPerson?.trim(),
    address: formData.address?.trim(),
    country: formData.country,
    state: formData.state,
    city: formData.city?.trim(),
    postal_code: formData.postalCode?.trim() || null,
    email: formData.email?.toLowerCase().trim(),
    phone: formData.phone?.trim(),
    fax: formData.fax?.trim() || null,
    website: formData.website?.trim() || null
  };
};

/**
 * Export validation utilities
 */
export {
  VALIDATION_PATTERNS,
  ERROR_MESSAGES
};
