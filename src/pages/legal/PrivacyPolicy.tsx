import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const PrivacyPolicy: React.FC = () => {
  usePageSEO({
    title: 'Privacy Policy | QuickMela',
    description: 'Full Privacy Policy describing how QuickMela collects, uses, and protects your data.',
    canonicalPath: '/legal/privacy-policy',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">Legal</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">Privacy Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Learn how your data is collected, used, and protected on QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA  PRIVACY POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This Privacy Policy explains how QuickMela, operated by Tekvoro Technologies, collects, uses, processes, discloses, and protects your information when you use our website, mobile application, and online auction services (Platform).</p>
          <p>By using QuickMela, you confirm that you have read and understood this Privacy Policy and agree to the collection and use of your information as described.</p>

          <h2>1. SCOPE OF THIS POLICY</h2>
          <p>This Privacy Policy applies to:</p>
          <ul>
            <li>Buyers</li>
            <li>Sellers</li>
            <li>Bidders</li>
            <li>Investors</li>
            <li>Visitors</li>
            <li>Logistics partners</li>
            <li>Anyone using QuickMela services</li>
          </ul>
          <p>This policy is part of QuickMelas Terms &amp; Conditions, Auction Rules, and all other policies.</p>

          <h2>2. INFORMATION WE COLLECT</h2>
          <p>We collect information in the following categories:</p>

          <h3>A. Information You Provide Directly</h3>
          <ul>
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Date of Birth</li>
            <li>Gender</li>
            <li>Residential Address / Billing Address</li>
          </ul>
          <p>KYC Documents:</p>
          <ul>
            <li>Aadhaar</li>
            <li>PAN</li>
            <li>Passport</li>
            <li>Driving License</li>
          </ul>
          <ul>
            <li>Bank Account Details (for withdrawals or payouts)</li>
            <li>Product Listings, Descriptions, Photos, Videos</li>
            <li>Feedback, Chats, Support Tickets</li>
            <li>Investor information (if participating in investment plans)</li>
          </ul>

          <h3>B. Automatically Collected Information</h3>
          <p>When you access or use the Platform, we automatically collect:</p>
          <ul>
            <li>IP address</li>
            <li>Device information (model, OS, unique identifiers)</li>
            <li>Browser information</li>
            <li>Location data (when enabled)</li>
            <li>Usage patterns</li>
            <li>Auction behaviour data</li>
            <li>Referring URLs</li>
            <li>Interaction data (clicks, views, pages, bids placed)</li>
            <li>Crash logs</li>
            <li>Cookies, pixels, and tracking data</li>
          </ul>

          <h3>C. Information From Third Parties</h3>
          <p>We may receive details from:</p>
          <ul>
            <li>Payment gateways</li>
            <li>Banks</li>
            <li>KYC providers</li>
            <li>Logistics partners</li>
            <li>Government agencies (when legally required)</li>
            <li>Social login providers (if enabled in future)</li>
          </ul>

          <h2>3. HOW WE USE YOUR INFORMATION</h2>
          <p>Your information is used to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Enable bidding, buying, and selling</li>
            <li>Verify identity (KYC / AML compliance)</li>
            <li>Prevent fraud, shill bidding, and duplicate accounts</li>
            <li>Process payments &amp; withdrawals</li>
            <li>Contact you for bids, alerts, payments, deliveries</li>
            <li>Handle disputes &amp; customer support tickets</li>
            <li>Improve Platform performance &amp; security</li>
            <li>Generate analytics to understand user behaviour</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. LEGAL BASIS FOR DATA PROCESSING (INDIA)</h2>
          <p>Under Indian IT Act 2000 and SPDI Rules, our processing is based on:</p>
          <ul>
            <li>Consent (registration, KYC, bidding)</li>
            <li>Contractual necessity (transactions, auctions)</li>
            <li>Legal obligation (government requests, SARFAESI compliance)</li>
            <li>Legitimate interest (fraud detection, platform improvement)</li>
          </ul>

          <h2>5. SHARING OF INFORMATION</h2>
          <p>We DO NOT sell your information.</p>
          <p>We may share information with:</p>

          <h3>A. Service Providers</h3>
          <ul>
            <li>Payment processors</li>
            <li>KYC verification companies</li>
            <li>SMS/Email/OTP providers</li>
            <li>Hosting/cloud partners</li>
            <li>Fraud detection partners</li>
            <li>Logistics &amp; courier partners</li>
          </ul>

          <h3>B. Sellers &amp; Buyers</h3>
          <p>Only when required for:</p>
          <ul>
            <li>Delivery</li>
            <li>Pickup</li>
            <li>Invoicing</li>
            <li>Communication related to a transaction</li>
          </ul>
          <p>We never disclose your full KYC documents to other users.</p>

          <h3>C. Legal &amp; Government Authorities</h3>
          <p>We may disclose information when:</p>
          <ul>
            <li>Required under law</li>
            <li>Responding to court orders</li>
            <li>Assisting SARFAESI-mandated auctions</li>
            <li>Preventing fraud, crime, or misuse</li>
          </ul>

          <h3>D. Business Transfers</h3>
          <p>If QuickMela is:</p>
          <ul>
            <li>Merged</li>
            <li>Acquired</li>
            <li>Legally transferred</li>
          </ul>
          <p>Your information may be transferred to the new entity.</p>

          <h2>6. DATA RETENTION</h2>
          <p>We retain your data for:</p>
          <ul>
            <li>As long as your account is active</li>
            <li>Minimum periods required by Indian law</li>
            <li>Fraud monitoring &amp; audit trails</li>
            <li>Tax compliance and accounting obligations</li>
          </ul>
          <p>You may request account deletion, but certain data must remain archived for legal reasons.</p>

          <h2>7. DATA SECURITY</h2>
          <p>We use multiple layers of protection:</p>
          <ul>
            <li>HTTPS / TLS encryption</li>
            <li>Secure wallet infrastructure</li>
            <li>Firewalls</li>
            <li>DDoS protection</li>
            <li>AI-based fraud detection</li>
            <li>Access controls &amp; token-based authentication</li>
            <li>Secure encrypted storage for sensitive info</li>
          </ul>
          <p>However, no system is 100% immune to cyber risks.</p>

          <h2>8. USER RIGHTS</h2>
          <p>Depending on law and platform policies, you may request:</p>
          <ul>
            <li>Access to your data</li>
            <li>Correction of inaccurate data</li>
            <li>Account deletion (subject to dues being cleared)</li>
            <li>Withdrawal of consent</li>
            <li>Transaction history</li>
            <li>Data download/export (when implemented)</li>
          </ul>
          <p>Requests can be made via:</p>
          <p>📩 tekvoro@gmail.com</p>
          <p>We may require KYC verification before responding.</p>

          <h2>9. COOKIES &amp; TRACKING TECHNOLOGIES</h2>
          <p>QuickMela uses:</p>
          <ul>
            <li>Cookies</li>
            <li>Session cookies</li>
            <li>Analytics tools</li>
            <li>Device fingerprinting (anti-fraud)</li>
            <li>Auction tracking pixels</li>
          </ul>
          <p>You may disable cookies, but some features (e.g., bidding, login) may stop functioning.</p>

          <h2>10. CHILDRENS PRIVACY</h2>
          <p>QuickMela is for 18+ users only.</p>
          <p>We do not knowingly collect data from minors.</p>
          <p>If a minor registers using false information, the account will be terminated.</p>

          <h2>11. THIRD-PARTY LINKS</h2>
          <p>QuickMela may contain external links.</p>
          <p>We are not responsible for:</p>
          <ul>
            <li>Their content</li>
            <li>Their privacy policies</li>
            <li>Their security practices</li>
          </ul>

          <h2>12. INTERNATIONAL USERS</h2>
          <p>QuickMela primarily serves India.</p>
          <p>If you use it from another country, your data will still be stored and processed in India.</p>

          <h2>13. DATA BREACH PROTOCOL</h2>
          <p>In case of a breach:</p>
          <ul>
            <li>We will notify affected users</li>
            <li>We will report to authorities if required by law</li>
            <li>We will take corrective measures immediately</li>
          </ul>

          <h2>14. CHANGES TO THIS PRIVACY POLICY</h2>
          <p>We may update this policy periodically.</p>
          <p>You will be notified via:</p>
          <ul>
            <li>Email</li>
            <li>App notification</li>
            <li>Website announcement</li>
          </ul>
          <p>Continued use = acceptance of updated policy.</p>

          <h2>15. CONTACT INFORMATION</h2>
          <p>For privacy-related questions or complaints:</p>
          <p>QuickMela  Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          🏢 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana, 500055</p>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicy;
