// Lightweight Event Instrumentation for Beta Feedback
export interface BetaEvent {
  eventName: string;
  userRole: 'guest' | 'beta_buyer' | 'beta_seller' | 'admin';
  page: string;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface FeedbackPrompt {
  id: string;
  type: 'page_clarity' | 'blocked_action' | 'abandoned_flow' | 'exit_survey';
  question: string;
  options?: string[];
  triggeredAfter: string;
  maxOncePerSession: boolean;
}

export class BetaFeedbackService {
  private static events: BetaEvent[] = [];
  private static feedbackPrompts: FeedbackPrompt[] = [
    {
      id: 'page_clarity',
      type: 'page_clarity',
      question: 'Was this page clear and easy to understand?',
      options: ['Yes', 'Somewhat', 'No'],
      triggeredAfter: 'dashboard_viewed',
      maxOncePerSession: true
    },
    {
      id: 'blocked_action',
      type: 'blocked_action',
      question: 'What were you trying to do?',
      triggeredAfter: 'bid_blocked_non_beta',
      maxOncePerSession: true
    },
    {
      id: 'abandoned_flow',
      type: 'abandoned_flow',
      question: 'What stopped you from completing this action?',
      triggeredAfter: 'beta_request_abandoned',
      maxOncePerSession: true
    },
    {
      id: 'exit_survey',
      type: 'exit_survey',
      question: 'What could be better about your beta experience?',
      triggeredAfter: 'session_end',
      maxOncePerSession: true
    }
  ];
  private static sessionPromptsShown: Set<string> = new Set();
  private static sessionId: string;

  static initializeSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionPromptsShown.clear();
  }

  static trackEvent(eventName: string, page: string, metadata?: Record<string, any>): void {
    const userId = localStorage.getItem('sb-user-id') || 'guest';
    const userRole = this.getUserRole(userId);

    const event: BetaEvent = {
      eventName,
      userRole,
      page,
      timestamp: new Date(),
      sessionId: this.sessionId,
      metadata
    };

    this.events.push(event);
    this.checkForFeedbackTriggers(event);
    this.cleanupOldEvents();
  }

  static getEvents(): BetaEvent[] {
    return [...this.events];
  }

  static getEventsByUser(userRole: string): BetaEvent[] {
    return this.events.filter(e => e.userRole === userRole);
  }

  static getEventsByPage(page: string): BetaEvent[] {
    return this.events.filter(e => e.page === page);
  }

  static getDropoffAnalysis(): {
    page: string;
    dropoffRate: number;
    totalEvents: number;
    abandonmentEvents: number;
  }[] {
    const pageAnalysis: Record<string, any> = {};

    // Group events by page
    this.events.forEach(event => {
      if (!pageAnalysis[event.page]) {
        pageAnalysis[event.page] = {
          totalEvents: 0,
          abandonmentEvents: 0,
          events: []
        };
      }
      pageAnalysis[event.page].totalEvents++;
      pageAnalysis[event.page].events.push(event);
      
      if (event.eventName.includes('abandoned') || event.eventName.includes('blocked')) {
        pageAnalysis[event.page].abandonmentEvents++;
      }
    });

    // Calculate dropoff rates
    return Object.entries(pageAnalysis).map(([page, data]) => ({
      page,
      dropoffRate: data.totalEvents > 0 ? (data.abandonmentEvents / data.totalEvents) * 100 : 0,
      totalEvents: data.totalEvents,
      abandonmentEvents: data.abandonmentEvents
    }));
  }

  static getHesitationAnalysis(): {
    avgTimeToAction: number;
    hesitationEvents: BetaEvent[];
  } {
    const hesitationEvents = this.events.filter(e => 
      e.eventName.includes('hover') || 
      e.eventName.includes('scroll') ||
      e.eventName.includes('viewed')
    );

    // Calculate average time between events (simplified)
    const avgTimeToAction = hesitationEvents.length > 1 ? 
      (hesitationEvents[hesitationEvents.length - 1].timestamp.getTime() - 
       hesitationEvents[0].timestamp.getTime()) / hesitationEvents.length : 0;

    return {
      avgTimeToAction,
      hesitationEvents
    };
  }

  static recordFeedback(promptId: string, response: string): void {
    const feedback = {
      promptId,
      response,
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    // Store feedback (in real implementation, this would go to backend)
    console.log('Feedback recorded:', feedback);
  }

  static shouldShowFeedback(promptId: string): boolean {
    const prompt = this.feedbackPrompts.find(p => p.id === promptId);
    if (!prompt || this.sessionPromptsShown.has(promptId)) {
      return false;
    }

    return true;
  }

  static markPromptShown(promptId: string): void {
    this.sessionPromptsShown.add(promptId);
  }

  private static getUserRole(userId: string): 'guest' | 'beta_buyer' | 'beta_seller' | 'admin' {
    // This would integrate with BetaUserService
    // For now, return guest as fallback
    return 'guest';
  }

  private static checkForFeedbackTriggers(event: BetaEvent): void {
    const prompt = this.feedbackPrompts.find(p => p.triggeredAfter === event.eventName);
    if (prompt && this.shouldShowFeedback(prompt.id)) {
      // This would trigger the feedback UI
      this.triggerFeedbackPrompt(prompt);
    }
  }

  private static triggerFeedbackPrompt(prompt: FeedbackPrompt): void {
    // This would be handled by the UI component
    console.log('Trigger feedback prompt:', prompt);
    this.markPromptShown(prompt.id);
  }

  private static cleanupOldEvents(): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.events = this.events.filter(e => e.timestamp > oneWeekAgo);
  }

  // High-value signal detection methods
  static detectHesitationSignals(): BetaEvent[] {
    return this.events.filter(e => 
      e.eventName.includes('hover') ||
      e.eventName.includes('scroll_loop')
    );
  }

  static detectDropoffSignals(): BetaEvent[] {
    return this.events.filter(e => 
      e.eventName.includes('abandoned') ||
      e.eventName.includes('blocked') ||
      e.eventName.includes('exit')
    );
  }

  static detectConfusionSignals(): BetaEvent[] {
    return this.events.filter(e => 
      e.eventName.includes('validation_error') ||
      e.eventName.includes('help_clicked') ||
      e.eventName.includes('repeated_action')
    );
  }

  static generateInsights(): {
    topDropoffPages: string[];
    commonConfusionPoints: string[];
    userEngagementLevel: 'low' | 'medium' | 'high';
  } {
    const dropoffAnalysis = this.getDropoffAnalysis();
    const confusionSignals = this.detectConfusionSignals();
    const hesitationSignals = this.detectHesitationSignals();

    // Sort pages by dropoff rate
    const topDropoffPages = dropoffAnalysis
      .sort((a, b) => b.dropoffRate - a.dropoffRate)
      .slice(0, 5)
      .map(d => d.page);

    // Extract common confusion points
    const commonConfusionPoints = confusionSignals
      .reduce((acc, event) => {
        const page = event.page;
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Calculate engagement level
    const totalEvents = this.events.length;
    const abandonmentEvents = this.detectDropoffSignals().length;
    const abandonmentRate = totalEvents > 0 ? (abandonmentEvents / totalEvents) * 100 : 0;
    
    let userEngagementLevel: 'low' | 'medium' | 'high';
    if (abandonmentRate > 50) {
      userEngagementLevel = 'low';
    } else if (abandonmentRate > 25) {
      userEngagementLevel = 'medium';
    } else {
      userEngagementLevel = 'high';
    }

    return {
      topDropoffPages,
      commonConfusionPoints: Object.keys(commonConfusionPoints),
      userEngagementLevel
    };
  }
}
