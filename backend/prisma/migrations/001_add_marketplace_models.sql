-- Migration: Add Marketplace Models for Category Parity
-- Created: 2024-01-16
-- Purpose: Add missing models for complete feature parity across all 6 seller categories

-- ============================================================================
-- CREATE ENUMS
-- ============================================================================

CREATE TYPE "ProductCategory" AS ENUM ('HANDMADE_ART', 'TOYS', 'VEHICLES', 'PAINTINGS_ARTWORK', 'WOODWORK', 'OTHERS');
CREATE TYPE "SellerTier" AS ENUM ('NEW_SELLER', 'TRUSTED_SELLER', 'TOP_RATED', 'ENTERPRISE');
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');
CREATE TYPE "ReviewType" AS ENUM ('SELLER', 'PRODUCT', 'TRANSACTION');

-- ============================================================================
-- PRODUCT & METADATA TABLES
-- ============================================================================

CREATE TABLE "Product" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category "ProductCategory" NOT NULL,
  subcategory TEXT,
  price DOUBLE PRECISION NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  "videoUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Product_sellerId_key" UNIQUE ("sellerId")
);

CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");
CREATE INDEX "Product_category_idx" ON "Product"(category);
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

CREATE TABLE "ProductMetadata" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" TEXT NOT NULL UNIQUE,
  materials TEXT,
  dimensions TEXT,
  technique TEXT,
  "handmadeProofVideo" TEXT,
  "isVerifiedHandmade" BOOLEAN DEFAULT false,
  "ageRating" INTEGER,
  "safetyCompliance" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isRecalled" BOOLEAN DEFAULT false,
  "vehicleYear" INTEGER,
  make TEXT,
  model TEXT,
  "engineCC" INTEGER,
  transmission TEXT,
  mileage DOUBLE PRECISION,
  "registrationNumber" TEXT,
  "engineNumber" TEXT,
  "chassisNumber" TEXT,
  "fuelType" TEXT,
  "bodyType" TEXT,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "ProductMetadata_productId_idx" ON "ProductMetadata"("productId");

-- ============================================================================
-- SELLER PROFILE & VERIFICATION
-- ============================================================================

CREATE TABLE "SellerProfile" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "businessName" TEXT,
  bio TEXT,
  "profileImage" TEXT,
  "bannerImage" TEXT,
  "sellerTier" "SellerTier" DEFAULT 'NEW_SELLER',
  "totalSales" INTEGER DEFAULT 0,
  "totalRating" DOUBLE PRECISION DEFAULT 0,
  "totalReviews" INTEGER DEFAULT 0,
  "responseTime" INTEGER DEFAULT 0,
  "acceptanceRate" DOUBLE PRECISION DEFAULT 0,
  "returnRate" DOUBLE PRECISION DEFAULT 0,
  "isVerified" BOOLEAN DEFAULT false,
  "isTopRated" BOOLEAN DEFAULT false,
  "isPowerSeller" BOOLEAN DEFAULT false,
  "enablesYoutubeGallery" BOOLEAN DEFAULT false,
  "enablesVideoBidding" BOOLEAN DEFAULT false,
  "vendorType" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "SellerProfile_userId_idx" ON "SellerProfile"("userId");
CREATE INDEX "SellerProfile_sellerTier_idx" ON "SellerProfile"("sellerTier");
CREATE INDEX "SellerProfile_isVerified_idx" ON "SellerProfile"("isVerified");

CREATE TABLE "KYCVerification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerProfileId" TEXT NOT NULL UNIQUE,
  "legalName" TEXT NOT NULL,
  "businessName" TEXT,
  "businessType" TEXT NOT NULL,
  "gstNumber" TEXT,
  "panNumber" TEXT NOT NULL,
  "aadhaarNumber" TEXT,
  "identityDocType" TEXT NOT NULL,
  "identityDocUrl" TEXT NOT NULL,
  "businessDocUrl" TEXT,
  "bankDocUrl" TEXT,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  status "KYCStatus" DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "verifiedAt" TIMESTAMP,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"(id) ON DELETE CASCADE
);

CREATE INDEX "KYCVerification_panNumber_idx" ON "KYCVerification"("panNumber");
CREATE INDEX "KYCVerification_status_idx" ON "KYCVerification"(status);

