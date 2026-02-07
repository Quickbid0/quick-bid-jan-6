import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Gavel, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Quick Mela</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Your trusted platform for online bidding and auctions.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary-500">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/advanced-search" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link to="/business-solutions" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Business Solutions
                </Link>
              </li>
              <li>
                <Link to="/marketing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Marketing Services
                </Link>
              </li>
              <li>
                <Link to="/sales" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Sales Support
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Launch Campaigns
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/mobile-app" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/partnerships" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link to="/investors" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Investor Pitch
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/security-center" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Security Center
                </Link>
              </li>
              <li>
                <Link to="/grievance-officer" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Grievance Officer
                </Link>
              </li>
              <li>
                <Link to="/market-analytics" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Market Analytics
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/grievance" className="text-gray-600 dark:text-gray-300 hover:text-primary-600">
                  Grievance Officer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;