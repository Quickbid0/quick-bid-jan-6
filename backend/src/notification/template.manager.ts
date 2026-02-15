import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: any[];
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TemplateManagerService {
  private readonly logger = new Logger(TemplateManagerService.name);

  // Pre-defined WhatsApp templates for QuickMela
  private templates: Record<string, WhatsAppTemplate> = {
    otp_verification: {
      id: 'otp_verification',
      name: 'otp_verification',
      category: 'AUTHENTICATION',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'body',
          text: 'Your QuickMela verification code is: {{otp}}. This code will expire in 5 minutes.',
        },
        {
          type: 'footer',
          text: 'Do not share this code with anyone.',
        },
      ],
      variables: ['otp'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    auction_win: {
      id: 'auction_win',
      name: 'auction_win',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'header',
          text: '🎉 Congratulations!',
        },
        {
          type: 'body',
          text: 'You won the auction for "{{auction_title}}" with a bid of ₹{{winning_amount}}!\n\nAuction ID: {{auction_id}}\n\nComplete your payment within 48 hours to secure your item.',
        },
        {
          type: 'button',
          text: 'Complete Payment',
          url: '{{payment_link}}',
        },
        {
          type: 'footer',
          text: 'QuickMela - Trusted Auction Platform',
        },
      ],
      variables: ['auction_title', 'winning_amount', 'auction_id', 'payment_link'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    outbid_alert: {
      id: 'outbid_alert',
      name: 'outbid_alert',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'header',
          text: '⚠️ Outbid Alert',
        },
        {
          type: 'body',
          text: 'You\'ve been outbid on "{{auction_title}}"!\n\nCurrent highest bid: ₹{{current_bid}}\nYour last bid: ₹{{your_last_bid}}\n\nDon\'t miss out - place a higher bid now!',
        },
        {
          type: 'button',
          text: 'Bid Higher',
          url: '{{auction_link}}',
        },
      ],
      variables: ['auction_title', 'current_bid', 'your_last_bid', 'auction_link'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    escrow_update: {
      id: 'escrow_update',
      name: 'escrow_update',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'body',
          text: 'Escrow Update for "{{auction_title}}"\n\nStatus: {{status}}\nAmount: ₹{{amount}}\n\n{{action_required}}\n\nYour funds are secure with QuickMela\'s escrow protection.',
        },
        {
          type: 'footer',
          text: 'Escrow Protection Active ✅',
        },
      ],
      variables: ['auction_title', 'status', 'amount', 'action_required'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    referral_reward: {
      id: 'referral_reward',
      name: 'referral_reward',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'header',
          text: '💰 Referral Reward Credited!',
        },
        {
          type: 'body',
          text: 'Congratulations! ₹{{reward_amount}} has been credited to your wallet as a referral reward.\n\nThank you for referring users to QuickMela!\n\nTotal Referrals: {{total_referrals}}\n\nKeep referring to earn more rewards! 🚀',
        },
        {
          type: 'footer',
          text: 'QuickMela Referral Program',
        },
      ],
      variables: ['reward_amount', 'total_referrals'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    auction_reminder: {
      id: 'auction_reminder',
      name: 'auction_reminder',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'header',
          text: '⏰ Auction Ending Soon!',
        },
        {
          type: 'body',
          text: '"{{auction_title}}" is ending soon!\n\nCurrent Bid: ₹{{current_bid}}\nTime Left: {{time_left}}\n\nLast chance to place your bid!',
        },
        {
          type: 'button',
          text: 'Place Bid',
          url: '{{auction_link}}',
        },
      ],
      variables: ['auction_title', 'current_bid', 'time_left', 'auction_link'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    payment_reminder: {
      id: 'payment_reminder',
      name: 'payment_reminder',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'body',
          text: 'Payment Reminder for "{{auction_title}}"\n\nAmount Due: ₹{{amount_due}}\nDue Date: {{due_date}}\n\nComplete your payment to receive your item.',
        },
        {
          type: 'button',
          text: 'Complete Payment',
          url: '{{payment_link}}',
        },
      ],
      variables: ['auction_title', 'amount_due', 'due_date', 'payment_link'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    welcome_message: {
      id: 'welcome_message',
      name: 'welcome_message',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [
        {
          type: 'header',
          text: '🎉 Welcome to QuickMela!',
        },
        {
          type: 'body',
          text: 'Welcome {{user_name}}!\n\nYour account has been successfully created.\n\nStart exploring amazing auctions and bid on your favorite items!\n\nYour Referral Code: {{referral_code}}',
        },
        {
          type: 'footer',
          text: 'Share your referral code to earn rewards! 💰',
        },
      ],
      variables: ['user_name', 'referral_code'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): WhatsAppTemplate | null {
    return this.templates[templateId] || null;
  }

  /**
   * Get all approved templates
   */
  getApprovedTemplates(): WhatsAppTemplate[] {
    return Object.values(this.templates).filter(
      template => template.status === 'APPROVED'
    );
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(templateId: string, variables: Record<string, string>): boolean {
    const template = this.getTemplate(templateId);
    if (!template) {
      return false;
    }

    // Check if all required variables are provided
    return template.variables.every(variable => {
      return variables.hasOwnProperty(variable) && variables[variable] !== undefined;
    });
  }

  /**
   * Build template components with variables
   */
  buildTemplateComponents(templateId: string, variables: Record<string, string>): any[] {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (!this.validateTemplateVariables(templateId, variables)) {
      throw new Error(`Missing required variables for template ${templateId}`);
    }

    // Deep clone components and replace variables
    const components = JSON.parse(JSON.stringify(template.components));

    // Replace variables in component text
    const replaceVariables = (text: string): string => {
      let result = text;
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
      });
      return result;
    };

    // Process each component
    components.forEach(component => {
      if (component.text) {
        component.text = replaceVariables(component.text);
      }
      if (component.parameters) {
        component.parameters.forEach(param => {
          if (param.text) {
            param.text = replaceVariables(param.text);
          }
        });
      }
    });

    return components;
  }

  /**
   * Get template by category
   */
  getTemplatesByCategory(category: WhatsAppTemplate['category']): WhatsAppTemplate[] {
    return Object.values(this.templates).filter(
      template => template.category === category && template.status === 'APPROVED'
    );
  }

  /**
   * Check if template supports language
   */
  supportsLanguage(templateId: string, language: string): boolean {
    const template = this.getTemplate(templateId);
    return template?.language === language;
  }

  /**
   * Get template usage statistics (mock implementation)
   */
  getTemplateStats(): Record<string, { sent: number; delivered: number; failed: number }> {
    // In production, this would query the notification_logs table
    const stats = {};
    Object.keys(this.templates).forEach(templateId => {
      stats[templateId] = {
        sent: Math.floor(Math.random() * 1000),
        delivered: Math.floor(Math.random() * 900),
        failed: Math.floor(Math.random() * 50),
      };
    });
    return stats;
  }
}
