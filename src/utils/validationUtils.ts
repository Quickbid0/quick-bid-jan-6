export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateBidAmount = (amount: number, currentPrice: number, increment: number): {
  isValid: boolean;
  error?: string;
} => {
  if (amount <= currentPrice) {
    return { isValid: false, error: 'Bid must be higher than current price' };
  }
  
  if (amount < currentPrice + increment) {
    return { isValid: false, error: `Minimum increment is ₹${increment.toLocaleString()}` };
  }
  
  return { isValid: true };
};

export const validateFileUpload = (file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): {
  isValid: boolean;
  error?: string;
} => {
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
};

export const validateProductData = (productData: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!productData.title || productData.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }
  
  if (!productData.description || productData.description.length < 20) {
    errors.push('Description must be at least 20 characters long');
  }
  
  if (!productData.starting_price || productData.starting_price < 1) {
    errors.push('Starting price must be greater than 0');
  }
  
  if (!productData.category) {
    errors.push('Category is required');
  }
  
  if (!productData.location) {
    errors.push('Location is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};