-- ============================================================================
-- REVIEWS & SELLER REPLIES
-- ============================================================================

CREATE TABLE "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "productId" TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  "reviewType" "ReviewType" DEFAULT 'SELLER',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  "videoUrl" TEXT,
  "isVerifiedPurchase" BOOLEAN DEFAULT false,
  "isVerifiedReview" BOOLEAN DEFAULT false,
  "helpfulCount" INTEGER DEFAULT 0,
  "unhelpfulCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("buyerId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE SET NULL,
  CONSTRAINT "Review_sellerId_buyerId_productId_key" UNIQUE ("sellerId", "buyerId", "productId")
);

CREATE INDEX "Review_sellerId_idx" ON "Review"("sellerId");
CREATE INDEX "Review_buyerId_idx" ON "Review"("buyerId");
CREATE INDEX "Review_rating_idx" ON "Review"(rating);
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

CREATE TABLE "ReviewReply" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "reviewId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  comment TEXT NOT NULL,
  "isPublic" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("reviewId") REFERENCES "Review"(id) ON DELETE CASCADE,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");
CREATE INDEX "ReviewReply_sellerId_idx" ON "ReviewReply"("sellerId");

-- ============================================================================
-- YOUTUBE GALLERY
-- ============================================================================

CREATE TABLE "YoutubeEmbed" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerProfileId" TEXT NOT NULL,
  "youtubeUrl" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  title TEXT,
  thumbnail TEXT,
  description TEXT,
  duration INTEGER,
  "displayOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"(id) ON DELETE CASCADE
);

CREATE INDEX "YoutubeEmbed_sellerProfileId_idx" ON "YoutubeEmbed"("sellerProfileId");
CREATE INDEX "YoutubeEmbed_videoId_idx" ON "YoutubeEmbed"("videoId");

-- ============================================================================
-- CATEGORY-SPECIFIC METADATA
-- ============================================================================

CREATE TABLE "ToyMetadata" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" TEXT NOT NULL UNIQUE,
  "ageMin" INTEGER NOT NULL,
  "ageMax" INTEGER,
  "safetyCompliances" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isRecalledByManufacturer" BOOLEAN DEFAULT false,
  "recallDate" TIMESTAMP,
  material TEXT,
  "hasSmallParts" BOOLEAN DEFAULT false,
  "hasChokingHazard" BOOLEAN DEFAULT false,
  "warningLabel" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "ToyMetadata_productId_idx" ON "ToyMetadata"("productId");

CREATE TABLE "BikeSpecification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" TEXT NOT NULL UNIQUE,
  "engineCC" INTEGER NOT NULL,
  "fuelType" TEXT NOT NULL,
  transmission TEXT NOT NULL,
  "forkType" TEXT,
  "suspensionType" TEXT,
  "brakeTypeF" TEXT,
  "brakeTypeR" TEXT,
  "maxPower" DOUBLE PRECISION,
  "maxTorque" DOUBLE PRECISION,
  "topSpeed" INTEGER,
  mileage DOUBLE PRECISION,
  "seatHeight" DOUBLE PRECISION,
  "wheelbaseLength" DOUBLE PRECISION,
  "groundClearance" DOUBLE PRECISION,
  "fuelTankCapacity" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "BikeSpecification_productId_idx" ON "BikeSpecification"("productId");

CREATE TABLE "VehicleInspectionReport" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" TEXT NOT NULL UNIQUE,
  "registrationNumber" TEXT,
  "registrationValidity" TIMESTAMP,
  "bodyCondition" TEXT,
  "engineCondition" TEXT,
  "interiorCondition" TEXT,
  "electricalCondition" TEXT,
  "hasAccidents" BOOLEAN DEFAULT false,
  "accidentDetails" TEXT,
  "hasRepaints" BOOLEAN DEFAULT false,
  "repaintAreas" TEXT,
  "hasChallan" BOOLEAN DEFAULT false,
  "challanDetails" TEXT,
  "rcStatus" TEXT,
  "insuranceStatus" TEXT,
  "pollutionStatus" TEXT,
  "loanStatus" TEXT,
  "loanDetails" TEXT,
  "reportUrl" TEXT,
  "inspectionDate" TIMESTAMP NOT NULL,
  "inspectorName" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "VehicleInspectionReport_productId_idx" ON "VehicleInspectionReport"("productId");

