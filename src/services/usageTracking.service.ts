// 📊 USAGE TRACKING IMPLEMENTATION
// src/services/usageTracking.service.ts

import backendAuthAPI from './backendAuthAPI';

export interface AuthEvent {
  action: string;
  resource: string;
  userId?: string;
  email?: string;
  success: boolean;
  error?: string;
  timestamp: Date;
  correlationId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface UserJourneyEvent {
  userId: string;
  step: string;
  completed: boolean;
  duration?: number;
  error?: string;
  timestamp: Date;
  metadata?: any;
}

export interface ConversionEvent {
  userId: string;
  fromDemo: boolean;
  toReal: boolean;
  timestamp: Date;
  metadata?: any;
}

export class UsageTrackingService {
  
  constructor() {
    // Initialize tracking service
  }

  // 🔐 AUTHENTICATION TRACKING
  async trackLoginAttempt(email: string, success: boolean, error?: string): Promise<void> {
    const event: AuthEvent = {
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      resource: 'AUTHENTICATION',
      email: this.sanitizeEmail(email),
      success,
      error,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      severity: success ? 'info' : 'warning'
    };

    await this.logEvent(event);
    console.log('🔐 Login attempt tracked:', event.action, event.success);
  }

  async trackRegistrationAttempt(email: string, success: boolean, error?: string): Promise<void> {
    const event: AuthEvent = {
      action: success ? 'REGISTRATION_SUCCESS' : 'REGISTRATION_FAILURE',
      resource: 'AUTHENTICATION',
      email: this.sanitizeEmail(email),
      success,
      error,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      severity: success ? 'info' : 'warning'
    };

    await this.logEvent(event);
    console.log('📝 Registration attempt tracked:', event.action, event.success);
  }

  async trackPasswordReset(email: string, success: boolean, error?: string): Promise<void> {
    const event: AuthEvent = {
      action: success ? 'PASSWORD_RESET_SUCCESS' : 'PASSWORD_RESET_FAILURE',
      resource: 'AUTHENTICATION',
      email: this.sanitizeEmail(email),
      success,
      error,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      severity: success ? 'info' : 'warning'
    };

    await this.logEvent(event);
    console.log('🔑 Password reset tracked:', event.action, event.success);
  }

  // 🔄 CONVERSION TRACKING
  async trackDemoToRealConversion(userId: string, fromDemo: boolean, toReal: boolean): Promise<void> {
    const event: ConversionEvent = {
      userId,
      fromDemo,
      toReal,
      timestamp: new Date(),
      metadata: {
        conversionType: fromDemo && toReal ? 'demo_to_real' : 'auth_mode_change'
      }
    };

    await this.logConversionEvent(event);
    console.log('🔄 Conversion tracked:', event.metadata?.conversionType);
  }

  // 👤 USER JOURNEY TRACKING
  async trackOnboardingStep(userId: string, step: string, completed: boolean, duration?: number, error?: string): Promise<void> {
    const event: UserJourneyEvent = {
      userId,
      step,
      completed,
      duration,
      error,
      timestamp: new Date(),
      metadata: {
        journeyType: 'onboarding',
        stepIndex: this.getStepIndex(step)
      }
    };

    await this.logJourneyEvent(event);
    console.log('👤 Onboarding step tracked:', step, completed);
  }

  async trackSellerOnboarding(userId: string, step: string, completed: boolean, metadata?: any): Promise<void> {
    const event: UserJourneyEvent = {
      userId,
      step,
      completed,
      timestamp: new Date(),
      metadata: {
        journeyType: 'seller_onboarding',
        ...metadata
      }
    };

    await this.logJourneyEvent(event);
    console.log('🏪 Seller onboarding tracked:', step, completed);
  }

  // 💰 AUCTION TRACKING
  async trackAuctionEvent(auctionId: string, event: string, userId: string, data?: any): Promise<void> {
    console.log('💰 Auction event tracked:', event, auctionId);
    
    // Store in localStorage for now (will be replaced with backend API)
    const auctionEvents = JSON.parse(localStorage.getItem('auctionEvents') || '[]');
    auctionEvents.push({
      userId,
      action: `AUCTION_${event}`,
      resource: 'AUCTION',
      details: {
        auctionId,
        event,
        data,
        correlationId: this.generateCorrelationId(),
        severity: 'info'
      },
      correlationId: this.generateCorrelationId(),
      severity: 'info',
      timestamp: new Date()
    });
    localStorage.setItem('auctionEvents', JSON.stringify(auctionEvents));
  }

