import { z } from 'zod';

// Product Categories
export const ProductCategory = z.enum([
  'vehicles',
  'electronics',
  'property',
  'art',
  'creative-artist', // Creative Artist as main category
  'jewelry',
  'fashion',
  'sports',
  'books',
  'business',
  'other'
]);

// Category to Subcategories Mapping
export const categorySubcategories: Record<z.infer<typeof ProductCategory>, z.infer<typeof ProductSubcategory>[]> = {
  vehicles: ['cars', 'motorcycles', 'trucks', 'buses', 'scooters'],
  electronics: ['phones', 'laptops', 'tablets', 'cameras', 'gaming'],
  property: ['residential', 'commercial', 'land'],
  art: ['paintings', 'sculptures', 'photography', 'digital'],
  'creative-artist': ['paintings', 'sculptures', 'handmade-crafts', 'digital-art', 'custom-art'],
  jewelry: ['rings', 'necklaces', 'earrings', 'watches'],
  fashion: ['clothing', 'shoes', 'accessories', 'bags'],
  sports: ['equipment', 'apparel', 'memorabilia'],
  books: ['fiction', 'non-fiction', 'textbooks', 'rare'],
  business: ['equipment', 'inventory', 'services'],
  other: ['misc']
};

export const ProductSubcategory = z.enum([
  // Vehicles
  'cars', 'motorcycles', 'trucks', 'buses', 'scooters',
  // Electronics
  'phones', 'laptops', 'tablets', 'cameras', 'gaming',
  // Property
  'residential', 'commercial', 'land',
  // Art
  'paintings', 'sculptures', 'photography', 'digital',
  // Creative Artist
  'paintings', 'sculptures', 'handmade-crafts', 'digital-art', 'custom-art',
  // Jewelry
  'rings', 'necklaces', 'earrings', 'watches',
  // Fashion
  'clothing', 'shoes', 'accessories', 'bags',
  // Sports
  'equipment', 'apparel', 'memorabilia',
  // Books
  'fiction', 'non-fiction', 'textbooks', 'rare',
  // Business
  'equipment', 'inventory', 'services',
  // Other
  'misc'
]);

export const ProductCondition = z.enum(['new', 'used', 'refurbished']);
export const AuctionType = z.enum(['timed', 'live', 'sealed']);
export const ProductStatus = z.enum(['DRAFT', 'PENDING', 'LIVE', 'REJECTED', 'ENDED']);

// Image Schema
export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().optional(),
  isThumbnail: z.boolean().default(false),
  order: z.number().default(0)
});

// Main Product Schema
export const ProductSchema = z.object({
  id: z.string().optional(),
  sellerId: z.string().min(1, 'Seller ID is required'),
  
  // Basic Information
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  slug: z.string().min(1, 'Slug is required'),
  category: ProductCategory,
  subcategory: ProductSubcategory,
  description: z.string().min(10, 'Description must be at least 10 characters'),
  condition: ProductCondition,
  
  // Pricing & Auction
  auctionType: AuctionType,
  basePrice: z.number().min(0, 'Base price must be positive'),
  bidIncrement: z.number().min(1, 'Bid increment must be at least 1'),
  reservePrice: z.number().optional(),
  buyNowPrice: z.number().optional(),
  
  // Media (REQUIRED)
  thumbnail: z.string().url('Thumbnail must be a valid URL'),
  images: z.array(ProductImageSchema).min(1, 'At least one image is required'),
  video: z.string().url().optional(),
  
  // Status & Metadata
  status: ProductStatus.default('DRAFT'),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  
  // Logistics
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string().optional()
  }),
  
  // Shipping & Returns
  shippingMethod: z.enum(['pickup', 'delivery', 'both']).default('pickup'),
  returnPolicy: z.enum(['accepted', 'not_accepted']).default('not_accepted'),
  
  // Timing
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  
  // Metadata
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  publishedAt: z.date().optional()
});

// Form Submission Schema (for frontend)
export const ProductFormSchema = ProductSchema.omit({
  id: true,
  sellerId: true,
  status: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true
}).extend({
  // Form-specific fields
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  acceptReturnPolicy: z.boolean().optional()
});

// API Response Schema
export const ProductResponseSchema = ProductSchema.extend({
  seller: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    rating: z.number().optional(),
    verified: z.boolean()
  }).optional(),
  
  // Auction-specific fields
  currentBid: z.number().optional(),
  bidCount: z.number().optional(),
  highestBidder: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  
  // Time remaining
  timeRemaining: z.number().optional()
});

// Types
export type Product = z.infer<typeof ProductSchema>;
export type ProductForm = z.infer<typeof ProductFormSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductCategory = z.infer<typeof ProductCategory>;
export type ProductSubcategory = z.infer<typeof ProductSubcategory>;
export type ProductCondition = z.infer<typeof ProductCondition>;
export type AuctionType = z.infer<typeof AuctionType>;
export type ProductStatus = z.infer<typeof ProductStatus>;
export type ProductImage = z.infer<typeof ProductImageSchema>;

// Validation helpers
export const validateProductForm = (data: unknown) => {
  return ProductFormSchema.safeParse(data);
};

export const validateProduct = (data: unknown) => {
  return ProductSchema.safeParse(data);
};

export const validateProductResponse = (data: unknown) => {
  return ProductResponseSchema.safeParse(data);
};
