import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

/**
 * useAddUserForm Hook
 * 
 * Main form state management hook for user creation/editing with:
 * - Form data management
 * - Step navigation
 * - Submission handling
 * - Progress tracking
 * - Error handling
 * - Business rule enforcement
 */
const useAddUserForm = ({
  user = null,
  mode = 'create',
  config,
  onSuccess,
  onError
}) => {
  // Initialize form data
  const initialData = useMemo(() => {
    if (mode === 'edit' && user) {
      return {
        id: user.id,
        name: user.name || '',
        user_name: user.user_name || '',
        email: user.email || '',
        employee_id: user.employee_id || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_joining: user.date_of_joining || '',
        department: user.department || '',
        designation: user.designation || '',
        report_to: user.report_to || '',
        password: '',
        confirmPassword: '',
        profile_image: null
      };
    }

    return {
      name: '',
      user_name: '',
      email: '',
      employee_id: '',
      gender: '',
      birthday: '',
      phone: '',
      address: '',
      date_of_joining: '',
      department: '',
      designation: '',
      report_to: '',
      password: '',
      confirmPassword: '',
      profile_image: null
    };
  }, [user, mode]);

  // Form state
  const [formData, setFormData] = useState(initialData);
  const [originalData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Form configuration
  const totalSteps = Object.keys(config.sections).length;
  const progress = Math.round((currentStep / totalSteps) * 100);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return Object.keys(formData).some(key => {
      if (key === 'password' || key === 'confirmPassword') {
        return Boolean(formData[key]); // Password fields count as change if not empty
      }
      return formData[key] !== originalData[key];
    });
  }, [formData, originalData]);

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    const sectionKeys = Object.keys(config.sections);
    const currentSection = sectionKeys[currentStep - 1];
    const sectionFields = Object.keys(config.fields).filter(
      field => config.fields[field].section === currentSection
    );

    const stepErrors = {};
    let isValid = true;

    for (const field of sectionFields) {
      const fieldConfig = config.fields[field];
      const value = formData[field];

      // Check required fields
      if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        stepErrors[field] = { message: `${fieldConfig.label} is required` };
        isValid = false;
      }

      // Validate field format
      if (value && fieldConfig.validation?.pattern) {
        if (!fieldConfig.validation.pattern.test(value)) {
          stepErrors[field] = { message: fieldConfig.validation.message };
          isValid = false;
        }
      }

      // Check password confirmation
      if (field === 'confirmPassword' && formData.password !== formData.confirmPassword) {
        stepErrors[field] = { message: 'Passwords do not match' };
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  }, [currentStep, formData, config]);

  // Check if can proceed to next step
  const canProceedToNext = useMemo(() => {
    const sectionKeys = Object.keys(config.sections);
    const currentSection = sectionKeys[currentStep - 1];
    const sectionFields = Object.keys(config.fields).filter(
      field => config.fields[field].section === currentSection
    );

    return sectionFields.every(field => {
      const fieldConfig = config.fields[field];
      const value = formData[field];
      const hasError = Boolean(errors[field]);

      // Check if required field is filled
      if (fieldConfig.required) {
        return !hasError && value && value.toString().trim() !== '';
      }

      // Check if optional field has no errors (if filled)
      return !hasError;
    });
  }, [currentStep, formData, errors, config]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Handle dependent field logic
    if (fieldName === 'department') {
      // Reset designation when department changes
      setFormData(prev => ({
        ...prev,
        designation: ''
      }));
    }
  }, [errors]);

  // Navigation functions
  const goToNextStep = useCallback(async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Validate entire form
  const validateForm = useCallback(async (data = formData) => {
    const formErrors = {};

    // Validate all fields
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      const value = data[fieldName];

      // Required field validation
      if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        formErrors[fieldName] = { message: `${fieldConfig.label} is required` };
        continue;
      }

      // Pattern validation
      if (value && fieldConfig.validation?.pattern) {
        if (!fieldConfig.validation.pattern.test(value)) {
          formErrors[fieldName] = { message: fieldConfig.validation.message };
        }
      }

      // Length validation
      if (value && fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
        formErrors[fieldName] = { 
          message: `${fieldConfig.label} must not exceed ${fieldConfig.maxLength} characters` 
        };
      }

      // Email validation
      if (fieldName === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          formErrors[fieldName] = { message: 'Please enter a valid email address' };
        }
      }

      // Phone validation
      if (fieldName === 'phone' && value) {
        const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phonePattern.test(value)) {
          formErrors[fieldName] = { message: 'Please enter a valid phone number' };
        }
      }

      // Password validation
      if (fieldName === 'password' && value) {
        if (value.length < 8) {
          formErrors[fieldName] = { message: 'Password must be at least 8 characters' };
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          formErrors[fieldName] = { 
            message: 'Password must contain uppercase, lowercase, number, and special character' 
          };
        }
      }

      // Confirm password validation
      if (fieldName === 'confirmPassword' && (value || data.password)) {
        if (value !== data.password) {
          formErrors[fieldName] = { message: 'Passwords do not match' };
        }
      }

      // Date validation
      if (fieldConfig.type === 'date' && value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          formErrors[fieldName] = { message: 'Please enter a valid date' };
        }

        // Age validation for birthday
        if (fieldName === 'birthday') {
          const age = new Date().getFullYear() - date.getFullYear();
          if (age < 16) {
            formErrors[fieldName] = { message: 'Employee must be at least 16 years old' };
          }
        }
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData, config.fields]);

  // Handle form submission
  const handleSubmit = useCallback(async (data = formData) => {
    setIsSubmitting(true);
    
    try {
      // Validate form
      const isValid = await validateForm(data);
      if (!isValid) {
        throw new Error('Form validation failed');
      }

      // Prepare form data for submission
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (key === 'profile_image' && data[key] instanceof File) {
          submitData.append('profile_image', data[key]);
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          submitData.append(key, data[key]);
        }
      });

      // Add mode for backend processing
      submitData.append('_mode', mode);
      if (mode === 'edit' && user?.id) {
        submitData.append('_method', 'PUT');
      }

      // Make API request
      const endpoint = mode === 'edit' 
        ? route('updateUser', user.id)
        : route('addUser');

      const response = await axios.post(endpoint, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        // Success
        onSuccess?.(response.data);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to save user');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      
      if (error.response?.status === 422) {
        // Validation errors from server
        setErrors(error.response.data.errors || {});
        toast.error('Please fix the validation errors and try again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while saving the user. Please try again.');
      }
      
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, user, validateForm, onSuccess, onError]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setCurrentStep(1);
    setIsLoading(false);
    setIsSubmitting(false);
  }, [initialData]);

  return {
    // Form state
    formData,
    originalData,
    isLoading,
    isSubmitting,
    errors,
    touched,
    hasChanges,

    // Step navigation
    currentStep,
    totalSteps,
    progress,
    canProceedToNext,

    // Actions
    handleFieldChange,
    handleSubmit,
    validateForm,
    validateCurrentStep,
    resetForm,
    goToNextStep,
    goToPreviousStep,

    // Setters (for advanced usage)
    setFormData,
    setErrors,
    setIsLoading,
    setCurrentStep
  };
};

export default useAddUserForm;
