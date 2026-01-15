import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIUsageMonitoringFairnessSafetyResponsibleAutomationPolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Usage, Monitoring, Fairness, Safety, Transparency & Responsible Automation Policy | QuickMela',
    description:
      'Governs design, deployment, monitoring, fairness, safety, and transparency of all AI systems used across QuickMela/Tekvoro.',
    canonicalPath: '/legal/aiusage-monitoring-fairness-safety-responsibleautomation-policy',
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
          <li className="text-gray-700 dark:text-gray-200">
            AI Usage, Monitoring, Fairness, Safety, Transparency &amp; Responsible Automation Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          AI Usage, Monitoring, Fairness, Safety, Transparency &amp; Responsible Automation Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy governs the design, deployment, monitoring, usage, fairness, accuracy, and safety of all
          Artificial Intelligence (AI) systems used across QuickMela/Tekvoro.
          Includes fraud detection AI, bidding insights, AI description generator, AI image enhancement, AI-based KYC
          checks, AI moderation, risk scoring, and prediction models.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Safe AI usage</li>
          <li>Non-biased decisions</li>
          <li>Transparent communication</li>
          <li>Protection of user rights</li>
          <li>Legal compliance</li>
          <li>Responsible automation</li>
          <li>Accuracy &amp; testing</li>
          <li>No harmful or manipulative AI behaviour</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>All AI models used on the platform</li>
          <li>All automated decisions</li>
          <li>All admin-sided AI tools</li>
          <li>All seller/buyer AI assistants</li>
          <li>Third-party AI integrations</li>
          <li>Future AI tools</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>AI training</li>
          <li>Inference</li>
          <li>Data inputs</li>
          <li>Decision-making</li>
          <li>Logging</li>
          <li>Bias checks</li>
          <li>Auditability</li>
          <li>Human review</li>
        </ul>

        <h2>3. Types of AI Used on QuickMela</h2>
        <h3>A. Fraud Detection &amp; Risk Scoring AI</h3>
        <ul>
          <li>Multi-account detection</li>
          <li>Suspicious behaviour</li>
          <li>Payment irregularities</li>
          <li>Device/IP correlation</li>
          <li>Seller/buyer fraud patterns</li>
        </ul>
        <h3>B. AI for Listing Enhancement</h3>
        <ul>
          <li>AI-generated titles</li>
          <li>AI descriptions</li>
          <li>AI price suggestions</li>
          <li>AI category detection</li>
          <li>AI-quality grading</li>
        </ul>
        <h3>C. Image AI</h3>
        <ul>
          <li>Background cleanup</li>
          <li>Image enhancement</li>
          <li>Fake photo detection</li>
          <li>Authenticity scoring</li>
        </ul>
        <h3>D. Auction &amp; Buyer Insights AI</h3>
        <ul>
          <li>Price prediction (suggestive, NOT deterministic)</li>
          <li>Buyer activity pattern detection</li>
          <li>Seller performance insights</li>
        </ul>
        <h3>E. Admin AI</h3>
        <ul>
          <li>Flagging illegal items</li>
          <li>Flagging harmful content</li>
          <li>KYC verification assistance</li>
          <li>OTP fraud pattern detection</li>
        </ul>

        <h2>4. AI Transparency Rules</h2>
        <p>Platform MUST clearly inform users when:</p>
        <ul>
          <li>AI is used to generate text</li>
          <li>AI enhances photos</li>
          <li>AI flags content</li>
          <li>AI scores risk</li>
          <li>AI provides suggestions</li>
        </ul>
        <p>AI is NOT used to:</p>
        <ul>
          <li>Auto-approve KYC</li>
          <li>Auto-ban users without human review</li>
          <li>Manipulate auction outcomes</li>
          <li>Decide winners</li>
          <li>Change bid amounts</li>
          <li>Mislead buyers or sellers</li>
        </ul>

        <h2>5. Human-in-the-Loop (HITL) Requirement</h2>
        <p>No high-impact AI decision is final without a human.</p>
        <p>Human review required for:</p>
        <ul>
          <li>KYC rejections</li>
          <li>Fraud bans</li>
          <li>Payment freezes</li>
          <li>Listing removal (high-risk)</li>
          <li>Auction cancellation</li>
          <li>User suspensions</li>
        </ul>
        <p>AI simply flags, human decides.</p>

        <h2>6. Fairness &amp; Non-Discrimination Rules</h2>
        <p>AI must NOT discriminate based on:</p>
        <ul>
          <li>Religion</li>
          <li>Gender</li>
          <li>Caste</li>
          <li>Ethnicity</li>
          <li>Age</li>
          <li>Disability</li>
          <li>Location</li>
          <li>Occupation</li>
          <li>Financial background</li>
        </ul>
        <p>AI models are tested monthly for bias.</p>
        <p>Bias detected → model retrained or disabled.</p>

        <h2>7. Data Usage for AI</h2>
        <p>AI MAY use:</p>
        <ul>
          <li>Transaction logs</li>
          <li>Bidding patterns</li>
          <li>Listing content</li>
          <li>Item photos</li>
          <li>Session behaviour</li>
        </ul>
        <p>AI MAY NOT use:</p>
        <ul>
          <li>Aadhaar</li>
          <li>PAN</li>
          <li>Phone numbers</li>
          <li>Addresses</li>
          <li>Bank accounts</li>
          <li>KYC photos</li>
          <li>Sensitive identity markers</li>
        </ul>
        <p>Sensitive data NEVER used to train AI.</p>

        <h2>8. Accuracy &amp; Reliability Requirements</h2>
        <p>AI models must:</p>
        <ul>
          <li>Reach minimum accuracy level</li>
          <li>Undergo monthly testing</li>
          <li>Have error rates documented</li>
          <li>Be monitored in real time</li>
          <li>Follow rollback procedures during anomalies</li>
        </ul>
        <p>Critical AI errors → model disabled immediately.</p>

        <h2>9. Safety Rules for AI</h2>
        <p>AI cannot:</p>
        <ul>
          <li>Auto-send threatening messages</li>
          <li>Promote risk-taking behaviour</li>
          <li>Misuse user data</li>
          <li>Guess missing data</li>
          <li>Manipulate auctions</li>
          <li>Recommend financial investments</li>
          <li>Promote harmful items</li>
          <li>Generate adult/unsafe content</li>
          <li>Create fake user profiles</li>
        </ul>
        <p>AI may ONLY assist ethically.</p>

        <h2>10. AI Decision Logging</h2>
        <p>All AI decisions logged:</p>
        <ul>
          <li>Input</li>
          <li>Output</li>
          <li>Timestamp</li>
          <li>User ID</li>
          <li>Model version</li>
          <li>Confidence score</li>
          <li>Action taken</li>
        </ul>
        <p>Logs stored for:</p>
        <ul>
          <li>180 days (AI insights)</li>
          <li>5 years (fraud AI logs)</li>
        </ul>

        <h2>11. User Rights with AI Decisions</h2>
        <p>Users may request:</p>
        <ul>
          <li>Explanation for AI-flagged issues</li>
          <li>Review of AI-based flags</li>
          <li>Correction of incorrect AI decisions</li>
        </ul>
        <p>Humans respond within:</p>
        <ul>
          <li>3 days (normal)</li>
          <li>24 hours (critical)</li>
        </ul>

        <h2>12. Third-Party AI Model Rules</h2>
        <p>Any external AI vendor must:</p>
        <ul>
          <li>Sign data processing agreement</li>
          <li>Not store user data</li>
          <li>Not train on QuickMela data</li>
          <li>Provide model logs</li>
          <li>Ensure compliance with DPDP Act</li>
          <li>Use only secure channels</li>
        </ul>

        <h2>13. Prohibited AI Behaviours</h2>
        <p>Strictly forbidden:</p>
        <ul>
          <li>Deepfakes</li>
          <li>Auto-bidding bots</li>
          <li>Surveillance-like behaviour</li>
          <li>Predicting sensitive traits</li>
          <li>Auto-approving loans</li>
          <li>Auto-marking disputes</li>
          <li>Auto-verification of risky items</li>
          <li>Any AI without human override</li>
        </ul>

        <h2>14. AI for Bidding &amp; Auctions — STRICT RULES</h2>
        <p>AI CANNOT:</p>
        <ul>
          <li>Bid for user</li>
          <li>Change auction outcome</li>
          <li>Predict exact winning price</li>
          <li>Give unfair advantage</li>
          <li>Delay/extend timers</li>
          <li>Manipulate auction experience</li>
          <li>Influence bidding in real time</li>
        </ul>
        <p>AI CAN ONLY:</p>
        <ul>
          <li>Suggest categories</li>
          <li>Suggest titles/descriptions</li>
          <li>Provide price analytics (informational only)</li>
        </ul>

        <h2>15. Ethical AI Guidelines</h2>
        <p>AI must be:</p>
        <ul>
          <li>Transparent</li>
          <li>Explainable</li>
          <li>Accountable</li>
          <li>Fair</li>
          <li>Secure</li>
          <li>Tested</li>
        </ul>
        <p>No black-box decisions allowed for high-impact actions.</p>

        <h2>16. Penalties for AI Misuse</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Using bots to bid</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>Using AI to create fake profiles</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>Manipulating auctions with AI</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Scraping with ML tools</td>
              <td>IP ban</td>
            </tr>
            <tr>
              <td>Third-party misuse of data</td>
              <td>Contract termination</td>
            </tr>
            <tr>
              <td>Internal misuse by staff</td>
              <td>Termination + legal</td>
            </tr>
          </tbody>
        </table>

        <h2>17. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain safe AI models</li>
          <li>Monitor performance</li>
          <li>Prevent misuse</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Use AI responsibly</li>
          <li>Report suspicious behaviour</li>
        </ul>
        <h3>Sellers</h3>
        <ul>
          <li>Not upload AI-generated fake items</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Follow ethical constraints</li>
          <li>Document models</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Review AI fairness</li>
          <li>Approve models</li>
        </ul>
        <h3>Admin Team</h3>
        <ul>
          <li>Follow HITL rules</li>
        </ul>

        <h2>18. Policy Updates</h2>
        <p>This policy may be updated anytime based on new AI laws or capabilities.</p>
      </article>
    </div>
  );
};

export default AIUsageMonitoringFairnessSafetyResponsibleAutomationPolicy;
