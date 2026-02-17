import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Car,
  Shield,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Clock,
  MapPin,
  DollarSign,
  Zap,
  Timer,
  Heart,
  Share2,
  Eye,
  Crown,
  Trophy,
  IndianRupee,
  ChevronRight,
  Phone,
  Mail,
  MapPin as LocationIcon,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Mock data
const featuredAuctions = [
  {
    id: '1',
    title: 'BMW X3 2020 Premium SUV',
    image: '/api/placeholder/400/300',
    currentBid: 1850000,
    timeLeft: '2h 34m',
    location: 'Mumbai',
    bids: 23,
    verified: true,
    riskGrade: 'A',
    emi: 38750
  },
  {
    id: '2',
    title: 'Mercedes C-Class 2019 Luxury Sedan',
    image: '/api/placeholder/400/300',
    currentBid: 2250000,
    timeLeft: '4h 12m',
    location: 'Delhi',
    bids: 34,
    verified: true,
    riskGrade: 'A',
    emi: 47000
  },
  {
    id: '3',
    title: 'Audi Q5 2021 Premium SUV',
    image: '/api/placeholder/400/300',
    currentBid: 3200000,
    timeLeft: '6h 45m',
    location: 'Bangalore',
    bids: 18,
    verified: true,
    riskGrade: 'A',
    emi: 66700
  }
];

const stats = [
  { label: 'Active Auctions', value: '1,247', icon: Car, color: 'text-blue-600' },
  { label: 'Verified Dealers', value: '2,891', icon: Shield, color: 'text-green-600' },
  { label: 'Successful Sales', value: '₹2.5Cr', icon: TrendingUp, color: 'text-orange-600' },
  { label: 'Happy Buyers', value: '98.7%', icon: Users, color: 'text-purple-600' }
];

const trustIndicators = [
  { icon: Shield, title: 'Verified Dealers', description: 'All dealers verified with GST & documents' },
  { icon: CheckCircle, title: '200-Point Inspection', description: 'Every vehicle inspected by certified mechanics' },
  { icon: Award, title: 'Risk Grade Assessment', description: 'AI-powered risk scoring for transparency' },
  { icon: Star, title: 'Bank-Grade Security', description: 'Secure escrow payments & data protection' },
  { icon: Users, title: 'Real-Time Bidding', description: 'Live auctions with instant bid updates' },
  { icon: DollarSign, title: 'Loan Pre-Approval', description: 'Instant financing with partner banks' }
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    rating: 5,
    text: 'Got my dream BMW at 20% below market price through QuickMela. The inspection report gave me complete confidence.',
    avatar: '/api/placeholder/40/40',
    vehicle: 'BMW X3'
  },
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'The live bidding experience was thrilling! Got instant loan approval and drove home the same day.',
    avatar: '/api/placeholder/40/40',
    vehicle: 'Mercedes C-Class'
  },
  {
    name: 'Vikram Singh',
    location: 'Bangalore',
    rating: 5,
    text: 'As a dealer, QuickMela helped me reach buyers I never could before. Commission rates are fair and transparent.',
    avatar: '/api/placeholder/40/40',
    vehicle: 'Multiple Luxury Cars'
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">QuickMela</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#auctions" className="text-gray-600 hover:text-gray-900">Auctions</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
                <a href="#dealers" className="text-gray-600 hover:text-gray-900">For Dealers</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auctions')}>
                Browse Auctions
              </Button>
              <Button onClick={() => navigate('/dealer-dashboard')}>
                Dealer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className="space-y-8"
            >
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  India's Most
                  <span className="text-blue-600"> Trusted</span>
                  <br />
                  Auto Auction Platform
                </h1>
                <p className="text-xl text-gray-600 mt-6 max-w-lg">
                  Buy verified luxury cars at unbeatable prices. Dealer auctions with 200-point inspections,
                  instant loan approvals, and bank-grade security.
                </p>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2 max-w-md">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by make, model, location..."
                    className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 text-gray-900 placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="px-6" onClick={() => navigate('/auctions')}>
                  Search
                </Button>
              </div>

              {/* Trust Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">10,000+ Verified Auctions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Instant Loan Approvals</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="px-8 py-4 text-lg" onClick={() => navigate('/auctions')}>
                  <Car className="h-5 w-5 mr-2" />
                  Browse Live Auctions
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div
              className="relative"
            >
              <div className="relative">
                <img
                  src="/api/placeholder/600/400"
                  alt="Luxury car auction"
                  className="rounded-lg shadow-2xl"
                />
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="text-sm font-medium">Live Auction</div>
                  <div className="text-xs">23 bidders active</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="text-sm font-medium">BMW X3 2020</div>
                  <div className="text-xs">Current: ₹18.5L</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm mb-4 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Live Auctions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium vehicles from verified dealers. Every car is inspected and comes with warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredAuctions.map((auction, index) => (
              <div
                key={auction.id}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                        LIVE
                      </span>
                      {auction.verified && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded text-sm">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {auction.timeLeft}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {auction.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{auction.location}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        auction.riskGrade === 'A' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Risk Grade {auction.riskGrade}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(auction.currentBid)}
                        </div>
                        <div className="text-sm text-gray-600">{auction.bids} bids</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">EMI from</div>
                        <div className="font-semibold text-green-600">
                          ₹{auction.emi.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => navigate('/live-bidding')}>
                      Join Live Auction
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" onClick={() => navigate('/auctions')}>
              View All Auctions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose QuickMela?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're India's most trusted auto auction platform, combining dealer expertise with fintech innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustIndicators.map((indicator, index) => (
              <div
                key={indicator.title}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <indicator.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {indicator.title}
                </h3>
                <p className="text-gray-600">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Simple, transparent, and secure auto auctions in 4 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Browse & Bid',
                description: 'Explore verified auctions from trusted dealers. Place bids in real-time.',
                icon: Search
              },
              {
                step: '2',
                title: 'Get Approved',
                description: 'Apply for instant loan pre-approval with our partner banks.',
                icon: CheckCircle
              },
              {
                step: '3',
                title: 'Win & Pay',
                description: 'If you win, complete secure payment through our escrow system.',
                icon: Trophy
              },
              {
                step: '4',
                title: 'Drive Home',
                description: 'Vehicle delivered with warranty and full documentation.',
                icon: Car
              }
            ].map((step, index) => (
              <div
                key={step.step}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of buyers and dealers across India.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div
              key={currentTestimonial}
              className="bg-white p-8 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 mb-6 italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonials[currentTestimonial].location} • {testimonials[currentTestimonial].vehicle}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream Car?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join India's largest network of verified dealers and get access to premium vehicles
            at unbeatable prices with instant financing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8" onClick={() => navigate('/auctions')}>
              Start Browsing Auctions
            </Button>
            <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-blue-600">
              Download App
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">QuickMela</span>
              </div>
              <p className="text-gray-400 mb-4">
                India's most trusted auto auction platform, connecting verified dealers with quality-conscious buyers.
              </p>
              <div className="flex gap-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">For Buyers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Auctions</a></li>
                <li><a href="#" className="hover:text-white">Loan Eligibility</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Buyer Protection</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">For Dealers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">List Your Car</a></li>
                <li><a href="#" className="hover:text-white">Dealer Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Commission Rates</a></li>
                <li><a href="#" className="hover:text-white">Marketing Tools</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 QuickMela. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
