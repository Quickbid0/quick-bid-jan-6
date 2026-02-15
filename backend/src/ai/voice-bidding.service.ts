import { Injectable, Logger } from '@nestjs/common';
import { AIService } from './ai.service';

export interface VoiceCommand {
  type: 'bid' | 'status' | 'help' | 'cancel' | 'confirm';
  amount?: number;
  confidence: number;
  rawText: string;
  timestamp: Date;
}

export interface VoiceBidSession {
  userId: string;
  auctionId: string;
  sessionId: string;
  isActive: boolean;
  lastActivity: Date;
  commandHistory: VoiceCommand[];
  currentBid?: number;
  pendingConfirmation?: {
    amount: number;
    expiresAt: Date;
  };
}

@Injectable()
export class VoiceBiddingService {
  private readonly logger = new Logger(VoiceBiddingService.name);
  private activeSessions: Map<string, VoiceBidSession> = new Map();

  constructor(private readonly aiService: AIService) {}

  /**
   * Process voice command from user
   */
  async processVoiceCommand(
    userId: string,
    auctionId: string,
    voiceText: string,
    confidence: number
  ): Promise<{
    success: boolean;
    command: VoiceCommand;
    response: {
      text: string;
      action?: 'bid' | 'confirm' | 'cancel';
      bidAmount?: number;
      requiresConfirmation?: boolean;
    };
    session: VoiceBidSession;
  }> {
    try {
      this.logger.log(`Processing voice command for user ${userId}: "${voiceText}"`);

      // Get or create session
      const session = this.getOrCreateSession(userId, auctionId);

      // Parse the voice command using AI
      const command = await this.parseVoiceCommand(voiceText, confidence);

      // Add command to session history
      session.commandHistory.push(command);
      session.lastActivity = new Date();

      // Process the command
      const response = await this.executeVoiceCommand(session, command);

      // Update session
      this.activeSessions.set(session.sessionId, session);

      this.logger.log(`Voice command processed: ${command.type} for user ${userId}`);

      return {
        success: true,
        command,
        response,
        session
      };
    } catch (error) {
      this.logger.error(`Voice command processing error for user ${userId}:`, error);
      throw new Error('Voice command processing failed');
    }
  }

