// Enhanced Auth Screens - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium Login/Signup experience with Apple-level polish and emotional engagement

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  Zap,
  Trophy,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Star,
  Users,
  Award
} from 'lucide-react';

// Import enhanced design system
import { Button, Card, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { useSafeClick, useFormSubmission } from '../ui-system/bug-prevention';

// Trust indicators component
const TrustIndicators: React.FC = () => (
  <div
}
}
}
    className="flex items-center justify-center gap-8 mt-8"
  >
    {[
      { icon: Shield, label: 'Bank-Grade Security', color: 'text-emerald-600' },
      { icon: Users, label: '500K+ Users', color: 'text-blue-600' },
      { icon: Award, label: 'Fintech Award Winner', color: 'text-purple-600' },
      { icon: CheckCircle, label: 'Verified Platform', color: 'text-orange-600' }
    ].map((item, index) => (
      <div
        key={item.label}
}
}
}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className={`p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 ${item.color}`}>
          <item.icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-white/90">{item.label}</span>
      </div>
    ))}
  </div>
);

// Social proof component
const SocialProof: React.FC = () => (
  <div
}
}
}
    className="text-center mt-12"
  >
    <div className="flex items-center justify-center gap-2 mb-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
}
}
}
        >
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        </div>
      ))}
      <span className="ml-2 text-white/90 font-medium">4.9/5 from 50K+ reviews</span>
    </div>

    <div className="flex items-center justify-center gap-6 text-sm text-white/80">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span>$2.5M+ in successful auctions</span>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span>98% seller satisfaction</span>
      </div>
    </div>
  </div>
);

