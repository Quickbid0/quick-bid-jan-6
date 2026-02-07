// 📊 WEEKLY REVIEW PROCESS
// src/services/weeklyReview.service.ts

import SupportTicketService, { TicketCategory, TicketPriority, TicketStatus } from './supportTicket.service';
import UsageTrackingService, { UsageMetrics } from './usageTracking.service';

export interface WeeklyReviewReport {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  metrics: UsageMetrics;
  ticketStats: {
    total: number;
    byCategory: Record<TicketCategory, number>;
    byPriority: Record<TicketPriority, number>;
    byStatus: Record<TicketStatus, number>;
    averageResolutionTime: number;
    customerSatisfaction: number;
  };
  insights: ReviewInsight[];
  recommendations: ReviewRecommendation[];
  actionItems: ReviewActionItem[];
}

export interface ReviewInsight {
  category: 'positive' | 'concern' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

export interface ReviewRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'user_experience' | 'technical' | 'business' | 'support';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  deadline?: string;
}

export interface ReviewActionItem {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

export class WeeklyReviewService {
  private usageTracker: UsageTrackingService;
  private supportService: SupportTicketService;

  constructor() {
    this.usageTracker = new UsageTrackingService();
    this.supportService = new SupportTicketService();
  }

  // Generate weekly review report
  async generateWeeklyReport(weekNumber?: number, year?: number): Promise<WeeklyReviewReport> {
    const now = new Date();
    const currentWeekNumber = weekNumber || this.getWeekNumber(now);
    const currentYear = year || now.getFullYear();
    
    const { startDate, endDate } = this.getWeekDates(currentWeekNumber, currentYear);
    
    console.log(`📊 Generating weekly review report for week ${currentWeekNumber}, ${currentYear}`);

    // Collect metrics
    const metrics = await this.usageTracker.collectMetrics();
    const ticketStats = await this.supportService.getTicketStats();

    // Generate insights
    const insights = await this.generateInsights(metrics, ticketStats);
    const recommendations = this.generateRecommendations(metrics, ticketStats);
    const actionItems = this.generateActionItems(insights, recommendations);

    const report: WeeklyReviewReport = {
      weekNumber: currentWeekNumber,
      year: currentYear,
      startDate,
      endDate,
      metrics,
      ticketStats,
      insights,
      recommendations,
      actionItems
    };

    // Store report in localStorage (will be replaced with backend API)
    const reports = JSON.parse(localStorage.getItem('weeklyReports') || '[]');
    reports.push(report);
    localStorage.setItem('weeklyReports', JSON.stringify(reports));

    console.log('📊 Weekly review report generated:', report.weekNumber, report.year);
    return report;
  }

