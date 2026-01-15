import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email too long');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

export const phoneSchema = z.string()
  .regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const priceSchema = z.number()
  .min(1, 'Price must be greater than 0')
  .max(10000000, 'Price too high')
  .positive('Price must be positive');

export const bidAmountSchema = z.number()
  .min(1, 'Bid amount must be at least 1')
  .max(10000000, 'Bid amount too high')
  .positive('Bid amount must be positive');

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema,
  phone: phoneSchema.optional(),
  userType: z.enum(['buyer', 'seller', 'both'], {
    errorMap: () => ({ message: 'Please select a valid user type' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Product listing schema
export const productSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  startingPrice: priceSchema,
  reservePrice: priceSchema.optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image required'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  location: z.string().min(1, 'Location is required'),
  endTime: z.string().datetime('Invalid end time'),
  auctionType: z.enum(['live', 'timed', 'tender'])
});

// Bid placement schema
export const bidSchema = z.object({
  productId: uuidSchema,
  amount: bidAmountSchema,
  bidType: z.enum(['regular', 'auto', 'sealed']).optional(),
  maxAmount: priceSchema.optional()
}).refine((data) => {
  if (data.bidType === 'auto' && !data.maxAmount) {
    return false;
  }
  return true;
}, {
  message: "Auto-bid requires maximum amount",
  path: ["maxAmount"]
});

// Profile update schema
export const profileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(200, 'Location too long').optional()
});

// Company registration schema
export const companySchema = z.object({
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name too long'),
  registrationNumber: z.string().min(1, 'Registration number required'),
  taxId: z.string().min(1, 'Tax ID required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  website: z.string().url('Invalid website URL').optional(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema
});

// Payment schema
export const paymentSchema = z.object({
  amount: priceSchema,
  method: z.enum(['card', 'bank_transfer', 'wallet']),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number').optional(),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date').optional(),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV').optional(),
  bankAccount: z.string().min(1, 'Bank account required').optional(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').optional()
}).refine((data) => {
  if (data.method === 'card' && (!data.cardNumber || !data.expiryDate || !data.cvv)) {
    return false;
  }
  if (data.method === 'bank_transfer' && (!data.bankAccount || !data.ifscCode)) {
    return false;
  }
  return true;
}, {
  message: "Payment method details incomplete",
  path: ["method"]
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(100, 'Query too long'),
  category: z.string().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  location: z.string().optional(),
  sortBy: z.enum(['price_low', 'price_high', 'ending_soon', 'newest']).optional()
}).refine((data) => {
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    return false;
  }
  return true;
}, {
  message: "Minimum price cannot be greater than maximum price",
  path: ["minPrice"]
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type BidInput = z.infer<typeof bidSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
