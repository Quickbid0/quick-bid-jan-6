import React from 'react';
import { Handshake, Building, Globe, Users, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Partnerships = () => {
  const partnerTypes = [
    {
      icon: <Building className="h-12 w-12 text-blue-500" />,
      title: 'Financial Institutions',
      description: 'Banks, NBFCs, and financial companies for asset recovery',
      benefits: ['Bulk asset liquidation', 'Regulatory compliance', 'Automated processes', 'Real-time reporting']
    },
    {
      icon: <Globe className="h-12 w-12 text-green-500" />,
      title: 'Auction Houses',
      description: 'Traditional auction houses expanding to digital platforms',
      benefits: ['Online presence', 'Live streaming', 'Global reach', 'Digital cataloging']
    },
    {
      icon: <Users className="h-12 w-12 text-purple-500" />,
      title: 'Technology Partners',
      description: 'Tech companies providing complementary services',
      benefits: ['API integration', 'White-label solutions', 'Custom development', 'Technical support']
    }
  ];

  const currentPartners = [
    { name: 'State Bank of India', logo: '🏦', category: 'Banking' },
    { name: 'HDFC Bank', logo: '🏛️', category: 'Banking' },
    { name: 'Sotheby\'s India', logo: '🎨', category: 'Auction House' },
    { name: 'Christie\'s', logo: '🖼️', category: 'Auction House' },
    { name: 'PayU', logo: '💳', category: 'Payment Gateway' },
    { name: 'Razorpay', logo: '💰', category: 'Payment Gateway' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Handshake className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Partner With Us
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Join the QuickBid ecosystem and unlock new opportunities in the digital auction space.
          Together, we can transform how assets are bought and sold.
        </p>
      </div>

      {/* Partnership Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {partnerTypes.map((type, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center"
          >
            <div className="mb-6">{type.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{type.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{type.description}</p>
            <ul className="space-y-2">
              {type.benefits.map((benefit, benefitIndex) => (
                <li key={benefitIndex} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Current Partners */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Partners</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {currentPartners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{partner.logo}</div>
              <h4 className="font-semibold text-sm">{partner.name}</h4>
              <p className="text-xs text-gray-500">{partner.category}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partnership Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Partnership Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Target className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Market Access</h3>
            <p className="text-sm text-gray-600">Access to our growing user base and market reach</p>
          </div>
          <div className="text-center">
            <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Technology Stack</h3>
            <p className="text-sm text-gray-600">Leverage our advanced auction technology platform</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Expert Support</h3>
            <p className="text-sm text-gray-600">Dedicated partnership management and technical support</p>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Global Reach</h3>
            <p className="text-sm text-gray-600">Expand your business to international markets</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner?</h2>
          <p className="text-lg">Let's discuss how we can work together to create value</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Company Name"
                className="px-4 py-3 rounded-lg text-gray-900"
              />
              <input
                type="email"
                placeholder="Business Email"
                className="px-4 py-3 rounded-lg text-gray-900"
              />
            </div>
            <select className="w-full px-4 py-3 rounded-lg text-gray-900">
              <option>Select Partnership Type</option>
              <option>Financial Institution</option>
              <option>Auction House</option>
              <option>Technology Partner</option>
              <option>Other</option>
            </select>
            <textarea
              placeholder="Tell us about your business and partnership goals"
              rows={4}
              className="w-full px-4 py-3 rounded-lg text-gray-900"
            />
            <button
              type="submit"
              className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Submit Partnership Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Partnerships;