  // Get week number from date
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Get week start and end dates
  private getWeekDates(weekNumber: number, year: number): { startDate: Date; endDate: Date } {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const startDate = new Date(firstDayOfYear.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    return { startDate, endDate };
  }

  // Generate insights from metrics
  private async generateInsights(metrics: UsageMetrics, ticketStats: any): Promise<ReviewInsight[]> {
    const insights: ReviewInsight[] = [];

    // Authentication insights
    if (metrics.auth.loginSuccessRate < 80) {
      insights.push({
        category: 'concern',
        title: 'Low Login Success Rate',
        description: `Login success rate is ${metrics.auth.loginSuccessRate.toFixed(1)}%, below target of 80%`,
        impact: 'high',
        data: { current: metrics.auth.loginSuccessRate, target: 80 }
      });
    }

    if (metrics.auth.loginSuccessRate > 95) {
      insights.push({
        category: 'positive',
        title: 'Excellent Login Performance',
        description: `Login success rate is ${metrics.auth.loginSuccessRate.toFixed(1)}%, exceeding target`,
        impact: 'high',
        data: { current: metrics.auth.loginSuccessRate, target: 80 }
      });
    }

    // Registration insights
    if (metrics.auth.registrationSuccessRate < 70) {
      insights.push({
        category: 'concern',
        title: 'Low Registration Success Rate',
        description: `Registration success rate is ${metrics.auth.registrationSuccessRate.toFixed(1)}%, below target of 70%`,
        impact: 'medium',
        data: { current: metrics.auth.registrationSuccessRate, target: 70 }
      });
    }

    // Conversion insights
    if (metrics.conversion.demoToRealConversionRate < 10) {
      insights.push({
        category: 'opportunity',
        title: 'Low Demo to Real Conversion',
        description: `Only ${metrics.conversion.demoToRealConversionRate.toFixed(1)}% of demo users convert to real accounts`,
        impact: 'high',
        data: { current: metrics.conversion.demoToRealConversionRate, target: 20 }
      });
    }

    if (metrics.conversion.demoToRealConversionRate > 30) {
      insights.push({
        category: 'positive',
        title: 'Strong Demo to Real Conversion',
        description: `${metrics.conversion.demoToRealConversionRate.toFixed(1)}% of demo users convert to real accounts`,
        impact: 'high',
        data: { current: metrics.conversion.demoToRealConversionRate, target: 20 }
      });
    }

    // Onboarding insights
    if (metrics.onboarding.onboardingCompletionRate < 60) {
      insights.push({
        category: 'concern',
        title: 'Low Onboarding Completion Rate',
        description: `Only ${metrics.onboarding.onboardingCompletionRate.toFixed(1)}% of users complete onboarding`,
        impact: 'high',
        data: { current: metrics.onboarding.onboardingCompletionRate, target: 80 }
      });
    }

    if (metrics.onboarding.onboardingDropOffPoints.length > 3) {
      insights.push({
        category: 'concern',
        title: 'Multiple Onboarding Drop-off Points',
        description: `${metrics.onboarding.onboardingDropOffPoints.length} drop-off points identified`,
        impact: 'medium',
        data: { dropOffPoints: metrics.onboarding.onboardingDropOffPoints }
      });
    }

    // Ticket insights
    if (ticketStats.averageResolutionTime > 48) { // 48 hours in minutes
      insights.push({
        category: 'concern',
        title: 'Long Ticket Resolution Time',
        description: `Average resolution time is ${ticketStats.averageResolutionTime.toFixed(1)} hours, exceeding target of 24 hours`,
        impact: 'medium',
        data: { current: ticketStats.averageResolutionTime, target: 24 }
      });
    }

    if (ticketStats.customerSatisfaction < 4.0) {
      insights.push({
        category: 'concern',
        title: 'Low Customer Satisfaction',
        description: `Customer satisfaction score is ${ticketStats.customerSatisfaction.toFixed(1)}, below target of 4.0`,
        impact: 'high',
        data: { current: ticketStats.customerSatisfaction, target: 4.0 }
      });
    }

    // Payment insights
    if (metrics.payments.paymentSuccessRate < 90) {
      insights.push({
        category: 'concern',
        title: 'Low Payment Success Rate',
        description: `Payment success rate is ${metrics.payments.paymentSuccessRate.toFixed(1)}%, below target of 90%`,
        impact: 'high',
        data: { current: metrics.payments.paymentSuccessRate, target: 90 }
      });
    }

    // Auction insights
    if (metrics.auctions.auctionCompletionRate < 50) {
      insights.push({
        category: 'opportunity',
        title: 'Low Auction Completion Rate',
        description: `Only ${metrics.auctions.auctionCompletionRate.toFixed(1)}% of auctions complete successfully`,
        impact: 'medium',
        data: { current: metrics.auctions.auctionCompletionRate, target: 70 }
      });
    }

    return insights;
  }

  // Generate recommendations based on insights
  private generateRecommendations(metrics: UsageMetrics, ticketStats: any): ReviewRecommendation[] {
    const recommendations: ReviewRecommendation[] = [];

    // Authentication recommendations
    if (metrics.auth.loginSuccessRate < 80) {
      recommendations.push({
        priority: 'high',
        category: 'technical',
        title: 'Improve Login Flow',
        description: 'Analyze login failures and improve user experience',
        expectedImpact: 'Increase login success rate by 15%',
        effort: 'medium',
        deadline: '2 weeks'
      });
    }

    // Registration recommendations
    if (metrics.auth.registrationSuccessRate < 70) {
      recommendations.push({
        priority: 'medium',
        category: 'user_experience',
        title: 'Simplify Registration Process',
        description: 'Reduce friction in registration flow and improve user guidance',
        expectedImpact: 'Increase registration success rate by 20%',
        effort: 'low',
        deadline: '1 week'
      });
    }

    // Conversion recommendations
    if (metrics.conversion.demoToRealConversionRate < 10) {
      recommendations.push({
        priority: 'high',
        category: 'business',
        title: 'Enhance Demo to Real Conversion',
        description: 'Create compelling reasons for users to upgrade to real accounts',
        expectedImpact: 'Increase conversion rate by 15%',
        effort: 'medium',
        deadline: '3 weeks'
      });
    }

    // Onboarding recommendations
    if (metrics.onboarding.onboardingCompletionRate < 60) {
      recommendations.push({
        priority: 'high',
        category: 'user_experience',
        title: 'Optimize Onboarding Flow',
        description: 'Address drop-off points and improve onboarding experience',
        expectedImpact: 'Increase completion rate by 25%',
        effort: 'medium',
        deadline: '2 weeks'
      });
    }

    // Support recommendations
    if (ticketStats.averageResolutionTime > 48) {
      recommendations.push({
        priority: 'medium',
        category: 'support',
        title: 'Improve Support Response Time',
        description: 'Implement better ticket triage and agent training',
        expectedImpact: 'Reduce resolution time by 50%',
        effort: 'medium',
        deadline: '2 weeks'
      });
    }

    return recommendations;
  }

  // Generate action items
  private generateActionItems(insights: ReviewInsight[], recommendations: ReviewRecommendation[]): ReviewActionItem[] {
    const actionItems: ReviewActionItem[] = [];

    // Generate action items from insights
    insights.forEach(insight => {
      if (insight.category === 'concern' && insight.impact === 'high') {
        actionItems.push({
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `Address: ${insight.title}`,
          description: `Investigate and resolve ${insight.title.toLowerCase()}`,
          priority: 'high',
          status: 'pending',
          createdAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
        });
      }
    });

    // Generate action items from recommendations
    recommendations.forEach(rec => {
      actionItems.push({
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        status: 'pending',
        createdAt: new Date(),
        dueDate: rec.deadline ? new Date(Date.now() + this.parseDeadline(rec.deadline)) : undefined
      });
    });

    return actionItems;
  }

  // Parse deadline string to days
  private parseDeadline(deadline: string): number {
    const unit = deadline.toLowerCase().replace(/[0-9]/g, '');
    const value = parseInt(deadline.replace(/[^\d]/g, ''));
    
    switch (unit) {
      case 'day':
      case 'days':
        return value;
      case 'week':
      case 'weeks':
        return value * 7;
      case 'month':
      case 'months':
        return value * 30;
      default:
        return 7; // Default to 1 week
    }
  }

  // Get all weekly reports
  async getAllReports(): Promise<WeeklyReviewReport[]> {
    const reports = JSON.parse(localStorage.getItem('weeklyReports') || '[]');
    return reports.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
  }

  // Get report by week number and year
  async getReport(weekNumber: number, year: number): Promise<WeeklyReviewReport | null> {
    const reports = JSON.parse(localStorage.getItem('weeklyReviews') || '[]');
    return reports.find(report => report.weekNumber === weekNumber && report.year === year) || null;
  }

  // Get reports by date range
  async getReportsByDateRange(startDate: Date, endDate: Date): Promise<WeeklyReviewReport[]> {
    const reports = JSON.parse(localStorage.getItem('weeklyReports') || '[]');
    return reports.filter(report => {
      const reportStart = new Date(report.startDate);
      const reportEnd = new Date(report.endDate);
      return reportStart >= startDate && reportEnd <= endDate;
    });
  }

  // Export report to JSON
  async exportReport(weekNumber: number, year: number): Promise<string> {
    const report = await this.getReport(weekNumber, year);
    if (!report) {
      throw new Error(`Report for week ${weekNumber}, ${year} not found`);
    }
    return JSON.stringify(report, null, 2);
  }

  // Generate summary statistics
  async generateSummaryStats(weeks: number = 12): Promise<{
    totalReports: number;
    averageLoginSuccessRate: number;
    averageRegistrationSuccessRate: number;
    averageConversionRate: number;
    averageOnboardingCompletionRate: number;
    averageCustomerSatisfaction: number;
    totalTickets: number;
    averageResolutionTime: number;
  }> {
    const reports = await this.getAllReports();
    const recentReports = reports.slice(-weeks);

    if (recentReports.length === 0) {
      return {
        totalReports: 0,
        averageLoginSuccessRate: 0,
        averageRegistrationSuccessRate: 0,
        averageConversionRate: 0,
        averageOnboardingCompletionRate: 0,
        averageCustomerSatisfaction: 0,
        totalTickets: 0,
        averageResolutionTime: 0
      };
    }

    const totals = recentReports.reduce((acc, report) => ({
      totalReports: acc.totalReports + 1,
      averageLoginSuccessRate: acc.averageLoginSuccessRate + report.metrics.auth.loginSuccessRate,
      averageRegistrationSuccessRate: acc.averageRegistrationSuccessRate + report.metrics.auth.registrationSuccessRate,
      averageConversionRate: acc.averageConversionRate + report.metrics.conversion.demoToRealConversionRate,
      averageOnboardingCompletionRate: acc.averageOnboardingCompletionRate + report.metrics.onboarding.onboardingCompletionRate,
      averageCustomerSatisfaction: acc.averageCustomerSatisfaction + report.ticketStats.customerSatisfaction,
      totalTickets: acc.totalTickets + report.ticketStats.total,
      averageResolutionTime: acc.averageResolutionTime + report.ticketStats.averageResolutionTime
    }), {
      totalReports: 0,
      averageLoginSuccessRate: 0,
      averageRegistrationSuccessRate: 0,
      averageConversionRate: 0,
      averageOnboardingCompletionRate: 0,
      averageCustomerSatisfaction: 0,
      totalTickets: 0,
      averageResolutionTime: 0
    });

    const count = recentReports.length;

    return {
      totalReports: count,
      averageLoginSuccessRate: totals.averageLoginSuccessRate / count,
      averageRegistrationSuccessRate: totals.averageRegistrationSuccessRate / count,
      averageConversionRate: totals.averageConversionRate / count,
      averageOnboardingCompletionRate: totals.averageOnboardingCompletionRate / count,
      averageCustomerSatisfaction: totals.averageCustomerSatisfaction / count,
      totalTickets: totals.totalTickets,
      averageResolutionTime: totals.averageResolutionTime / count
    };
  }

  // Create action item
  async createActionItem(
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    assignee?: string,
    deadline?: string
  ): Promise<ReviewActionItem> {
    const actionItem: ReviewActionItem = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      priority,
      assignee,
      status: 'pending',
      createdAt: new Date(),
      dueDate: deadline ? new Date(Date.now() + this.parseDeadline(deadline)) : undefined
    };

    // Store in localStorage (will be replaced with backend API)
    const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
    actionItems.push(actionItem);
    localStorage.setItem('actionItems', JSON.stringify(actionItems));

    console.log('📊 Action item created:', actionItem.id, actionItem.title);
    return actionItem;
  }

  // Update action item status
  async updateActionItemStatus(
    actionItemId: string,
    status: 'pending' | 'in_progress' | 'completed',
    assignee?: string
  ): Promise<ReviewActionItem> {
    const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
    const actionItem = actionItems.find(item => item.id === actionItemId);
    
    if (!actionItem) {
      throw new Error(`Action item ${actionItemId} not found`);
    }

    actionItem.status = status;
    if (assignee) {
      actionItem.assignee = assignee;
    }
    
    if (status === 'completed') {
      actionItem.completedAt = new Date();
    }

    // Update localStorage
    const itemIndex = actionItems.findIndex(item => item.id === actionItemId);
    if (itemIndex !== -1) {
      actionItems[itemIndex] = actionItem;
      localStorage.setItem('actionItems', JSON.stringify(actionItems));
    }

    console.log('📊 Action item status updated:', actionItemId, status);
    return actionItem;
  }

  // Get action items by status
  async getActionItems(status?: 'pending' | 'in_progress' | 'completed'): Promise<ReviewActionItem[]> {
    const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
    
    if (status) {
      return actionItems.filter(item => item.status === status);
    }
    
    return actionItems;
  }

  // Get action items by assignee
  async getActionItemsByAssignee(assignee: string): Promise<ReviewActionItem[]> {
    const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
    return actionItems.filter(item => item.assignee === assignee);
  }

  // Get overdue action items
  async getOverdueActionItems(): Promise<ReviewActionItem[]> {
    const actionItems = JSON.parse(localStorage.getItem('actionItems') || '[]');
    const now = new Date();
    
    return actionItems.filter(item => 
      item.status !== 'completed' && 
      item.dueDate && 
      item.dueDate < now
    );
  }
}

export default WeeklyReviewService;
