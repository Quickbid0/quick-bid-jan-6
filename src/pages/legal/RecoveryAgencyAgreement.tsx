import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const RecoveryAgencyAgreement: React.FC = () => {
  usePageSEO({
    title: 'Recovery Agency Agreement | QuickMela',
    description: 'Full Recovery Agency Agreement for repossession vendors, field agents, and recovery contractors working with QuickMela.',
    canonicalPath: '/legal/recovery-agency-agreement',
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
          <li className="text-gray-700 dark:text-gray-200">Recovery Agency Agreement</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Recovery Agency Agreement
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Agreement terms for repossession vendors, field agents, and recovery contractors working with QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p>✅ 1. FULL RECOVERY AGENCY AGREEMENT</p>
          <p>(For Repossession Vendors, Field Agents, Recovery Contractors)</p>

          <h2>RECOVERY AGENCY AGREEMENT</h2>
          <p>Between QuickMela (Tekvoro Technologies)<br />
          AND<br />
          ________________________ (Recovery Agency)</p>
          <p>Agreement ID: QM-REC-______________<br />
          Effective Date: ______________________</p>

          <h2>1. PARTIES</h2>
          <h3>1.1 QuickMela (Tekvoro Technologies)</h3>
          <p>Registered Address:<br />
          5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana – 500055<br />
          Email: tekvoro@gmail.com<br />
          Phone: +91 9121331813</p>
          <p>Hereinafter referred to as “QuickMela”, “Company”, or “First Party”.</p>

          <h3>1.2 Recovery Agency</h3>
          <p>Agency Name: ________________________<br />
          Authorized Person: ____________________<br />
          Address: _____________________________<br />
          Phone/Email: __________________________</p>
          <p>Hereinafter referred to as “Recovery Agency”, “Vendor”, “Contractor”, or “Second Party”.</p>

          <h2>2. PURPOSE OF AGREEMENT</h2>
          <p>QuickMela engages the Recovery Agency to:</p>
          <ul>
            <li>Retrieve seized vehicles</li>
            <li>Perform field recovery</li>
            <li>Secure, store, and deliver repossessed assets</li>
            <li>Assist Banks/NBFCs in asset retrieval</li>
            <li>Provide inspection and condition reports</li>
            <li>Support post-auction buyer coordination</li>
          </ul>

          <h2>3. SCOPE OF WORK</h2>
          <p>Recovery Agency will handle:</p>
          <ul>
            <li>✔ Field repossession</li>
            <li>✔ Soft recovery (communication-based)</li>
            <li>✔ Hard recovery (physical repossession)</li>
            <li>✔ Condition reporting</li>
            <li>✔ Yard storage</li>
            <li>✔ Vehicle handover to buyers</li>
            <li>✔ Documentation handling</li>
            <li>✔ Photographs/videos</li>
            <li>✔ Key and RC collection (if available)</li>
            <li>✔ Coordination with local police (if required)</li>
            <li>✔ Ensuring safe and non-violent recovery methods</li>
          </ul>

          <h2>4. LEGAL COMPLIANCE</h2>
          <p>Recovery Agency must comply with:</p>
          <ul>
            <li>Indian Penal Code</li>
            <li>SARFAESI Act, 2002</li>
            <li>Motor Vehicles Act</li>
            <li>IT Act, 2000</li>
            <li>State police rules</li>
            <li>RBI/NBFC recovery guidelines</li>
          </ul>
          <p>Usage of force, intimidation, or harassment is strictly prohibited.</p>

          <h2>5. FEES &amp; PAYMENT STRUCTURE</h2>
          <p>QuickMela will pay as follows:</p>
          <p>Service<br />
          Fee<br />
          Notes</p>
          <p>Standard Vehicle Recovery<br />
          ₹_______<br />
          Per case</p>
          <p>High-Risk Recovery<br />
          ₹_______<br />
          Based on difficulty</p>
          <p>Yard Storage<br />
          ₹_______<br />
          Per day</p>
          <p>Documentation Pickup<br />
          ₹_______<br />
          Per case</p>
          <p>Delivery to Buyer<br />
          ₹_______<br />
          KM-based</p>
          <p>Inspection Photos<br />
          ₹_______<br />
          Per asset</p>
          <p>Payments released within 7–15 working days after invoice approval.</p>

          <h2>6. PERFORMANCE STANDARDS</h2>
          <p>Recovery Agency must maintain:</p>
          <ul>
            <li>90%+ recovery rate</li>
            <li>Clear photo/video evidence</li>
            <li>24–48 hour inspection TAT</li>
            <li>Buyer coordination support</li>
            <li>Proper safety protocols</li>
            <li>Zero harassment complaints</li>
          </ul>

          <h2>7. PROHIBITED ACTIONS</h2>
          <p>Recovery Agency must NOT:</p>
          <ul>
            <li>Threaten, harass, or use force on borrowers</li>
            <li>Impersonate police or government</li>
            <li>Create fake or tampered documents</li>
            <li>Unlawfully repossess assets</li>
            <li>Collude with borrowers or buyers</li>
            <li>Misappropriate vehicle parts</li>
            <li>Accept bribes or unauthorized payments</li>
          </ul>
          <p>Violation =&gt; Immediate termination + legal action.</p>

          <h2>8. LIABILITY</h2>
          <p>Recovery Agency is responsible for:</p>
          <ul>
            <li>Asset damage</li>
            <li>Document tampering</li>
            <li>Misconduct of staff</li>
            <li>Theft of parts</li>
            <li>Accidents during transport</li>
            <li>Wrongful repossession</li>
          </ul>
          <p>QuickMela is NOT liable for these events.</p>

          <h2>9. TERMINATION</h2>
          <p>Immediate termination if:</p>
          <ul>
            <li>Fraud</li>
            <li>Harassment complaints</li>
            <li>Legal/criminal case</li>
            <li>Non-performance</li>
            <li>Breach of SLA</li>
          </ul>

          <h2>10. SIGNATURES</h2>
          <p>For QuickMela<br />
          Name: ___________________<br />
          Signature: _______________</p>
          <p>For Recovery Agency<br />
          Name: ___________________<br />
          Signature: _______________</p>

          <p>✔ Recovery Agency Agreement Complete</p>
        </div>
      </article>
    </div>
  );
};

export default RecoveryAgencyAgreement;
