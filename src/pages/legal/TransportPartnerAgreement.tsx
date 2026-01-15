import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const TransportPartnerAgreement: React.FC = () => {
  usePageSEO({
    title: 'Transport Partner Agreement | QuickMela',
    description:
      'Transport Partner Agreement governing responsibilities, SLAs, safety, payments, and conduct for logistics partners working with QuickMela.',
    canonicalPath: '/legal/transport-partner-agreement',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">
              Legal
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">Transport Partner Agreement</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Transport Partner Agreement
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This Transport Partner Agreement (“Agreement”) governs the responsibilities, obligations, and service standards
          for all logistics, transport, and delivery partners (“Transport Partner”) engaged with QuickMela / Tekvoro
          Technologies Pvt. Ltd. (“Company”). By onboarding as a Transport Partner, you agree to comply with all terms,
          SLAs, operational protocols, and safety standards outlined herein.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Introduction</h2>
        <p>
          This Transport Partner Agreement (“Agreement”) governs the responsibilities, obligations, and service
          standards for all logistics, transport, and delivery partners (“Transport Partner”) engaged with QuickMela /
          Tekvoro Technologies Pvt. Ltd. (“Company”). By onboarding as a Transport Partner, you agree to comply with all
          terms, SLAs, operational protocols, and safety standards outlined herein.
        </p>

        <h2>2. Definitions</h2>
        <p>
          <strong>Company:</strong> Tekvoro Technologies Pvt. Ltd. (QuickMela).
          <br />
          <strong>Transport Partner:</strong> Any individual or organization providing logistics, pickup, or delivery
          services.
          <br />
          <strong>Shipment:</strong> Goods assigned for pickup, transport, or delivery.
          <br />
          <strong>SLA:</strong> Service Level Agreement defining performance metrics.
        </p>

        <h2>3. Partner Eligibility</h2>
        <p>To qualify as a Transport Partner, the applicant must:</p>
        <ul>
          <li>Be legally registered (GST optional for individuals).</li>
          <li>Submit KYC documents (Aadhaar, PAN, driving license).</li>
          <li>Provide vehicle RC, insurance, and fitness certificates.</li>
          <li>Maintain a smartphone with the Company’s app installed.</li>
          <li>Have valid banking details for payouts.</li>
        </ul>

        <h2>4. Scope of Services</h2>
        <p>Transport Partner agrees to:</p>
        <ul>
          <li>Pick up goods from sellers or yard locations.</li>
          <li>Deliver goods safely to buyers or designated hubs.</li>
          <li>Follow scheduled routes and timelines.</li>
          <li>Maintain real-time location tracking.</li>
          <li>Update delivery status and submit proof of delivery (POD).</li>
        </ul>

        <h2>5. Service Level Agreement (SLA)</h2>
        <p>Transport Partners must meet the following minimum SLAs:</p>
        <ul>
          <li>Pickup accuracy: 95%</li>
          <li>On-time delivery: 90%</li>
          <li>POD submission: 100%</li>
          <li>Damage incidents: &lt;2%</li>
          <li>Customer communication: Respond within 10 minutes</li>
        </ul>
        <p>Failure to meet SLAs may result in penalties or suspension.</p>

        <h2>6. Pricing &amp; Payments</h2>
        <p>Payments will be:</p>
        <ul>
          <li>Calculated based on distance, weight, urgency, and category.</li>
          <li>Credited weekly or bi-weekly.</li>
          <li>Subject to deductions for penalties, damages, or fraudulent activities.</li>
        </ul>
        <p>Transport Partners agree not to demand extra cash from users under any circumstances.</p>

        <h2>7. Compliance Requirements</h2>
        <p>Transport Partners must:</p>
        <ul>
          <li>Follow all Road Transport laws of India.</li>
          <li>Ensure vehicles are well-maintained.</li>
          <li>Use PPE when required (helmets, gloves, etc.).</li>
          <li>Follow safety protocols in yards/hubs.</li>
          <li>Allow inspection of vehicles upon request.</li>
        </ul>

        <h2>8. Damage, Loss &amp; Liability</h2>
        <p>Transport Partners are responsible for:</p>
        <ul>
          <li>Goods damaged due to negligence.</li>
          <li>Inventory mismatch.</li>
          <li>Missing items.</li>
          <li>Tampered packaging.</li>
        </ul>
        <p>If damage occurs:</p>
        <ul>
          <li>A damage assessment report will be created.</li>
          <li>Costs may be deducted from payout or insurance claims.</li>
        </ul>

        <h2>9. Insurance Requirements</h2>
        <p>Transport Partners must maintain:</p>
        <ul>
          <li>Valid vehicle insurance.</li>
          <li>Third-party liability coverage.</li>
          <li>Transit insurance where applicable.</li>
        </ul>
        <p>The Company may offer an optional insurance add-on.</p>

        <h2>10. Partner Conduct Rules</h2>
        <p>Transport Partners must not:</p>
        <ul>
          <li>Engage in alcohol/drug use during duty.</li>
          <li>Harass customers or staff.</li>
          <li>Misbehave at yards or pickup points.</li>
          <li>Alter or destroy shipment labels or tags.</li>
          <li>Divert packages without approval.</li>
        </ul>

        <h2>11. Data &amp; App Usage</h2>
        <p>Partners must:</p>
        <ul>
          <li>Keep the app active during duty.</li>
          <li>Not share passwords or OTPs.</li>
          <li>Keep GPS, mobile data, and notifications enabled.</li>
        </ul>
        <p>Device tampering, spoofing, or GPS manipulation leads to termination.</p>

        <h2>12. Confidentiality</h2>
        <p>
          All customer data, routes, pricing, and internal systems are confidential. Sharing any internal information
          results in immediate termination.
        </p>

        <h2>13. Termination</h2>
        <p>The Company may suspend or terminate a partner for:</p>
        <ul>
          <li>Repeated SLA breach</li>
          <li>Fraudulent activity</li>
          <li>Theft</li>
          <li>Safety violations</li>
          <li>Misconduct</li>
          <li>Policy non-compliance</li>
        </ul>
        <p>The Transport Partner may voluntarily exit with 7-day written notice.</p>

        <h2>14. Dispute Resolution</h2>
        <p>Any disputes arising under this Agreement will be resolved through:</p>
        <ul>
          <li>Internal grievance team</li>
          <li>Mediation</li>
          <li>Arbitration (Hyderabad jurisdiction)</li>
        </ul>

        <h2>15. Amendments</h2>
        <p>
          The Company reserves the right to update this policy at any time. Updated versions will be notified through the
          app and website.
        </p>
      </article>
    </div>
  );
};

export default TransportPartnerAgreement;
