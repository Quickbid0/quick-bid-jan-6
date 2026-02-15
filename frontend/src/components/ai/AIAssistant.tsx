// src/components/ai/AIAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  user: User;
  context: {
    page: string;
    data?: any;
    recentActions?: string[];
  };
  onAction: (action: string, params?: any) => void;
  onMessage: (message: string) => void;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    actions?: MessageAction[];
    data?: any;
  };
}

interface MessageAction {
  id: string;
  type: 'button' | 'link' | 'navigation' | 'form';
  label: string;
  action: string;
  params?: Record<string, any>;
  primary?: boolean;
}

interface ProactiveSuggestion {
  id: string;
  trigger: 'page_load' | 'user_action' | 'time_based' | 'error_state';
  condition: (context: any) => boolean;
  message: string;
  actions: MessageAction[];
  priority: 'low' | 'medium' | 'high';
  cooldown: number; // minutes
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  user,
  context,
  onAction,
  onMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (conversationHistory.length === 0) {
      const welcomeMessage = generateWelcomeMessage(user, context);
      setConversationHistory([welcomeMessage]);
    }
  }, []);

  // Generate proactive suggestions based on context
  useEffect(() => {
    const activeSuggestions = AI_PROACTIVE_SUGGESTIONS
      .filter(suggestion => suggestion.condition(context))
      .filter(suggestion => {
        // Check cooldown (simplified - in real app, use localStorage)
        const lastShown = localStorage.getItem(`ai_suggestion_${suggestion.id}`);
        if (!lastShown) return true;
        const timeSinceLastShown = Date.now() - parseInt(lastShown);
        return timeSinceLastShown > (suggestion.cooldown * 60 * 1000);
      });

    setProactiveSuggestions(activeSuggestions);
    setUnreadCount(activeSuggestions.length);
  }, [context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: generateId(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setConversationHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Process message through AI
      const response = await processAIMessage(content, {
        user,
        context,
        conversationHistory: [...conversationHistory, userMessage],
      });

      // Add AI response
      const aiMessage: ConversationMessage = {
        id: generateId(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          intent: response.intent,
          confidence: response.confidence,
          actions: response.actions,
        },
      };

      setConversationHistory(prev => [...prev, aiMessage]);
      onMessage(response.message);

    } catch (error) {
      // Add error message
      const errorMessage: ConversationMessage = {
        id: generateId(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: string, params?: any) => {
    onAction(action, params);
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: ProactiveSuggestion) => {
    // Mark suggestion as shown
    localStorage.setItem(`ai_suggestion_${suggestion.id}`, Date.now().toString());

    // Send suggestion as message
    handleSendMessage(suggestion.message);
    setIsOpen(true);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <FloatingActionButton
        isOpen={isOpen}
        hasUnread={unreadCount > 0}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
      />

      {/* Proactive Suggestions Toast */}
      {proactiveSuggestions.length > 0 && !isOpen && (
        <ProactiveSuggestionsToast
          suggestions={proactiveSuggestions}
          onSuggestionClick={handleSuggestionClick}
          onDismiss={() => setProactiveSuggestions([])}
        />
      )}

      {/* Chat Modal */}
      {isOpen && (
        <ChatModal
          user={user}
          conversationHistory={conversationHistory}
          isTyping={isTyping}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          onActionClick={handleActionClick}
          onClose={() => setIsOpen(false)}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          onKeyPress={handleKeyPress}
        />
      )}
    </>
  );
};

// Floating Action Button Component
interface FloatingActionButtonProps {
  isOpen: boolean;
  hasUnread: boolean;
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isOpen,
  hasUnread,
  onClick
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        {/* Unread Badge */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}

        {/* Main Button */}
        <button
          onClick={onClick}
          className={`
            h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
            flex items-center justify-center
            ${isOpen
              ? 'bg-red-500 hover:bg-red-600 rotate-45'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }
          `}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative">
              <Bot className="h-6 w-6 text-white" />

              {/* Thinking Animation */}
              <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-20" />
              <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-20"
                   style={{ animationDelay: '0.5s' }} />
            </div>
          )}
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
          {hasUnread ? 'AI Assistant - New suggestions!' : 'AI Assistant'}
        </div>
      </div>
    </div>
  );
};

