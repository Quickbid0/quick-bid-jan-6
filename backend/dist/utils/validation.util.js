"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = void 0;
exports.IsEmail = IsEmail;
exports.IsPhone = IsPhone;
exports.IsStrongPassword = IsStrongPassword;
exports.IsSanitized = IsSanitized;
const common_1 = require("@nestjs/common");
const validator = require("validator");
class ValidationUtil {
    static validateEmail(email) {
        return validator.isEmail(email);
    }
    static validatePhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return validator.isLength(cleanPhone, { min: 10, max: 10 }) &&
            validator.isNumeric(cleanPhone) &&
            cleanPhone.startsWith('6') || cleanPhone.startsWith('7') ||
            cleanPhone.startsWith('8') || cleanPhone.startsWith('9');
    }
    static validatePassword(password) {
        const errors = [];
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
    static validateName(name) {
        const trimmedName = name.trim();
        return validator.isLength(trimmedName, { min: 2, max: 50 }) &&
            validator.matches(trimmedName, /^[a-zA-Z\s'-]+$/);
    }
    static validateUrl(url) {
        return validator.isURL(url, {
            protocols: ['http', 'https'],
            require_protocol: true,
            require_host: true,
            require_port: false,
            require_valid_protocol: true,
        });
    }
    static validateUUID(uuid) {
        return validator.isUUID(uuid);
    }
    static validateNumber(value, options) {
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
    static sanitizeString(input, options) {
        let sanitized = input.trim();
        if (!options?.allowHtml) {
            sanitized = sanitized
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<object[^>]*>.*?<\/object>/gi, '')
                .replace(/<embed[^>]*>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        else {
            sanitized = sanitized
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<object[^>]*>.*?<\/object>/gi, '')
                .replace(/<embed[^>]*>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (options?.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }
        return sanitized;
    }
    static sanitizeSQL(input) {
        return input.replace(/['"\\;]/g, '');
    }
    static sanitizeXSS(input) {
        return this.sanitizeString(input, { allowHtml: false });
    }
    static validateFile(file, options) {
        const errors = [];
        const maxSize = options?.maxSize || 5 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }
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
    static validateBatch(data, rules) {
        const errors = {};
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
    static validateRequired(data, requiredFields) {
        const errors = [];
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
    static validate(validator, errorMessage) {
        return (target, propertyKey) => {
            const value = target[propertyKey];
            if (!validator(value)) {
                throw new common_1.BadRequestException(errorMessage || `Validation failed for property ${propertyKey}`);
            }
        };
    }
}
exports.ValidationUtil = ValidationUtil;
function IsEmail() {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        if (!ValidationUtil.validateEmail(value)) {
            throw new common_1.BadRequestException(`Invalid email address for ${propertyKey}`);
        }
    };
}
function IsPhone() {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        if (!ValidationUtil.validatePhone(value)) {
            throw new common_1.BadRequestException(`Invalid phone number for ${propertyKey}`);
        }
    };
}
function IsStrongPassword() {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        const validation = ValidationUtil.validatePassword(value);
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`Invalid password: ${validation.errors.join(', ')}`);
        }
    };
}
function IsSanitized(options) {
    return function (target, propertyKey) {
        const value = target[propertyKey];
        if (typeof value === 'string') {
            target[propertyKey] = ValidationUtil.sanitizeString(value, options);
        }
    };
}
//# sourceMappingURL=validation.util.js.map