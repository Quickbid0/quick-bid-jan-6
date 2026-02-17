// Enhanced Subscription Plans - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium SaaS subscription experience with pricing psychology, conversion optimization, and intelligent features

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Zap,
  Star,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Clock,
  CreditCard,
  Gift,
  Award,
  Rocket,
  Diamond,
  Infinity,
  Calendar,
  DollarSign,
  Percent,
  ChevronRight,
  CheckCircle,
  Info,
  Lock,
  Unlock
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Pricing Psychology Components
interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    tagline: string;
    price: number;
    originalPrice?: number;
    interval: 'month' | 'year';
    description: string;
    features: string[];
    limitations?: string[];
    popular?: boolean;
    recommended?: boolean;
    savings?: number;
    badge?: string;
    icon: React.ComponentType<any>;
    color: string;
    gradient: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  currentPlan?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isSelected, onSelect, currentPlan }) => {
  const isCurrentPlan = currentPlan === plan.id;

  return (
    <div
}
}
}
      className={`relative ${plan.popular ? 'scale-105' : ''}`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div
}
}
}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🔥 MOST POPULAR
          </div>
        </div>
      )}

      {/* Recommended Badge */}
      {plan.recommended && (
        <div
}
}
}
          className="absolute -top-3 -right-3 z-10"
        >
          <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg">
            <Award className="w-4 h-4" />
          </div>
        </div>
      )}

      <Card
        className={`p-8 h-full cursor-pointer transition-all duration-300 ${
          isSelected
            ? `ring-2 ring-${plan.color}-500 shadow-2xl scale-105`
            : 'hover:shadow-xl hover:scale-102'
        } ${plan.popular ? 'border-2 border-orange-300' : 'border border-gray-200'}`}
        onClick={onSelect}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}
}
}
          >
            <plan.icon className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
          <p className="text-gray-600 text-sm">{plan.tagline}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
            <span className="text-gray-500 text-lg">/{plan.interval}</span>
          </div>

          {plan.originalPrice && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice.toLocaleString()}</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-semibold">
                Save {plan.savings}%
              </span>
            </div>
          )}

          {plan.badge && (
            <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {plan.badge}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div
              key={index}
}
}
}
              className="flex items-start gap-3"
            >
              <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}

          {plan.limitations && plan.limitations.map((limitation, index) => (
            <div
              key={`limit-${index}`}
}
}
}
              className="flex items-start gap-3"
            >
              <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 text-sm">{limitation}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          fullWidth
          className={`py-3 font-semibold transition-all ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
              : plan.popular
              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
              : `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`
          }`}
          disabled={isCurrentPlan}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isCurrentPlan ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Current Plan
            </>
          ) : (
            <>
              Choose {plan.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            Secure
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle className="w-3 h-3" />
            Trusted
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            Cancel anytime
          </div>
        </div>
      </Card>
    </div>
  );
};

// Conversion Optimization Components
interface UrgencyBannerProps {
  message: string;
  timeLeft?: string;
  discount?: number;
  className?: string;
}

