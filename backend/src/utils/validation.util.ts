import { BadRequestException } from '@nestjs/common';
import * as validator from 'validator';

export class ValidationUtil {
  // Email validation
  static validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  // Phone number validation (Indian format)
  static validatePhone(phone: string): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian phone number (10 digits)
    return validator.isLength(cleanPhone, { min: 10, max: 10 }) && 
           validator.isNumeric(cleanPhone) &&
           cleanPhone.startsWith('6') || cleanPhone.startsWith('7') || 
           cleanPhone.startsWith('8') || cleanPhone.startsWith('9');
  }

  // Password validation
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!validator.isLength(password, { min: 8, max: 128 })) {
      errors.push('Password must be between 8 and 128 characters long');
    }

    if (!validator.matches(password, /[A-Z]/)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!validator.matches(password, /[a-z]/)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!validator.matches(password, /\d/)) {
      errors.push('Password must contain at least one number');
    }

    if (!validator.matches(password, /[!@#$%^&*(),.?":{}|<>]/)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Name validation
  static validateName(name: string): boolean {
    const trimmedName = name.trim();
    return validator.isLength(trimmedName, { min: 2, max: 50 }) &&
           validator.matches(trimmedName, /^[a-zA-Z\s'-]+$/);
  }

  // URL validation
  static validateUrl(url: string): boolean {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true,
      require_port: false,
      require_valid_protocol: true,
    });
  }

  // UUID validation
  static validateUUID(uuid: string): boolean {
    return validator.isUUID(uuid);
  }

  // Numeric validation
  static validateNumber(value: any, options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): boolean {
    const num = Number(value);
    
    if (isNaN(num)) {
      return false;
    }

    if (options?.integer && !Number.isInteger(num)) {
      return false;
    }

    if (options?.min !== undefined && num < options.min) {
      return false;
    }

    if (options?.max !== undefined && num > options.max) {
      return false;
    }

    return true;
  }

  // String sanitization
  static sanitizeString(input: string, options?: {
    maxLength?: number;
    allowHtml?: boolean;
  }): string {
    let sanitized = input.trim();

    // Remove potentially dangerous characters
    if (!options?.allowHtml) {
      // Basic HTML sanitization
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed[^>]*>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      // Allow basic HTML tags
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed[^>]*>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    // Limit length
    if (options?.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  // SQL injection prevention
  static sanitizeSQL(input: string): string {
    // Remove SQL injection patterns
    return input.replace(/['"\\;]/g, '');
  }

  // XSS prevention
  static sanitizeXSS(input: string): string {
    return this.sanitizeString(input, { allowHtml: false });
  }

  // File upload validation
  static validateFile(file: any, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Check file type
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Batch validation
  static validateBatch(data: Record<string, any>, rules: Record<string, (value: any) => boolean>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, validator]) => {
      const value = data[field];
      
      if (!validator(value)) {
        errors[field] = `Invalid value for field ${field}`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Required fields validation
  static validateRequired(data: Record<string, any>, requiredFields: string[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Custom validation decorator
  static validate(validator: (value: any) => boolean, errorMessage?: string) {
    return (target: any, propertyKey: string) => {
      const value = target[propertyKey];
      
      if (!validator(value)) {
        throw new BadRequestException(
          errorMessage || `Validation failed for property ${propertyKey}`
        );
      }
    };
  }
}

// Validation decorators
export function IsEmail() {
  return function (target: any, propertyKey: string) {
    const value = target[propertyKey];
    
    if (!ValidationUtil.validateEmail(value)) {
      throw new BadRequestException(`Invalid email address for ${propertyKey}`);
    }
  };
}

export function IsPhone() {
  return function (target: any, propertyKey: string) {
    const value = target[propertyKey];
    
    if (!ValidationUtil.validatePhone(value)) {
      throw new BadRequestException(`Invalid phone number for ${propertyKey}`);
    }
  };
}

export function IsStrongPassword() {
  return function (target: any, propertyKey: string) {
    const value = target[propertyKey];
    const validation = ValidationUtil.validatePassword(value);
    
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid password: ${validation.errors.join(', ')}`);
    }
  };
}

export function IsSanitized(options?: { maxLength?: number; allowHtml?: boolean }) {
  return function (target: any, propertyKey: string) {
    const value = target[propertyKey];
    
    if (typeof value === 'string') {
      target[propertyKey] = ValidationUtil.sanitizeString(value, options);
    }
  };
}
