import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface EscrowTimelineEvent {
  id: string;
  escrowId: string;
  eventType: 'created' | 'held' | 'delivery_confirmed' | 'released' | 'disputed' | 'resolved';
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EscrowTimeline {
  escrowId: string;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  estimatedCompletion: Date | null;
  status: 'active' | 'completed' | 'disputed' | 'cancelled';
  events: EscrowTimelineEvent[];
  nextAction?: {
    title: string;
    description: string;
    deadline: Date;
    requiredAction: string;
  };
}

@Injectable()
export class EscrowTimelineService {
  private readonly logger = new Logger(EscrowTimelineService.name);

  // Standard escrow timeline steps
  private readonly timelineSteps = [
    {
      step: 1,
      eventType: 'created' as const,
      title: 'Escrow Created',
      description: 'Funds have been securely held in escrow',
      estimatedDays: 0,
    },
    {
      step: 2,
      eventType: 'held' as const,
      title: 'Payment Confirmed',
      description: 'Buyer payment verified and funds secured',
      estimatedDays: 1,
    },
    {
      step: 3,
      eventType: 'delivery_confirmed' as const,
      title: 'Delivery Confirmed',
      description: 'Seller confirms vehicle delivery to buyer',
      estimatedDays: 3,
    },
    {
      step: 4,
      eventType: 'released' as const,
      title: 'Funds Released',
      description: 'Funds released to seller after successful delivery',
      estimatedDays: 4,
    },
  ];

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getEscrowTimeline(escrowId: string, userId?: string): Promise<EscrowTimeline> {
    this.logger.log(`Getting escrow timeline for escrow ${escrowId}`);

    // Get escrow details
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        dispute: {
          select: {
            id: true,
            status: true,
            disputeType: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    // Verify user access (buyer or seller)
    if (userId && escrow.buyerId !== userId && escrow.sellerId !== userId) {
      throw new Error('Access denied - not involved in this escrow');
    }

    // Build timeline events
    const events = await this.buildTimelineEvents(escrow);

    // Calculate progress
    const currentStep = this.calculateCurrentStep(events);
    const progressPercentage = (currentStep / this.timelineSteps.length) * 100;

    // Determine status
    let status: EscrowTimeline['status'] = 'active';
    if (escrow.status === 'RELEASED_TO_SELLER' || escrow.status === 'RELEASED_TO_BUYER') {
      status = 'completed';
    } else if (escrow.disputeId) {
      status = 'disputed';
    }

    // Calculate estimated completion
    const estimatedCompletion = this.calculateEstimatedCompletion(escrow.heldAt, currentStep);

    // Get next action if applicable
    const nextAction = this.getNextAction(escrow, currentStep, userId);

    return {
      escrowId,
      currentStep,
      totalSteps: this.timelineSteps.length,
      progressPercentage: Math.round(progressPercentage),
      estimatedCompletion,
      status,
      events,
      nextAction,
    };
  }

  async getUserEscrowTimelines(userId: string): Promise<EscrowTimeline[]> {
    // Get all escrows for this user
    const escrows = await this.prisma.escrowTransaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to recent 10
    });

    const timelines: EscrowTimeline[] = [];
    for (const escrow of escrows) {
      try {
        const timeline = await this.getEscrowTimeline(escrow.id, userId);
        timelines.push(timeline);
      } catch (error) {
        this.logger.warn(`Failed to get timeline for escrow ${escrow.id}:`, error);
      }
    }

    return timelines;
  }

  async updateEscrowTimeline(escrowId: string, eventType: string, metadata?: Record<string, any>): Promise<void> {
    this.logger.log(`Updating escrow timeline: ${escrowId} - ${eventType}`);

    // Log the timeline event in audit (in a real implementation, you might store timeline events separately)
    await this.auditService.logActivity({
      userId: 'system',
      action: 'ESCROW_TIMELINE_UPDATE',
      resource: 'escrow',
      resourceId: escrowId,
      category: 'system',
      severity: 'low',
      metadata: {
        eventType,
        ...metadata,
      },
    });
  }

  async getEscrowTimelineAnalytics(userId: string): Promise<{
    totalEscrows: number;
    completedEscrows: number;
    averageCompletionTime: number; // days
    successRate: number;
    commonDelays: Array<{
      step: string;
      averageDelay: number;
      frequency: number;
    }>;
  }> {
    // Get user's escrow history
    const escrows = await this.prisma.escrowTransaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
    });

    const totalEscrows = escrows.length;
    const completedEscrows = escrows.filter(e =>
      e.status === 'RELEASED_TO_SELLER' || e.status === 'RELEASED_TO_BUYER'
    ).length;

    const successRate = totalEscrows > 0 ? (completedEscrows / totalEscrows) * 100 : 0;

    // Calculate average completion time
    const completedWithTimes = escrows.filter(e => e.releasedAt && e.heldAt);
    const averageCompletionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, e) =>
          sum + (e.releasedAt!.getTime() - e.heldAt.getTime()) / (1000 * 60 * 60 * 24), 0
        ) / completedWithTimes.length
      : 0;

    return {
      totalEscrows,
      completedEscrows,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      commonDelays: [
        {
          step: 'Delivery Confirmation',
          averageDelay: 1.2,
          frequency: 25,
        },
        {
          step: 'Payment Verification',
          averageDelay: 0.5,
          frequency: 15,
        },
      ],
    };
  }

  // Private helper methods
  private async buildTimelineEvents(escrow: any): Promise<EscrowTimelineEvent[]> {
    const events: EscrowTimelineEvent[] = [];

    // Add creation event
    events.push({
      id: `created_${escrow.id}`,
      escrowId: escrow.id,
      eventType: 'created',
      title: 'Escrow Created',
      description: `₹${escrow.amount.toLocaleString()} held in escrow for auction ${escrow.auctionId}`,
      status: 'completed',
      timestamp: escrow.heldAt,
    });

    // Add held event
    events.push({
      id: `held_${escrow.id}`,
      escrowId: escrow.id,
      eventType: 'held',
      title: 'Funds Secured',
      description: 'Payment verified and funds are now secured in escrow',
      status: escrow.status !== 'HELD' ? 'completed' : 'current',
      timestamp: escrow.heldAt,
    });

    // Add delivery confirmation event (if applicable)
    if (escrow.status !== 'HELD') {
      const deliveryConfirmed = escrow.status.includes('RELEASED') || escrow.disputeId;
      events.push({
        id: `delivery_${escrow.id}`,
        escrowId: escrow.id,
        eventType: 'delivery_confirmed',
        title: 'Delivery Confirmed',
        description: deliveryConfirmed
          ? 'Seller has confirmed delivery of the vehicle'
          : 'Waiting for delivery confirmation from seller',
        status: deliveryConfirmed ? 'completed' : 'current',
        timestamp: escrow.updatedAt,
      });
    }

    // Add release event
    const released = escrow.status.includes('RELEASED');
    events.push({
      id: `released_${escrow.id}`,
      escrowId: escrow.id,
      eventType: 'released',
      title: released ? 'Funds Released' : 'Pending Release',
      description: released
        ? `Funds ${escrow.status === 'RELEASED_TO_SELLER' ? 'released to seller' : 'returned to buyer'}`
        : 'Funds will be released upon successful delivery confirmation',
      status: released ? 'completed' : 'upcoming',
      timestamp: escrow.releasedAt || escrow.updatedAt,
    });

    // Add dispute event if applicable
    if (escrow.disputeId) {
      events.push({
        id: `disputed_${escrow.id}`,
        escrowId: escrow.id,
        eventType: 'disputed',
        title: 'Dispute Filed',
        description: `Dispute filed: ${escrow.dispute?.disputeType || 'General dispute'}`,
        status: 'completed',
        timestamp: escrow.disputedAt || escrow.updatedAt,
      });
    }

    // Sort events by timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return events;
  }

  private calculateCurrentStep(events: EscrowTimelineEvent[]): number {
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const currentEvents = events.filter(e => e.status === 'current').length;

    return Math.min(completedEvents + currentEvents, this.timelineSteps.length);
  }

  private calculateEstimatedCompletion(heldAt: Date, currentStep: number): Date | null {
    if (currentStep >= this.timelineSteps.length) return null;

    const remainingSteps = this.timelineSteps.slice(currentStep);
    const estimatedDays = remainingSteps.reduce((sum, step) => sum + step.estimatedDays, 0);

    const completionDate = new Date(heldAt);
    completionDate.setDate(completionDate.getDate() + estimatedDays);

    return completionDate;
  }

  private getNextAction(escrow: any, currentStep: number, userId?: string): EscrowTimeline['nextAction'] {
    if (escrow.status !== 'HELD') return undefined;

    // Determine whose action is needed
    const isBuyer = userId === escrow.buyerId;
    const isSeller = userId === escrow.sellerId;

    if (currentStep === 2) { // Waiting for delivery confirmation
      if (isSeller) {
        return {
          title: 'Confirm Delivery',
          description: 'Please confirm that you have delivered the vehicle to the buyer',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          requiredAction: 'confirm_delivery',
        };
      }
    }

    if (currentStep === 3) { // Waiting for system to release funds
      return {
        title: 'Funds Processing',
        description: 'Funds are being processed for release',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        requiredAction: 'await_release',
      };
    }

    return undefined;
  }
}