  // 💳 PAYMENT TRACKING
  async trackPaymentEvent(paymentId: string, event: string, userId: string, success: boolean, error?: string): Promise<void> {
    console.log('💳 Payment event tracked:', event, success);
    
    // Store in localStorage for now (will be replaced with backend API)
    const paymentEvents = JSON.parse(localStorage.getItem('paymentEvents') || '[]');
    paymentEvents.push({
      userId,
      action: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILURE',
      resource: 'PAYMENT',
      details: {
        paymentId,
        event,
        success,
        error,
        correlationId: this.generateCorrelationId(),
        severity: success ? 'info' : 'error'
      },
      correlationId: this.generateCorrelationId(),
      severity: success ? 'info' : 'error',
      timestamp: new Date()
    });
    localStorage.setItem('paymentEvents', JSON.stringify(paymentEvents));
  }

  // 📊 METRICS COLLECTION
  async collectMetrics(): Promise<UsageMetrics> {
    // Get events from localStorage (will be replaced with backend API)
    const authEvents = JSON.parse(localStorage.getItem('authEvents') || '[]');
    const auctionEvents = JSON.parse(localStorage.getItem('auctionEvents') || '[]');
    const paymentEvents = JSON.parse(localStorage.getItem('paymentEvents') || '[]');
    
    return {
      auth: {
        loginAttempts: authEvents.filter(log => log.action === 'LOGIN_SUCCESS' || log.action === 'LOGIN_FAILURE').length,
        loginSuccessRate: this.calculateSuccessRate(authEvents, 'LOGIN_SUCCESS', 'LOGIN_FAILURE'),
        registrationAttempts: authEvents.filter(log => log.action === 'REGISTRATION_SUCCESS' || log.action === 'REGISTRATION_FAILURE').length,
        registrationSuccessRate: this.calculateSuccessRate(authEvents, 'REGISTRATION_SUCCESS', 'REGISTRATION_FAILURE'),
        passwordResetRequests: authEvents.filter(log => log.action === 'PASSWORD_RESET_REQUEST').length
      },
      conversion: {
        demoToRealConversionRate: this.calculateConversionRate(authEvents),
        demoUserRetentionRate: this.calculateRetentionRate(authEvents, 'demo'),
        realUserActivationRate: this.calculateActivationRate(authEvents)
      },
      onboarding: {
        onboardingStartRate: this.calculateOnboardingRate(authEvents, 'start'),
        onboardingCompletionRate: this.calculateOnboardingRate(authEvents, 'complete'),
        averageOnboardingTime: this.calculateAverageOnboardingTime(authEvents),
        onboardingDropOffPoints: this.getDropOffPoints(authEvents)
      },
      auctions: {
        auctionStartRate: this.calculateAuctionRate(auctionEvents, 'start'),
        auctionCompletionRate: this.calculateAuctionRate(auctionEvents, 'complete'),
        averageBidCount: this.calculateAverageBidCount(auctionEvents),
        averageSalePrice: this.calculateAverageSalePrice(auctionEvents)
      },
      payments: {
        paymentSuccessRate: this.calculatePaymentSuccessRate(paymentEvents),
        paymentFailureReasons: this.getPaymentFailureReasons(paymentEvents),
        averagePaymentTime: this.calculateAveragePaymentTime(paymentEvents)
      }
    };
  }