  /**
   * Get active voice bidding session
   */
  getActiveSession(userId: string, auctionId: string): VoiceBidSession | null {
    const sessionId = `${userId}-${auctionId}`;
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * End voice bidding session
   */
  endSession(userId: string, auctionId: string): boolean {
    const sessionId = `${userId}-${auctionId}`;
    const session = this.activeSessions.get(sessionId);

    if (session) {
      session.isActive = false;
      this.logger.log(`Ended voice bidding session for user ${userId}`);
      return true;
    }

    return false;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      // End sessions inactive for more than 10 minutes
      if (now.getTime() - session.lastActivity.getTime() > 10 * 60 * 1000) {
        session.isActive = false;
        expiredSessions.push(sessionId);
      }

      // Clean up expired confirmations
      if (session.pendingConfirmation &&
          now.getTime() > session.pendingConfirmation.expiresAt.getTime()) {
        session.pendingConfirmation = undefined;
      }
    }

    // Remove completely inactive sessions
    expiredSessions.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      this.logger.log(`Cleaned up ${expiredSessions.length} expired voice bidding sessions`);
    }
  }

  private getOrCreateSession(userId: string, auctionId: string): VoiceBidSession {
    const sessionId = `${userId}-${auctionId}`;
    let session = this.activeSessions.get(sessionId);

    if (!session || !session.isActive) {
      session = {
        userId,
        auctionId,
        sessionId,
        isActive: true,
        lastActivity: new Date(),
        commandHistory: []
      };
      this.activeSessions.set(sessionId, session);
      this.logger.log(`Created new voice bidding session for user ${userId}`);
    }

    return session;
  }

  private async parseVoiceCommand(voiceText: string, confidence: number): Promise<VoiceCommand> {
    const text = voiceText.toLowerCase().trim();

    // Basic keyword matching (can be enhanced with ML models)
    if (text.includes('bid') || text.includes('offer') || text.includes('place')) {
      const amount = this.extractBidAmount(text);
      return {
        type: 'bid',
        amount,
        confidence,
        rawText: voiceText,
        timestamp: new Date()
      };
    }

    if (text.includes('status') || text.includes('current') || text.includes('price')) {
      return {
        type: 'status',
        confidence,
        rawText: voiceText,
        timestamp: new Date()
      };
    }

    if (text.includes('help') || text.includes('what') || text.includes('how')) {
      return {
        type: 'help',
        confidence,
        rawText: voiceText,
        timestamp: new Date()
      };
    }

    if (text.includes('cancel') || text.includes('stop') || text.includes('quit')) {
      return {
        type: 'cancel',
        confidence,
        rawText: voiceText,
        timestamp: new Date()
      };
    }

    if (text.includes('yes') || text.includes('confirm') || text.includes('okay') || text.includes('sure')) {
      return {
        type: 'confirm',
        confidence,
        rawText: voiceText,
        timestamp: new Date()
      };
    }

    // Default to help if command not recognized
    return {
      type: 'help',
      confidence,
      rawText: voiceText,
      timestamp: new Date()
    };
  }

  private extractBidAmount(text: string): number | undefined {
    // Extract numbers from voice text
    const numberPatterns = [
      /\b(\d+(?:,\d{3})*(?:\.\d{2})?)\b/g,  // 1,000 or 1000.50
      /\b(\d+)\s*(?:thousand|k)\b/gi,        // 5 thousand or 5k
      /\b(\d+)\s*(?:lakh|l)\b/gi,           // 5 lakh or 5l
      /\b(\d+)\s*(?:crore|c)\b/gi           // 5 crore or 5c
    ];

    for (const pattern of numberPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const amount = this.parseAmount(matches[0]);
        if (amount && amount > 0) {
          return amount;
        }
      }
    }

    return undefined;
  }

  private parseAmount(amountText: string): number | null {
    const text = amountText.toLowerCase().replace(/,/g, '');

    // Handle Indian numbering system
    if (text.includes('lakh') || text.includes('l')) {
      const num = parseFloat(text.replace(/\s*(?:lakh|l)\s*/gi, ''));
      return num * 100000; // 1 lakh = 100,000
    }

    if (text.includes('crore') || text.includes('c')) {
      const num = parseFloat(text.replace(/\s*(?:crore|c)\s*/gi, ''));
      return num * 10000000; // 1 crore = 10,000,000
    }

    if (text.includes('thousand') || text.includes('k')) {
      const num = parseFloat(text.replace(/\s*(?:thousand|k)\s*/gi, ''));
      return num * 1000;
    }

    return parseFloat(text) || null;
  }

  private async executeVoiceCommand(
    session: VoiceBidSession,
    command: VoiceCommand
  ): Promise<{
    text: string;
    action?: 'bid' | 'confirm' | 'cancel';
    bidAmount?: number;
    requiresConfirmation?: boolean;
  }> {
    switch (command.type) {
      case 'bid':
        return await this.handleBidCommand(session, command);

      case 'status':
        return await this.handleStatusCommand(session);

      case 'help':
        return this.handleHelpCommand();

      case 'cancel':
        return this.handleCancelCommand(session);

      case 'confirm':
        return await this.handleConfirmCommand(session);

      default:
        return {
          text: "I'm sorry, I didn't understand that command. Say 'help' to learn available commands."
        };
    }
  }

  private async handleBidCommand(
    session: VoiceBidSession,
    command: VoiceCommand
  ): Promise<{
    text: string;
    action?: 'bid' | 'confirm' | 'cancel';
    bidAmount?: number;
    requiresConfirmation?: boolean;
  }> {
    if (!command.amount) {
      return {
        text: "I didn't catch the bid amount. Please say something like 'bid 5000 rupees' or 'place bid for 10 thousand'."
      };
    }

    // Validate bid amount against current auction state
    const auctionState = await this.getAuctionState(session.auctionId);

    if (command.amount <= auctionState.currentBid) {
      return {
        text: `Your bid of ₹${command.amount.toLocaleString()} is too low. The current bid is ₹${auctionState.currentBid.toLocaleString()}.`
      };
    }

    if (command.amount < auctionState.currentBid + auctionState.bidIncrement) {
      const minBid = auctionState.currentBid + auctionState.bidIncrement;
      return {
        text: `Your bid must be at least ₹${minBid.toLocaleString()}. Would you like to bid ₹${minBid.toLocaleString()} instead?`
      };
    }

    // Check user balance
    const userBalance = await this.getUserBalance(session.userId);
    if (command.amount > userBalance) {
      return {
        text: `Insufficient balance. Your current balance is ₹${userBalance.toLocaleString()}, but you're trying to bid ₹${command.amount.toLocaleString()}.`
      };
    }

    // Set up confirmation for high-value bids
    if (command.amount > auctionState.currentBid * 1.5) {
      session.pendingConfirmation = {
        amount: command.amount,
        expiresAt: new Date(Date.now() + 30 * 1000) // 30 seconds
      };

      return {
        text: `You want to bid ₹${command.amount.toLocaleString()}? This is significantly higher than the current bid. Say 'confirm' to place the bid or 'cancel' to stop.`,
        action: 'confirm',
        bidAmount: command.amount,
        requiresConfirmation: true
      };
    }

    // Place bid directly
    session.currentBid = command.amount;

    return {
      text: `Placing your bid of ₹${command.amount.toLocaleString()} on ${auctionState.title}. Confirming...`,
      action: 'bid',
      bidAmount: command.amount
    };
  }

  private async handleStatusCommand(session: VoiceBidSession): Promise<{ text: string }> {
    const auctionState = await this.getAuctionState(session.auctionId);

    return {
      text: `Current bid on ${auctionState.title} is ₹${auctionState.currentBid.toLocaleString()} with ${auctionState.bidderCount} bidders. Time remaining: ${this.formatTimeRemaining(auctionState.timeLeft)}.`
    };
  }

  private handleHelpCommand(): { text: string } {
    return {
      text: `Voice bidding commands: Say 'bid [amount]' to place a bid, 'status' for current auction info, 'help' for commands, 'cancel' to stop. For example: 'bid 5000 rupees' or 'place bid for 10 thousand'.`
    };
  }

  private handleCancelCommand(session: VoiceBidSession): { text: string; action: 'cancel' } {
    session.pendingConfirmation = undefined;
    return {
      text: 'Voice bidding session cancelled. You can start again anytime.',
      action: 'cancel'
    };
  }

  private async handleConfirmCommand(session: VoiceBidSession): Promise<{
    text: string;
    action?: 'bid';
    bidAmount?: number;
  }> {
    if (!session.pendingConfirmation) {
      return {
        text: 'Nothing to confirm. Say "bid [amount]" to place a new bid.'
      };
    }

    if (new Date() > session.pendingConfirmation.expiresAt) {
      session.pendingConfirmation = undefined;
      return {
        text: 'Confirmation expired. Please try your bid again.'
      };
    }

    const amount = session.pendingConfirmation.amount;
    session.pendingConfirmation = undefined;
    session.currentBid = amount;

    return {
      text: `Bid confirmed! Placing ₹${amount.toLocaleString()}...`,
      action: 'bid',
      bidAmount: amount
    };
  }

  private async getAuctionState(auctionId: string): Promise<{
    title: string;
    currentBid: number;
    bidIncrement: number;
    bidderCount: number;
    timeLeft: number;
  }> {
    // In production, fetch from database
    // For demo, return mock data
    return {
      title: 'Premium Auction Item',
      currentBid: 5000,
      bidIncrement: 500,
      bidderCount: 12,
      timeLeft: 1800 // 30 minutes in seconds
    };
  }

  private async getUserBalance(userId: string): Promise<number> {
    // In production, fetch from wallet service
    // For demo, return mock balance
    return 25000;
  }

  private formatTimeRemaining(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    }
    return `${minutes} minutes`;
  }
}
