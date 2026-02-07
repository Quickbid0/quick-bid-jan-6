// 🎯 PHASE 1: VALIDATION MODE - CORE USER JOURNEYS
// src/services/productOwner.service.ts

export interface UserJourney {
  type: 'buyer' | 'seller' | 'admin';
  steps: string[];
  metrics: UserJourneyMetrics;
  frictionPoints: FrictionPoint[];
}

export interface UserJourneyMetrics {
  completionRate: number;
  averageTime: number;
  dropOffPoints: string[];
  successRate: number;
  engagementRate: number;
}

export interface FrictionPoint {
  step: string;
  type: 'confusion' | 'trust' | 'pricing' | 'technical' | 'ui';
  description: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
}

export interface SuccessMetrics {
  buyer: {
    bidRate: number; // % users who place at least 1 bid
    timeToFirstBid: number; // minutes from login to first bid
    dropOffBeforeBidding: number; // % users who drop off before bidding
  };
  seller: {
    productAddRate: number; // % sellers who successfully add product
    timeToFirstAuction: number; // minutes from login to first auction
    auctionCompletionRate: number; // % auctions completed vs cancelled
  };
  platform: {
    demoToRealConversion: number; // % demo users who convert to real
    failedActionRate: number; // % failed actions (bids, payments)
    supportTicketRate: number; // support tickets per 100 users
  };
}

export interface UserFeedback {
  id: string;
  userId?: string;
  journeyType: 'buyer' | 'seller' | 'admin';
  step: string;
  blockedBy: 'confusion' | 'trust' | 'pricing';
  description: string;
  timestamp: Date;
  context?: any;
}

export class ProductOwnerService {
  private feedback: Map<string, UserFeedback[]> = new Map();
  private journeys: Map<string, UserJourney> = new Map();

  constructor() {
    this.initializeCoreJourneys();
  }

  // Initialize core user journeys
  private initializeCoreJourneys(): void {
    // Buyer Journey: Visit → Login → Browse → Bid → Win/Lose → Wallet → Exit
    this.journeys.set('buyer', {
      type: 'buyer',
      steps: ['visit', 'login', 'browse', 'bid', 'result', 'wallet', 'exit'],
      metrics: {
        completionRate: 0,
        averageTime: 0,
        dropOffPoints: [],
        successRate: 0,
        engagementRate: 0
      },
      frictionPoints: []
    });

    // Seller Journey: Login → Add Product → Auction Live → Bids → Sale → Payout
    this.journeys.set('seller', {
      type: 'seller',
      steps: ['login', 'add_product', 'auction_live', 'bids', 'sale', 'payout'],
      metrics: {
        completionRate: 0,
        averageTime: 0,
        dropOffPoints: [],
        successRate: 0,
        engagementRate: 0
      },
      frictionPoints: []
    });

    // Admin Journey: Monitor → Approve → Resolve Issues → Trust & Safety
    this.journeys.set('admin', {
      type: 'admin',
      steps: ['monitor', 'approve', 'resolve_issues', 'trust_safety'],
      metrics: {
        completionRate: 0,
        averageTime: 0,
        dropOffPoints: [],
        successRate: 0,
        engagementRate: 0
      },
      frictionPoints: []
    });
  }

  // Track user journey step completion
  trackJourneyStep(
    userId: string,
    journeyType: 'buyer' | 'seller' | 'admin',
    step: string,
    completed: boolean,
    duration?: number
  ): void {
    const journey = this.journeys.get(journeyType);
    if (!journey) return;

    // Store in localStorage for now (will be replaced with backend API)
    const journeyEvents = JSON.parse(localStorage.getItem('journeyEvents') || '[]');
    journeyEvents.push({
      userId,
      journeyType,
      step,
      completed,
      duration,
      timestamp: new Date()
    });
    localStorage.setItem('journeyEvents', JSON.stringify(journeyEvents));

    console.log(`🎯 Journey step tracked: ${journeyType} - ${step} - ${completed ? 'completed' : 'failed'}`);
  }

