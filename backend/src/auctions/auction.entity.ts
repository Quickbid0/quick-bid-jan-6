import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

export type AuctionType = 'live' | 'timed' | 'flash' | 'tender';
export type AuctionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled' | 'rejected' | 'deleted';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    default: 'timed'
  })
  auctionType: AuctionType;

  @Column({ nullable: true })
  productId: string;

  @Column({ nullable: true })
  eventId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  startingPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  reservePrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  buyNowPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  currentPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 1 })
  incrementAmount: number;

  @Column({
    type: 'varchar',
    default: 'draft'
  })
  status: AuctionStatus;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'json', nullable: true })
  auctionSettings: {
    // Live auction settings
    streamUrl?: string;
    requiresTokenDeposit?: boolean;
    tokenDepositAmount?: number;

    // Timed auction settings
    autoExtend?: boolean;
    extendMinutes?: number;

    // Flash auction settings
    durationMinutes?: number;

    // Tender auction settings
    minimumBidders?: number;
    qualificationCriteria?: string[];
  };

  @Column({ nullable: true })
  sellerId: string;

  @Column({ type: 'json', nullable: true })
  sellerInfo: {
    name: string;
    type: 'individual' | 'company' | 'third_party';
    avatarUrl?: string;
    rating?: number;
    totalSales?: number;
    verified?: boolean;
  };

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ default: 0 })
  totalBids: number;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ default: 0 })
  watchers: number;

  @Column({ type: 'json', nullable: true })
  lastBid: {
    userId: string;
    userName: string;
    amount: number;
    timestamp: Date;
  };

  @Column({ type: 'json', nullable: true })
  winner: {
    userId: string;
    userName: string;
    amount: number;
    timestamp: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
