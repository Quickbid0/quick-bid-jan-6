import { IsNumber, IsPositive, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFundsDto {
  @ApiProperty({
    description: 'Amount to add to wallet',
    example: 1000,
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}

export class PlaceBidDto {
  @ApiProperty({
    description: 'Bid amount',
    example: 5000,
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Auction ID for the bid',
    example: 'auction_123'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  auctionId: string;
}

export class RefundBidDto {
  @ApiProperty({
    description: 'Amount to refund',
    example: 5000,
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Auction cancelled',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class WalletTransactionQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number = 20;

  @ApiProperty({
    description: 'Transaction type filter',
    example: 'credit',
    enum: ['credit', 'debit', 'hold', 'release'],
    required: false
  })
  @IsOptional()
  @IsString()
  type?: 'credit' | 'debit' | 'hold' | 'release';

  @ApiProperty({
    description: 'Transaction purpose filter',
    example: 'wallet_topup',
    enum: ['wallet_topup', 'bid_placement', 'bid_refund', 'auction_win', 'auction_payout', 'security_deposit', 'commission', 'penalty', 'refund'],
    required: false
  })
  @IsOptional()
  @IsString()
  purpose?: string;
}
