import { z } from 'zod';

/**
 * FIX V-03, V-12: Form Validation — Negative Bids & Zero Auto-Bid
 * FIX V-10: Auction End Date Validation
 * FIX V-08, V-09: Image Upload Validation
 */

// ============ BID FORM VALIDATION ============
export const bidFormSchema = z.object({
  bid: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Bid must be greater than ₹0')
    .min(0.01, 'Minimum bid is ₹1'),
  
  autoBidMax: z
    .number()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional
        return val > 0;
      },
      'Auto-bid max must be greater than ₹0'
    ),
});

export const createBidSchema = (currentHighestBid: number, walletBalance: number) =>
  z.object({
    bid: z
      .number({ invalid_type_error: 'Enter a valid amount' })
      .positive('Bid must be greater than ₹0')
      .min(currentHighestBid + 1, `Minimum bid is ₹${currentHighestBid + 1}`)
      .max(walletBalance, `Cannot exceed your wallet balance of ₹${walletBalance}`),

    autoBidMax: z
      .number()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional
          return val > 0;
        },
        'Auto-bid max must be greater than ₹0'
      )
      .refine(
        (val) => {
          if (!val) return true; // Optional
          return val >= currentHighestBid + 1;
        },
        `Auto-bid max must exceed current highest bid (₹${currentHighestBid})`
      )
      .refine(
        (val) => {
          if (!val) return true; // Optional
          return val <= walletBalance;
        },
        `Cannot set auto-bid max higher than wallet balance of ₹${walletBalance}`
      ),
  });

// ============ AUCTION CREATION ============
export const auctionFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startPrice: z
    .number()
    .positive('Start price must be greater than ₹0'),
  
  /**
   * FIX V-10: Auction End Date Validation
   * End date must be at least 1 hour in the future
   */
  endDate: z
    .date()
    .min(
      new Date(Date.now() + 60 * 60 * 1000),
      'Auction must end at least 1 hour from now'
    ),

  images: z
    .array(z.instanceof(File))
    .min(1, 'At least 1 image required')
    .max(5, 'Maximum 5 images allowed'),
});

// ============ IMAGE UPLOAD VALIDATION ============
/**
 * FIX V-08, V-09: Image Upload Validation
 * Check file type and size before upload
 */
export const imageValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => {
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        return ALLOWED_TYPES.includes(file.type);
      },
      'Only JPG, PNG, WebP, GIF files allowed'
    )
    .refine(
      (file) => {
        const MAX_SIZE_MB = 10;
        return file.size <= MAX_SIZE_MB * 1024 * 1024;
      },
      'File size must be less than 10MB'
    ),
});

// ============ PROFILE/USER VALIDATION ============
export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// ============ AUTO-BID CONFIGURATION ============
export const autoBidConfigSchema = (currentHighestBid: number, walletBalance: number) =>
  z.object({
    maxBid: z
      .number()
      .positive('Must be greater than ₹0')
      .min(
        currentHighestBid + 1,
        `Auto-bid max must exceed current highest bid (₹${currentHighestBid})`
      )
      .max(
        walletBalance,
        `Cannot exceed your wallet balance of ₹${walletBalance}`
      ),

    autoBidIncrement: z
      .number()
      .positive('Increment must be greater than ₹0')
      .optional(),
  });
