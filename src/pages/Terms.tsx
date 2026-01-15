import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Scale, AlertTriangle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <FileText className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Terms & Conditions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Please read these terms carefully before using QuickBid
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Last updated: {new Date().toLocaleDateString()}
          </span>
          <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">|</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800">
              View Privacy Policy
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
            <li><a href="#acceptance" className="text-indigo-600 hover:text-indigo-800">1. Acceptance of Terms</a></li>
            <li><a href="#accounts" className="text-indigo-600 hover:text-indigo-800">2. User Accounts</a></li>
            <li><a href="#auction-rules" className="text-indigo-600 hover:text-indigo-800">3. Auction Rules</a></li>
            <li><a href="#payment-terms" className="text-indigo-600 hover:text-indigo-800">4. Payment Terms</a></li>
            <li><a href="#privacy-security" className="text-indigo-600 hover:text-indigo-800">5. Privacy & Security</a></li>
            <li><a href="#prohibited" className="text-indigo-600 hover:text-indigo-800">6. Prohibited Activities</a></li>
            <li><a href="#liability" className="text-indigo-600 hover:text-indigo-800">7. Limitation of Liability</a></li>
            <li><a href="#ip-ownership" className="text-indigo-600 hover:text-indigo-800">10. Intellectual Property & Ownership</a></li>
            <li><a href="#modifications" className="text-indigo-600 hover:text-indigo-800">11. Modifications to Terms</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:text-indigo-800">12. Contact Information</a></li>
          </ul>
        </div>

        <section>
          <h2 id="acceptance" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Scale className="h-6 w-6 mr-2 text-indigo-600" />
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing and using QuickBid, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 id="accounts" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. User Accounts
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Users must provide accurate and complete information during registration</li>
            <li>Users are responsible for maintaining the confidentiality of their account credentials</li>
            <li>Users must be at least 18 years old to create an account</li>
            <li>One account per person is allowed</li>
          </ul>
        </section>

        <section>
          <h2 id="auction-rules" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. Auction Rules
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bidding</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>All bids are binding and cannot be retracted</li>
                <li>Bidders must have sufficient funds in their wallet</li>
                <li>The highest bidder at auction close wins the item</li>
                <li>Reserve prices may apply to certain items</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Selling</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Sellers must provide accurate item descriptions</li>
                <li>All items must be legally owned by the seller</li>
                <li>Prohibited items cannot be listed</li>
                <li>Commission fees apply to successful sales</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 id="payment-terms" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Payment Terms
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Payment must be completed within 7 days of auction end</li>
            <li>All transactions are processed through secure payment gateways</li>
            <li>Refunds are subject to our refund policy</li>
            <li>Platform fees are non-refundable</li>
          </ul>
        </section>

        <section>
          <h2 id="privacy-security" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-indigo-600" />
            5. Privacy & Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We are committed to protecting your privacy. Please review our Privacy Policy to understand 
            how we collect, use, and protect your information. We implement industry-standard security 
            measures to protect your data and transactions.
          </p>
        </section>

        <section>
          <h2 id="prohibited" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Prohibited Activities
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Fraudulent bidding or shill bidding</li>
            <li>Listing stolen or illegal items</li>
            <li>Manipulating auction outcomes</li>
            <li>Creating multiple accounts</li>
            <li>Harassment of other users</li>
          </ul>
        </section>

        <section>
          <h2 id="liability" className="text-2xl font-semibent text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-yellow-600" />
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            QuickBid acts as a platform connecting buyers and sellers. We are not responsible for the 
            quality, safety, or legality of items listed, the truth or accuracy of listings, or the 
            ability of sellers to sell items or buyers to pay for items.
          </p>
        </section>

        <section>
          <h2 id="ip-ownership" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            10. Intellectual Property & Ownership
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              The QuickBid platform, including but not limited to its software, design, UI/UX, branding, content,
              features, and all associated intellectual property, is the exclusive property of
              <strong> Tekvoro Technologies Pvt Ltd</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Unauthorized copying, reproduction, distribution, modification, or reverse engineering is strictly prohibited.</li>
              <li>All trademarks, logos, and service marks displayed are the property of their respective owners.</li>
              <li>Use of the platform does not transfer any ownership rights to users or third parties.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 id="modifications" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            11. Modifications to Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            QuickBid reserves the right to modify these terms at any time. Users will be notified of 
            significant changes via email or platform notifications. Continued use of the service 
            constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h2 id="contact" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            12. Contact Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            For questions about these Terms & Conditions, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-900 dark:text-white">
              <strong>Email:</strong> legal@quickbid.com<br />
              <strong>Phone:</strong> +1 (555) 123-4567<br />
              <strong>Address:</strong> 123 Legal Street, Business City, BC 12345
            </p>
          </div>
        </section>

        <div className="border-t pt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="mt-4 space-x-4">
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
    </div>
  );
};

export default Terms;