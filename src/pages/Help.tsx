import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Users,
  Shield,
  CreditCard,
  Truck,
  Package
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book className="h-6 w-6" />,
      color: 'bg-blue-500',
      articles: [
        { title: 'How to create an account', link: '#' },
        { title: 'Verifying your identity', link: '#' },
        { title: 'Setting up your profile', link: '#' },
        { title: 'Understanding user roles', link: '#' }
      ]
    },
    {
      id: 'bidding',
      title: 'Bidding & Auctions',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-500',
      articles: [
        { title: 'How to place a bid', link: '#' },
        { title: 'Understanding auction types', link: '#' },
        { title: 'Live auction participation', link: '#' },
        { title: 'Tender auction process', link: '#' },
        { title: 'Winning an auction', link: '#' }
      ]
    },
    {
      id: 'selling',
      title: 'Selling Items',
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500',
      articles: [
        { title: 'Listing your first item', link: '#' },
        { title: 'Product photography tips', link: '#' },
        { title: 'Setting reserve prices', link: '#' },
        { title: 'Managing your listings', link: '#' },
        { title: 'Bulk upload for companies', link: '#' }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Wallet',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-yellow-500',
      articles: [
        { title: 'Adding money to wallet', link: '#' },
        { title: 'Payment methods accepted', link: '#' },
        { title: 'Understanding fees', link: '#' },
        { title: 'Refund policy', link: '#' },
        { title: 'Security deposits', link: '#' }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <Truck className="h-6 w-6" />,
      color: 'bg-orange-500',
      articles: [
        { title: 'Shipping options', link: '#' },
        { title: 'Tracking your order', link: '#' },
        { title: 'Delivery timeframes', link: '#' },
        { title: 'International shipping', link: '#' },
        { title: 'Damaged items policy', link: '#' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Trust',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-red-500',
      articles: [
        { title: 'Account security tips', link: '#' },
        { title: 'Reporting suspicious activity', link: '#' },
        { title: 'Verification process', link: '#' },
        { title: 'Dispute resolution', link: '#' },
        { title: 'Privacy settings', link: '#' }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: <MessageCircle className="h-8 w-8" />,
      action: 'Start Chat',
      color: 'bg-blue-600'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: <Video className="h-8 w-8" />,
      action: 'Watch Videos',
      color: 'bg-purple-600'
    },
    {
      title: 'Contact Support',
      description: 'Email us your questions',
      icon: <Mail className="h-8 w-8" />,
      action: 'Send Email',
      color: 'bg-green-600'
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      icon: <Phone className="h-8 w-8" />,
      action: 'Call Now',
      color: 'bg-orange-600'
    }
  ];

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.articles.some(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <HelpCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Help Center
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Find answers to your questions and get the help you need
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`${action.color} text-white p-3 rounded-lg inline-block mb-4`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {action.description}
            </p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
              {action.action}
            </button>
          </div>
        ))}
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
              className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${category.color} text-white p-2 rounded-lg mr-4`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedCategory === category.id && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {category.articles.map((article, index) => (
                    <a
                      key={index}
                      href={article.link}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                          {article.title}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our support team is available 24/7 to assist you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Email Support</h3>
              <p className="text-gray-600 dark:text-gray-300">support@quickbid.com</p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Phone Support</h3>
              <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Chat</h3>
              <p className="text-gray-600 dark:text-gray-300">Available 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center">
        <div className="space-x-6">
          <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">
            Terms & Conditions
          </Link>
          <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700">
            Privacy Policy
          </Link>
          <Link to="/contactus" className="text-indigo-600 hover:text-indigo-700">
            Contact Us
          </Link>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;