const UrgencyBanner: React.FC<UrgencyBannerProps> = ({ message, timeLeft, discount, className }) => (
  <div
}
}
}
    className={`bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
}
}
        >
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-lg">{message}</div>
          {timeLeft && <div className="text-sm opacity-90">{timeLeft} remaining</div>}
        </div>
      </div>

      {discount && (
        <div className="text-right">
          <div className="text-2xl font-black">{discount}% OFF</div>
          <div className="text-sm opacity-90">Limited time</div>
        </div>
      )}
    </div>
  </div>
);

// Social Proof Component
interface SocialProofProps {
  testimonials: Array<{
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    avatar: string;
  }>;
  className?: string;
}

const SocialProof: React.FC<SocialProofProps> = ({ testimonials, className }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted by Industry Leaders</h3>
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-sm text-gray-600 ml-2">4.9/5 from 2,500+ customers</span>
        </div>
      </div>

      <Fragment mode="wait">
        <div
          key={currentTestimonial}
}
}
}
}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {testimonials[currentTestimonial].avatar}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
              <div className="text-sm text-gray-600">
                {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
              </div>
            </div>
          </div>

          <blockquote className="text-gray-700 italic mb-4">
            "{testimonials[currentTestimonial].content}"
          </blockquote>

          <div className="flex items-center justify-center gap-1">
            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </Fragment>

      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTestimonial(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </Card>
  );
};

// Enhanced Subscription Plans Component
export const EnhancedSubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [currentPlan, setCurrentPlan] = useState<string>('starter');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Perfect for beginners',
      price: billingInterval === 'month' ? 999 : 9990,
      originalPrice: billingInterval === 'month' ? 1299 : 12990,
      interval: billingInterval,
      description: 'Get started with essential auction features',
      savings: 23,
      features: [
        'Up to 5 active listings',
        'Basic auction analytics',
        'Email notifications',
        'Mobile app access',
        'Community support'
      ],
      limitations: [
        'Limited to ₹50L auctions',
        'Basic fraud protection'
      ],
      icon: Target,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      tagline: 'For serious sellers',
      price: billingInterval === 'month' ? 2499 : 24990,
      originalPrice: billingInterval === 'month' ? 3499 : 34990,
      interval: billingInterval,
      description: 'Advanced features for growing businesses',
      savings: 29,
      popular: true,
      features: [
        'Unlimited active listings',
        'Advanced AI analytics',
        'Priority customer support',
        'Custom branding options',
        'Bulk listing tools',
        'Advanced fraud protection',
        'Real-time notifications',
        'API access'
      ],
      badge: 'Most Popular',
      icon: Trophy,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'For large operations',
      price: billingInterval === 'month' ? 4999 : 49990,
      originalPrice: billingInterval === 'month' ? 6999 : 69990,
      interval: billingInterval,
      description: 'Complete solution for enterprise auction houses',
      savings: 29,
      recommended: true,
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced reporting & insights',
        'White-label solution',
        'Priority auction scheduling',
        'VIP support line',
        'Custom SLA agreements'
      ],
      icon: Crown,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO',
      company: 'AutoTrade India',
      content: 'QuickMela transformed our auction business. The AI insights helped us increase our success rate by 40%.',
      rating: 5,
      avatar: 'RK'
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Head',
      company: 'BidSmart Auctions',
      content: 'The platform\'s fraud detection saved us from potential losses. Enterprise support is outstanding.',
      rating: 5,
      avatar: 'PS'
    },
    {
      name: 'Amit Patel',
      role: 'Founder',
      company: 'AssetAuction Pro',
      content: 'Best ROI we\'ve seen in auction platforms. The analytics and AI recommendations are game-changing.',
      rating: 5,
      avatar: 'AP'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'We offer a 14-day free trial for all plans. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, UPI, net banking, and digital wallets.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. Cancel anytime with no penalties. Your data remains accessible for 30 days.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Container className="py-12">
        {/* Header */}
        <div
}
}
}
          className="text-center mb-12"
        >
          <div
}
}
}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Choose Your Success Plan
          </div>

          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Scale Your Auction Business
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join 50,000+ businesses using QuickMela to run successful auctions with AI-powered insights
          </p>
        </div>

        {/* Urgency Banner */}
        <UrgencyBanner
          message="🎯 Limited Time: 30% OFF Annual Plans"
          timeLeft="48 hours"
          discount={30}
          className="mb-8"
        />

        {/* Billing Toggle */}
        <div
}
}
}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-lg ${billingInterval === 'month' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="relative w-16 h-8 bg-gray-300 rounded-full transition-colors"
          >
            <div
              className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all"
}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${billingInterval === 'year' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-semibold">
              Save 23%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
}
}
}
          className="mb-16"
        >
          <Grid cols={3} gap="lg">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
                currentPlan={currentPlan}
              />
            ))}
          </Grid>
        </div>

        {/* Selected Plan CTA */}
        <Fragment>
          {selectedPlan && (
            <div
}
}
}
}
              className="text-center mb-16"
            >
              <Card className="p-8 bg-gradient-to-r from-emerald-500 to-blue-600 text-white max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to start with {plans.find(p => p.id === selectedPlan)?.name}?
                </h3>
                <p className="text-emerald-100 mb-6">
                  Get started today and transform your auction business
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 font-bold px-8 py-3">
                    Start Free Trial
                    <Rocket className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 px-6 py-3">
                    Schedule Demo
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </Fragment>

        {/* Social Proof */}
        <div
}
}
}
          className="mb-16"
        >
          <SocialProof testimonials={testimonials} />
        </div>

        {/* Feature Comparison */}
        <div
}
}
}
          className="mb-16"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Plans</h2>
              <p className="text-gray-600">Choose the perfect plan for your business needs</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                    {plans.map(plan => (
                      <th key={plan.id} className="text-center py-4 px-6 font-semibold text-gray-900">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Active Listings', '5', 'Unlimited', 'Unlimited'],
                    ['Auction Analytics', 'Basic', 'Advanced AI', 'Enterprise'],
                    ['Customer Support', 'Community', 'Priority', 'Dedicated Manager'],
                    ['API Access', '✗', '✓', '✓'],
                    ['Custom Branding', '✗', '✓', '✓'],
                    ['White-label Solution', '✗', '✗', '✓']
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={`py-4 px-6 text-center ${
                          cellIndex === 0 ? 'text-left font-medium text-gray-900' : 'text-gray-700'
                        }`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div
}
}
}
          className="mb-16"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about QuickMela</p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
}
}
}
                  className="border border-gray-200 rounded-lg"
                >
                  <button className="w-full text-left p-6 focus:outline-none">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Final CTA */}
        <div
}
}
}
          className="text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Auctions?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Join thousands of successful auction houses using QuickMela's AI-powered platform
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 px-6 py-3">
                Contact Sales
              </Button>
            </div>
            <p className="text-indigo-200 text-sm mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default EnhancedSubscriptionPlans;