-- ============================================================================
-- AUCTION & BIDDING
-- ============================================================================

CREATE TABLE "Auction" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "startingPrice" DOUBLE PRECISION NOT NULL,
  "currentPrice" DOUBLE PRECISION DEFAULT 0,
  "reservePrice" DOUBLE PRECISION,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  "allowVoiceBidding" BOOLEAN DEFAULT false,
  "allowAutoBidding" BOOLEAN DEFAULT true,
  "totalBids" INTEGER DEFAULT 0,
  "uniqueBidders" INTEGER DEFAULT 0,
  "winnerUserId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Auction_productId_idx" ON "Auction"("productId");
CREATE INDEX "Auction_sellerId_idx" ON "Auction"("sellerId");
CREATE INDEX "Auction_status_idx" ON "Auction"(status);
CREATE INDEX "Auction_endTime_idx" ON "Auction"("endTime");

-- ============================================================================
-- SELLER MANAGEMENT
-- ============================================================================

CREATE TABLE "SellerFAQ" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerProfileId" TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  "viewCount" INTEGER DEFAULT 0,
  "helpfulCount" INTEGER DEFAULT 0,
  "displayOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"(id) ON DELETE CASCADE
);

CREATE INDEX "SellerFAQ_sellerProfileId_idx" ON "SellerFAQ"("sellerProfileId");
CREATE INDEX "SellerFAQ_category_idx" ON "SellerFAQ"(category);

CREATE TABLE "SellerCategory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerId" TEXT NOT NULL,
  category "ProductCategory" NOT NULL,
  "isEnabled" BOOLEAN DEFAULT true,
  "isFeatured" BOOLEAN DEFAULT false,
  "totalListings" INTEGER DEFAULT 0,
  "avgRating" DOUBLE PRECISION DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "SellerCategory_sellerId_category_key" UNIQUE ("sellerId", category)
);

CREATE INDEX "SellerCategory_sellerId_idx" ON "SellerCategory"("sellerId");

-- ============================================================================
-- BULK OPERATIONS
-- ============================================================================

CREATE TABLE "BulkUploadSession" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "totalRows" INTEGER NOT NULL,
  "processedRows" INTEGER DEFAULT 0,
  "successCount" INTEGER DEFAULT 0,
  "failureCount" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  "errorLog" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "BulkUploadSession_sellerId_idx" ON "BulkUploadSession"("sellerId");
CREATE INDEX "BulkUploadSession_status_idx" ON "BulkUploadSession"(status);

-- ============================================================================
-- DASHBOARD & ANALYTICS
-- ============================================================================

CREATE TABLE "SellerDashboardMetrics" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sellerId" TEXT NOT NULL UNIQUE,
  "monthYear" TEXT NOT NULL,
  "totalSales" INTEGER NOT NULL,
  "totalRevenue" DOUBLE PRECISION NOT NULL,
  "totalImpressions" INTEGER NOT NULL,
  "conversionRate" DOUBLE PRECISION NOT NULL,
  "totalAuctionsCreated" INTEGER NOT NULL,
  "totalAuctionsWon" INTEGER NOT NULL,
  "avgSellingPrice" DOUBLE PRECISION NOT NULL,
  "totalOrders" INTEGER NOT NULL,
  "returnRate" DOUBLE PRECISION NOT NULL,
  "customerSatisfaction" DOUBLE PRECISION NOT NULL,
  "totalReviews" INTEGER NOT NULL,
  "avgRating" DOUBLE PRECISION NOT NULL,
  "messageResponseTime" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "SellerDashboardMetrics_sellerId_monthYear_key" UNIQUE ("sellerId", "monthYear")
);

CREATE INDEX "SellerDashboardMetrics_sellerId_idx" ON "SellerDashboardMetrics"("sellerId");

-- ============================================================================
-- UPDATE USER MODEL (if not already done)
-- ============================================================================

-- Add missing columns to User table if they don't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerProfiles" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredCategories" "ProductCategory"[] DEFAULT ARRAY[]::text[];

-- Add foreign key relationship columns
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sellerId" TEXT;
ALTER TABLE "Auction" ADD COLUMN IF NOT EXISTS "sellerId" TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"(role);
CREATE INDEX IF NOT EXISTS "User_emailVerified_idx" ON "User"("emailVerified");
