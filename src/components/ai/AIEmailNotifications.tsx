import React, { useState, useEffect } from 'react';
import { Brain, Mail, Send, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Settings, RefreshCw, Eye, Target, Zap, Users, BarChart3, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'auction_ending' | 'price_drop' | 'new_recommendations' | 'fraud_alert' | 'payment_reminder' | 'welcome' | 'win_notification' | 'outbid';
  subject: string;
  content: string;
  variables: string[];
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  aiGenerated: boolean;
  performance: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    unsubscribeRate: number;
  };
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    eventType: string;
    userSegment: string;
    timeThreshold?: string;
    priceThreshold?: number;
    frequency?: string;
  };
  actions: {
    sendEmail: boolean;
    templateId: string;
    delayMinutes?: number;
    personalization: boolean;
  };
  enabled: boolean;
  aiOptimized: boolean;
  performance: {
    sentCount: number;
    successRate: number;
    engagementRate: number;
  };
}

interface EmailCampaign {
  id: string;
  name: string;
  type: 'promotional' | 'transactional' | 'behavioral' | 'reengagement';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetAudience: string;
  templateId: string;
  scheduledAt?: Date;
  sentAt?: Date;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    bounced: number;
    unsubscribed: number;
  };
  aiOptimized: boolean;
  personalizationLevel: 'basic' | 'advanced' | 'hyper_personalized';
}

interface EmailInsight {
  category: 'engagement' | 'timing' | 'content' | 'personalization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  confidence: number;
  expectedImprovement: number;
  timeframe: string;
}

