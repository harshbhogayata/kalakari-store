// Comprehensive Frontend Validation Utilities

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Phone number validation for Indian numbers
export const validateIndianPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  if (name.length > 50) return false;
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  return nameRegex.test(name);
};

// Pincode validation for India
export const validateIndianPincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Form field validation
export const validateFormField = (
  value: string, 
  fieldName: string, 
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => boolean;
  }
): { isValid: boolean; errorMessage: string } => {
  
  if (rules.required && (!value || value.trim().length === 0)) {
    return {
      isValid: false,
      errorMessage: `${fieldName} is required`
    };
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      errorMessage: `${fieldName} must be at least ${rules.minLength} characters long`
    };
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      errorMessage: `${fieldName} cannot exceed ${rules.maxLength} characters`
    };
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      errorMessage: `Invalid ${fieldName} format`
    };
  }
  
  if (value && rules.customValidator && !rules.customValidator(value)) {
    return {
      isValid: false,
      errorMessage: `Invalid ${fieldName}`
    };
  }
  
  return { isValid: true, errorMessage: '' };
};

// File validation
export const validateFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    requiredTypes?: string[];
  } = {}
): { isValid: boolean; errorMessage: string } => {
  
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], requiredTypes } = options;
  
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      errorMessage: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check required types
  if (requiredTypes && !requiredTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `File type must be one of: ${requiredTypes.join(', ')}`
    };
  }
  
  return { isValid: true, errorMessage: '' };
};

// Phone number formatting for display
export const formatIndianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Currency formatting for INR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Generate error messages for form validation
export const generateFormErrors = (
  formData: Record<string, any>,
  validationRules: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const rules = validationRules[fieldName];
    if (rules) {
      const validation = validateFormField(value, fieldName, rules);
      if (!validation.isValid) {
        errors[fieldName] = validation.errorMessage;
      }
    }
  }
  
  return errors;
};

// Secure input for display (prevents XSS)
export const secureDisplayText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate cart item
export const validateCartItem = (item: {
  productId: string;
  quantity: number;
  price: number;
  variant?: Record<string, string>;
}): { isValid: boolean; errorMessage: string } => {
  
  if (!item.productId || !item.productId.trim()) {
    return {
      isValid: false,
      errorMessage: 'Product ID is required'
    };
  }
  
  if (!item.quantity || item.quantity < 1) {
    return {
      isValid: false,
      errorMessage: 'Valid quantity is required'
    };
  }
  
  if (!item.price || item.price < 0) {
    return {
      isValid: false,
      errorMessage: 'Valid price is required'
    };
  }
  
  if (item.quantity > 99) {
    return {
      isValid: false,
      errorMessage: 'Maximum quantity per item is 99'
    };
  }
  
  return { isValid: true, errorMessage: '' };
};

// Environment validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredVars = ['REACT_APP_API_URL', 'REACT_APP_CLIENT_URL'];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Validate API URL format
  if (process.env.REACT_APP_API_URL && !validateUrl(process.env.REACT_APP_API_URL)) {
    errors.push('REACT_APP_API_URL must be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Device/browser detection
export const detectDevice = (): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
} => {
  const userAgent = navigator.userAgent;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    userAgent
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void | Promise<any>): void => {
  const start = performance.now();
  
  const finish = () => {
    const duration = performance.now() - start;
    console.log(`${name} took ${duration.toFixed(2)} milliseconds`);
  };
  
  const result = fn();
  
  if (result && typeof result.then === 'function') {
    // Promise
    result.finally(finish);
  } else {
    // Synchronous
    finish();
  }
};

// Local storage utilities with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem error:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage.setItem error:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage.removeItem error:', error);
      return false;
    }
  }
};

export default {
  validateEmail,
  validateIndianPhone,
  validatePassword,
  validateName,
  validateIndianPincode,
  validateFormField,
  validateFile,
  formatIndianPhone,
  formatCurrency,
  sanitizeInput,
  validateUrl,
  generateFormErrors,
  secureDisplayText,
  validateCartItem,
  validateEnvironment,
  detectDevice,
  measurePerformance,
  safeLocalStorage
};
