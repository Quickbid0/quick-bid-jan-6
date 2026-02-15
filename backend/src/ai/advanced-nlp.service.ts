import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NLPIntent {
  intent: 'bid' | 'ask_price' | 'ask_status' | 'ask_help' | 'negotiate' | 'complaint' | 'praise' | 'inquiry' | 'command';
  confidence: number;
  entities: Array<{
    type: 'amount' | 'currency' | 'product' | 'time' | 'person' | 'location';
    value: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  language: string;
  context: {
    auctionId?: string;
    userId?: string;
    conversationHistory?: string[];
  };
}

export interface ChatResponse {
  response: string;
  suggestedActions?: Array<{
    type: 'bid' | 'view_product' | 'ask_question' | 'end_conversation';
    label: string;
    data?: any;
  }>;
  followUpQuestions?: string[];
  confidence: number;
  language: string;
  metadata: {
    processingTime: number;
    modelUsed: string;
    intentDetected: string;
  };
}

export interface ConversationContext {
  userId: string;
  auctionId?: string;
  conversationId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  currentIntent?: string;
  contextData: {
    preferredLanguage: string;
    biddingHistory: any[];
    favoriteCategories: string[];
    riskTolerance: 'low' | 'medium' | 'high';
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    message: string;
    timestamp: Date;
    intent?: string;
    entities?: any[];
  }>;
}

@Injectable()
export class AdvancedNLPService {
  private readonly logger = new Logger(AdvancedNLPService.name);
  private activeConversations: Map<string, ConversationContext> = new Map();

  constructor(private readonly configService: ConfigService) {}

  /**
   * ADVANCED INTENT RECOGNITION - Natural language understanding
   */
  async analyzeIntent(
    message: string,
    context: {
      userId?: string;
      auctionId?: string;
      language?: string;
      conversationHistory?: string[];
    } = {}
  ): Promise<NLPIntent> {
    const startTime = Date.now();

    this.logger.log(`Analyzing intent for message: "${message.substring(0, 50)}..."`);

    try {
      // Detect language
      const language = await this.detectLanguage(message, context.language);

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(message, language);

      // Extract entities
      const entities = await this.extractEntities(message, language);

      // Determine primary intent
      const intentResult = await this.classifyIntent(message, entities, context, language);

      // Update conversation context if userId provided
      if (context.userId) {
        await this.updateConversationContext(context.userId, {
          message,
          intent: intentResult.intent,
          entities,
          sentiment,
          language
        });
      }

      const nlpIntent: NLPIntent = {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities,
        sentiment: sentiment.label,
        sentimentScore: sentiment.score,
        language,
        context: {
          auctionId: context.auctionId,
          userId: context.userId,
          conversationHistory: context.conversationHistory
        }
      };

      const processingTime = Date.now() - startTime;
      this.logger.log(`Intent analysis completed in ${processingTime}ms: ${intentResult.intent} (${(intentResult.confidence * 100).toFixed(1)}% confidence)`);

      return nlpIntent;

    } catch (error) {
      this.logger.error('Intent analysis failed:', error);
      throw new Error(`NLP intent analysis failed: ${error.message}`);
    }
  }

  /**
   * CONVERSATIONAL AI - Intelligent chat responses
   */
  async generateChatResponse(
    userMessage: string,
    context: {
      userId: string;
      auctionId?: string;
      language?: string;
      userProfile?: any;
      auctionData?: any;
    }
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    this.logger.log(`Generating chat response for user ${context.userId}`);

    try {
      // Analyze user intent
      const intent = await this.analyzeIntent(userMessage, {
        userId: context.userId,
        auctionId: context.auctionId,
        language: context.language
      });

      // Get conversation context
      const conversationContext = this.getConversationContext(context.userId);

      // Generate contextual response
      const response = await this.generateContextualResponse(intent, context, conversationContext);

      // Generate suggested actions
      const suggestedActions = await this.generateSuggestedActions(intent, context);

      // Generate follow-up questions
      const followUpQuestions = await this.generateFollowUpQuestions(intent, context);

      const processingTime = Date.now() - startTime;

      const chatResponse: ChatResponse = {
        response: response.text,
        suggestedActions,
        followUpQuestions,
        confidence: response.confidence,
        language: intent.language,
        metadata: {
          processingTime,
          modelUsed: 'advanced-nlp-v2',
          intentDetected: intent.intent
        }
      };

      // Update conversation history
      this.updateConversationHistory(context.userId, 'assistant', response.text, intent.intent);

      this.logger.log(`Chat response generated in ${processingTime}ms`);
      return chatResponse;

    } catch (error) {
      this.logger.error('Chat response generation failed:', error);
      throw new Error(`Chat response generation failed: ${error.message}`);
    }
  }

  /**
   * VOICE COMMAND PROCESSING - Enhanced voice bidding
   */
  async processVoiceCommand(
    audioData: Buffer,
    context: {
      userId: string;
      auctionId?: string;
      language?: string;
      previousCommands?: string[];
    }
  ): Promise<{
    transcription: string;
    intent: NLPIntent;
    response: ChatResponse;
    confidence: number;
  }> {
    this.logger.log(`Processing voice command for user ${context.userId}`);

    try {
      // Convert speech to text (placeholder - would integrate with speech service)
      const transcription = await this.transcribeAudio(audioData, context.language || 'en');

      // Analyze intent from transcription
      const intent = await this.analyzeIntent(transcription, {
        userId: context.userId,
        auctionId: context.auctionId,
        language: context.language,
        conversationHistory: context.previousCommands
      });

      // Generate voice response
      const response = await this.generateVoiceResponse(intent, context);

      const result = {
        transcription,
        intent,
        response,
        confidence: Math.min(intent.confidence, response.confidence)
      };

      this.logger.log(`Voice command processed: "${transcription}" -> ${intent.intent}`);
      return result;

    } catch (error) {
      this.logger.error('Voice command processing failed:', error);
      throw new Error(`Voice command processing failed: ${error.message}`);
    }
  }

  /**
   * MULTI-LANGUAGE SUPPORT - Advanced translation and localization
   */
  async translateAndLocalize(
    text: string,
    targetLanguage: string,
    context: {
      domain?: 'auction' | 'bidding' | 'customer_service';
      userPreferences?: any;
      culturalContext?: string;
    } = {}
  ): Promise<{
    translatedText: string;
    localizedText: string;
    confidence: number;
    culturalNotes?: string[];
  }> {
    this.logger.log(`Translating to ${targetLanguage}: "${text.substring(0, 50)}..."`);

    try {
      // Basic translation (placeholder - would use translation API)
      const translatedText = await this.translateText(text, targetLanguage);

      // Cultural localization
      const localizedText = await this.localizeText(translatedText, targetLanguage, context);

      // Cultural sensitivity check
      const culturalNotes = await this.checkCulturalSensitivity(text, targetLanguage, context);

      const result = {
        translatedText,
        localizedText,
        confidence: 0.85, // Placeholder confidence
        culturalNotes: culturalNotes.length > 0 ? culturalNotes : undefined
      };

      this.logger.log(`Translation completed for ${targetLanguage}`);
      return result;

    } catch (error) {
      this.logger.error('Translation failed:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * CONVERSATION CONTEXT MANAGEMENT
   */
  private getConversationContext(userId: string): ConversationContext {
    return this.activeConversations.get(userId) || this.createConversationContext(userId);
  }

  private createConversationContext(userId: string): ConversationContext {
    const context: ConversationContext = {
      userId,
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      contextData: {
        preferredLanguage: 'en',
        biddingHistory: [],
        favoriteCategories: [],
        riskTolerance: 'medium'
      },
      conversationHistory: []
    };

    this.activeConversations.set(userId, context);
    return context;
  }

  private updateConversationContext(userId: string, messageData: any): void {
    const context = this.getConversationContext(userId);
    context.lastActivity = new Date();
    context.messageCount++;

    // Update context data based on conversation
    if (messageData.intent === 'bid' && messageData.entities.some((e: any) => e.type === 'amount')) {
      context.contextData.biddingHistory.push({
        timestamp: new Date(),
        intent: messageData.intent,
        amount: messageData.entities.find((e: any) => e.type === 'amount')?.value
      });
    }
  }

  private updateConversationHistory(userId: string, role: 'user' | 'assistant', message: string, intent?: string): void {
    const context = this.getConversationContext(userId);
    context.conversationHistory.push({
      role,
      message,
      timestamp: new Date(),
      intent
    });

    // Keep only last 50 messages
    if (context.conversationHistory.length > 50) {
      context.conversationHistory = context.conversationHistory.slice(-50);
    }
  }

  // ==========================================
  // INTENT ANALYSIS METHODS
  // ==========================================

  private async detectLanguage(text: string, providedLanguage?: string): Promise<string> {
    if (providedLanguage) return providedLanguage;

    // Simple language detection (placeholder)
    const hindiChars = /[\u0900-\u097F]/;
    const tamilChars = /[\u0B80-\u0BFF]/;
    const teluguChars = /[\u0C00-\u0C7F]/;

    if (hindiChars.test(text)) return 'hi';
    if (tamilChars.test(text)) return 'ta';
    if (teluguChars.test(text)) return 'te';

    return 'en';
  }

  private async analyzeSentiment(text: string, language: string): Promise<{ label: 'positive' | 'negative' | 'neutral'; score: number }> {
    // Simple sentiment analysis (placeholder)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) {
      return { label: 'positive', score: 0.7 };
    } else if (negativeCount > positiveCount) {
      return { label: 'negative', score: -0.7 };
    } else {
      return { label: 'neutral', score: 0.0 };
    }
  }

  private async extractEntities(text: string, language: string): Promise<any[]> {
    const entities = [];

    // Extract amounts (₹, rupees, dollars, etc.)
    const amountPatterns = [
      /(?:₹|rs|rupees?)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|rs|rupees?)/gi,
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/gi
    ];

    for (const pattern of amountPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = match[1] || match[0].replace(/[^\d.]/g, '');
        entities.push({
          type: 'amount',
          value: amount,
          confidence: 0.9,
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    // Extract time references
    const timePatterns = [
      /\b(\d+)\s*(?:minutes?|mins?|hours?|hrs?)\s*(?:ago|from now)\b/gi,
      /\bin\s+(\d+)\s*(?:minutes?|mins?|hours?|hrs?)\b/gi
    ];

    for (const pattern of timePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'time',
          value: match[1],
          confidence: 0.8,
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    return entities;
  }

  private async classifyIntent(
    text: string,
    entities: any[],
    context: any,
    language: string
  ): Promise<{ intent: any; confidence: number }> {
    const lowerText = text.toLowerCase();

    // Bid intent
    if (lowerText.includes('bid') || lowerText.includes('offer') || lowerText.includes('place') ||
        entities.some(e => e.type === 'amount')) {
      return { intent: 'bid', confidence: 0.9 };
    }

    // Status inquiry
    if (lowerText.includes('status') || lowerText.includes('current') || lowerText.includes('price') ||
        lowerText.includes('how much') || lowerText.includes('what is')) {
      return { intent: 'ask_status', confidence: 0.85 };
    }

    // Help request
    if (lowerText.includes('help') || lowerText.includes('how') || lowerText.includes('what') ||
        lowerText.includes('can you') || lowerText.includes('explain')) {
      return { intent: 'ask_help', confidence: 0.8 };
    }

    // Negotiation
    if (lowerText.includes('negotiate') || lowerText.includes('deal') || lowerText.includes('counter') ||
        lowerText.includes('lower') || lowerText.includes('discount')) {
      return { intent: 'negotiate', confidence: 0.75 };
    }

    // Complaints
    if (lowerText.includes('problem') || lowerText.includes('issue') || lowerText.includes('wrong') ||
        lowerText.includes('bad') || lowerText.includes('terrible')) {
      return { intent: 'complaint', confidence: 0.7 };
    }

    // Default to inquiry
    return { intent: 'inquiry', confidence: 0.6 };
  }

  // ==========================================
  // RESPONSE GENERATION METHODS
  // ==========================================

  private async generateContextualResponse(
    intent: NLPIntent,
    context: any,
    conversationContext: ConversationContext
  ): Promise<{ text: string; confidence: number }> {
    const { auctionData, userProfile } = context;

    switch (intent.intent) {
      case 'bid':
        const amount = intent.entities.find(e => e.type === 'amount')?.value;
        if (amount) {
          return {
            text: `I understand you want to place a bid of ₹${amount}. ${this.getBiddingGuidance(amount, auctionData)}`,
            confidence: 0.9
          };
        }
        return {
          text: "I'd be happy to help you place a bid. Could you please specify the amount you'd like to bid?",
          confidence: 0.8
        };

      case 'ask_status':
        if (auctionData) {
          return {
            text: `The current bid for ${auctionData.title} is ₹${auctionData.currentBid}. There are ${auctionData.bidders} active bidders. The auction ends in ${this.formatTimeRemaining(auctionData.timeLeft)}.`,
            confidence: 0.95
          };
        }
        return {
          text: "I'd be happy to provide auction status. Could you please specify which auction you're interested in?",
          confidence: 0.7
        };

      case 'ask_help':
        return {
          text: `I'm here to help with your auction experience! You can ask me about:
• Current bid prices and status
• How to place bids
• Auction rules and timing
• Product information
• Bidding strategies

What would you like to know more about?`,
          confidence: 0.9
        };

      case 'negotiate':
        return {
          text: "While I can't negotiate on behalf of sellers, I can help you understand the current market value and suggest competitive bidding strategies. Would you like me to analyze the current auction pricing?",
          confidence: 0.8
        };

      case 'complaint':
        return {
          text: "I'm sorry to hear you're experiencing issues. Our customer support team is here to help. Would you like me to connect you with a support representative or provide information about our policies?",
          confidence: 0.85
        };

      default:
        return {
          text: "I'm here to assist you with your auction experience. You can ask me about bids, auction status, or general help. How can I help you today?",
          confidence: 0.7
        };
    }
  }

  private async generateSuggestedActions(intent: NLPIntent, context: any): Promise<any[]> {
    const actions = [];

    switch (intent.intent) {
      case 'bid':
        const amount = intent.entities.find(e => e.type === 'amount')?.value;
        if (amount && context.auctionData) {
          actions.push({
            type: 'bid',
            label: `Place Bid: ₹${amount}`,
            data: { amount: parseInt(amount.replace(/,/g, '')) }
          });
        }
        break;

      case 'ask_status':
        actions.push({
          type: 'view_product',
          label: 'View Product Details',
          data: { productId: context.auctionData?.productId }
        });
        break;

      case 'ask_help':
        actions.push({
          type: 'ask_question',
          label: 'Ask About Bidding',
          data: { topic: 'bidding' }
        });
        break;
    }

    return actions;
  }

  private async generateFollowUpQuestions(intent: NLPIntent, context: any): Promise<string[]> {
    const questions = [];

    switch (intent.intent) {
      case 'bid':
        questions.push("Would you like me to explain the bidding process?");
        questions.push("Are you interested in similar products?");
        break;

      case 'ask_status':
        questions.push("Would you like to know about the seller's rating?");
        questions.push("Are you interested in bidding on this item?");
        break;

      case 'ask_help':
        questions.push("Do you need help with account setup?");
        questions.push("Would you like a tour of the platform?");
        break;
    }

    return questions;
  }

  private async generateVoiceResponse(intent: NLPIntent, context: any): Promise<ChatResponse> {
    // Generate voice-optimized responses (shorter, more conversational)
    const baseResponse = await this.generateContextualResponse(intent, context, this.getConversationContext(context.userId));

    return {
      ...baseResponse,
      response: baseResponse.text.replace(/•/g, '').replace(/\n/g, ' '), // Remove formatting for voice
      suggestedActions: [],
      followUpQuestions: [],
      language: intent.language,
      metadata: {
        processingTime: 0,
        modelUsed: 'voice-nlp-v1',
        intentDetected: intent.intent
      }
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private getBiddingGuidance(amount: string, auctionData: any): string {
    if (!auctionData) return "Please confirm the auction details before bidding.";

    const bidAmount = parseInt(amount.replace(/,/g, ''));
    const currentBid = auctionData.currentBid || 0;
    const minBid = currentBid + (auctionData.bidIncrement || 100);

    if (bidAmount < minBid) {
      return `The minimum bid required is ₹${minBid}. Would you like to adjust your bid?`;
    }

    if (bidAmount > currentBid * 1.5) {
      return `That's a significantly higher bid than the current price. This might deter other bidders. Are you sure you want to proceed?`;
    }

    return `This looks like a competitive bid. I recommend confirming before submitting.`;
  }

  private formatTimeRemaining(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hours and ${minutes} minutes`;
    }
    return `${minutes} minutes`;
  }

  private async transcribeAudio(audioData: Buffer, language?: string): Promise<string> {
    // Placeholder for speech-to-text integration
    // In production, integrate with Google Speech-to-Text, AWS Transcribe, etc.
    return "This is a transcribed voice command"; // Placeholder
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // Placeholder for translation service
    // In production, use Google Translate, AWS Translate, etc.
    if (targetLanguage === 'hi') {
      // Simple example translations
      return text.replace(/bid/g, 'बोली लगाएं')
                 .replace(/status/g, 'स्थिति')
                 .replace(/help/g, 'मदद');
    }
    return text; // Placeholder
  }

  private async localizeText(text: string, language: string, context: any): Promise<string> {
    // Apply cultural and regional localization
    // Adjust currency symbols, date formats, etc.
    return text; // Placeholder
  }

  private async checkCulturalSensitivity(text: string, language: string, context: any): Promise<string[]> {
    // Check for culturally sensitive content
    return []; // Placeholder
  }

  /**
   * CLEANUP - Remove inactive conversations
   */
  cleanupInactiveConversations(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [userId, context] of this.activeConversations) {
      if (now.getTime() - context.lastActivity.getTime() > inactiveThreshold) {
        this.activeConversations.delete(userId);
        this.logger.log(`Cleaned up inactive conversation for user ${userId}`);
      }
    }
  }
}
