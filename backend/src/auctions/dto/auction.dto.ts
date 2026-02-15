import { IsNumber, IsPositive, IsString, IsOptional, IsEnum, MinLength, MaxLength, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({
    description: 'Auction title',
    example: 'iPhone 15 Pro Max 256GB'
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Product ID associated with the auction',
    example: 'prod_123456'
  })
  @IsString()
  @MinLength(1)
  productId: string;

  @ApiProperty({
    description: 'Starting price of the auction',
    example: 50000,
    minimum: 1
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  startPrice: number;

  @ApiPropertyOptional({
    description: 'Buy now price (optional)',
    example: 80000,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  buyNowPrice?: number;

  @ApiPropertyOptional({
    description: 'Auction end time (ISO string)',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class PlaceBidDto {
  @ApiProperty({
    description: 'Bid amount',
    example: 55000,
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}

export class UpdateAuctionDto {
  @ApiPropertyOptional({
    description: 'Updated auction title',
    example: 'iPhone 15 Pro Max 256GB - Updated'
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated starting price',
    example: 45000,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  startPrice?: number;

  @ApiPropertyOptional({
    description: 'Updated buy now price',
    example: 75000,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  buyNowPrice?: number;

  @ApiPropertyOptional({
    description: 'Auction type',
    example: 'timed',
    enum: ['timed', 'live', 'flash', 'tender']
  })
  @IsOptional()
  @IsEnum(['timed', 'live', 'flash', 'tender'])
  auctionType?: 'timed' | 'live' | 'flash' | 'tender';

  @ApiPropertyOptional({
    description: 'Requires token deposit for live auctions',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  requiresTokenDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum bidders required for tender auctions',
    example: 3,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumBidders?: number;
}

export class AuctionQueryDto {
  @ApiPropertyOptional({
    description: 'Auction status filter',
    example: 'active',
    enum: ['active', 'draft', 'ended', 'paused']
  })
  @IsOptional()
  @IsEnum(['active', 'draft', 'ended', 'paused'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Auction type filter',
    example: 'timed',
    enum: ['timed', 'live', 'flash', 'tender']
  })
  @IsOptional()
  @IsEnum(['timed', 'live', 'flash', 'tender'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
