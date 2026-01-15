import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Users,
  FileText,
  Phone,
  Mail,
  Globe,
  Award,
  Zap,
  Star,
  Camera,
  CreditCard,
  UserCheck,
  Building,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

const TrustSafety = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const safetyFeatures = [
    {
      icon: <Shield className="h-12 w-12 text-green-500" />,
      title: 'Identity Verification',
      description: 'All users verify with government ID and phone number',
      details: ['Aadhaar verification', 'PAN card validation', 'Phone OTP verification', 'Address confirmation'],
      stats: '99.8% verified users'
    },
    {
      icon: <Lock className="h-12 w-12 text-blue-500" />,
      title: 'Secure Payments',
      description: 'Bank-level encryption and secure payment processing',
      details: ['256-bit SSL encryption', 'PCI DSS compliance', 'Escrow protection', 'Fraud monitoring'],
      stats: '₹100Cr+ processed securely'
    },
    {
      icon: <Eye className="h-12 w-12 text-purple-500" />,
      title: 'Product Authentication',
      description: 'AI-powered authenticity checks and expert verification',
      details: ['AI image analysis', 'Expert authentication', 'Document verification', 'Provenance tracking'],
      stats: '95% authenticity rate'
    },
    {
      icon: <Users className="h-12 w-12 text-orange-500" />,
      title: 'Community Trust',
      description: 'Rating system and community-driven safety',
      details: ['Seller ratings', 'Buyer feedback', 'Community reporting', 'Dispute resolution'],
      stats: '4.8/5 average rating'
    }
  ];

  const trustMetrics = [
    { label: 'Verified Users', value: '99.8%', icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
    { label: 'Successful Transactions', value: '98.5%', icon: <Award className="h-6 w-6 text-blue-500" /> },
    { label: 'Fraud Prevention', value: '99.9%', icon: <Shield className="h-6 w-6 text-purple-500" /> },
    { label: 'User Satisfaction', value: '4.9/5', icon: <Star className="h-6 w-6 text-yellow-500" /> }
  ];

  const safetyTips = [
    {
      title: 'Verify Before You Buy',
      tips: [
        'Check seller verification status',
        'Read product descriptions carefully',
        'Review seller ratings and feedback',
        'Ask questions before bidding'
      ]
    },
    {
      title: 'Secure Bidding Practices',
      tips: [
        'Set a maximum bid limit',
        'Understand auction terms',
        'Keep payment information secure',
        'Use platform messaging only'
      ]
    },
    {
      title: 'Red Flags to Watch',
      tips: [
        'Unverified sellers',
        'Prices too good to be true',
        'Requests for off-platform payment',
        'Poor quality images or descriptions'
      ]
    }
  ];

  const securityMeasures = [
    {
      category: 'Data Protection',
      measures: [
        'End-to-end encryption for all sensitive data',
        'Regular security audits and penetration testing',
        'GDPR and data privacy compliance',
        'Secure data centers with 24/7 monitoring'
      ]
    },
    {
      category: 'Financial Security',
      measures: [
        'PCI DSS Level 1 compliance',
        'Multi-factor authentication for payments',
        'Real-time fraud detection algorithms',
        'Secure escrow services for high-value items'
      ]
    },
    {
      category: 'Platform Security',
      measures: [
        'AI-powered content moderation',
        'Automated suspicious activity detection',
        'Regular system updates and patches',
        'Incident response team available 24/7'
      ]
    }
  ];

  const verificationProcess = [
    {
      step: 1,
      title: 'Account Creation',
      description: 'Sign up with email and phone verification',
      icon: <Mail className="h-6 w-6" />
    },
    {
      step: 2,
      title: 'Identity Verification',
      description: 'Upload government ID and complete KYC process',
      icon: <FileText className="h-6 w-6" />
    },
    {
      step: 3,
      title: 'Address Verification',
      description: 'Confirm your address with utility bills or bank statements',
      icon: <Building className="h-6 w-6" />
    },
    {
      step: 4,
      title: 'Final Approval',
      description: 'Manual review and account activation',
      icon: <UserCheck className="h-6 w-6" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Trust & Safety
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          QuickMela is built for serious buyers, sellers and bank partners who need a safe, transparent and
          compliant auction experience. Every auction is backed by strict KYC and fraud checks, secure payments
          and escrow, strong data protection and clear rules for behaviour, disputes and cross-border trade.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'verification', label: 'Verification' },
            { id: 'security', label: 'Security' },
            { id: 'tips', label: 'Safety Tips' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Trust Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {trustMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
              >
                <div className="mb-4">{metric.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-500">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Safety Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {feature.description}
                </p>
                <div className="mb-4">
                  <div className="text-sm font-medium text-indigo-600 mb-2">{feature.stats}</div>
                </div>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Verification Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {verificationProcess.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-xl mb-4 inline-block">
                    {step.icon}
                  </div>
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          {securityMeasures.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.measures.map((measure, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{measure}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Safety Tips for Secure Trading
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {safetyTips.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Link to full Legal Center */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          Want to read the full legal and compliance framework behind these protections?
        </p>
        <Link
          to="/legal"
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
        >
          View Legal, Compliance &amp; Trust Center
          <span className="ml-1" aria-hidden="true">
            e
          </span>
        </Link>
      </div>

      {/* Report Issues */}
      <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Report Safety Issues
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            If you encounter any suspicious activity or safety concerns, report them immediately.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
              Report Issue
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Security Certifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-3 inline-block">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm">ISO 27001</h3>
            <p className="text-xs text-gray-500">Information Security</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-3 inline-block">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm">PCI DSS</h3>
            <p className="text-xs text-gray-500">Payment Security</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-3 inline-block">
              <Scale className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm">SOC 2</h3>
            <p className="text-xs text-gray-500">Compliance</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl mb-3 inline-block">
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-sm">GDPR</h3>
            <p className="text-xs text-gray-500">Privacy Protection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;