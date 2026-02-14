export declare class ValidationUtil {
    static validateEmail(email: string): boolean;
    static validatePhone(phone: string): boolean;
    static validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static validateName(name: string): boolean;
    static validateUrl(url: string): boolean;
    static validateUUID(uuid: string): boolean;
    static validateNumber(value: any, options?: {
        min?: number;
        max?: number;
        integer?: boolean;
    }): boolean;
    static sanitizeString(input: string, options?: {
        maxLength?: number;
        allowHtml?: boolean;
    }): string;
    static sanitizeSQL(input: string): string;
    static sanitizeXSS(input: string): string;
    static validateFile(file: any, options?: {
        maxSize?: number;
        allowedTypes?: string[];
    }): {
        isValid: boolean;
        errors: string[];
    };
    static validateBatch(data: Record<string, any>, rules: Record<string, (value: any) => boolean>): {
        isValid: boolean;
        errors: Record<string, string>;
    };
    static validateRequired(data: Record<string, any>, requiredFields: string[]): {
        isValid: boolean;
        errors: string[];
    };
    static validate(validator: (value: any) => boolean, errorMessage?: string): (target: any, propertyKey: string) => void;
}
export declare function IsEmail(): (target: any, propertyKey: string) => void;
export declare function IsPhone(): (target: any, propertyKey: string) => void;
export declare function IsStrongPassword(): (target: any, propertyKey: string) => void;
export declare function IsSanitized(options?: {
    maxLength?: number;
    allowHtml?: boolean;
}): (target: any, propertyKey: string) => void;
