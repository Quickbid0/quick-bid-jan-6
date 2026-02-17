import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Shield,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Play,
  ChevronRight
} from 'lucide-react';

// =============================================================================
// ELITE HOMEPAGE - Series B Ready
// VC-Backed Indian Marketplace (₹500 Crore Valuation)
// Apple Clean + Stripe Confident + Amazon Conversion
// =============================================================================

const EliteLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('vehicles');

  const categories = [
    { id: 'vehicles', name: 'Vehicles', count: '2,847', icon: '🚗' },
    { id: 'art', name: 'Art & Paintings', count: '1,203', icon: '🎨' },
    { id: 'jewelry', name: 'Jewelry', count: '856', icon: '💎' },
    { id: 'equipment', name: 'Equipment', count: '642', icon: '⚙️' },
    { id: 'antiques', name: 'Antiques', count: '423', icon: '🏺' },
    { id: 'handmade', name: 'Handmade', count: '298', icon: '🎨' },
  ];

  const trustSignals = [
    { icon: Shield, text: 'Bank-Grade Security', color: 'text-emerald-500' },
    { icon: CheckCircle, text: 'AI-Verified Auctions', color: 'text-blue-600' },
    { icon: Award, text: 'Trusted by 500K+ Users', color: 'text-purple-600' },
  ];

  const stats = [
    { value: '₹2.5M+', label: 'Auctions Completed', change: '+127%' },
    { value: '500K+', label: 'Happy Users', change: '+89%' },
    { value: '98%', label: 'Success Rate', change: '+12%' },
    { value: '50+', label: 'Countries', change: '+25%' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Clean & Minimal */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                QuickMela
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/auctions" className="text-neutral-600 hover:text-primary-600 transition-colors duration-200">
                Browse Auctions
              </Link>
              <Link to="/sell" className="text-neutral-600 hover:text-primary-600 transition-colors duration-200">
                Sell with Us
              </Link>
              <Link to="/about" className="text-neutral-600 hover:text-primary-600 transition-colors duration-200">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <button className="text-neutral-600 hover:text-primary-600 px-4 py-2 rounded-lg transition-colors duration-200">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-250 hover:shadow-lg hover:shadow-primary-500/25">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Large & Confident */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-white">
        <div className="absolute inset-0 bg-grid-neutral-100 bg-[size:32px_32px] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Trusted by 500K+ Users</span>
              </div>

              {/* Hero Headline */}
              <div
                className="space-y-4"
              >
                <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                  India's Most
                  <span className="block text-primary-600">Trusted Auction</span>
                  <span className="block">Platform</span>
                </h1>
                <p className="text-xl text-neutral-600 max-w-lg leading-relaxed">
                  Experience secure, transparent auctions with AI-powered insights and real-time bidding. Join India's fastest-growing marketplace.
                </p>
              </div>

              {/* Search-First UX */}
              <div
                className="max-w-md"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search auctions, vehicles, art..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-250 hover:shadow-lg">
                    Search
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/register">
                  <button className="w-full sm:w-auto bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250 hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2">
                    Start Bidding Today
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <button className="w-full sm:w-auto border border-neutral-300 text-neutral-700 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Social Proof */}
              <div
                className="flex items-center gap-8 pt-8"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-neutral-600 ml-2">4.9/5 (50K+ reviews)</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div
              className="relative"
            >
              {/* Main Auction Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900">BMW X5 2020</h3>
                    <p className="text-neutral-600">Premium Luxury SUV • Verified</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600">AI-Verified</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-neutral-600">Current Bid</div>
                    <div className="text-2xl font-bold text-emerald-600">₹8.75L</div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-600">Time Left</div>
                    <div className="text-2xl font-bold text-amber-600">4:23</div>
                  </div>
                </div>

                <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250 hover:shadow-lg">
                  Place Bid
                </button>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-neutral-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">247 watching</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-neutral-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">+23% value</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-neutral-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-12">
            {trustSignals.map((signal, index) => (
              <div
                key={signal.text}
                className="flex items-center gap-2 text-white"
              >
                <signal.icon className={`w-5 h-5 ${signal.color}`} />
                <span className="text-sm font-medium">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover premium items across India's most trusted auction categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-250 cursor-pointer ${
                  activeCategory === category.id
                    ? 'border-primary-500 shadow-xl shadow-primary-500/10'
                    : 'border-neutral-200 hover:border-neutral-300 hover:shadow-lg'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{category.name}</h3>
                <p className="text-neutral-600 mb-4">{category.count} active auctions</p>
                <div className="flex items-center text-primary-600 font-medium">
                  Browse Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-neutral-600">
              Join thousands of satisfied users who've transformed their auction experience
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-neutral-900 font-semibold mb-1">{stat.label}</div>
                <div className="text-emerald-600 text-sm font-medium">{stat.change} this quarter</div>
              </div>
            ))}
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Verified Seller',
                content: 'Sold my vintage car for 40% above market value. The AI insights were game-changing.',
                avatar: 'RK'
              },
              {
                name: 'Priya Sharma',
                role: 'Premium Buyer',
                content: 'Found incredible art pieces at fair prices. The verification process gives complete peace of mind.',
                avatar: 'PS'
              },
              {
                name: 'Amit Patel',
                role: 'Company Director',
                content: 'Our bulk auctions run smoothly with enterprise-grade security and real-time analytics.',
                avatar: 'AP'
              }
            ].map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Auction Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join India's most trusted auction platform. Start bidding or selling today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="w-full sm:w-auto bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250 hover:shadow-xl flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/auctions">
                <button className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-250">
                  Browse Auctions
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - VC Startup Clean */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">QuickMela</div>
              <p className="text-neutral-400 leading-relaxed">
                India's most trusted auction platform with AI-powered insights and enterprise-grade security.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/auctions" className="hover:text-white transition-colors">Browse Auctions</Link></li>
                <li><Link to="/sell" className="hover:text-white transition-colors">Sell with Us</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © 2024 QuickMela. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-neutral-400 text-sm">Made with ❤️ in India</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-neutral-400 text-sm">ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EliteLandingPage;