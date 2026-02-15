// Enhanced Landing Page - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium home page experience that converts visitors into engaged users

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import {
  Zap,
  Shield,
  Trophy,
  Star,
  Crown,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  MapPin,
  Car,
  Truck,
  Bike,
  Building,
  Smartphone,
  Globe,
  Lock,
  Fingerprint,
  CreditCard,
  BarChart3,
  Lightbulb,
  Rocket,
  Flame,
  Wind,
  Camera,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  X,
  Menu,
  Search
} from 'lucide-react';

// Import enhanced design system
import { Container, Button, Card, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = '',
  duration = 2000
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startValue = 0;
    const endValue = value;
    const increment = endValue / (duration / 16); // 60fps

    const timer = setInterval(() => {
      setCount(prevCount => {
        const nextCount = prevCount + increment;
        if (nextCount >= endValue) {
          clearInterval(timer);
          return endValue;
        }
        return nextCount;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{Math.floor(count).toLocaleString()}{suffix}</span>;
};

// Trust Indicators Component
const TrustIndicators: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.6 }}
    className="flex flex-wrap items-center justify-center gap-6 mt-8"
  >
    {[
      { icon: Shield, label: 'Bank-Grade Security', color: 'text-emerald-600' },
      { icon: Users, label: '500K+ Happy Users', color: 'text-blue-600' },
      { icon: Award, label: 'Fintech Award Winner', color: 'text-purple-600' },
      { icon: CheckCircle, label: 'Verified Platform', color: 'text-orange-600' }
    ].map((item, index) => (
      <motion.div
        key={item.label}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
      >
        <item.icon className={`w-4 h-4 ${item.color}`} />
        <span className="text-white/90 text-sm font-medium">{item.label}</span>
      </motion.div>
    ))}
  </motion.div>
);

// Social Proof Component
const SocialProof: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.0, duration: 0.6 }}
    className="text-center"
  >
    <div className="flex items-center justify-center gap-2 mb-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        </motion.div>
      ))}
      <span className="text-white/90 font-medium text-lg">4.9/5 from 50K+ reviews</span>
    </div>

    <div className="flex items-center justify-center gap-8 text-white/80">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span>$2.5M+ in successful auctions</span>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span>98% seller satisfaction</span>
      </div>
    </div>
  </motion.div>
);