  // Record user feedback
  recordFeedback(
    userId: string,
    journeyType: 'buyer' | 'seller' | 'admin',
    step: string,
    blockedBy: 'confusion' | 'trust' | 'pricing',
    description: string,
    context?: any
  ): void {
    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      journeyType,
      step,
      blockedBy,
      description,
      timestamp: new Date(),
      context
    };

    // Store feedback
    const stepFeedback = this.feedback.get(step) || [];
    stepFeedback.push(feedback);
    this.feedback.set(step, stepFeedback);

    // Store in localStorage for now (will be replaced with backend API)
    const allFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    allFeedback.push(feedback);
    localStorage.setItem('userFeedback', JSON.stringify(allFeedback));

    console.log(`🎯 Feedback recorded: ${blockedBy} - ${description}`);
  }

  // Get success metrics
  getSuccessMetrics(): SuccessMetrics {
    // Get data from localStorage (will be replaced with backend API)
    const journeyEvents = JSON.parse(localStorage.getItem('journeyEvents') || '[]');
    const allFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');

    // Calculate buyer metrics
    const buyerEvents = journeyEvents.filter(e => e.journeyType === 'buyer');
    const buyerUsers = new Set(buyerEvents.map(e => e.userId));
    const buyerBidders = new Set(buyerEvents.filter(e => e.step === 'bid' && e.completed).map(e => e.userId));
    
    const buyerMetrics = {
      bidRate: buyerUsers.size > 0 ? (buyerBidders.size / buyerUsers.size) * 100 : 0,
      timeToFirstBid: this.calculateAverageTime(buyerEvents, 'bid'),
      dropOffBeforeBidding: this.calculateDropOffRate(buyerEvents, 'bid')
    };

    // Calculate seller metrics
    const sellerEvents = journeyEvents.filter(e => e.journeyType === 'seller');
    const sellerUsers = new Set(sellerEvents.map(e => e.userId));
    const sellerProductAdders = new Set(sellerEvents.filter(e => e.step === 'add_product' && e.completed).map(e => e.userId));
    
    const sellerMetrics = {
      productAddRate: sellerUsers.size > 0 ? (sellerProductAdders.size / sellerUsers.size) * 100 : 0,
      timeToFirstAuction: this.calculateAverageTime(sellerEvents, 'auction_live'),
      auctionCompletionRate: this.calculateAuctionCompletionRate(sellerEvents)
    };

    // Calculate platform metrics
    const platformMetrics = {
      demoToRealConversion: this.calculateDemoToRealConversion(),
      failedActionRate: this.calculateFailedActionRate(journeyEvents),
      supportTicketRate: this.calculateSupportTicketRate()
    };

    return {
      buyer: buyerMetrics,
      seller: sellerMetrics,
      platform: platformMetrics
    };
  }

  // Get friction points
  getFrictionPoints(): FrictionPoint[] {
    const allFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
    const frictionMap = new Map<string, FrictionPoint>();

    allFeedback.forEach(feedback => {
      const key = `${feedback.journeyType}-${feedback.step}-${feedback.blockedBy}`;
      const existing = frictionMap.get(key);
      
      if (existing) {
        existing.frequency++;
      } else {
        frictionMap.set(key, {
          step: feedback.step,
          type: this.mapFeedbackToFrictionType(feedback.blockedBy),
          description: feedback.description,
          frequency: 1,
          impact: this.calculateImpact(feedback.blockedBy)
        });
      }
    });

    return Array.from(frictionMap.values()).sort((a, b) => b.frequency - a.frequency);
  }

  // Get weekly report
  getWeeklyReport(): {
    metrics: SuccessMetrics;
    frictionPoints: FrictionPoint[];
    topIssues: string[];
    recommendations: string[];
  } {
    const metrics = this.getSuccessMetrics();
    const frictionPoints = this.getFrictionPoints();
    
    // Top issues are the most frequent friction points
    const topIssues = frictionPoints
      .slice(0, 5)
      .map(fp => `${fp.step}: ${fp.description} (${fp.frequency} times)`);

    // Generate recommendations based on metrics and friction points
    const recommendations = this.generateRecommendations(metrics, frictionPoints);

    return {
      metrics,
      frictionPoints,
      topIssues,
      recommendations
    };
  }

  // Remove friction point
  removeFrictionPoint(step: string, type: string): void {
    console.log(`🎯 Friction point removed: ${step} - ${type}`);
    // This would typically involve fixing the UI/UX issue
    // For now, we just log it
  }

  // Product Owner decision rule
  shouldImplementFeature(feature: string, benefit: string): boolean {
    // "Does this help a real user complete an auction faster, safer, or with more confidence?"
    const helpsUser = benefit.toLowerCase().includes('faster') || 
                       benefit.toLowerCase().includes('safer') || 
                       benefit.toLowerCase().includes('confidence');
    
    const helpsAuction = benefit.toLowerCase().includes('bid') ||
                         benefit.toLowerCase().includes('auction') ||
                         benefit.toLowerCase().includes('sale');
    
    return helpsUser && helpsAuction;
  }

  // Weekly Product Owner checklist
  runWeeklyChecklist(): {
    checklist: {
      metricsReviewed: boolean;
      topComplaintsReviewed: boolean;
      buyerFlowWalkthrough: boolean;
      sellerFlowWalkthrough: boolean;
      frictionPointRemoved: boolean;
    };
    insights: string[];
    actions: string[];
  } {
    const metrics = this.getSuccessMetrics();
    const frictionPoints = this.getFrictionPoints();
    
    return {
      checklist: {
        metricsReviewed: true,
        topComplaintsReviewed: true,
        buyerFlowWalkthrough: false, // To be done manually
        sellerFlowWalkthrough: false, // To be done manually
        frictionPointRemoved: false // To be done manually
      },
      insights: this.generateInsights(metrics, frictionPoints),
      actions: this.generateWeeklyActions(metrics, frictionPoints)
    };
  }

  // Private helper methods
  private calculateAverageTime(events: any[], step: string): number {
    const stepEvents = events.filter(e => e.step === step && e.duration);
    if (stepEvents.length === 0) return 0;
    
    const totalTime = stepEvents.reduce((sum, e) => sum + e.duration, 0);
    return totalTime / stepEvents.length;
  }

  private calculateDropOffRate(events: any[], step: string): number {
    const stepIndex = ['visit', 'login', 'browse', 'bid', 'result', 'wallet', 'exit'].indexOf(step);
    const usersAtStep = new Set(events.filter(e => e.step === step).map(e => e.userId));
    const usersBeforeStep = new Set(events.filter(e => {
      const stepIdx = ['visit', 'login', 'browse', 'bid', 'result', 'wallet', 'exit'].indexOf(e.step);
      return stepIdx < stepIndex;
    }).map(e => e.userId));
    
    return usersBeforeStep.size > 0 ? ((usersBeforeStep.size - usersAtStep.size) / usersBeforeStep.size) * 100 : 0;
  }

  private calculateAuctionCompletionRate(events: any[]): number {
    const completedAuctions = events.filter(e => e.step === 'sale' && e.completed).length;
    const totalAuctions = events.filter(e => e.step === 'auction_live').length;
    return totalAuctions > 0 ? (completedAuctions / totalAuctions) * 100 : 0;
  }

  private calculateDemoToRealConversion(): number {
    // This would be calculated from auth mode conversion data
    // For now, return a placeholder
    return 15.5; // Placeholder
  }

  private calculateFailedActionRate(events: any[]): number {
    const failedActions = events.filter(e => !e.completed).length;
    const totalActions = events.length;
    return totalActions > 0 ? (failedActions / totalActions) * 100 : 0;
  }

  private calculateSupportTicketRate(): number {
    // This would be calculated from support ticket data
    // For now, return a placeholder
    return 2.3; // Placeholder: tickets per 100 users
  }

  private mapFeedbackToFrictionType(blockedBy: string): 'confusion' | 'trust' | 'pricing' | 'technical' | 'ui' {
    switch (blockedBy) {
      case 'confusion': return 'confusion';
      case 'trust': return 'trust';
      case 'pricing': return 'pricing';
      default: return 'ui';
    }
  }

  private calculateImpact(blockedBy: string): 'high' | 'medium' | 'low' {
    switch (blockedBy) {
      case 'trust': return 'high';
      case 'pricing': return 'medium';
      case 'confusion': return 'medium';
      default: return 'low';
    }
  }

  private generateRecommendations(metrics: SuccessMetrics, frictionPoints: FrictionPoint[]): string[] {
    const recommendations: string[] = [];
    
    // Buyer recommendations
    if (metrics.buyer.bidRate < 20) {
      recommendations.push('Improve bid button visibility and clarity');
    }
    
    if (metrics.buyer.timeToFirstBid > 10) {
      recommendations.push('Simplify bidding process to reduce time to first bid');
    }
    
    if (metrics.buyer.dropOffBeforeBidding > 50) {
      recommendations.push('Address drop-off points before bidding');
    }
    
    // Seller recommendations
    if (metrics.seller.productAddRate < 30) {
      recommendations.push('Simplify product addition process');
    }
    
    if (metrics.seller.timeToFirstAuction > 15) {
      recommendations.push('Streamline auction creation process');
    }
    
    if (metrics.seller.auctionCompletionRate < 60) {
      recommendations.push('Improve auction success rate');
    }
    
    // Platform recommendations
    if (metrics.platform.demoToRealConversion < 10) {
      recommendations.push('Enhance demo to real conversion flow');
    }
    
    if (metrics.platform.failedActionRate > 30) {
      recommendations.push('Reduce failed actions across platform');
    }
    
    if (metrics.platform.supportTicketRate > 5) {
      recommendations.push('Improve user experience to reduce support tickets');
    }
    
    // Friction point recommendations
    const highImpactFriction = frictionPoints.filter(fp => fp.impact === 'high');
    if (highImpactFriction.length > 0) {
      recommendations.push(`Address high-impact friction points: ${highImpactFriction.map(fp => fp.step).join(', ')}`);
    }
    
    return recommendations;
  }

  private generateInsights(metrics: SuccessMetrics, frictionPoints: FrictionPoint[]): string[] {
    const insights: string[] = [];
    
    // Buyer insights
    if (metrics.buyer.bidRate > 40) {
      insights.push('Buyer engagement is strong');
    } else {
      insights.push('Buyer engagement needs improvement');
    }
    
    // Seller insights
    if (metrics.seller.productAddRate > 50) {
      insights.push('Seller activation is healthy');
    } else {
      insights.push('Seller activation is a concern');
    }
    
    // Platform insights
    if (metrics.platform.demoToRealConversion > 20) {
      insights.push('Demo to real conversion is effective');
    } else {
      insights.push('Demo to real conversion needs attention');
    }
    
    // Friction insights
    if (frictionPoints.length > 5) {
      insights.push('Multiple friction points identified');
    } else {
      insights.push('Friction points are manageable');
    }
    
    return insights;
  }

  private generateWeeklyActions(metrics: SuccessMetrics, frictionPoints: FrictionPoint[]): string[] {
    const actions: string[] = [];
    
    // Priority actions based on metrics
    if (metrics.buyer.bidRate < 20) {
      actions.push('Focus on improving buyer bid rate');
    }
    
    if (metrics.seller.productAddRate < 30) {
      actions.push('Simplify seller product addition');
    }
    
    if (metrics.platform.demoToRealConversion < 10) {
      actions.push('Optimize demo to real conversion');
    }
    
    // Remove top friction point
    if (frictionPoints.length > 0) {
      actions.push(`Remove friction point: ${frictionPoints[0].step}`);
    }
    
    return actions;
  }
}

export default ProductOwnerService;