const AIEmailNotifications: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [insights, setInsights] = useState<EmailInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'templates' | 'rules' | 'campaigns' | 'insights'>('templates');

  useEffect(() => {
    loadEmailData();
    
    if (autoOptimization) {
      const interval = setInterval(() => {
        optimizeEmails();
      }, 300000); // Optimize every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoOptimization]);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading email data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTemplates = generateMockTemplates();
      const mockRules = generateMockRules();
      const mockCampaigns = generateMockCampaigns();
      const mockInsights = generateMockInsights();
      
      setTemplates(mockTemplates);
      setRules(mockRules);
      setCampaigns(mockCampaigns);
      setInsights(mockInsights);
      
    } catch (error) {
      console.error('Error loading email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTemplates = (): EmailTemplate[] => [
    {
      id: '1',
      name: 'Auction Ending Soon',
      type: 'auction_ending',
      subject: '🔥 Your auction is ending soon! Last chance to bid!',
      content: 'Hi {{userName}}, your auction for {{productName}} is ending in {{timeLeft}}. Current bid: {{currentPrice}}. Don\'t miss out!',
      variables: ['userName', 'productName', 'timeLeft', 'currentPrice'],
      enabled: true,
      priority: 'high',
      frequency: 'immediate',
      aiGenerated: true,
      performance: {
        openRate: 78,
        clickRate: 45,
        conversionRate: 23,
        unsubscribeRate: 2,
      },
    },
    {
      id: '2',
      name: 'Price Drop Alert',
      type: 'price_drop',
      subject: '💰 Price drop on items you\'re watching!',
      content: 'Great news! {{productName}} price dropped from {{oldPrice}} to {{newPrice}}. This is a {{discountPercentage}}% discount!',
      variables: ['userName', 'productName', 'oldPrice', 'newPrice', 'discountPercentage'],
      enabled: true,
      priority: 'medium',
      frequency: 'immediate',
      aiGenerated: true,
      performance: {
        openRate: 82,
        clickRate: 58,
        conversionRate: 31,
        unsubscribeRate: 1.5,
      },
    },
    {
      id: '3',
      name: 'Personalized Recommendations',
      type: 'new_recommendations',
      subject: '🎯 New recommendations just for you!',
      content: 'Based on your interests, we think you\'ll love these items: {{recommendations}}. Each has a {{confidence}}% match with your preferences.',
      variables: ['userName', 'recommendations', 'confidence'],
      enabled: true,
      priority: 'medium',
      frequency: 'weekly',
      aiGenerated: true,
      performance: {
        openRate: 71,
        clickRate: 42,
        conversionRate: 18,
        unsubscribeRate: 2.8,
      },
    },
    {
      id: '4',
      name: 'Fraud Alert',
      type: 'fraud_alert',
      subject: '🚨 Security alert: Suspicious activity detected',
      content: 'We detected unusual activity on your account. Action: {{action}}. Please review your recent activity.',
      variables: ['userName', 'action', 'activity'],
      enabled: true,
      priority: 'urgent',
      frequency: 'immediate',
      aiGenerated: false,
      performance: {
        openRate: 95,
        clickRate: 67,
        conversionRate: 89,
        unsubscribeRate: 0.5,
      },
    },
  ];

  const generateMockRules = (): NotificationRule[] => [
    {
      id: '1',
      name: 'Auction Ending Notification',
      description: 'Send notification when auction is ending soon',
      conditions: {
        eventType: 'auction_ending',
        userSegment: 'all',
        timeThreshold: '1h',
      },
      actions: {
        sendEmail: true,
        templateId: '1',
        delayMinutes: 0,
        personalization: true,
      },
      enabled: true,
      aiOptimized: true,
      performance: {
        sentCount: 1247,
        successRate: 96,
        engagementRate: 78,
      },
    },
    {
      id: '2',
      name: 'Price Drop Alert',
      description: 'Notify users when prices drop on watched items',
      conditions: {
        eventType: 'price_drop',
        userSegment: 'watchers',
        priceThreshold: 1000,
      },
      actions: {
        sendEmail: true,
        templateId: '2',
        delayMinutes: 15,
        personalization: true,
      },
      enabled: true,
      aiOptimized: true,
      performance: {
        sentCount: 892,
        successRate: 98,
        engagementRate: 82,
      },
    },
    {
      id: '3',
      name: 'Weekly Recommendations',
      description: 'Send personalized recommendations weekly',
      conditions: {
        eventType: 'recommendation',
        userSegment: 'active_users',
        frequency: 'weekly',
      },
      actions: {
        sendEmail: true,
        templateId: '3',
        delayMinutes: 0,
        personalization: true,
      },
      enabled: true,
      aiOptimized: true,
      performance: {
        sentCount: 5432,
        successRate: 94,
        engagementRate: 71,
      },
    },
  ];

  const generateMockCampaigns = (): EmailCampaign[] => [
    {
      id: '1',
      name: 'Summer Auction Promotion',
      type: 'promotional',
      status: 'active',
      targetAudience: 'premium_users',
      templateId: '2',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      metrics: {
        sent: 5000,
        delivered: 4850,
        opened: 3120,
        clicked: 1872,
        converted: 561,
        bounced: 150,
        unsubscribed: 75,
      },
      aiOptimized: true,
      personalizationLevel: 'advanced',
    },
    {
      id: '2',
      name: 'Welcome Series',
      type: 'transactional',
      status: 'active',
      targetAudience: 'new_users',
      templateId: '1',
      metrics: {
        sent: 1250,
        delivered: 1235,
        opened: 1087,
        clicked: 652,
        converted: 326,
        bounced: 15,
        unsubscribed: 8,
      },
      aiOptimized: true,
      personalizationLevel: 'hyper_personalized',
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      type: 'reengagement',
      status: 'scheduled',
      targetAudience: 'inactive_users',
      templateId: '3',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      aiOptimized: true,
      personalizationLevel: 'advanced',
    },
  ];

  const generateMockInsights = (): EmailInsight[] => [
    {
      category: 'engagement',
      title: 'Best sending time identified',
      description: 'AI analysis shows 10:00 AM on Tuesdays has highest engagement rates',
      impact: 'high',
      recommendation: 'Schedule important emails for Tuesday 10:00 AM',
      confidence: 94,
      expectedImprovement: 23,
      timeframe: '2 weeks',
    },
    {
      category: 'content',
      title: 'Subject line optimization needed',
      description: 'Current subject lines have 15% lower open rate than industry average',
      impact: 'medium',
      recommendation: 'Use AI-generated subject lines with emojis and personalization',
      confidence: 87,
      expectedImprovement: 18,
      timeframe: '1 week',
    },
    {
      category: 'personalization',
      title: 'Hyper-personalization increases conversion',
      description: 'Campaigns with hyper-personalization show 45% higher conversion rates',
      impact: 'high',
      recommendation: 'Implement hyper-personalization for all campaigns',
      confidence: 91,
      expectedImprovement: 32,
      timeframe: '3 weeks',
    },
  ];

  const optimizeEmails = async () => {
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Email optimization completed');
      
    } catch (error) {
      console.error('Error optimizing emails:', error);
      toast.error('Failed to optimize emails');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmailData();
    setRefreshing(false);
    toast.success('Email data refreshed');
  };

  const toggleAutoOptimization = () => {
    setAutoOptimization(!autoOptimization);
    toast(`${autoOptimization ? 'Disabled' : 'Enabled'} auto-optimization`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'timing': return <Clock className="w-4 h-4 text-green-500" />;
      case 'content': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'personalization': return <Target className="w-4 h-4 text-orange-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Brain className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Email Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent email marketing and notification system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoOptimization}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoOptimization 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Brain className="w-4 h-4" />
            {autoOptimization ? 'Auto-Optimization ON' : 'Auto-Optimization OFF'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
        {(['templates', 'rules', 'campaigns', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
              selectedTab === tab
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.aiGenerated ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-600'}`}>
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                    {template.priority}
                  </span>
                  <button
                    onClick={() => {
                      setTemplates(prev => prev.map(t => 
                        t.id === template.id ? { ...t, enabled: !t.enabled } : t
                      ));
                      toast(`${template.name} ${template.enabled ? 'disabled' : 'enabled'}`);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      template.enabled ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-600 text-white'
                    }`}
                  >
                    {template.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Subject: {template.subject}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.content}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {template.variables.map((variable, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                  >
                    {variable}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Open Rate</span>
                  <span className="font-medium text-green-600">{template.performance.openRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Click Rate</span>
                  <span className="font-medium text-blue-600">{template.performance.clickRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Conversion</span>
                  <span className="font-medium text-purple-600">{template.performance.conversionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Unsubscribe</span>
                  <span className="font-medium text-red-600">{template.performance.unsubscribeRate}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${rule.aiOptimized ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-600'}`}>
                    <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rule.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRules(prev => prev.map(r => 
                      r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                    ));
                    toast(`${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    rule.enabled ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-600 text-white'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Sent Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">{rule.performance.sentCount}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-medium text-green-600">{rule.performance.successRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                  <span className="font-medium text-blue-600">{rule.performance.engagementRate}%</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Conditions: {rule.conditions.eventType} | {rule.conditions.userSegment}
                {rule.conditions.timeThreshold && ` | ${rule.conditions.timeThreshold}`}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaigns Tab */}
      {selectedTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(campaign.status)}`}>
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {campaign.type} | {campaign.targetAudience}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  {campaign.aiOptimized && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                      AI Optimized
                    </span>
                  )}
                </div>
              </div>
              
              {campaign.metrics.sent > 0 && (
                <div className="grid grid-cols-6 gap-4 text-xs mb-3">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Sent</span>
                    <span className="font-medium text-gray-900 dark:text-white">{campaign.metrics.sent}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Opened</span>
                    <span className="font-medium text-green-600">{campaign.metrics.opened}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Clicked</span>
                    <span className="font-medium text-blue-600">{campaign.metrics.clicked}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Converted</span>
                    <span className="font-medium text-purple-600">{campaign.metrics.converted}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Bounced</span>
                    <span className="font-medium text-red-600">{campaign.metrics.bounced}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Unsub</span>
                    <span className="font-medium text-orange-600">{campaign.metrics.unsubscribed}</span>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Personalization: {campaign.personalizationLevel.replace('_', ' ')}
                {campaign.scheduledAt && ` | Scheduled: ${campaign.scheduledAt.toLocaleDateString()}`}
                {campaign.sentAt && ` | Sent: ${campaign.sentAt.toLocaleDateString()}`}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {insight.description}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Recommendation:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {insight.recommendation}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Expected improvement: +{insight.expectedImprovement}%</span>
                    <span>Timeframe: {insight.timeframe}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIEmailNotifications;
