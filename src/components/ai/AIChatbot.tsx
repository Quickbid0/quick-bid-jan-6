import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'track-order',
      label: 'Track Order',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => handleQuickAction('track-order'),
    },
    {
      id: 'payment-help',
      label: 'Payment Help',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => handleQuickAction('payment-help'),
    },
    {
      id: 'bidding-info',
      label: 'How to Bid',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => handleQuickAction('bidding-info'),
    },
    {
      id: 'account-help',
      label: 'Account Issues',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => handleQuickAction('account-help'),
    },
  ];

  const commonQuestions = [
    'How do I place a bid?',
    'What are the payment methods?',
    'How can I track my order?',
    'What is the return policy?',
    'How do I verify my account?',
    'What are the bidding fees?',
  ];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Welcome message
      if (messages.length === 0) {
        addBotMessage(
          "Hello! I'm your QuickBid AI assistant. I can help you with bidding, payments, orders, and account issues. How can I assist you today?",
          ['Track my order', 'Payment help', 'How to bid', 'Account verification']
        );
      }
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (content: string, suggestions?: string[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      suggestions,
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleQuickAction = (action: string) => {
    setShowSuggestions(false);
    switch (action) {
      case 'track-order':
        addUserMessage('I want to track my order');
        simulateBotResponse('track-order');
        break;
      case 'payment-help':
        addUserMessage('I need help with payment');
        simulateBotResponse('payment-help');
        break;
      case 'bidding-info':
        addUserMessage('How do I place a bid?');
        simulateBotResponse('bidding-info');
        break;
      case 'account-help':
        addUserMessage('I have account issues');
        simulateBotResponse('account-help');
        break;
    }
  };

  const simulateBotResponse = async (intent: string) => {
    setIsTyping(true);
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Remove typing indicator
    setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

    // Add actual response
    let response = '';
    let suggestions: string[] = [];

    switch (intent) {
      case 'track-order':
        response = "I can help you track your order! Please provide your order ID or the email address associated with your purchase. I'll check the current status and estimated delivery time for you.";
        suggestions = ['Check order status', 'Contact support', 'Track multiple orders'];
        break;
      case 'payment-help':
        response = "For payment assistance, QuickBid accepts credit/debit cards, UPI, net banking, and EMI options. If you're facing payment issues, I can help you troubleshoot or connect you with our payment support team.";
        suggestions = ['Payment failed', 'Refund status', 'EMI options'];
        break;
      case 'bidding-info':
        response = "Placing a bid is easy! 1) Find an item you like, 2) Enter your bid amount (must be higher than current bid), 3) Review and confirm. Remember to have sufficient funds in your wallet and ensure your account is verified.";
        suggestions = ['Bidding limits', 'Auto-bidding', 'Winning strategies'];
        break;
      case 'account-help':
        response = "I can help with account issues! Common problems include verification, password reset, and profile updates. What specific issue are you facing? I'll guide you through the solution step by step.";
        suggestions = ['Account verification', 'Password reset', 'Profile update'];
        break;
      default:
        response = "I understand you need help. Let me connect you with the right information or support team. Could you provide more details about your issue?";
        suggestions = ['Contact human agent', 'Browse help center', 'Report issue'];
    }

    addBotMessage(response, suggestions);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setShowSuggestions(false);

    // Simulate AI processing
    await simulateBotResponse('general');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    toast.success(isPositive ? 'Thanks for your feedback!' : 'We\'ll improve our responses');
    // In production, send feedback to AI service
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-auto' : 'w-96'}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">QuickBid AI Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-2">
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : ''}`}>
                      {message.isTyping ? (
                        <div className="flex gap-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.type === 'bot' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => copyMessage(message.content)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <Copy className="w-3 h-3 opacity-70" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(message.id, true)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <ThumbsUp className="w-3 h-3 opacity-70" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(message.id, false)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  <ThumbsDown className="w-3 h-3 opacity-70" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {message.suggestions && message.type === 'bot' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.type === 'user' && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg ml-2 order-1">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {showSuggestions && messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common Questions */}
            {showSuggestions && messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Common Questions:</p>
                <div className="flex flex-wrap gap-1">
                  {commonQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AIChatbot;
