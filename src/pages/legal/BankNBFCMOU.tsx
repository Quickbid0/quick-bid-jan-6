import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BankNBFCMOU: React.FC = () => {
  usePageSEO({
    title: 'Bank / NBFC Partnership MoU | QuickMela',
    description: 'Memorandum of Understanding (MoU) template for banks and NBFCs partnering with QuickMela for seized vehicle and SARFAESI auctions.',
    canonicalPath: '/legal/bank-nbfc-mou',
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
          <li className="text-gray-700 dark:text-gray-200">Bank / NBFC Partnership MoU</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bank / NBFC Partnership MoU
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Memorandum of Understanding for seized vehicle auctions, SARFAESI auctions, and asset liquidation partnerships with QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p>✅ 1. BANK / NBFC PARTNERSHIP MoU (Memorandum of Understanding)</p>
          <p>For Seized Vehicle Auctions, SARFAESI Auctions &amp; Asset Liquidation</p>

          <h2>MEMORANDUM OF UNDERSTANDING (MoU)</h2>
          <p>Between<br />
          Tekvoro Technologies (QuickMela)<br />
          AND<br />
          _______________________ (Bank / NBFC / Financial Institution)</p>
          <p>Effective Date: ________________<br />
          MoU ID: QM-MOU-________________</p>

          <h2>1. PARTIES</h2>
          <h3>1.1 Tekvoro Technologies (QuickMela)</h3>
          <p>Registered Address:<br />
          5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana – 500055<br />
          Email: tekvoro@gmail.com | Phone: +91 9121331813</p>
          <p>Hereinafter called “QuickMela”, “Platform”, or “First Party.”</p>

          <h3>1.2 Bank / NBFC / Institution</h3>
          <p>Name: ____________________________________<br />
          Address: __________________________________<br />
          Authorized Officer: _________________________</p>
          <p>Hereinafter called “Partner Bank”, “Second Party”, or “Institution.”</p>

          <h2>2. PURPOSE OF MOU</h2>
          <p>This MoU establishes collaboration between QuickMela and the Partner Bank for:</p>
          <ul>
            <li>Listing bank-seized, repossessed, and SARFAESI vehicles</li>
            <li>Conducting transparent digital auctions</li>
            <li>Increasing sale recovery value</li>
            <li>Ensuring legal &amp; regulatory compliance</li>
            <li>Providing a secure buyer–seller digital ecosystem</li>
          </ul>

          <h2>3. SCOPE OF COOPERATION</h2>
          <p>QuickMela will provide:</p>
          <ul>
            <li>Digital auction platform</li>
            <li>Real-time bidding tools</li>
            <li>Buyer verification &amp; deposit collection</li>
            <li>Fraud detection and compliance screening</li>
            <li>Auction marketing &amp; promotions</li>
            <li>Reporting dashboard for banks</li>
            <li>Dedicated support team</li>
          </ul>
          <p>The Bank will provide:</p>
          <ul>
            <li>Accurate repossession documents</li>
            <li>Condition, inspection &amp; legal details</li>
            <li>Asset availability for buyer inspection</li>
            <li>Sale approval/rejection</li>
            <li>Fast release of DO/NOC post-sale</li>
            <li>Support for dispute resolution (if any)</li>
          </ul>

          <h2>4. NO JOINT VENTURE OR EQUITY</h2>
          <p>This MoU:</p>
          <ul>
            <li>❌ does NOT create a partnership firm</li>
            <li>❌ does NOT create shared ownership</li>
            <li>❌ does NOT involve equity or investment</li>
            <li>❌ does NOT grant rights over bank assets</li>
          </ul>
          <p>It is strictly a service cooperation MoU.</p>

          <h2>5. COMMISSION / SERVICE FEES</h2>
          <p>The Bank agrees to pay QuickMela:</p>
          <ul>
            <li>✔ A fixed per-vehicle fee, OR</li>
            <li>✔ A percentage commission, OR</li>
            <li>✔ A hybrid model, OR</li>
            <li>✔ A custom enterprise model</li>
          </ul>
          <p>(To be selected below)</p>
          <p>Vehicle Type<br />
          Fee (Editable)</p>
          <ul>
            <li>Two-Wheeler – ₹1,500</li>
            <li>Three-Wheeler – ₹3,000</li>
            <li>Car – ₹5,000</li>
            <li>Commercial Vehicle – ₹7,500+</li>
          </ul>
          <p>Or % Commission<br />
          ____%</p>
          <p>Payment must be made within 7 business days of sale confirmation.</p>

          <h2>6. CONFIDENTIALITY</h2>
          <p>Both Parties agree to maintain confidentiality of:</p>
          <ul>
            <li>Documents</li>
            <li>Auction data</li>
            <li>Buyer information</li>
            <li>Bank asset details</li>
            <li>Internal communication</li>
          </ul>

          <h2>7. TERM AND TERMINATION</h2>
          <p>Valid for 1 year, auto-renewed unless terminated by 30 days’ notice.</p>
          <p>Immediate termination applies for:</p>
          <ul>
            <li>Fraud</li>
            <li>Misconduct</li>
            <li>Non-payment</li>
            <li>Breach of laws</li>
          </ul>

          <h2>8. GOVERNING LAW</h2>
          <p>Jurisdiction: Hyderabad, Telangana</p>
          <p>Subject to Indian laws including:</p>
          <ul>
            <li>SARFAESI Act, 2002</li>
            <li>IT Act, 2000</li>
            <li>Contract Act, 1872</li>
          </ul>

          <h2>9. SIGNATURES</h2>
          <p>For QuickMela (Tekvoro Technologies)<br />
          Name: __________________________<br />
          Designation: _____________________<br />
          Signature: _______________________<br />
          Date: ___________________________</p>
          <p>For Partner Bank / NBFC<br />
          Name: __________________________<br />
          Designation: _____________________<br />
          Signature: _______________________<br />
          Date: ___________________________</p>

          <p>✔ MoU Completed.</p>
        </div>
      </article>
    </div>
  );
};

export default BankNBFCMOU;
