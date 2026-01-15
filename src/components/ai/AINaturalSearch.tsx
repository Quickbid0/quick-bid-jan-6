import React, { useState, useEffect, useRef } from 'react';
import { Search, Brain, Sparkles, Clock, Filter, TrendingUp, X, Mic, MicOff, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'attribute' | 'intent';
  confidence: number;
  category?: string;
  attributes?: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
  relevanceScore: number;
  matchReasons: string[];
  highlightedText?: string;
}

interface SearchIntent {
  type: 'browse' | 'compare' | 'find_specific' | 'discover' | 'research';
  category?: string;
  priceRange?: { min: number; max: number };
  attributes?: string[];
  keywords: string[];
  confidence: number;
}

const AINaturalSearch: React.FC<{
  onResults?: (results: SearchResult[]) => void;
  onFilter?: (filters: any) => void;
  placeholder?: string;
  showVoice?: boolean;
}> = ({ onResults, onFilter, placeholder = "Describe what you're looking for...", showVoice = true }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadSearchHistory();
    loadTrendingSearches();
    initializeVoiceRecognition();
  }, []);

  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const loadTrendingSearches = () => {
    // Mock trending searches - in production, this would come from API
    setTrendingSearches([
      'luxury watches under 50000',
      'mercedes benz cars 2022',
      'apple macbook pro m1',
      'vintage jewelry collection',
      'sports shoes size 10',
    ]);
  };

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening... Speak clearly');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setShowSuggestions(false);
        handleSearch(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice search failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      generateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const generateSuggestions = async (input: string) => {
    try {
      // Mock AI suggestions - in production, this would call AI API
      const mockSuggestions: SearchSuggestion[] = [
        {
          text: `${input} under 50000`,
          type: 'query',
          confidence: 92,
          attributes: ['price_range']
        },
        {
          text: `${input} in good condition`,
          type: 'attribute',
          confidence: 88,
          attributes: ['condition']
        },
        {
          text: `luxury ${input}`,
          type: 'category',
          confidence: 85,
          category: 'Luxury'
        },
        {
          text: `best ${input} deals`,
          type: 'intent',
          confidence: 78,
        },
      ];

      setSuggestions(mockSuggestions.filter(s => s.text.toLowerCase().includes(input.toLowerCase())));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Analyze search intent
      const searchIntent = await analyzeIntent(finalQuery);
      setIntent(searchIntent);

      // Perform AI-powered search
      const searchResults = await performSearch(finalQuery, searchIntent);
      setResults(searchResults);
      onResults?.(searchResults);

      // Update search history
      const newHistory = [finalQuery, ...searchHistory.filter(h => h !== finalQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeIntent = async (query: string): Promise<SearchIntent> => {
    // Mock intent analysis - in production, this would use NLP
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      return {
        type: 'compare',
        keywords: extractKeywords(query),
        confidence: 85,
      };
    }
    
    if (lowerQuery.includes('under') || lowerQuery.includes('below') || lowerQuery.includes('less than')) {
      const priceMatch = query.match(/(\d+(?:,\d+)*)/);
      return {
        type: 'find_specific',
        priceRange: { min: 0, max: priceMatch ? parseInt(priceMatch[1].replace(',', '')) : 1000000 },
        keywords: extractKeywords(query),
        confidence: 90,
      };
    }
    
    if (lowerQuery.includes('discover') || lowerQuery.includes('show me') || lowerQuery.includes('browse')) {
      return {
        type: 'discover',
        keywords: extractKeywords(query),
        confidence: 80,
      };
    }
    
    return {
      type: 'browse',
      keywords: extractKeywords(query),
      confidence: 75,
    };
  };

  const extractKeywords = (query: string): string[] => {
    // Simple keyword extraction - in production, use NLP
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5);
  };

  const performSearch = async (query: string, intent: SearchIntent): Promise<SearchResult[]> => {
    // Mock search results - in production, this would call AI search API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            id: '1',
            title: 'Luxury Mercedes-Benz C-Class',
            description: 'Premium sedan with advanced features and elegant design',
            category: 'Vehicles',
            price: 2850000,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
            relevanceScore: 95,
            matchReasons: ['Matches luxury category', 'Fits price range', 'Premium brand'],
          },
          {
            id: '2',
            title: 'Rolex Submariner Watch',
            description: 'Classic timepiece for the discerning collector',
            category: 'Jewelry',
            price: 450000,
            image: 'https://images.unsplash.com/photo-1547996160-9e6e7288a9f3?w=400',
            relevanceScore: 88,
            matchReasons: ['Luxury item', 'High quality', 'Popular brand'],
          },
          {
            id: '3',
            title: 'Apple MacBook Pro M1',
            description: 'Powerful laptop for professionals and creators',
            category: 'Electronics',
            price: 95000,
            image: 'https://images.unsplash.com/photo-1517336712830-c9662b7e77b1?w=400',
            relevanceScore: 82,
            matchReasons: ['Premium electronics', 'Latest model', 'High performance'],
          },
        ];
        
        resolve(mockResults);
      }, 1500);
    });
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast.success('Search history cleared');
  };

  const getIntentIcon = (type: string) => {
    switch (type) {
      case 'browse': return <Search className="w-4 h-4" />;
      case 'compare': return <Filter className="w-4 h-4" />;
      case 'find_specific': return <Target className="w-4 h-4" />;
      case 'discover': return <Sparkles className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getIntentColor = (type: string) => {
    switch (type) {
      case 'browse': return 'text-blue-600 bg-blue-100';
      case 'compare': return 'text-purple-600 bg-purple-100';
      case 'find_specific': return 'text-green-600 bg-green-100';
      case 'discover': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Search Input */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => query.length > 2 && setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full pl-12 pr-24 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              {/* Voice Search Button */}
              {showVoice && (
                <button
                  onClick={handleVoiceSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              <span>AI Search</span>
            </button>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {suggestion.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(suggestion.type)}`}>
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Intent Display */}
        {intent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3"
          >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getIntentColor(intent.type)}`}>
              {getIntentIcon(intent.type)}
              <span className="text-sm font-medium capitalize">
                {intent.type.replace('_', ' ')}
              </span>
              <span className="text-xs">
                {Math.round(intent.confidence)}% confidence
              </span>
            </div>
            
            {intent.keywords.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Keywords:</span>
                <div className="flex gap-1">
                  {intent.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Search Results
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {results.length} results found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {result.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {result.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{result.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevanceScore)}% match
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white ml-1">
                        {result.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Match Reasons */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Why this matches:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.matchReasons.map((reason, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search History and Trending */}
      {!query && !results.length && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h4>
                {searchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent searches
                </p>
              )}
            </div>

            {/* Trending Searches */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </h4>
              <div className="space-y-2">
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(trend)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AINaturalSearch;
