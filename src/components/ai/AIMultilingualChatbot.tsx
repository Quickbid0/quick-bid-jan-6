import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageSquare, Send, Mic, MicOff, Globe, Users, Clock, CheckCircle, XCircle, AlertTriangle, Zap, Settings, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  language: string;
  timestamp: Date;
  translatedContent?: { [key: string]: string };
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  intent?: string;
  entities?: Array<{ type: string; value: string; confidence: number }>;
  actions?: Array<{ type: string; label: string; payload: any }>;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  supported: boolean;
}

interface ChatbotIntent {
  name: string;
  description: string;
  examples: string[];
  parameters?: string[];
  responses: string[];
  confidence: number;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  language: string;
  topic?: string;
  previousIntents: string[];
  userPreferences: {
    language: string;
    voiceEnabled: boolean;
    responseStyle: 'formal' | 'casual' | 'friendly';
    detailLevel: 'brief' | 'normal' | 'detailed';
  };
  metadata: {
    startTime: Date;
    messageCount: number;
    satisfactionScore?: number;
    resolved: boolean;
  };
}

const AIMultilingualChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    userId: 'demo-user',
    sessionId: 'session-' + Date.now(),
    language: 'en',
    previousIntents: [],
    userPreferences: {
      language: 'en',
      voiceEnabled: false,
      responseStyle: 'friendly',
      detailLevel: 'normal',
    },
    metadata: {
      startTime: new Date(),
      messageCount: 0,
      resolved: false,
    },
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', supported: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', supported: true },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', supported: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', supported: true },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', supported: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', supported: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', supported: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', supported: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', supported: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', supported: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', supported: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', supported: true },
  ];

  const intents: ChatbotIntent[] = [
    {
      name: 'greeting',
      description: 'User greeting',
      examples: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      responses: [
        'Hello! How can I help you today?',
        'Hi there! What can I do for you?',
        'Greetings! How may I assist you?',
      ],
      confidence: 0.95,
    },
    {
      name: 'auction_search',
      description: 'Search for auctions',
      examples: ['find auctions', 'search for items', 'show me products', 'looking for'],
      parameters: ['category', 'price_range', 'location'],
      responses: [
        'I can help you find auctions! What type of items are you looking for?',
        'Let me search for auctions for you. What category interests you?',
        'I\'ll help you find the perfect auction. What are you searching for?',
      ],
      confidence: 0.88,
    },
    {
      name: 'bidding_help',
      description: 'Help with bidding',
      examples: ['how to bid', 'place a bid', 'bidding process', 'how do I bid'],
      responses: [
        'To place a bid, simply click the "Place Bid" button on any auction page and enter your amount.',
        'Bidding is easy! Find an item you like, enter your bid amount, and confirm. I can guide you through it!',
        'I can help you with bidding! Would you like step-by-step instructions?',
      ],
      confidence: 0.92,
    },
    {
      name: 'payment_help',
      description: 'Payment assistance',
      examples: ['how to pay', 'payment methods', 'checkout process', 'payment options'],
      responses: [
        'We accept multiple payment methods including credit cards, debit cards, and digital wallets.',
        'Payment is secure and easy! You can choose from various payment options at checkout.',
        'I can help you with payment. What payment method would you like to use?',
      ],
      confidence: 0.90,
    },
    {
      name: 'account_help',
      description: 'Account assistance',
      examples: ['account settings', 'profile help', 'update account', 'my account'],
      responses: [
        'You can manage your account settings in your profile section.',
        'I can help you with your account! What would you like to update?',
        'Account management is easy! What specific help do you need?',
      ],
      confidence: 0.87,
    },
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: getGreetingMessage(selectedLanguage),
      language: selectedLanguage,
      timestamp: new Date(),
      confidence: 1.0,
      intent: 'greeting',
      actions: [
        { type: 'quick_reply', label: 'Search Auctions', payload: 'search' },
        { type: 'quick_reply', label: 'Bidding Help', payload: 'bidding' },
        { type: 'quick_reply', label: 'Account Help', payload: 'account' },
      ],
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getGreetingMessage = (lang: string): string => {
    const greetings: { [key: string]: string } = {
      en: 'Hello! I\'m your AI assistant. How can I help you today?',
      es: '¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?',
      fr: 'Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui?',
      de: 'Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?',
      it: 'Ciao! Sono il tuo assistente IA. Come posso aiutarti oggi?',
      pt: 'Olá! Sou seu assistente de IA. Como posso ajudá-lo hoje?',
      ru: 'Привет! Я ваш ИИ-ассистент. Чем я могу вам помочь сегодня?',
      zh: '你好！我是你的AI助手。今天我能为您做些什么？',
      ja: 'こんにちは！私はAIアシスタントです。今日はどのようなご用件でしょうか？',
      ko: '안녕하세요! 저는 AI 어시스턴트입니다. 오늘 어떻게 도와드릴까요?',
      ar: 'مرحبا! أنا مساعد الذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟',
      hi: 'नमस्ते! मैं आपका AI सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं?',
    };
    return greetings[lang] || greetings['en'];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectLanguage = (text: string): string => {
    // Simplified language detection - in production, use a proper language detection library
    const textLower = text.toLowerCase();
    
    // Check for common words/phrases in different languages
    if (textLower.includes('hola') || textLower.includes('gracias') || textLower.includes('por favor')) return 'es';
    if (textLower.includes('bonjour') || textLower.includes('merci') || textLower.includes('s\'il vous')) return 'fr';
    if (textLower.includes('hallo') || textLower.includes('danke') || textLower.includes('bitte')) return 'de';
    if (textLower.includes('ciao') || textLower.includes('grazie') || textLower.includes('prego')) return 'it';
    if (textLower.includes('olá') || textLower.includes('obrigado') || textLower.includes('por favor')) return 'pt';
    if (textLower.includes('привет') || textLower.includes('спасибо') || textLower.includes('пожалуйста')) return 'ru';
    if (textLower.includes('你好') || textLower.includes('谢谢') || textLower.includes('请')) return 'zh';
    if (textLower.includes('こんにちは') || textLower.includes('ありがとう') || textLower.includes('お願い')) return 'ja';
    if (textLower.includes('안녕') || textLower.includes('감사') || textLower.includes('제발')) return 'ko';
    if (textLower.includes('مرحبا') || textLower.includes('شكرا') || textLower.includes('من فضلك')) return 'ar';
    if (textLower.includes('नमस्ते') || textLower.includes('धन्यवाद') || textLower.includes('कृपया')) return 'hi';
    
    return 'en'; // Default to English
  };

  const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
    // Simulate translation - in production, use a proper translation API
    if (fromLang === toLang) return text;
    
    // Simulated translation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return original text with translation indicator
    return `[Translated from ${fromLang} to ${toLang}] ${text}`;
  };

  const detectIntent = (message: string): ChatbotIntent => {
    const messageLower = message.toLowerCase();
    
    // Find matching intent based on examples
    for (const intent of intents) {
      for (const example of intent.examples) {
        if (messageLower.includes(example.toLowerCase())) {
          return intent;
        }
      }
    }
    
    // Default to general help intent
    return {
      name: 'general_help',
      description: 'General help',
      examples: ['help', 'assist', 'support'],
      responses: [
        'I\'m here to help! What do you need assistance with?',
        'How can I assist you today?',
        'I\'m happy to help! What can I do for you?',
      ],
      confidence: 0.5,
    };
  };

  const generateResponse = async (userMessage: string, detectedLanguage: string): Promise<ChatMessage> => {
    // Detect intent
    const intent = detectIntent(userMessage);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Select response based on intent
    const responseText = intent.responses[Math.floor(Math.random() * intent.responses.length)];
    
    // Translate response if needed
    const finalResponse = detectedLanguage === 'en' ? responseText : await translateText(responseText, 'en', detectedLanguage);
    
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: finalResponse,
      language: detectedLanguage,
      timestamp: new Date(),
      sentiment: 'positive',
      confidence: intent.confidence,
      intent: intent.name,
      entities: [],
      actions: generateQuickActions(intent.name),
    };
    
    return botMessage;
  };

  const generateQuickActions = (intent: string): Array<{ type: string; label: string; payload: any }> => {
    switch (intent) {
      case 'greeting':
        return [
          { type: 'quick_reply', label: 'Search Auctions', payload: 'search' },
          { type: 'quick_reply', label: 'Bidding Help', payload: 'bidding' },
          { type: 'quick_reply', label: 'Account Help', payload: 'account' },
        ];
      case 'auction_search':
        return [
          { type: 'quick_reply', label: 'Electronics', payload: 'electronics' },
          { type: 'quick_reply', label: 'Fashion', payload: 'fashion' },
          { type: 'quick_reply', label: 'Home', payload: 'home' },
        ];
      case 'bidding_help':
        return [
          { type: 'quick_reply', label: 'How to Bid', payload: 'how_to_bid' },
          { type: 'quick_reply', label: 'Bid Strategies', payload: 'strategies' },
          { type: 'quick_reply', label: 'Bid History', payload: 'history' },
        ];
      default:
        return [
          { type: 'quick_reply', label: 'Help', payload: 'help' },
          { type: 'quick_reply', label: 'Contact Support', payload: 'support' },
        ];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const detectedLanguage = detectLanguage(inputMessage);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      language: detectedLanguage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Generate bot response
    try {
      const botResponse = await generateResponse(inputMessage, detectedLanguage);
      setMessages(prev => [...prev, botResponse]);
      
      // Update conversation context
      setConversationContext(prev => ({
        ...prev,
        language: detectedLanguage,
        previousIntents: [...prev.previousIntents, botResponse.intent || ''],
        metadata: {
          ...prev.metadata,
          messageCount: prev.metadata.messageCount + 2,
        },
      }));
      
      // Speak response if voice is enabled
      if (voiceEnabled) {
        speakResponse(botResponse.content, detectedLanguage);
      }
      
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: any) => {
    const actionMessage = action.label;
    setInputMessage(actionMessage);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowLanguageSelector(false);
    setConversationContext(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        language: langCode,
      },
    }));
    
    // Send language change confirmation
    const confirmationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Language changed to ${languages.find(l => l.code === langCode)?.name || langCode}`,
      language: langCode,
      timestamp: new Date(),
      confidence: 1.0,
    };
    setMessages(prev => [...prev, confirmationMessage]);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    setConversationContext(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        voiceEnabled: !voiceEnabled,
      },
    }));
  };

  const speakResponse = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error('Speech recognition not supported');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={toggleVoice}
              className="p-1 hover:bg-white/20 rounded"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Language Selector */}
        <AnimatePresence>
          {showLanguageSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/10 backdrop-blur rounded-lg p-2"
            >
              <div className="grid grid-cols-3 gap-1">
                {languages.filter(lang => lang.supported).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-1 p-1 rounded text-xs hover:bg-white/20 ${
                      selectedLanguage === lang.code ? 'bg-white/20' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="text-xs opacity-75">
          {languages.find(l => l.code === selectedLanguage)?.nativeName} • 
          {conversationContext.metadata.messageCount} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.confidence && (
                  <span className="text-xs opacity-75">
                    {Math.round(message.confidence * 100)}%
                  </span>
                )}
              </div>
              
              {/* Quick Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-2 rounded-lg ${
              isListening
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <span>{languages.find(l => l.code === selectedLanguage)?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {voiceEnabled && <Volume2 className="w-3 h-3" />}
            <span>AI Assistant</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIMultilingualChatbot;
