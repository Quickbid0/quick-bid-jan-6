import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import {
  Gavel, Clock, Users, MessageSquare, TrendingUp,
  DollarSign, Send, Heart, Share, AlertCircle,
  Star, CheckCircle, Brain, Target, Zap,
  TrendingDown, Shield, Lightbulb
} from 'lucide-react';
import VoiceBidding from '../components/VoiceBidding';

interface AuctionData {
  id: string;
  title: string;
  currentBid: number;
  startingPrice: number;
  bidIncrement: number;
  endTime: string;
  status: 'active' | 'ended' | 'paused';
  bidders: number;
  totalBids: number;
  seller: {
    name: string;
    rating: number;
  };
  product: {
    images: string[];
    description: string;
    category: string;
    condition: string;
  };
}

interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

const RealTimeBidding: React.FC<{ auctionId: string }> = ({ auctionId }) => {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [myBidHistory, setMyBidHistory] = useState<Bid[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId') || 'anonymous';

  useEffect(() => {
    initializeAuction();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [auctionId]);

  const initializeAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`);
      if (response.ok) {
        const auctionData = await response.json();
        setAuction(auctionData);
        setBidAmount(auctionData.currentBid + auctionData.bidIncrement);
        calculateTimeLeft(auctionData.endTime);

        // Load AI bidding suggestions
        await loadAISuggestions(auctionData);
      } else {
        toast.error('Failed to load auction details');
      }
    } catch (error) {
      console.error('Error loading auction:', error);
      toast.error('Failed to load auction');
    }
  };

  const loadAISuggestions = async (auctionData: AuctionData) => {
    try {
      setLoadingAISuggestions(true);

      // Get AI bidding strategy from backend
      const aiResponse = await fetch(`/api/ai/bidding-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          auctionId,
          userBudget: 100000, // This should come from user preferences
          riskTolerance: 'medium', // This should come from user preferences
          biddingStyle: 'strategic' // This should come from user preferences
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setAiSuggestions(aiData);
      } else {
        // Fallback to basic AI suggestions
        setAiSuggestions(generateFallbackAISuggestions(auctionData));
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      // Fallback to basic suggestions
      setAiSuggestions(generateFallbackAISuggestions(auctionData));
    } finally {
      setLoadingAISuggestions(false);
    }
  };

  const generateFallbackAISuggestions = (auctionData: AuctionData) => {
    const currentBid = auctionData.currentBid;
    const increment = auctionData.bidIncrement;
    const timeLeftHours = timeLeft / 3600;

    return {
      recommendedStrategy: {
        type: timeLeftHours < 1 ? 'aggressive' : timeLeftHours < 6 ? 'strategic' : 'conservative',
        reasoning: [
          timeLeftHours < 1 ? 'Auction ending soon - consider aggressive bidding' :
          timeLeftHours < 6 ? 'Mid-auction timing - strategic approach recommended' :
          'Early auction - conservative bidding advised'
        ],
        riskLevel: 'medium',
        expectedROI: 15
      },
      optimalBids: [
        {
          amount: currentBid + increment,
          timing: 'immediate',
          confidence: 85,
          reasoning: 'Minimum safe bid increment',
          successProbability: 70
        },
        {
          amount: currentBid + (increment * 2),
          timing: 'early',
          confidence: 75,
          reasoning: 'Strategic position above minimum',
          successProbability: 60
        },
        {
          amount: currentBid + (increment * 3),
          timing: 'mid',
          confidence: 65,
          reasoning: 'Aggressive positioning',
          successProbability: 45
        }
      ],
      marketIntelligence: {
        competitionLevel: auctionData.bidders > 10 ? 8 : auctionData.bidders > 5 ? 5 : 2,
        auctionMomentum: auctionData.totalBids > 20 ? 'fast' : auctionData.totalBids > 10 ? 'steady' : 'slow',
        shillBiddingRisk: auctionData.bidders > auctionData.totalBids * 0.7 ? 7 : 2,
        optimalEntryPoint: currentBid + increment
      },
      budgetOptimization: {
        suggestedMaxBid: currentBid * 1.3,
        reserveAmount: currentBid * 0.1,
        profitMargin: 12
      }
    };
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('accessToken');

    socketRef.current = io('/auction', {
      query: { userId, auctionId },
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to live auction');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from auction');
    });

    // Auction events
    socketRef.current.on('auctionJoined', (data) => {
      setActiveUsers(data.activeUsers);
      setAuction(prev => prev ? { ...prev, ...data.auction } : null);
    });

    socketRef.current.on('auctionUpdate', (data) => {
      setAuction(prev => prev ? { ...prev, ...data.auction } : null);
      setActiveUsers(data.activeUsers);
    });

    socketRef.current.on('auctionEnded', (data) => {
      setAuction(prev => prev ? { ...prev, status: 'ended' } : null);
      toast.success(data.message);
    });

    // Bid events
    socketRef.current.on('newBid', (bidData: Bid) => {
      setBids(prev => [bidData, ...prev.slice(0, 19)]); // Keep last 20 bids
      setAuction(prev => prev ? {
        ...prev,
        currentBid: bidData.amount,
        bidders: prev.bidders + (bids.find(b => b.bidderId === bidData.bidderId) ? 0 : 1),
        totalBids: prev.totalBids + 1
      } : null);

      // Play bid sound
      playBidSound();
    });

    socketRef.current.on('bidAccepted', (data) => {
      toast.success(data.message);
      setMyBidHistory(prev => [{
        id: data.bidId,
        bidderId: userId,
        bidderName: 'You',
        amount: data.amount,
        timestamp: new Date(),
        isWinning: true
      }, ...prev]);
    });

    socketRef.current.on('bidRejected', (data) => {
      toast.error(data.reason || data.message);
    });

    // Chat events
    socketRef.current.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
      scrollToBottom();
    });

    // Error handling
    socketRef.current.on('error', (error) => {
      toast.error(error.message || 'Connection error');
    });

    socketRef.current.on('userJoined', (data) => {
      setActiveUsers(data.activeUsers);
    });

    socketRef.current.on('userLeft', (data) => {
      setActiveUsers(data.activeUsers);
    });
  };

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    setTimeLeft(Math.floor(diff / 1000));
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auction ended
            setAuction(prev => prev ? { ...prev, status: 'ended' } : null);
            toast.success('Auction has ended!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const placeBid = () => {
    if (!socketRef.current || !auction) return;

    if (bidAmount <= auction.currentBid) {
      toast.error('Bid must be higher than current bid');
      return;
    }

    if (bidAmount < auction.currentBid + auction.bidIncrement) {
      toast.error(`Minimum bid increment is ₹${auction.bidIncrement}`);
      return;
    }

    socketRef.current.emit('placeBid', {
      auctionId,
      amount: bidAmount,
      userId,
      userName: localStorage.getItem('userName') || 'Anonymous'
    });
  };

  const sendChatMessage = () => {
    if (!socketRef.current || !chatMessage.trim()) return;

    socketRef.current.emit('sendChatMessage', {
      auctionId,
      userId,
      userName: localStorage.getItem('userName') || 'Anonymous',
      message: chatMessage.trim()
    });

    setChatMessage('');
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const playBidSound = () => {
    // Create a simple beep sound for new bids
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getBidStatus = (bid: Bid) => {
    if (bid.isWinning) return 'winning';
    if (bid.bidderId === userId) return 'yours';
    return 'outbid';
  };

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{auction.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Seller: {auction.seller.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{auction.seller.rating}</span>
                    </div>
                    <span>{auction.product.category}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Images */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {auction.product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Auction Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">₹{auction.currentBid.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Current Bid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{auction.bidders}</div>
                  <div className="text-sm text-gray-600">Bidders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{auction.totalBids}</div>
                  <div className="text-sm text-gray-600">Total Bids</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    timeLeft < 300 ? 'text-red-600' :
                    timeLeft < 1800 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : 'ENDED'}
                  </div>
                  <div className="text-sm text-gray-600">Time Left</div>
                </div>
              </div>
            </div>

            {/* AI-Powered Bidding Suggestions */}
            {auction.status === 'active' && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      AI Bidding Strategy
                      <span className="text-sm font-normal bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Powered by QuickMela AI
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Smart recommendations based on market data and your bidding history</p>
                  </div>
                </div>

                {loadingAISuggestions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Analyzing auction data...</span>
                  </div>
                ) : aiSuggestions ? (
                  <div className="space-y-6">
                    {/* Strategy Recommendation */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Strategy</h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          aiSuggestions.recommendedStrategy.type === 'conservative' ? 'bg-green-100 text-green-800' :
                          aiSuggestions.recommendedStrategy.type === 'strategic' ? 'bg-blue-100 text-blue-800' :
                          aiSuggestions.recommendedStrategy.type === 'aggressive' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {aiSuggestions.recommendedStrategy.type.charAt(0).toUpperCase() + aiSuggestions.recommendedStrategy.type.slice(1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{aiSuggestions.recommendedStrategy.expectedROI}%</div>
                          <div className="text-xs text-gray-600">Expected ROI</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            aiSuggestions.recommendedStrategy.riskLevel === 'low' ? 'text-green-600' :
                            aiSuggestions.recommendedStrategy.riskLevel === 'medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {aiSuggestions.recommendedStrategy.riskLevel.charAt(0).toUpperCase() + aiSuggestions.recommendedStrategy.riskLevel.slice(1)}
                          </div>
                          <div className="text-xs text-gray-600">Risk Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{aiSuggestions.marketIntelligence.competitionLevel}/10</div>
                          <div className="text-xs text-gray-600">Competition</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            aiSuggestions.marketIntelligence.auctionMomentum === 'slow' ? 'text-red-600' :
                            aiSuggestions.marketIntelligence.auctionMomentum === 'steady' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {aiSuggestions.marketIntelligence.auctionMomentum.charAt(0).toUpperCase() + aiSuggestions.marketIntelligence.auctionMomentum.slice(1)}
                          </div>
                          <div className="text-xs text-gray-600">Momentum</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>AI Analysis:</strong> {aiSuggestions.recommendedStrategy.reasoning[0]}
                      </div>
                    </div>

                    {/* Optimal Bids */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Suggested Bids
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {aiSuggestions.optimalBids.map((bid: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer group"
                               onClick={() => setBidAmount(bid.amount)}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                ₹{bid.amount.toLocaleString()}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                bid.timing === 'immediate' ? 'bg-green-100 text-green-800' :
                                bid.timing === 'early' ? 'bg-blue-100 text-blue-800' :
                                bid.timing === 'mid' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {bid.timing}
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {bid.reasoning}
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-purple-600" />
                                <span className="text-purple-600 font-medium">{bid.confidence}% confidence</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-green-600 font-medium">{bid.successProbability}% win chance</span>
                              </div>
                            </div>

                            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                                Use This Bid
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Intelligence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Risk Assessment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Shill Bidding Risk</span>
                            <span className={`font-medium ${
                              aiSuggestions.marketIntelligence.shillBiddingRisk > 5 ? 'text-red-600' :
                              aiSuggestions.marketIntelligence.shillBiddingRisk > 3 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {aiSuggestions.marketIntelligence.shillBiddingRisk}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Competition Level</span>
                            <span className="font-medium text-blue-600">
                              {aiSuggestions.marketIntelligence.competitionLevel > 7 ? 'High' :
                               aiSuggestions.marketIntelligence.competitionLevel > 4 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Budget Optimization
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Suggested Max Bid</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{aiSuggestions.budgetOptimization.suggestedMaxBid.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Reserve Amount</span>
                            <span className="font-medium text-green-600">
                              ₹{aiSuggestions.budgetOptimization.reserveAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Expected Profit</span>
                            <span className="font-medium text-purple-600">
                              {aiSuggestions.budgetOptimization.profitMargin}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Pro Tip</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Based on current market conditions, consider bidding strategically rather than aggressively.
                            The AI predicts a {aiSuggestions.marketIntelligence.auctionMomentum} momentum with
                            {aiSuggestions.marketIntelligence.competitionLevel > 7 ? ' high' :
                             aiSuggestions.marketIntelligence.competitionLevel > 4 ? ' moderate' : ' low'} competition.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>AI suggestions unavailable</p>
                  </div>
                )}
              </div>
            )}

            {/* Voice Bidding Interface */}
            {auction.status === 'active' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <VoiceBidding
                  auctionId={auctionId}
                  currentBid={auction.currentBid}
                  bidIncrement={auction.bidIncrement}
                  onBidPlaced={(amount) => {
                    setBidAmount(amount);
                    placeBid();
                  }}
                  disabled={!isConnected || timeLeft === 0}
                />
              </div>
            )}

            {/* Traditional Bidding Interface */}
            {auction.status === 'active' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Place Your Bid</h2>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min={auction.currentBid + auction.bidIncrement}
                      step={auction.bidIncrement}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum bid: ₹{(auction.currentBid + auction.bidIncrement).toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-8">
                    <button
                      onClick={placeBid}
                      disabled={!isConnected || timeLeft === 0}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Gavel className="w-5 h-5" />
                      <span>Place Bid</span>
                    </button>
                  </div>
                </div>

                {/* Quick Bid Buttons */}
                <div className="flex space-x-2">
                  {[auction.bidIncrement, auction.bidIncrement * 2, auction.bidIncrement * 5].map((increment) => (
                    <button
                      key={increment}
                      onClick={() => setBidAmount(auction.currentBid + increment)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-sm font-medium"
                    >
                      +₹{increment.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auction Ended */}
            {auction.status === 'ended' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">Auction Ended!</h2>
                  <p className="text-green-700">
                    Final bid: ₹{auction.currentBid.toLocaleString()} with {auction.bidders} bidders
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Live Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{activeUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Bids</span>
                  <span className="font-medium">{myBidHistory.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection</span>
                  <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Bids</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bids.slice(0, 10).map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{bid.bidderName}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        bid.isWinning ? 'bg-green-100 text-green-800' :
                        bid.bidderId === userId ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getBidStatus(bid)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{bid.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Live Chat
              </h3>

              <div
                ref={chatContainerRef}
                className="h-64 overflow-y-auto mb-3 p-2 border rounded-lg bg-gray-50"
              >
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-sm mb-2">
                    <span className="font-medium text-indigo-600">{message.userName}:</span>
                    <span className="ml-1">{message.message}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  maxLength={200}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatMessage.trim() || !isConnected}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeBidding;
