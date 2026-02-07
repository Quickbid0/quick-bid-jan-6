import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Wallet, CheckCircle, Truck, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const features = [
    {
      icon: <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />,
      title: 'Verified Vehicles',
      desc: 'All vehicles undergo 147-point inspection. Complete documentation and service history provided.',
    },
    {
      icon: <Wallet className="h-12 w-12 text-green-600 mx-auto mb-4" />,
      title: 'Secure Payments',
      desc: 'Escrow protection for all transactions. Money released only after successful delivery.',
    },
    {
      icon: <Truck className="h-12 w-12 text-orange-600 mx-auto mb-4" />,
      title: 'Pan India Delivery',
      desc: 'Free delivery to 20,000+ pin codes. Doorstep inspection and document handover.',
    },
  ];

  const bannerSlogans = [
    'Buy Better. Sell Smarter on QuickMela.',
    'Best Deals Every Day on QuickMela.',
    'Sell Your Vehicle in Minutes with QuickMela.',
  ];

  return (
    <div className="flex flex-col min-h-screen font-inter bg-white dark:bg-gray-900 transition-all">
      
      {/* Hero Section - Cars24/Spinny inspired */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                India's Most Trusted
                <br />
                <span className="text-yellow-300">Vehicle Auction Platform</span>
              </h1>
              <p className="mt-6 text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
                Bank-seized cars, pre-owned vehicles & exclusive auctions
                <br />
                <span className="text-yellow-300 font-semibold">147-point inspection</span> on every vehicle
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/buyer/auctions"
                className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Browse Auctions
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Start Selling
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-300" />
                <span>100% Verified Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-300" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-yellow-300" />
                <span>Pan India Delivery</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why QuickMela is Trusted by Thousands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
                <div className="font-semibold text-gray-900 dark:text-white mt-4">{feature.title}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600">50,000+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Verified Vehicles</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-green-600">₹100Cr+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Transactions Processed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-orange-600">20,000+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Happy Customers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-purple-600">4.9/5</div>
              <div className="text-gray-600 dark:text-gray-400 mt-2">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Start Your Auction Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Register Now
            </Link>
            <Link
              to="/buyer/auctions"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;