// Feature Showcase Component
const FeatureShowcase: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Auctions',
      description: 'Real-time bidding with instant updates and live countdowns',
      color: 'from-blue-500 to-cyan-500',
      stats: '23s avg bid time'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Escrow protection, SSL encryption, and fraud detection AI',
      color: 'from-emerald-500 to-green-500',
      stats: '99.9% secure'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Smart pricing suggestions and market intelligence',
      color: 'from-purple-500 to-pink-500',
      stats: '40% better pricing'
    },
    {
      icon: Trophy,
      title: 'Gamified Experience',
      description: 'Achievement unlocks and competitive bidding psychology',
      color: 'from-orange-500 to-red-500',
      stats: '60% more engagement'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.color} text-white`}>
            {feature.stats}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Live Auction Preview Component
const LiveAuctionPreview: React.FC = () => {
  const [currentAuction, setCurrentAuction] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const auctions = [
    {
      item: 'BMW X5 2020',
      image: '/api/placeholder/400/300',
      currentBid: 875000,
      bidders: 23,
      category: 'Luxury SUV'
    },
    {
      item: 'Honda City 2019',
      image: '/api/placeholder/400/300',
      currentBid: 650000,
      bidders: 18,
      category: 'Sedan'
    },
    {
      item: 'Royal Enfield Classic 350',
      image: '/api/placeholder/400/300',
      currentBid: 185000,
      bidders: 31,
      category: 'Motorcycle'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-16"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">🔥 Live Auctions Happening Now</h3>
          <p className="text-gray-300">Join the excitement and place your bids!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 font-semibold">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {auctions.map((auction, index) => (
          <motion.div
            key={auction.item}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + index * 0.2, duration: 0.5 }}
            className={`rounded-xl overflow-hidden cursor-pointer transition-all ${
              index === currentAuction ? 'ring-2 ring-orange-500 scale-105' : ''
            }`}
            onClick={() => setCurrentAuction(index)}
          >
            <div className="relative">
              <img
                src={auction.image}
                alt={auction.item}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">{auction.category}</span>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-lg mb-2">{auction.item}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current Bid:</span>
                  <span className="font-bold text-green-400">₹{(auction.currentBid / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Active Bidders:</span>
                  <span className="font-bold">{auction.bidders}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-4 bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors cursor-pointer">
          <Zap className="w-5 h-5" />
          Join Live Auction
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

// Success Stories Carousel
const SuccessStories: React.FC = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const stories = [
    {
      name: 'Rajesh Kumar',
      role: 'Auto Dealer',
      achievement: 'Sold luxury car for ₹2.8L above reserve',
      quote: 'QuickMela transformed our auction business. The AI insights helped us increase our success rate by 40%.',
      avatar: 'RK',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Priya Sharma',
      role: 'Collector',
      achievement: 'Won vintage motorcycle auction',
      quote: 'The platform\'s fraud detection saved us from potential losses. Enterprise support is outstanding.',
      avatar: 'PS',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Amit Patel',
      role: 'Investor',
      achievement: '15x return on machinery investment',
      quote: 'Best ROI we\'ve seen in auction platforms. The analytics and AI recommendations are game-changing.',
      avatar: 'AP',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory(prev => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [stories.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Success Stories</h3>
        <p className="text-gray-600">Real wins from our community</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${stories[currentStory].gradient} flex items-center justify-center text-white text-2xl font-bold`}>
            {stories[currentStory].avatar}
          </div>

          <blockquote className="text-lg text-gray-700 italic mb-6">
            "{stories[currentStory].quote}"
          </blockquote>

          <div className="mb-4">
            <h4 className="font-bold text-gray-900 text-lg">{stories[currentStory].name}</h4>
            <p className="text-gray-600">{stories[currentStory].role}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">{stories[currentStory].achievement}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-6">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStory(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentStory ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Stats Counter Component
const StatsCounter: React.FC = () => {
  const stats = [
    { label: 'Active Auctions', value: 1247, icon: Target, suffix: '+' },
    { label: 'Happy Users', value: 500000, icon: Users, suffix: '+' },
    { label: 'Total Transactions', value: 2500000, icon: DollarSign, suffix: '₹' },
    { label: 'Success Rate', value: 98, icon: Trophy, suffix: '%' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <stat.icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stat.suffix === '+' || stat.suffix === '%' ? (
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            ) : (
              `${stat.suffix}${(stat.value / 1000000).toFixed(1)}M`
            )}
          </div>
          <div className="text-gray-600 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Enhanced Landing Page Component
export const EnhancedLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleDemoAccess = () => {
    navigate('/demo-showcase');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuickMela</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#auctions" className="text-gray-700 hover:text-blue-600 font-medium">Auctions</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium">Success</a>
              <Link to="/demo-showcase" className="text-gray-700 hover:text-blue-600 font-medium">Demo</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 border-t border-gray-200"
              >
                <div className="flex flex-col gap-4 pt-4">
                  <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
                  <a href="#auctions" className="text-gray-700 hover:text-blue-600 font-medium">Auctions</a>
                  <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium">Success</a>
                  <Link to="/demo-showcase" className="text-gray-700 hover:text-blue-600 font-medium">Demo</Link>
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                    <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                      Sign In
                    </Link>
                    <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Get Started
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 animate-pulse" />

          {/* Floating geometric shapes */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-32 right-32 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
          />
        </div>

        <Container className="relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 mb-6"
              >
                <Crown className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-medium text-sm">#1 Auction Platform in India</span>
              </motion.div>

              {/* Hero Title with Gaming Typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-6"
              >
                <h1
                  className="text-5xl lg:text-7xl font-black mb-4 leading-tight"
                  style={getTextStyle('gaming', 'hero')}
                >
                  WIN BIG
                </h1>
                <p className="text-2xl lg:text-3xl text-white/90 font-medium mb-6">
                  Experience the future of online auctions
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  Join India's fastest-growing auction platform with AI-powered bidding,
                  real-time excitement, and bank-grade security.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-orange-500/25"
                >
                  <Rocket className="w-6 h-6 mr-2" />
                  Start Winning Today
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>

                <Button
                  onClick={handleDemoAccess}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
                >
                  <Play className="w-6 h-6 mr-2" />
                  View Demo
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <TrustIndicators />

              {/* Social Proof */}
              <SocialProof />
            </motion.div>

            {/* Right Side - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Live Auction Preview</h3>
                  <p className="text-white/80">Experience real-time bidding excitement</p>
                </div>

                {/* Mock Auction Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/api/placeholder/60/60"
                      alt="BMW X5"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white">BMW X5 2020</h4>
                      <p className="text-white/70 text-sm">Luxury SUV</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-white/70 text-sm">Current Bid</div>
                      <div className="text-xl font-bold text-green-400">₹8.75L</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Time Left</div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-xl font-bold text-orange-400"
                      >
                        4:23
                      </motion.div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold">
                    <Zap className="w-4 h-4 mr-2" />
                    Place Bid
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <Container>
          <StatsCounter />
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuickMela?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the most advanced auction platform with cutting-edge technology
              and unbeatable user experience.
            </p>
          </motion.div>

          <FeatureShowcase />
        </Container>
      </section>

      {/* Live Auctions Preview */}
      <section id="auctions" className="py-20 bg-white">
        <Container>
          <LiveAuctionPreview />
        </Container>
      </section>

      {/* Success Stories */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <Container>
          <SuccessStories />
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <Container className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Auction Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500,000+ users who have discovered the future of online auctions.
              Start bidding, selling, and winning today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg shadow-2xl hover:shadow-orange-500/25"
              >
                <Rocket className="w-6 h-6 mr-2" />
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>

              <Button
                onClick={handleDemoAccess}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              >
                <Eye className="w-6 h-6 mr-2" />
                Explore Demo
              </Button>
            </div>

            {/* Email Signup */}
            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for updates"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-blue-200 text-sm mt-2">
                Get exclusive access to new auctions and platform updates
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuickMela</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's premier auction platform with AI-powered insights and bank-grade security.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">How it Works</a>
                <a href="#" className="block hover:text-white">Browse Auctions</a>
                <a href="#" className="block hover:text-white">Seller Center</a>
                <a href="#" className="block hover:text-white">API Docs</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">Help Center</a>
                <a href="#" className="block hover:text-white">Contact Us</a>
                <a href="#" className="block hover:text-white">Security</a>
                <a href="#" className="block hover:text-white">Trust & Safety</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">About Us</a>
                <a href="#" className="block hover:text-white">Careers</a>
                <a href="#" className="block hover:text-white">Press</a>
                <a href="#" className="block hover:text-white">Blog</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 QuickMela. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;