// Success stories carousel
const SuccessStories: React.FC = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const stories = [
    {
      name: "Rajesh Kumar",
      role: "Auto Dealer",
      achievement: "Sold luxury car for ₹2.8L above reserve",
      avatar: "RK",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Priya Sharma",
      role: "Collector",
      achievement: "Won vintage motorcycle auction",
      avatar: "PS",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      name: "Amit Patel",
      role: "Investor",
      achievement: "15x return on machinery investment",
      avatar: "AP",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % stories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stories.length]);

  return (
    <div
}
}
}
      className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80"
    >
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Success Stories</h3>
          <p className="text-sm text-gray-600">Real wins from our community</p>
        </div>

        <Fragment mode="wait">
          <div
            key={currentStory}
}
}
}
}
            className="text-center"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${stories[currentStory].gradient} flex items-center justify-center text-white font-bold text-lg`}>
              {stories[currentStory].avatar}
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{stories[currentStory].name}</h4>
            <p className="text-sm text-gray-600 mb-2">{stories[currentStory].role}</p>
            <p className="text-sm text-emerald-600 font-medium">{stories[currentStory].achievement}</p>
          </div>
        </Fragment>

        <div className="flex justify-center gap-2 mt-4">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStory(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStory ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

// Enhanced Login Component
export const EnhancedLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, isSubmitting } = useFormSubmission(async (data: typeof formData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Login attempt:', data);
    // Navigate to dashboard
    navigate('/dashboard');
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20" />

        {/* Floating geometric shapes */}
        <div
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
        <div
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

      <Container className="relative z-10 min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Trust */}
          <div
}
}
}
            className="text-center lg:text-left"
          >
            {/* Hero Title with Gaming Typography */}
            <div
}
}
}
              className="mb-6"
            >
              <h1
                className="text-5xl lg:text-6xl font-black mb-4"
                style={getTextStyle('gaming', 'hero')}
              >
                WIN BIG
              </h1>
              <p className="text-xl text-white/90 font-medium">
                Join India's fastest-growing auction platform
              </p>
            </div>

            {/* Feature Highlights */}
            <div
}
}
}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              {[
                { icon: Zap, label: 'Lightning Fast Auctions', color: 'text-yellow-400' },
                { icon: Shield, label: '100% Secure Payments', color: 'text-emerald-400' },
                { icon: Crown, label: 'Premium Experience', color: 'text-purple-400' },
                { icon: Sparkles, label: 'AI-Powered Insights', color: 'text-blue-400' }
              ].map((feature, index) => (
                <div
                  key={feature.label}
}
}
}
                  className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-white/90 font-medium text-sm">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <TrustIndicators />

            {/* Social Proof */}
            <SocialProof />
          </div>

          {/* Right Side - Login Form */}
          <div
}
}
}
            className="relative"
          >
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              {/* Header */}
              <div
}
}
}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Continue your winning streak</p>
              </div>

              {/* Login Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(formData);
              }} className="space-y-6">
                {/* Email Field */}
                <div
}
}
}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Password Field */}
                <div
}
}
}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div
}
}
}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <div
}
}
}
                >
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {isSubmitting ? 'Signing In...' : 'Start Winning'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                {/* Social Login Options */}
                <div
}
}
}
                  className="relative"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div
}
}
}
                  className="grid grid-cols-2 gap-4"
                >
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                    Twitter
                  </button>
                </div>

                {/* Sign Up Link */}
                <div
}
}
}
                  className="text-center"
                >
                  <p className="text-gray-600">
                    New to QuickMela?{' '}
                    <Link
                      to="/signup"
                      className="text-blue-600 hover:text-blue-500 font-semibold"
                    >
                      Start your journey
                    </Link>
                  </p>
                </div>
              </form>
            </Card>

            {/* Success Stories */}
            <SuccessStories />
          </div>
        </div>
      </Container>
    </div>
  );
};

// Enhanced Signup Component
export const EnhancedSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer' as 'buyer' | 'seller',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, isSubmitting } = useFormSubmission(async (data: typeof formData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Signup attempt:', data);
    // Navigate to dashboard
    navigate('/dashboard');
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20" />

        {/* Floating geometric shapes */}
        <div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-20 right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl"
        />
        <div
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-32 left-32 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl"
        />
      </div>

      <Container className="relative z-10 min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-4xl">
          <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            {/* Header */}
            <div
}
}
}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Join the Winners</h1>
              <p className="text-gray-600">Create your account and start winning auctions</p>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step <= currentStep
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
}
                      whileTap={{ scale: 0.95 }}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 mx-2 rounded ${
                        step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-16 mt-2 text-xs text-gray-500">
                <span>Account</span>
                <span>Details</span>
                <span>Verify</span>
              </div>
            </div>

            {/* Multi-Step Form */}
            <Fragment mode="wait">
              {currentStep === 1 && (
                <motion.form
                  key="step1"
}
}
}
}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formData.firstName && formData.lastName && formData.email) {
                      nextStep();
                    }
                  }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>

                  <Grid cols={2} gap="md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </Grid>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.form>
              )}

              {currentStep === 2 && (
                <motion.form
                  key="step2"
}
}
}
}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword) {
                      nextStep();
                    }
                  }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'buyer', label: 'Buyer', description: 'I want to bid on auctions' },
                        { value: 'seller', label: 'Seller', description: 'I want to sell items' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange('userType', option.value)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.userType === option.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      disabled={!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                    >
                      Continue
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {currentStep === 3 && (
                <motion.form
                  key="step3"
}
}
}
}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formData.agreeToTerms) {
                      handleSubmit(formData);
                    }
                  }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms & Verification</h3>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-emerald-900 mb-1">Almost there!</h4>
                        <p className="text-sm text-emerald-700">
                          We'll send a verification email to <strong>{formData.email}</strong> to confirm your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-emerald-600 hover:text-emerald-500 font-medium">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-emerald-600 hover:text-emerald-500 font-medium">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={isSubmitting}
                      disabled={!formData.agreeToTerms}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create My Account'}
                      <Sparkles className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </motion.form>
              )}
            </Fragment>

            {/* Login Link */}
            <div
}
}
}
              className="text-center mt-8 pt-6 border-t border-gray-200"
            >
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-500 font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default { EnhancedLogin, EnhancedSignup };
