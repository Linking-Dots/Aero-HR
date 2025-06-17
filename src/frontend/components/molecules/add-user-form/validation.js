import * as yup from 'yup';

/**
 * Validation Schema for AddUserForm
 * 
 * Comprehensive validation rules following business requirements
 * and security best practices.
 */

// Password validation schema
const passwordValidation = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// Email validation schema
const emailValidation = yup
  .string()
  .required('Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email must not exceed 100 characters');

// Phone validation schema
const phoneValidation = yup
  .string()
  .required('Phone number is required')
  .matches(
    /^[\+]?[1-9][\d]{0,15}$/,
    'Please enter a valid phone number'
  );

// Username validation schema
const usernameValidation = yup
  .string()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must not exceed 50 characters')
  .matches(
    /^[a-zA-Z0-9_.-]+$/,
    'Username can only contain letters, numbers, underscores, periods, and hyphens'
  );

// Employee ID validation schema
const employeeIdValidation = yup
  .string()
  .required('Employee ID is required')
  .max(20, 'Employee ID must not exceed 20 characters')
  .matches(
    /^[A-Z0-9-]+$/,
    'Employee ID can only contain uppercase letters, numbers, and hyphens'
  );

// Name validation schema
const nameValidation = yup
  .string()
  .required('Full name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .matches(
    /^[a-zA-Z\s.'-]+$/,
    'Name can only contain letters, spaces, periods, apostrophes, and hyphens'
  );

// Date validation helpers
const minAge = 16;
const maxEmploymentHistoryYears = 10;

export const addUserValidationSchema = yup.object().shape({
  // Personal Information
  name: nameValidation,
  
  user_name: usernameValidation,
  
  email: emailValidation,
  
  employee_id: employeeIdValidation,
  
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other', 'prefer-not-to-say'], 'Please select a valid gender'),
  
  birthday: yup
    .date()
    .nullable()
    .test('min-age', `Employee must be at least ${minAge} years old`, function(value) {
      if (!value) return true; // Optional field
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge;
      }
      return age >= minAge;
    })
    .max(new Date(), 'Date of birth cannot be in the future'),
  
  phone: phoneValidation,
  
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters'),

  // Employment Information
  date_of_joining: yup
    .date()
    .required('Date of joining is required')
    .min(
      new Date(new Date().getFullYear() - maxEmploymentHistoryYears, 0, 1),
      `Date of joining cannot be more than ${maxEmploymentHistoryYears} years ago`
    )
    .max(
      new Date(new Date().getFullYear() + 1, 11, 31),
      'Date of joining cannot be more than 1 year in the future'
    ),
  
  department: yup
    .string()
    .required('Department is required'),
  
  designation: yup
    .string()
    .required('Designation is required'),
  
  report_to: yup
    .string()
    .nullable(),

  // Security
  password: passwordValidation,
  
  confirmPassword: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password')], 'Passwords do not match'),

  // Profile Image (optional)
  profile_image: yup
    .mixed()
    .nullable()
    .test('fileSize', 'File size must be less than 5MB', function(value) {
      if (!value || !value.size) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Only JPEG and PNG images are allowed', function(value) {
      if (!value || !value.type) return true;
      return ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type);
    })
});

// Validation schema for edit mode (password optional)
export const editUserValidationSchema = yup.object().shape({
  // Personal Information
  name: nameValidation,
  
  user_name: usernameValidation,
  
  email: emailValidation,
  
  employee_id: employeeIdValidation,
  
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other', 'prefer-not-to-say'], 'Please select a valid gender'),
  
  birthday: yup
    .date()
    .nullable()
    .test('min-age', `Employee must be at least ${minAge} years old`, function(value) {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge;
      }
      return age >= minAge;
    })
    .max(new Date(), 'Date of birth cannot be in the future'),
  
  phone: phoneValidation,
  
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters'),

  // Employment Information
  date_of_joining: yup
    .date()
    .required('Date of joining is required')
    .min(
      new Date(new Date().getFullYear() - maxEmploymentHistoryYears, 0, 1),
      `Date of joining cannot be more than ${maxEmploymentHistoryYears} years ago`
    )
    .max(
      new Date(new Date().getFullYear() + 1, 11, 31),
      'Date of joining cannot be more than 1 year in the future'
    ),
  
  department: yup
    .string()
    .required('Department is required'),
  
  designation: yup
    .string()
    .required('Designation is required'),
  
  report_to: yup
    .string()
    .nullable(),

  // Security (optional in edit mode)
  password: yup
    .string()
    .when('password', {
      is: (value) => value && value.length > 0,
      then: passwordValidation,
      otherwise: yup.string().nullable()
    }),
  
  confirmPassword: yup
    .string()
    .when('password', {
      is: (value) => value && value.length > 0,
      then: yup
        .string()
        .required('Password confirmation is required')
        .oneOf([yup.ref('password')], 'Passwords do not match'),
      otherwise: yup.string().nullable()
    }),

  // Profile Image (optional)
  profile_image: yup
    .mixed()
    .nullable()
    .test('fileSize', 'File size must be less than 5MB', function(value) {
      if (!value || !value.size) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Only JPEG and PNG images are allowed', function(value) {
      if (!value || !value.type) return true;
      return ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type);
    })
});

// Async validation schemas for unique field checks
export const asyncValidationSchemas = {
  username: yup.object().shape({
    username: usernameValidation,
    id: yup.string().nullable() // For edit mode exclusion
  }),
  
  email: yup.object().shape({
    email: emailValidation,
    id: yup.string().nullable()
  }),
  
  employee_id: yup.object().shape({
    employee_id: employeeIdValidation,
    id: yup.string().nullable()
  })
};

// Business rule validation schemas
export const businessRuleValidations = {
  // Department-designation compatibility
  departmentDesignation: yup.object().shape({
    department: yup.string().required(),
    designation: yup.string().required()
  }),
  
  // Reporting structure validation
  reportingStructure: yup.object().shape({
    report_to: yup.string().nullable(),
    user_id: yup.string().nullable(),
    department: yup.string().required()
  })
};

export default addUserValidationSchema;