  // 🔧 PRIVATE METHODS
  private async logEvent(event: AuthEvent): Promise<void> {
    try {
      // Store in localStorage for now (will be replaced with backend API)
      const authEvents = JSON.parse(localStorage.getItem('authEvents') || '[]');
      authEvents.push(event);
      localStorage.setItem('authEvents', JSON.stringify(authEvents));
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  private async logConversionEvent(event: ConversionEvent): Promise<void> {
    try {
      // Store in localStorage for now (will be replaced with backend API)
      const conversionEvents = JSON.parse(localStorage.getItem('conversionEvents') || '[]');
      conversionEvents.push(event);
      localStorage.setItem('conversionEvents', JSON.stringify(conversionEvents));
    } catch (error) {
      console.error('Failed to log conversion event:', error);
    }
  }

  private async logJourneyEvent(event: UserJourneyEvent): Promise<void> {
    try {
      // Store in localStorage for now (will be replaced with backend API)
      const journeyEvents = JSON.parse(localStorage.getItem('journeyEvents') || '[]');
      journeyEvents.push(event);
      localStorage.setItem('journeyEvents', JSON.stringify(journeyEvents));
    } catch (error) {
      console.error('Failed to log journey event:', error);
    }
  }

  private sanitizeEmail(email: string): string {
    return email.toLowerCase().substring(0, 3) + '***';
  }

  private generateCorrelationId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStepIndex(step: string): number {
    const steps = ['registration', 'verification', 'profile', 'preferences', 'complete'];
    return steps.indexOf(step);
  }

  private calculateSuccessRate(logs: any[], successAction: string, failureAction: string): number {
    const successes = logs.filter(log => log.action === successAction).length;
    const failures = logs.filter(log => log.action === failureAction).length;
    const total = successes + failures;
    return total > 0 ? (successes / total) * 100 : 0;
  }

  private calculateConversionRate(logs: any[]): number {
    const conversions = logs.filter(log => log.action === 'AUTH_MODE_CONVERSION').length;
    const totalUsers = new Set(logs.map(log => log.userId)).size;
    return totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;
  }

  private calculateRetentionRate(logs: any[], userType: string): number {
    const userLogs = logs.filter(log => log.details?.userType === userType);
    const activeUsers = new Set(userLogs.map(log => log.userId)).size;
    const totalUsers = new Set(logs.map(log => log.userId)).size;
    return totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  }

  private calculateActivationRate(logs: any[]): number {
    const activations = logs.filter(log => log.action === 'USER_ACTIVATION').length;
    const totalUsers = new Set(logs.map(log => log.userId)).size;
    return totalUsers > 0 ? (activations / totalUsers) * 100 : 0;
  }

  private calculateOnboardingRate(logs: any[], stage: string): number {
    const onboardingLogs = logs.filter(log => log.action === 'USER_JOURNEY' && log.details?.journeyType === 'onboarding');
    const relevantLogs = onboardingLogs.filter(log => stage === 'start' ? log.details?.step === 'registration' : log.details?.completed);
    const totalOnboarding = onboardingLogs.length;
    return totalOnboarding > 0 ? (relevantLogs.length / totalOnboarding) * 100 : 0;
  }

  private calculateAverageOnboardingTime(logs: any[]): number {
    const onboardingLogs = logs.filter(log => log.action === 'USER_JOURNEY' && log.details?.journeyType === 'onboarding' && log.details?.duration);
    const totalDuration = onboardingLogs.reduce((sum, log) => sum + (log.details?.duration || 0), 0);
    return onboardingLogs.length > 0 ? totalDuration / onboardingLogs.length : 0;
  }

  private getDropOffPoints(logs: any[]): string[] {
    const onboardingLogs = logs.filter(log => log.action === 'USER_JOURNEY' && log.details?.journeyType === 'onboarding' && !log.details?.completed);
    const dropOffSteps = onboardingLogs.map(log => log.details?.step);
    return [...new Set(dropOffSteps)];
  }

  private calculateAuctionRate(logs: any[], stage: string): number {
    const auctionLogs = logs.filter(log => log.action === `AUCTION_${stage.toUpperCase()}`);
    const totalAuctions = logs.filter(log => log.action.startsWith('AUCTION_')).length;
    return totalAuctions > 0 ? (auctionLogs.length / totalAuctions) * 100 : 0;
  }

  private calculateAverageBidCount(logs: any[]): number {
    const bidLogs = logs.filter(log => log.action === 'AUCTION_BID');
    const auctionIds = new Set(bidLogs.map(log => log.details?.auctionId));
    return auctionIds.size > 0 ? bidLogs.length / auctionIds.size : 0;
  }

  private calculateAverageSalePrice(logs: any[]): number {
    const saleLogs = logs.filter(log => log.action === 'AUCTION_COMPLETE' && log.details?.salePrice);
    const totalSales = saleLogs.reduce((sum, log) => sum + (log.details?.salePrice || 0), 0);
    return saleLogs.length > 0 ? totalSales / saleLogs.length : 0;
  }

  private calculatePaymentSuccessRate(logs: any[]): number {
    const successes = logs.filter(log => log.action === 'PAYMENT_SUCCESS').length;
    const failures = logs.filter(log => log.action === 'PAYMENT_FAILURE').length;
    const total = successes + failures;
    return total > 0 ? (successes / total) * 100 : 0;
  }

  private getPaymentFailureReasons(logs: any[]): Record<string, number> {
    const failureLogs = logs.filter(log => log.action === 'PAYMENT_FAILURE');
    const reasons: Record<string, number> = {};
    
    failureLogs.forEach(log => {
      const reason = log.details?.error || 'unknown';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    
    return reasons;
  }

  private calculateAveragePaymentTime(logs: any[]): number {
    const paymentLogs = logs.filter(log => log.action === 'PAYMENT_SUCCESS' && log.details?.processingTime);
    const totalTime = paymentLogs.reduce((sum, log) => sum + (log.details?.processingTime || 0), 0);
    return paymentLogs.length > 0 ? totalTime / paymentLogs.length : 0;
  }
}

// 📊 METRICS INTERFACE
export interface UsageMetrics {
  auth: {
    loginAttempts: number;
    loginSuccessRate: number;
    registrationAttempts: number;
    registrationSuccessRate: number;
    passwordResetRequests: number;
  };
  conversion: {
    demoToRealConversionRate: number;
    demoUserRetentionRate: number;
    realUserActivationRate: number;
  };
  onboarding: {
    onboardingStartRate: number;
    onboardingCompletionRate: number;
    averageOnboardingTime: number;
    onboardingDropOffPoints: string[];
  };
  auctions: {
    auctionStartRate: number;
    auctionCompletionRate: number;
    averageBidCount: number;
    averageSalePrice: number;
  };
  payments: {
    paymentSuccessRate: number;
    paymentFailureReasons: Record<string, number>;
    averagePaymentTime: number;
  };
}

export default UsageTrackingService;
