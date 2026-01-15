import React from 'react';
import { 
  Building, 
  Truck, 
  Factory, 
  Briefcase,
  TrendingUp,
  Shield,
  Globe,
  Users,
  BarChart3,
  Zap,
  Award,
  CheckCircle,
  DollarSign,
  Clock,
  Target,
  Lightbulb,
  Phone,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BusinessSolutions = () => {
  const navigate = useNavigate();
  
  const handleIndustryClick = (industryName: string) => {
    switch (industryName) {
      case 'Banking & Finance':
        navigate('/catalog?category=vehicles&filter=seized');
        toast.success('Exploring Banking & Finance solutions');
        break;
      case 'Automotive':
        navigate('/catalog?category=vehicles');
        toast.success('Exploring Automotive solutions');
        break;
      case 'Manufacturing':
        navigate('/catalog?category=industrial');
        toast.success('Exploring Manufacturing equipment');
        break;
      case 'Government':
        navigate('/tender-auction');
        toast.success('Exploring Government tenders');
        break;
      default:
        navigate('/catalog');
    }
  };

  const handleLearnMore = (solutionType: string) => {
    switch (solutionType) {
      case 'Asset Recovery & Liquidation':
        navigate('/catalog?category=vehicles&filter=seized');
        toast.success('Navigating to Asset Recovery solutions');
        break;
      case 'Vehicle Auction Platform':
        navigate('/catalog?category=vehicles');
        toast.success('Navigating to Vehicle Auction Platform');
        break;
      case 'Industrial Equipment Exchange':
        navigate('/catalog?category=industrial');
        toast.success('Navigating to Industrial Equipment');
        break;
      case 'Government Tender Platform':
        navigate('/tender-auction');
        toast.success('Navigating to Government Tender Platform');
        break;
      default:
        navigate('/catalog');
        toast.success('Navigating to all solutions');
    }
  };
  const handleScheduleDemo = () => {
    navigate('/contactus?subject=business-demo');
    toast.success('Redirecting to schedule a demo');
  };
    const solutions = [
    {
      icon: <Building className="h-12 w-12 text-blue-500" />,
      title: 'Asset Recovery & Liquidation',
      description: 'Complete solution for banks and NBFCs to recover and liquidate seized assets',
      features: [
        'Bulk asset uploads via Excel/CSV',
        'Automated valuation and pricing',
        'Regulatory compliance tracking',
        'Real-time auction management',
        'Detailed reporting and analytics'
      ],
      clients: ['State Bank of India', 'HDFC Bank', 'ICICI Bank'],
      color: 'bg-blue-500',
      stats: { recovery: '40%', time: '60%', volume: '₹500Cr+' }
    },
    {
      icon: <Truck className="h-12 w-12 text-green-500" />,
      title: 'Vehicle Auction Platform',
      description: 'Specialized platform for automotive dealers and fleet operators',
      features: [
        'Vehicle inspection reports',
        'Document verification system',
        'Live streaming capabilities',
        'Mobile bidding app',
        'Logistics coordination'
      ],
      clients: ['Maruti Suzuki', 'Mahindra Finance', 'Bajaj Auto'],
      color: 'bg-green-500',
      stats: { vehicles: '10K+', dealers: '500+', satisfaction: '98%' }
    },
    {
      icon: <Factory className="h-12 w-12 text-purple-500" />,
      title: 'Industrial Equipment Exchange',
      description: 'B2B marketplace for heavy machinery and industrial equipment',
      features: [
        'Technical specification matching',
        'Condition assessment tools',
        'Warranty and service tracking',
        'Bulk procurement support',
        'International shipping'
      ],
      clients: ['Tata Steel', 'L&T', 'Godrej'],
      color: 'bg-purple-500',
      stats: { equipment: '5K+', manufacturers: '200+', value: '₹1000Cr+' }
    },
    {
      icon: <Briefcase className="h-12 w-12 text-orange-500" />,
      title: 'Government Tender Platform',
      description: 'Secure tender management system for government procurement',
      features: [
        'Sealed bid submissions',
        'Compliance verification',
        'Transparent bid opening',
        'Audit trail maintenance',
        'Multi-level approvals'
      ],
      clients: ['Ministry of Railways', 'NHAI', 'State Governments'],
      color: 'bg-orange-500',
      stats: { tenders: '1K+', agencies: '50+', transparency: '100%' }
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: 'Increased Recovery Rates',
      description: 'Up to 40% higher recovery rates compared to traditional methods',
      metric: '40% Higher Recovery'
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: 'Faster Liquidation',
      description: 'Reduce asset holding time by 60% with our efficient platform',
      metric: '60% Faster Process'
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: 'Regulatory Compliance',
      description: 'Built-in compliance with RBI, SARFAESI, and other regulations',
      metric: '100% Compliant'
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: 'National Reach',
      description: 'Access to buyers across India with multi-language support',
      metric: '28 States Coverage'
    }
  ];

  const caseStudies = [
    {
      client: 'State Bank of India',
      logo: '🏦',
      challenge: 'Liquidate 500+ seized vehicles efficiently',
      solution: 'Implemented bulk upload system with live streaming auctions',
      result: '35% higher recovery rate, 50% faster liquidation',
      value: '₹250 Cr assets liquidated',
      timeline: '6 months'
    },
    {
      client: 'HDFC Bank',
      logo: '🏛️',
      challenge: 'Streamline asset recovery process',
      solution: 'Custom dashboard with automated workflows',
      result: '₹250 Cr assets liquidated in 6 months',
      value: '₹180 Cr recovered',
      timeline: '4 months'
    },
    {
      client: 'Mahindra Finance',
      logo: '🚗',
      challenge: 'Expand buyer network for vehicle auctions',
      solution: 'Mobile app and digital marketing integration',
      result: '300% increase in registered bidders',
      value: '₹120 Cr transactions',
      timeline: '3 months'
    }
  ];

  const industries = [
    {
      name: 'Banking & Finance',
      description: 'Asset recovery and liquidation for banks and NBFCs',
      companies: 25,
      volume: '₹500Cr+',
      icon: '🏦'
    },
    {
      name: 'Automotive',
      description: 'Vehicle auctions and fleet management',
      companies: 15,
      volume: '₹200Cr+',
      icon: '🚗'
    },
    {
      name: 'Manufacturing',
      description: 'Industrial equipment and machinery trading',
      companies: 30,
      volume: '₹300Cr+',
      icon: '🏭'
    },
    {
      name: 'Government',
      description: 'Public sector procurement and asset disposal',
      companies: 12,
      volume: '₹150Cr+',
      icon: '🏛️'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Building className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Business Solutions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Enterprise-grade auction solutions for banks, NBFCs, government agencies, 
          and large corporations. Streamline your asset liquidation process.
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">₹1000Cr+</div>
          <div className="text-sm text-gray-500">Assets Liquidated</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">100+</div>
          <div className="text-sm text-gray-500">Enterprise Clients</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">60%</div>
          <div className="text-sm text-gray-500">Faster Processing</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">98.5%</div>
          <div className="text-sm text-gray-500">Success Rate</div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {solutions.map((solution, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <div className="mb-6">{solution.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {solution.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {solution.description}
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(solution.stats).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-bold text-lg">{value}</div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Trusted by:</h4>
              <div className="flex flex-wrap gap-2">
                {solution.clients.map((client, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {client}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleLearnMore(solution.title)}
              className={`w-full ${solution.color} text-white py-3 rounded-lg hover:opacity-90 font-semibold flex items-center justify-center gap-2`}
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Industry Coverage */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Industry Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleIndustryClick(industry.name)}
            >
              <div className="text-4xl mb-4">{industry.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{industry.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{industry.description}</p>
              <div className="space-y-1">
                <div className="text-sm font-medium">{industry.companies} Companies</div>
                <div className="text-sm text-green-600">{industry.volume} Volume</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose QuickBid for Business?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{benefit.description}</p>
              <div className="text-lg font-bold text-indigo-600">{benefit.metric}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
        <div className="space-y-6">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{study.logo}</div>
                  <h3 className="font-bold text-lg text-indigo-600">{study.client}</h3>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Challenge</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{study.challenge}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Solution</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{study.solution}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Result</h4>
                  <p className="text-sm text-green-600 font-medium">{study.result}</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{study.value}</div>
                  <div className="text-sm text-gray-500">in {study.timeline}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Powered by Advanced Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">AI & Machine Learning</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Smart recommendations, fraud detection, and price optimization
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Blockchain Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Immutable transaction records and smart contracts
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Cloud Infrastructure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Scalable, secure, and globally distributed platform
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl mb-4 inline-block">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time insights and predictive analytics
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg mb-8">
            Join leading financial institutions and corporations using QuickBid for asset liquidation.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/company/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Building className="h-5 w-5" />
              Get Started
            </Link>
            <button 
              onClick={handleScheduleDemo}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Schedule Demo
            </button>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm">Enterprise Support</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm">Platform Uptime</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">30 Days</div>
              <div className="text-sm">Implementation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSolutions;