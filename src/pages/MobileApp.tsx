import React from 'react';
import { Smartphone, Download, Star, Shield, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileApp = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Lightning Fast Bidding',
      description: 'Place bids in milliseconds with our optimized mobile interface'
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: 'Secure Transactions',
      description: 'Bank-level security with biometric authentication'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Live Auction Rooms',
      description: 'Join live auctions with real-time chat and bidding'
    }
  ];

  const screenshots = [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=300&q=80'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Smartphone className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          QuickBid Mobile App
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Take the auction experience with you. Bid from anywhere, anytime with our 
          lightning-fast mobile application.
        </p>
      </div>

      {/* App Store Buttons */}
      <div className="flex justify-center gap-6 mb-16">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-gray-800"
        >
          <Download className="h-6 w-6" />
          <div className="text-left">
            <div className="text-xs">Download on the</div>
            <div className="text-lg font-semibold">App Store</div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-gray-800"
        >
          <Download className="h-6 w-6" />
          <div className="text-left">
            <div className="text-xs">Get it on</div>
            <div className="text-lg font-semibold">Google Play</div>
          </div>
        </motion.button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Screenshots */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">App Screenshots</h2>
        <div className="flex justify-center gap-6 overflow-x-auto">
          {screenshots.map((screenshot, index) => (
            <motion.img
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              src={screenshot}
              alt={`Screenshot ${index + 1}`}
              className="w-64 h-auto rounded-2xl shadow-xl"
            />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Rajesh Kumar', rating: 5, review: 'Best auction app! Won amazing deals on vintage items.' },
            { name: 'Priya Sharma', rating: 5, review: 'Love the live streaming feature. So engaging!' },
            { name: 'Amit Patel', rating: 5, review: 'Secure payments and fast delivery. Highly recommended!' }
          ].map((review, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-xl">
              <div className="flex items-center mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3">"{review.review}"</p>
              <p className="font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileApp;