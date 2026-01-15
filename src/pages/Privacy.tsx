import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Database, Globe, UserCheck } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your privacy is important to us. Learn how we protect your data.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Last updated: {new Date().toLocaleDateString()}
          </span>
          <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">|</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-800">
              View Terms & Conditions
            </Link>
            <Link to="/contactus" className="text-indigo-600 hover:text-indigo-800">
              Contact support
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            On this page
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
            <li><a href="#information" className="text-indigo-600 hover:text-indigo-800">1. Information We Collect</a></li>
            <li><a href="#use" className="text-indigo-600 hover:text-indigo-800">2. How We Use Your Information</a></li>
            <li><a href="#sharing" className="text-indigo-600 hover:text-indigo-800">3. Information Sharing</a></li>
            <li><a href="#security" className="text-indigo-600 hover:text-indigo-800">4. Data Security</a></li>
            <li><a href="#rights" className="text-indigo-600 hover:text-indigo-800">5. Your Rights</a></li>
            <li><a href="#cookies" className="text-indigo-600 hover:text-indigo-800">6. Cookies and Tracking</a></li>
            <li><a href="#ownership" className="text-indigo-600 hover:text-indigo-800">11. Ownership & Restrictions</a></li>
            <li><a href="#retention" className="text-indigo-600 hover:text-indigo-800">12. Data Retention</a></li>
            <li><a href="#transfers" className="text-indigo-600 hover:text-indigo-800">13. International Transfers</a></li>
            <li><a href="#children" className="text-indigo-600 hover:text-indigo-800">14. Children's Privacy</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:text-indigo-800">15. Contact Us</a></li>
          </ul>
        </div>

        <section>
          <h2 id="information" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="h-6 w-6 mr-2 text-indigo-600" />
            1. Information We Collect
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Government-issued ID for verification</li>
                <li>Payment information (processed securely)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Bidding history and preferences</li>
                <li>Search queries and browsing behavior</li>
                <li>Device information and IP addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 id="use" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Database className="h-6 w-6 mr-2 text-indigo-600" />
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>To provide and improve our auction services</li>
            <li>To process transactions and payments</li>
            <li>To verify user identity and prevent fraud</li>
            <li>To send important notifications about auctions</li>
            <li>To personalize your experience with AI recommendations</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 id="sharing" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="h-6 w-6 mr-2 text-indigo-600" />
            3. Information Sharing
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            We do not sell your personal information. We may share information in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>With payment processors to complete transactions</li>
            <li>With shipping partners for delivery services</li>
            <li>With law enforcement when legally required</li>
            <li>With service providers who assist our operations</li>
            <li>In case of business merger or acquisition</li>
          </ul>
        </section>

        <section>
          <h2 id="security" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lock className="h-6 w-6 mr-2 text-indigo-600" />
            4. Data Security
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>SSL encryption for all data transmission</li>
              <li>Secure data centers with 24/7 monitoring</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication options</li>
              <li>Employee access controls and training</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 id="rights" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserCheck className="h-6 w-6 mr-2 text-indigo-600" />
            5. Your Rights
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Access and review your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of marketing communications</li>
            <li>Restrict certain data processing activities</li>
          </ul>
        </section>

        <section>
          <h2 id="cookies" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Cookies and Tracking
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Essential Cookies</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Required for basic site functionality and security
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analytics Cookies</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Help us understand how users interact with our platform
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 id="ownership" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            11. Ownership & Restrictions
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              The QuickBid platform and its related services are proprietary to <strong>Tekvoro Technologies Pvt Ltd</strong>.
              All software, content, design, and materials are protected by applicable intellectual property laws.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Unauthorized copying, reproduction, distribution, or reverse engineering is strictly prohibited.</li>
              <li>Use of the platform does not grant any ownership rights to users or third parties.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 id="retention" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            12. Data Retention
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We retain your information for as long as necessary to provide our services and comply with 
            legal obligations. Account information is typically retained for 7 years after account closure 
            for legal and regulatory compliance.
          </p>
        </section>

        <section>
          <h2 id="transfers" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            13. International Transfers
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data during international transfers.
          </p>
        </section>

        <section>
          <h2 id="children" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            14. Children's Privacy
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our services are not intended for children under 18. We do not knowingly collect personal 
            information from children. If we become aware of such collection, we will delete the 
            information immediately.
          </p>
        </section>

        <section>
          <h2 id="contact" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            15. Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            For privacy-related questions or to exercise your rights, contact us:
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-900 dark:text-white">
              <strong>Privacy Officer:</strong> privacy@quickbid.com<br />
              <strong>Phone:</strong> +1 (555) 123-4567<br />
              <strong>Mail:</strong> QuickBid Privacy Team<br />
              123 Privacy Street, Data City, DC 12345
            </p>
          </div>
        </section>

        <div className="border-t pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="mt-4 space-x-4">
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">
              Terms & Conditions
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
    </div>
  );
};

export default Privacy;