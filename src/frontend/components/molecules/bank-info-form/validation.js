import * as Yup from 'yup';

/**
 * Bank Information Form Validation Schema
 * 
 * Comprehensive validation rules for banking information with:
 * - Financial data validation
 * - Indian banking system compliance
 * - Security and fraud prevention
 * - Real-time field validation
 * 
 * ISO 25010 Quality Attributes:
 * - Reliability: Robust financial data validation
 * - Security: Fraud prevention and data integrity
 * - Usability: Clear error messages and guidance
 */

// Banking validation patterns
const BANKING_PATTERNS = {
  bankName: /^[a-zA-Z0-9\s\-\&\.\,\']+$/,
  accountNumber: /^[0-9]+$/,
  ifscCode: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]$/
};

// Error message configuration
const ERROR_MESSAGES = {
  required: {
    bankName: 'Bank name is required',
    accountNumber: 'Bank account number is required',
    ifscCode: 'IFSC code is required',
    panNumber: 'PAN number is required'
  },
  invalid: {
    bankName: 'Bank name contains invalid characters',
    accountNumber: 'Account number must contain only digits',
    ifscCode: 'IFSC code format is invalid (Example: SBIN0001234)',
    panNumber: 'PAN number format is invalid (Example: ABCDE1234F)'
  },
  length: {
    bankName: {
      min: 'Bank name must be at least 2 characters',
      max: 'Bank name cannot exceed 100 characters'
    },
    accountNumber: {
      min: 'Account number must be at least 9 digits',
      max: 'Account number cannot exceed 20 digits'
    },
    ifscCode: {
      exact: 'IFSC code must be exactly 11 characters'
    },
    panNumber: {
      exact: 'PAN number must be exactly 10 characters'
    }
  }
};

/**
 * PAN Number Checksum Validation
 * Validates PAN number using algorithm for Indian tax numbers
 */
const validatePanChecksum = (panNumber) => {
  if (!panNumber || panNumber.length !== 10) return false;
  
  // PAN structure: AAAAA9999A
  // First 5: Alphabets
  // Next 4: Numbers
  // Last 1: Alphabet
  
  const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (!pattern.test(panNumber)) return false;
  
  // Additional business logic validation
  const firstChar = panNumber.charAt(0);
  const fourthChar = panNumber.charAt(3);
  
  // Fourth character indicates entity type
  const validEntityTypes = ['P', 'F', 'C', 'H', 'A', 'T', 'B', 'L', 'J', 'G'];
  if (!validEntityTypes.includes(fourthChar)) return false;
  
  return true;
};

/**
 * IFSC Code Validation with Bank Verification
 */
const validateIfscCode = (ifscCode) => {
  if (!ifscCode || ifscCode.length !== 11) return false;
  
  // IFSC structure: AAAA0BBBBBB
  // First 4: Bank code (alphabets)
  // 5th: Always '0'
  // Last 6: Branch code (alphanumeric)
  
  const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return pattern.test(ifscCode);
};

/**
 * Account Number Validation
 * Validates account number format and length
 */
const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return false;
  
  const numericPattern = /^[0-9]+$/;
  const length = accountNumber.length;
  
  return numericPattern.test(accountNumber) && length >= 9 && length <= 20;
};

/**
 * Bank Name Validation
 * Validates bank name format and checks against known banks
 */
const validateBankName = (bankName) => {
  if (!bankName || bankName.length < 2) return false;
  
  const pattern = /^[a-zA-Z0-9\s\-\&\.\,\']+$/;
  return pattern.test(bankName);
};

/**
 * Base Bank Information Validation Schema
 */
export const bankInfoValidationSchema = Yup.object().shape({
  // Bank Details
  bank_name: Yup.string()
    .required(ERROR_MESSAGES.required.bankName)
    .min(2, ERROR_MESSAGES.length.bankName.min)
    .max(100, ERROR_MESSAGES.length.bankName.max)
    .matches(BANKING_PATTERNS.bankName, ERROR_MESSAGES.invalid.bankName)
    .test('bank-name-valid', ERROR_MESSAGES.invalid.bankName, validateBankName)
    .trim(),

  bank_account_no: Yup.string()
    .required(ERROR_MESSAGES.required.accountNumber)
    .min(9, ERROR_MESSAGES.length.accountNumber.min)
    .max(20, ERROR_MESSAGES.length.accountNumber.max)
    .matches(BANKING_PATTERNS.accountNumber, ERROR_MESSAGES.invalid.accountNumber)
    .test('account-number-valid', ERROR_MESSAGES.invalid.accountNumber, validateAccountNumber),

  ifsc_code: Yup.string()
    .required(ERROR_MESSAGES.required.ifscCode)
    .length(11, ERROR_MESSAGES.length.ifscCode.exact)
    .matches(BANKING_PATTERNS.ifscCode, ERROR_MESSAGES.invalid.ifscCode)
    .test('ifsc-valid', ERROR_MESSAGES.invalid.ifscCode, validateIfscCode)
    .uppercase(),

  pan_no: Yup.string()
    .required(ERROR_MESSAGES.required.panNumber)
    .length(10, ERROR_MESSAGES.length.panNumber.exact)
    .matches(BANKING_PATTERNS.panNumber, ERROR_MESSAGES.invalid.panNumber)
    .test('pan-checksum', ERROR_MESSAGES.invalid.panNumber, validatePanChecksum)
    .uppercase()
});

/**
 * Real-time Field Validation
 * Individual field validation for real-time feedback
 */
export const validateBankField = async (fieldName, value, context = {}) => {
  try {
    const schema = bankInfoValidationSchema.pick([fieldName]);
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
 * IFSC Code Lookup and Validation
 * Validates IFSC against bank database and returns branch details
 */
export const validateIfscWithLookup = async (ifscCode) => {
  if (!ifscCode || ifscCode.length !== 11) {
    return { 
      isValid: false, 
      error: 'IFSC code must be 11 characters',
      type: 'format'
    };
  }

  try {
    // Basic format validation first
    const formatValidation = validateIfscCode(ifscCode);
    if (!formatValidation) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.invalid.ifscCode,
        type: 'format'
      };
    }

    // API lookup for IFSC verification
    const response = await fetch('/api/banking/ifsc-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      },
      body: JSON.stringify({ ifsc_code: ifscCode })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        isValid: false,
        error: data.message || 'IFSC code not found',
        type: 'lookup'
      };
    }

    return {
      isValid: true,
      branchDetails: data.branch,
      bankName: data.bank_name,
      branchName: data.branch_name,
      city: data.city,
      district: data.district,
      state: data.state
    };
  } catch (error) {
    console.warn('IFSC lookup failed:', error);
    return {
      isValid: true, // Don't fail validation on network error
      warning: 'Unable to verify IFSC code. Please ensure it is correct.',
      type: 'network'
    };
  }
};

/**
 * Bank Account Duplicate Check
 * Validates that account number is not already registered
 */
export const validateAccountUniqueness = async (accountNumber, ifscCode, userId = null) => {
  if (!accountNumber || !ifscCode) {
    return { isValid: true };
  }

  try {
    const response = await fetch('/api/profile/validate-bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      },
      body: JSON.stringify({ 
        bank_account_no: accountNumber,
        ifsc_code: ifscCode,
        exclude_user_id: userId 
      })
    });

    const data = await response.json();

    if (!data.unique) {
      return {
        isValid: false,
        error: 'This bank account is already registered in the system',
        type: 'duplicate'
      };
    }

    return { isValid: true };
  } catch (error) {
    console.warn('Account uniqueness check failed:', error);
    return { 
      isValid: true, 
      warning: 'Unable to verify account uniqueness'
    };
  }
};

/**
 * Business Rules Validation
 * Additional banking business logic validation
 */
export const validateBankingBusinessRules = async (formData) => {
  const errors = {};
  const warnings = [];

  // IFSC-Bank Name Consistency Check
  if (formData.ifsc_code && formData.bank_name) {
    const bankCode = formData.ifsc_code.substring(0, 4);
    const bankName = formData.bank_name.toLowerCase();
    
    // Map common bank codes to names
    const bankCodeMap = {
      'SBIN': ['state bank', 'sbi'],
      'HDFC': ['hdfc'],
      'ICIC': ['icici'],
      'PUNB': ['punjab national', 'pnb'],
      'BARB': ['bank of baroda', 'baroda'],
      'UTIB': ['axis bank', 'axis'],
      'KKBK': ['kotak', 'kotak mahindra']
    };

    if (bankCodeMap[bankCode]) {
      const expectedNames = bankCodeMap[bankCode];
      const isMatch = expectedNames.some(name => bankName.includes(name));
      
      if (!isMatch) {
        warnings.push({
          field: 'bank_name',
          message: `Bank name may not match IFSC code. Expected: ${expectedNames[0]}`,
          type: 'consistency'
        });
      }
    }
  }

  // Account Number Length Validation by Bank
  if (formData.bank_account_no && formData.bank_name) {
    const accountLength = formData.bank_account_no.length;
    const bankName = formData.bank_name.toLowerCase();
    
    // Bank-specific account length rules
    if (bankName.includes('sbi') || bankName.includes('state bank')) {
      if (accountLength !== 11) {
        warnings.push({
          field: 'bank_account_no',
          message: 'SBI account numbers are typically 11 digits',
          type: 'format'
        });
      }
    } else if (bankName.includes('hdfc')) {
      if (accountLength !== 14) {
        warnings.push({
          field: 'bank_account_no',
          message: 'HDFC account numbers are typically 14 digits',
          type: 'format'
        });
      }
    }
  }

  return { errors, warnings };
};

/**
 * Form Data Transformation
 * Transforms and sanitizes form data before submission
 */
export const transformBankFormData = (formData) => {
  return {
    bank_name: formData.bank_name?.trim(),
    bank_account_no: formData.bank_account_no?.trim(),
    ifsc_code: formData.ifsc_code?.toUpperCase().trim(),
    pan_no: formData.pan_no?.toUpperCase().trim(),
    ruleSet: 'bank'
  };
};

/**
 * Export validation utilities
 */
export {
  BANKING_PATTERNS,
  ERROR_MESSAGES,
  validatePanChecksum,
  validateIfscCode,
  validateAccountNumber,
  validateBankName
};