// Proactive Suggestions Toast
interface ProactiveSuggestionsToastProps {
  suggestions: ProactiveSuggestion[];
  onSuggestionClick: (suggestion: ProactiveSuggestion) => void;
  onDismiss: () => void;
}

const ProactiveSuggestionsToast: React.FC<ProactiveSuggestionsToastProps> = ({
  suggestions,
  onSuggestionClick,
  onDismiss,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % suggestions.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [suggestions.length]);

  const currentSuggestion = suggestions[currentIndex];

  if (!currentSuggestion) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900">AI Suggestion</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Pagination Dots */}
            {suggestions.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}

            <button
              onClick={onDismiss}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm text-gray-700">{currentSuggestion.message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {currentSuggestion.actions.slice(0, 2).map((action) => (
            <button
              key={action.id}
              onClick={() => onSuggestionClick(currentSuggestion)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                action.primary
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Chat Modal Component
interface ChatModalProps {
  user: User;
  conversationHistory: ConversationMessage[];
  isTyping: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: (content: string) => void;
  onActionClick: (action: string, params?: any) => void;
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  user,
  conversationHistory,
  isTyping,
  message,
  onMessageChange,
  onSendMessage,
  onActionClick,
  onClose,
  messagesEndRef,
  inputRef,
  onKeyPress,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">QuickMela AI Assistant</h3>
              <p className="text-sm text-gray-500">Online • Ready to help</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationHistory.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onActionClick={onActionClick}
            />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Ask me anything about QuickMela..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              onClick={() => onSendMessage(message)}
              disabled={!message.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Suggestions */}
          <QuickSuggestions onSuggestionClick={onSendMessage} />
        </div>
      </div>
    </div>
  );
};

// Chat Message Component
interface ChatMessageProps {
  message: ConversationMessage;
  onActionClick: (action: string, params?: any) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-sm">{message.content}</div>

        {/* Message Actions */}
        {message.metadata?.actions && (
          <div className="mt-3 space-y-2">
            {message.metadata.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => onActionClick(action.action, action.params)}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                  action.primary
                    ? 'bg-white text-blue-600 hover:bg-gray-50'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Message Metadata */}
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

// Typing Indicator
const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 px-4 py-2 rounded-lg">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  </div>
);

// Quick Suggestions
interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    'How do I place a bid?',
    'What\'s my wallet balance?',
    'How to sell on QuickMela?',
    'EMI eligibility check',
  ];

  return (
    <div className="flex gap-2 mt-3 overflow-x-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

// AI Processing Logic
const generateWelcomeMessage = (user: User, context: any): ConversationMessage => {
  let welcomeText = `Hello ${user.name}! 👋 I'm your QuickMela AI assistant. `;

  switch (user.role) {
    case 'buyer':
      welcomeText += 'I can help you find great deals, place bids, and answer questions about buying on QuickMela.';
      break;
    case 'seller':
      welcomeText += 'I can help you list items, optimize your auctions, and maximize your sales.';
      break;
    case 'company_owner':
      welcomeText += 'I can help you manage your bulk uploads, track performance, and optimize your recovery strategies.';
      break;
    default:
      welcomeText += 'I\'m here to help you make the most of QuickMela!';
  }

  return {
    id: 'welcome',
    type: 'assistant',
    content: welcomeText,
    timestamp: new Date(),
    metadata: {
      actions: [
        {
          id: 'explore',
          type: 'button',
          label: 'Explore Auctions',
          action: 'navigate',
          params: { route: '/auctions' },
          primary: true,
        },
        {
          id: 'help',
          type: 'button',
          label: 'Get Help',
          action: 'send_message',
          params: { message: 'What can you help me with?' },
        },
      ],
    },
  };
};

const processAIMessage = async (
  message: string,
  context: {
    user: User;
    context: any;
    conversationHistory: ConversationMessage[];
  }
): Promise<{
  message: string;
  intent: string;
  confidence: number;
  actions?: MessageAction[];
}> => {
  // Simple intent classification (in real app, use NLP service)
  const lowerMessage = message.toLowerCase();

  // Wallet queries
  if (lowerMessage.includes('wallet') || lowerMessage.includes('balance')) {
    return {
      message: `Your current wallet balance is ₹50,000. You can add more funds anytime to keep bidding! 💰`,
      intent: 'wallet_inquiry',
      confidence: 0.9,
      actions: [{
        id: 'add_funds',
        type: 'button',
        label: 'Add Funds',
        action: 'navigate',
        params: { route: '/wallet' },
      }],
    };
  }

  // Bidding help
  if (lowerMessage.includes('bid') || lowerMessage.includes('bidding')) {
    return {
      message: `Placing a bid is easy! Just find an auction you like, enter your bid amount (must be higher than the current bid), and click "Place Bid". Remember, bids are final once placed. 🏷️`,
      intent: 'bidding_help',
      confidence: 0.85,
      actions: [{
        id: 'browse_auctions',
        type: 'button',
        label: 'Browse Auctions',
        action: 'navigate',
        params: { route: '/auctions' },
      }],
    };
  }

  // Default response
  return {
    message: "I'm here to help with anything related to QuickMela! I can assist with bidding, wallet management, account settings, and general questions. What would you like to know?",
    intent: 'general_help',
    confidence: 0.6,
    actions: [
      {
        id: 'auctions',
        type: 'button',
        label: 'View Auctions',
        action: 'navigate',
        params: { route: '/auctions' },
      },
      {
        id: 'profile',
        type: 'button',
        label: 'My Profile',
        action: 'navigate',
        params: { route: '/profile' },
      },
    ],
  };
};

// Proactive Suggestions Configuration
const AI_PROACTIVE_SUGGESTIONS: ProactiveSuggestion[] = [
  {
    id: 'low_wallet_balance',
    trigger: 'page_load',
    condition: (context) => context.userStats?.walletBalance < 5000,
    message: 'Your wallet balance is running low. Would you like me to help you add funds?',
    actions: [{
      id: 'add_funds',
      type: 'button',
      label: 'Add Funds',
      action: 'navigate',
      params: { route: '/wallet' },
      primary: true,
    }],
    priority: 'high',
    cooldown: 60, // 1 hour
  },
  {
    id: 'first_time_buyer',
    trigger: 'page_load',
    condition: (context) => context.page === '/auctions' && context.userStats?.totalBids === 0,
    message: 'New to QuickMela? I can guide you through your first bid!',
    actions: [{
      id: 'learn_bidding',
      type: 'button',
      label: 'Learn to Bid',
      action: 'send_message',
      params: { message: 'How do I place my first bid?' },
      primary: true,
    }],
    priority: 'medium',
    cooldown: 1440, // 24 hours
  },
  {
    id: 'ending_soon',
    trigger: 'time_based',
    condition: (context) => context.userStats?.endingSoonAuctions > 0,
    message: `You have ${context.userStats?.endingSoonAuctions} auction${context.userStats?.endingSoonAuctions > 1 ? 's' : ''} ending soon. Want to place a last-minute bid? ⏰`,
    actions: [{
      id: 'view_ending',
      type: 'button',
      label: 'View Ending Auctions',
      action: 'navigate',
      params: { route: '/auctions?filter=ending_soon' },
      primary: true,
    }],
    priority: 'high',
    cooldown: 30, // 30 minutes
  },
];

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

export default AIAssistant;
