// 🔧 CORE LOOP IMPROVEMENTS - PHASE 3
// src/services/coreLoop.service.ts

export interface CoreLoopImprovement {
  type: 'buyer' | 'seller';
  step: string;
  improvement: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed';
  implementedAt?: Date;
}

export interface BuyerLoopImprovements {
  auctionDiscovery: CoreLoopImprovement[];
  bidPlaced: CoreLoopImprovement[];
  outcomeClear: CoreLoopImprovement[];
  walletUpdated: CoreLoopImprovement[];
  return: CoreLoopImprovement[];
}

export interface SellerLoopImprovements {
  auctionCreated: CoreLoopImprovement[];
  bidsReceived: CoreLoopImprovement[];
  saleCompleted: CoreLoopImprovement[];
  earningsVisible: CoreLoopImprovement[];
  return: CoreLoopImprovement[];
}

export class CoreLoopService {
  private buyerImprovements: BuyerLoopImprovements;
  private sellerImprovements: SellerLoopImprovements;

  constructor() {
    this.buyerImprovements = this.initializeBuyerImprovements();
    this.sellerImprovements = this.initializeSellerImprovements();
  }

  // Initialize buyer loop improvements
  private initializeBuyerImprovements(): BuyerLoopImprovements {
    return {
      auctionDiscovery: [
        {
          type: 'buyer',
          step: 'auction_discovery',
          improvement: 'Enhanced search filters',
          description: 'Add category, price range, and location filters to reduce uncertainty',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'buyer',
          step: 'auction_discovery',
          improvement: 'Clear auction status indicators',
          description: 'Show time remaining, bid count, and current bid prominently',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        }
      ],
      bidPlaced: [
        {
          type: 'buyer',
          step: 'bid_placed',
          improvement: 'Simplified bid interface',
          description: 'Reduce clicks and form fields to place a bid',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'buyer',
          step: 'bid_placed',
          improvement: 'Real-time bid validation',
          description: 'Show bid amount validation and available balance instantly',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      outcomeClear: [
        {
          type: 'buyer',
          step: 'outcome_clear',
          improvement: 'Stronger winner confirmation',
          description: 'Clear, prominent "You Won!" message with next steps',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        },
        {
          type: 'buyer',
          step: 'outcome_clear',
          improvement: 'Better loser notification',
          description: 'Helpful message with suggestions for similar auctions',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      walletUpdated: [
        {
          type: 'buyer',
          step: 'wallet_updated',
          improvement: 'Instant wallet balance updates',
          description: 'Show real-time balance changes after transactions',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'buyer',
          step: 'wallet_updated',
          improvement: 'Transaction history clarity',
          description: 'Clear transaction details with timestamps and status',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      return: [
        {
          type: 'buyer',
          step: 'return',
          improvement: 'Personalized auction recommendations',
          description: 'Show relevant auctions based on bidding history',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'buyer',
          step: 'return',
          improvement: 'Saved search preferences',
          description: 'Remember user search filters and preferences',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ]
    };
  }

  // Initialize seller loop improvements
  private initializeSellerImprovements(): SellerLoopImprovements {
    return {
      auctionCreated: [
        {
          type: 'seller',
          step: 'auction_created',
          improvement: 'Streamlined auction creation',
          description: 'Reduce steps and fields required to create an auction',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'seller',
          step: 'auction_created',
          improvement: 'Auction preview before publishing',
          description: 'Show exactly how auction will appear to buyers',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      bidsReceived: [
        {
          type: 'seller',
          step: 'bids_received',
          improvement: 'Real-time bid notifications',
          description: 'Instant notifications when bids are placed',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        },
        {
          type: 'seller',
          step: 'bids_received',
          improvement: 'Bid quality indicators',
          description: 'Show buyer verification status and bid history',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      saleCompleted: [
        {
          type: 'seller',
          step: 'sale_completed',
          improvement: 'Clear sale confirmation',
          description: 'Detailed sale completion message with buyer info',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        },
        {
          type: 'seller',
          step: 'sale_completed',
          improvement: 'Next steps guidance',
          description: 'Clear instructions for payment and delivery',
          impact: 'medium',
          effort: 'low',
          status: 'planned'
        }
      ],
      earningsVisible: [
        {
          type: 'seller',
          step: 'earnings_visible',
          improvement: 'Better earnings dashboard',
          description: 'Clear breakdown of earnings, fees, and net income',
          impact: 'high',
          effort: 'medium',
          status: 'planned'
        },
        {
          type: 'seller',
          step: 'earnings_visible',
          improvement: 'Payout timeline clarity',
          description: 'Show exactly when funds will be available',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        }
      ],
      return: [
        {
          type: 'seller',
          step: 'return',
          improvement: 'Quick auction relisting',
          description: 'One-click relisting for similar items',
          impact: 'high',
          effort: 'low',
          status: 'planned'
        },
        {
          type: 'seller',
          step: 'return',
          improvement: 'Performance insights',
          description: 'Show auction performance metrics and suggestions',
          impact: 'medium',
          effort: 'medium',
          status: 'planned'
        }
      ]
    };
  }

  // Implement buyer loop improvement
  implementBuyerImprovement(step: keyof BuyerLoopImprovements, improvementIndex: number): void {
    const improvements = this.buyerImprovements[step];
    if (improvements && improvements[improvementIndex]) {
      improvements[improvementIndex].status = 'completed';
      improvements[improvementIndex].implementedAt = new Date();
      
      console.log(`🔧 Buyer improvement implemented: ${improvements[improvementIndex].improvement}`);
      
      // Save to localStorage
      this.saveImprovements();
    }
  }

  // Implement seller loop improvement
  implementSellerImprovement(step: keyof SellerLoopImprovements, improvementIndex: number): void {
    const improvements = this.sellerImprovements[step];
    if (improvements && improvements[improvementIndex]) {
      improvements[improvementIndex].status = 'completed';
      improvements[improvementIndex].implementedAt = new Date();
      
      console.log(`🔧 Seller improvement implemented: ${improvements[improvementIndex].improvement}`);
      
      // Save to localStorage
      this.saveImprovements();
    }
  }

  // Get buyer loop improvements
  getBuyerImprovements(): BuyerLoopImprovements {
    return this.buyerImprovements;
  }

  // Get seller loop improvements
  getSellerImprovements(): SellerLoopImprovements {
    return this.sellerImprovements;
  }

  // Get high-impact improvements (priority order)
  getHighImpactImprovements(): CoreLoopImprovement[] {
    const allImprovements: CoreLoopImprovement[] = [
      ...this.buyerImprovements.auctionDiscovery,
      ...this.buyerImprovements.bidPlaced,
      ...this.buyerImprovements.outcomeClear,
      ...this.buyerImprovements.walletUpdated,
      ...this.buyerImprovements.return,
      ...this.sellerImprovements.auctionCreated,
      ...this.sellerImprovements.bidsReceived,
      ...this.sellerImprovements.saleCompleted,
      ...this.sellerImprovements.earningsVisible,
      ...this.sellerImprovements.return
    ];

    return allImprovements
      .filter(imp => imp.impact === 'high')
      .sort((a, b) => {
        // Sort by effort (low first) then by status
        const effortOrder = { low: 1, medium: 2, high: 3 };
        const statusOrder = { planned: 1, in_progress: 2, completed: 3 };
        
        if (effortOrder[a.effort] !== effortOrder[b.effort]) {
          return effortOrder[a.effort] - effortOrder[b.effort];
        }
        
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }

  // Get improvements by status
  getImprovementsByStatus(status: 'planned' | 'in_progress' | 'completed'): CoreLoopImprovement[] {
    const allImprovements: CoreLoopImprovement[] = [
      ...this.buyerImprovements.auctionDiscovery,
      ...this.buyerImprovements.bidPlaced,
      ...this.buyerImprovements.outcomeClear,
      ...this.buyerImprovements.walletUpdated,
      ...this.buyerImprovements.return,
      ...this.sellerImprovements.auctionCreated,
      ...this.sellerImprovements.bidsReceived,
      ...this.sellerImprovements.saleCompleted,
      ...this.sellerImprovements.earningsVisible,
      ...this.sellerImprovements.return
    ];

    return allImprovements.filter(imp => imp.status === status);
  }

  // Calculate completion rate
  getCompletionRate(): {
    overall: number;
    buyer: number;
    seller: number;
    byStep: Record<string, number>;
  } {
    const allImprovements: CoreLoopImprovement[] = [
      ...this.buyerImprovements.auctionDiscovery,
      ...this.buyerImprovements.bidPlaced,
      ...this.buyerImprovements.outcomeClear,
      ...this.buyerImprovements.walletUpdated,
      ...this.buyerImprovements.return,
      ...this.sellerImprovements.auctionCreated,
      ...this.sellerImprovements.bidsReceived,
      ...this.sellerImprovements.saleCompleted,
      ...this.sellerImprovements.earningsVisible,
      ...this.sellerImprovements.return
    ];

    const completed = allImprovements.filter(imp => imp.status === 'completed').length;
    const overall = allImprovements.length > 0 ? (completed / allImprovements.length) * 100 : 0;

    const buyerImprovements = [
      ...this.buyerImprovements.auctionDiscovery,
      ...this.buyerImprovements.bidPlaced,
      ...this.buyerImprovements.outcomeClear,
      ...this.buyerImprovements.walletUpdated,
      ...this.buyerImprovements.return
    ];
    const buyerCompleted = buyerImprovements.filter(imp => imp.status === 'completed').length;
    const buyer = buyerImprovements.length > 0 ? (buyerCompleted / buyerImprovements.length) * 100 : 0;

    const sellerImprovements = [
      ...this.sellerImprovements.auctionCreated,
      ...this.sellerImprovements.bidsReceived,
      ...this.sellerImprovements.saleCompleted,
      ...this.sellerImprovements.earningsVisible,
      ...this.sellerImprovements.return
    ];
    const sellerCompleted = sellerImprovements.filter(imp => imp.status === 'completed').length;
    const seller = sellerImprovements.length > 0 ? (sellerCompleted / sellerImprovements.length) * 100 : 0;

    // Calculate by step
    const byStep: Record<string, number> = {};
    const steps = [
      'auction_discovery', 'bid_placed', 'outcome_clear', 'wallet_updated', 'return',
      'auction_created', 'bids_received', 'sale_completed', 'earnings_visible'
    ];

    steps.forEach(step => {
      const stepImprovements = allImprovements.filter(imp => imp.step === step);
      const stepCompleted = stepImprovements.filter(imp => imp.status === 'completed').length;
      byStep[step] = stepImprovements.length > 0 ? (stepCompleted / stepImprovements.length) * 100 : 0;
    });

    return {
      overall,
      buyer,
      seller,
      byStep
    };
  }

  // Get next recommended improvement
  getNextRecommendedImprovement(): CoreLoopImprovement | null {
    const highImpact = this.getHighImpactImprovements();
    return highImpact.find(imp => imp.status === 'planned') || null;
  }

  // Save improvements to localStorage
  private saveImprovements(): void {
    const data = {
      buyerImprovements: this.buyerImprovements,
      sellerImprovements: this.sellerImprovements
    };
    localStorage.setItem('coreLoopImprovements', JSON.stringify(data));
  }

  // Load improvements from localStorage
  private loadImprovements(): void {
    const saved = localStorage.getItem('coreLoopImprovements');
    if (saved) {
      const data = JSON.parse(saved);
      this.buyerImprovements = data.buyerImprovements || this.buyerImprovements;
      this.sellerImprovements = data.sellerImprovements || this.sellerImprovements;
    }
  }

  // Generate core loop improvement report
  generateImprovementReport(): {
    summary: {
      totalImprovements: number;
      completedImprovements: number;
      completionRate: number;
      highImpactCompleted: number;
      nextRecommendation: CoreLoopImprovement | null;
    };
    buyerLoop: {
      steps: string[];
      completionRate: number;
      completedSteps: string[];
      pendingSteps: string[];
    };
    sellerLoop: {
      steps: string[];
      completionRate: number;
      completedSteps: string[];
      pendingSteps: string[];
    };
    recommendations: CoreLoopImprovement[];
  } {
    const completionRates = this.getCompletionRate();
    const nextRecommendation = this.getNextRecommendedImprovement();

    // Buyer loop analysis
    const buyerSteps = ['auction_discovery', 'bid_placed', 'outcome_clear', 'wallet_updated', 'return'];
    const buyerCompletedSteps = buyerSteps.filter(step => completionRates.byStep[step] === 100);
    const buyerPendingSteps = buyerSteps.filter(step => completionRates.byStep[step] < 100);

    // Seller loop analysis
    const sellerSteps = ['auction_created', 'bids_received', 'sale_completed', 'earnings_visible', 'return'];
    const sellerCompletedSteps = sellerSteps.filter(step => completionRates.byStep[step] === 100);
    const sellerPendingSteps = sellerSteps.filter(step => completionRates.byStep[step] < 100);

    return {
      summary: {
        totalImprovements: this.getImprovementsByStatus('planned').length + this.getImprovementsByStatus('completed').length,
        completedImprovements: this.getImprovementsByStatus('completed').length,
        completionRate: completionRates.overall,
        highImpactCompleted: this.getHighImpactImprovements().filter(imp => imp.status === 'completed').length,
        nextRecommendation
      },
      buyerLoop: {
        steps: buyerSteps,
        completionRate: completionRates.buyer,
        completedSteps: buyerCompletedSteps,
        pendingSteps: buyerPendingSteps
      },
      sellerLoop: {
        steps: sellerSteps,
        completionRate: completionRates.seller,
        completedSteps: sellerCompletedSteps,
        pendingSteps: sellerPendingSteps
      },
      recommendations: this.getHighImpactImprovements().filter(imp => imp.status === 'planned').slice(0, 5)
    };
  }

  // Check if core loops are sufficiently tightened
  areCoreLoopsTightened(): boolean {
    const completionRates = this.getCompletionRate();
    
    // Core loops are tight if:
    // - Overall completion rate >= 80%
    // - Both buyer and seller loops >= 75%
    // - High-impact improvements >= 90% complete
    
    return (
      completionRates.overall >= 80 &&
      completionRates.buyer >= 75 &&
      completionRates.seller >= 75 &&
      (this.getHighImpactImprovements().filter(imp => imp.status === 'completed').length / this.getHighImpactImprovements().length) >= 0.9
    );
  }

  // Get uncertainty reduction opportunities
  getUncertaintyReductionOpportunities(): {
    buyer: {
      step: string;
      currentUncertainty: number;
      potentialReduction: number;
      improvements: CoreLoopImprovement[];
    }[];
    seller: {
      step: string;
      currentUncertainty: number;
      potentialReduction: number;
      improvements: CoreLoopImprovement[];
    }[];
  } {
    // This would integrate with uncertainty measurements
    // For now, return placeholder data based on improvements
    
    const buyerOpportunities = [
      {
        step: 'auction_discovery',
        currentUncertainty: 35,
        potentialReduction: 20,
        improvements: this.buyerImprovements.auctionDiscovery.filter(imp => imp.status === 'planned')
      },
      {
        step: 'bid_placed',
        currentUncertainty: 25,
        potentialReduction: 15,
        improvements: this.buyerImprovements.bidPlaced.filter(imp => imp.status === 'planned')
      },
      {
        step: 'outcome_clear',
        currentUncertainty: 20,
        potentialReduction: 15,
        improvements: this.buyerImprovements.outcomeClear.filter(imp => imp.status === 'planned')
      }
    ];

    const sellerOpportunities = [
      {
        step: 'auction_created',
        currentUncertainty: 30,
        potentialReduction: 20,
        improvements: this.sellerImprovements.auctionCreated.filter(imp => imp.status === 'planned')
      },
      {
        step: 'sale_completed',
        currentUncertainty: 25,
        potentialReduction: 15,
        improvements: this.sellerImprovements.saleCompleted.filter(imp => imp.status === 'planned')
      },
      {
        step: 'earnings_visible',
        currentUncertainty: 20,
        potentialReduction: 15,
        improvements: this.sellerImprovements.earningsVisible.filter(imp => imp.status === 'planned')
      }
    ];

    return {
      buyer: buyerOpportunities,
      seller: sellerOpportunities
    };
  }
}

export default CoreLoopService;
