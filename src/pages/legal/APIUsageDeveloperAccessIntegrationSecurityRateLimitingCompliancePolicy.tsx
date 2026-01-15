import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const APIUsageDeveloperAccessIntegrationSecurityRateLimitingCompliancePolicy: React.FC = () => {
  usePageSEO({
    title:
      'API Usage, Developer Access, Integration Security & Rate-Limiting Compliance Policy | QuickMela',
    description:
      'Governs API usage, developer access, integration security, rate limits, and data exposure rules for all QuickMela/Tekvoro APIs and integrations.',
    canonicalPath: '/legal/apiusage-developeraccess-integrationsecurity-ratelimiting-policy',
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
            API Usage, Developer Access, Integration Security &amp; Rate-Limiting Compliance Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          API Usage, Developer Access, Integration Security &amp; Rate-Limiting Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy governs the use, access, security, rate limits, data exposure rules, authentication, and
          compliance guidelines for all APIs and integrations used by QuickMela/Tekvoro, including internal APIs, partner
          APIs, webhooks, third-party integrations, and developer access.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To ensure:</p>
        <ul>
          <li>Secure use of APIs</li>
          <li>Protection from misuse</li>
          <li>Data privacy compliance</li>
          <li>Prevention of system overload</li>
          <li>Safe developer access</li>
          <li>Controlled partner integrations</li>
          <li>Rate-limiting for stability</li>
          <li>Prevention of unauthorized scraping</li>
          <li>Legal compliance (DPDP Act + IT Act)</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Mobile apps</li>
          <li>Web apps</li>
          <li>Internal APIs</li>
          <li>External/partner APIs</li>
          <li>Admin tools</li>
          <li>Integrations</li>
          <li>Third-party developers</li>
          <li>Vendors</li>
          <li>Payment gateways</li>
          <li>Verification providers</li>
          <li>Logistics APIs</li>
          <li>Notification providers</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Authentication</li>
          <li>Rate-limits</li>
          <li>Data access</li>
          <li>Logging</li>
          <li>Monitoring</li>
          <li>Permissions</li>
          <li>API key security</li>
          <li>Webhooks</li>
        </ul>

        <h2>3. API Access Types</h2>
        <h3>A. Public APIs (Limited)</h3>
        <p>Used by:</p>
        <ul>
          <li>Mobile apps</li>
          <li>Web clients</li>
        </ul>
        <p>Public APIs CANNOT expose:</p>
        <ul>
          <li>KYC</li>
          <li>Payment logs</li>
          <li>Wallet details</li>
          <li>Sensitive information</li>
        </ul>
        <h3>B. Private Internal APIs</h3>
        <p>Used by:</p>
        <ul>
          <li>Admins</li>
          <li>Moderators</li>
          <li>System services</li>
          <li>Internal tools</li>
        </ul>
        <p>Protected with:</p>
        <ul>
          <li>Token + IP whitelisting</li>
          <li>Strict RBAC</li>
        </ul>
        <h3>C. Partner APIs</h3>
        <p>For:</p>
        <ul>
          <li>Delivery companies</li>
          <li>Yard operators</li>
          <li>KYC providers</li>
          <li>Payment partners</li>
          <li>SMS/Email/WhatsApp providers</li>
        </ul>
        <p>Partner APIs must have:</p>
        <ul>
          <li>Signed agreements</li>
          <li>Limited scopes</li>
          <li>Secure authentication</li>
        </ul>
        <h3>D. Developer APIs (Future)</h3>
        <p>Given only with:</p>
        <ul>
          <li>Verified business registration</li>
          <li>NDA</li>
          <li>Integration agreement</li>
        </ul>

        <h2>4. Authentication Requirements</h2>
        <p>All API requests must have secure authentication.</p>
        <p>Allowed:</p>
        <ul>
          <li>OAuth 2.0</li>
          <li>JWT tokens with expiry</li>
          <li>HMAC signatures</li>
          <li>API keys stored in secure vault</li>
          <li>IP whitelisting for admin APIs</li>
        </ul>
        <p>Forbidden:</p>
        <ul>
          <li>Hardcoded API keys</li>
          <li>Plain HTTP requests</li>
          <li>Sharing auth keys on email/WhatsApp</li>
          <li>Using tokens without expiry</li>
        </ul>
        <p>All tokens must:</p>
        <ul>
          <li>Expire</li>
          <li>Be revokable</li>
          <li>Be tied to device/session</li>
        </ul>

        <h2>5. API Key Security Rules</h2>
        <p>API keys must:</p>
        <ul>
          <li>Be unique per developer</li>
          <li>Be stored encrypted</li>
          <li>Not be pushed to GitHub</li>
          <li>Not be included in frontend code</li>
          <li>Not be emailed or screenshotted</li>
          <li>Not be shared with other companies</li>
        </ul>
        <p>Lost/leaked key → immediate rotation required.</p>

        <h2>6. Rate-Limiting Rules</h2>
        <p>To prevent abuse, DDoS, scraping, or system overload:</p>
        <h3>Client-facing APIs</h3>
        <ul>
          <li>30–60 requests/minute per user</li>
          <li>Burst limit applied</li>
          <li>Auto-block suspicious spikes</li>
        </ul>
        <h3>Partner APIs</h3>
        <ul>
          <li>100–500 requests/minute depending on plan</li>
          <li>Must use caching</li>
        </ul>
        <h3>Admin APIs</h3>
        <ul>
          <li>10–20 requests/minute</li>
          <li>Strict logging &amp; monitoring</li>
        </ul>
        <h3>Unauthenticated users</h3>
        <ul>
          <li>Very low limits (to prevent scraping)</li>
          <li>CAPTCHA required</li>
        </ul>
        <p>Violation → temporary or permanent API ban.</p>

        <h2>7. Allowed Uses of APIs</h2>
        <p>Developers MAY:</p>
        <ul>
          <li>Build integrations</li>
          <li>Display real-time data</li>
          <li>Fetch auction lists</li>
          <li>Access their own order details</li>
          <li>Perform logistic updates</li>
          <li>Handle KYC callbacks</li>
          <li>Manage their seller data</li>
          <li>Process delivery updates</li>
        </ul>

        <h2>8. Prohibited API Uses</h2>
        <p>Developers/users CANNOT:</p>
        <ul>
          <li>Scrape data</li>
          <li>Export large datasets</li>
          <li>Access others’ user data</li>
          <li>Perform automated bidding</li>
          <li>Use bots</li>
          <li>Reverse-engineer private endpoints</li>
          <li>Manipulate auctions</li>
          <li>Bypass rate-limits</li>
          <li>Manipulate wallet/payout APIs</li>
          <li>Trigger artificial load</li>
          <li>Spoof IP or device fingerprint</li>
        </ul>
        <p>Violation → permanent ban + legal action.</p>

        <h2>9. Data Exposure Rules</h2>
        <p>APIs MAY expose:</p>
        <ul>
          <li>Item details</li>
          <li>Auction state</li>
          <li>Seller’s public info</li>
          <li>Delivery tracking</li>
          <li>Order history</li>
          <li>KYC status (only for account owner)</li>
        </ul>
        <p>APIs MAY NOT expose:</p>
        <ul>
          <li>Full user profiles</li>
          <li>Personal identity data</li>
          <li>Payment logs</li>
          <li>Bank account numbers</li>
          <li>KYC images/raw documents</li>
          <li>Fraud or internal notes</li>
          <li>Admin details</li>
          <li>Internal system logs</li>
        </ul>

        <h2>10. Logging &amp; Monitoring of All API Calls</h2>
        <p>Logged automatically:</p>
        <ul>
          <li>IP</li>
          <li>User ID</li>
          <li>Token used</li>
          <li>Endpoint</li>
          <li>Request method</li>
          <li>Response time</li>
          <li>Errors</li>
          <li>Suspicious behaviour</li>
          <li>Rate-limit violations</li>
        </ul>
        <p>All logs stored as:</p>
        <ul>
          <li>Immutable</li>
          <li>Encrypted</li>
          <li>Audit-ready</li>
        </ul>

        <h2>11. Webhooks &amp; Callback Security</h2>
        <p>Webhooks must use:</p>
        <ul>
          <li>HMAC signing</li>
          <li>Timestamp validation</li>
          <li>Payload hashing</li>
          <li>IP allowlist</li>
        </ul>
        <p>Platform must:</p>
        <ul>
          <li>Log every callback</li>
          <li>Validate authenticity</li>
          <li>Reject mismatched signatures</li>
        </ul>
        <p>Unauthorized callbacks → blocked.</p>

        <h2>12. API Abuse Detection (AI &amp; Behavioural)</h2>
        <p>AI automatically detects:</p>
        <ul>
          <li>High-volume scraping</li>
          <li>Automated bidding patterns</li>
          <li>Bot-like request timing</li>
          <li>Multiple tokens from same device</li>
          <li>Suspicious API error spikes</li>
          <li>Unusual API call frequency</li>
          <li>Token reuse attempts</li>
        </ul>
        <p>Suspicious activity triggers:</p>
        <ul>
          <li>Throttling</li>
          <li>Captcha</li>
          <li>Token invalidation</li>
          <li>Account freeze</li>
        </ul>

        <h2>13. API Versioning &amp; Deprecation</h2>
        <p>We maintain:</p>
        <ul>
          <li>Versioned endpoints (v1, v2, v3…)</li>
          <li>Deprecation notices (30–60 days)</li>
          <li>Backward compatibility windows</li>
        </ul>
        <p>Old APIs shut down after:</p>
        <ul>
          <li>Security gaps</li>
          <li>Policy changes</li>
          <li>Compliance requirements</li>
        </ul>

        <h2>14. Partner Integration Compliance</h2>
        <p>Partners MUST:</p>
        <ul>
          <li>Sign integration agreement</li>
          <li>Follow DPDP Act rules</li>
          <li>Pass API security checks</li>
          <li>Not store user data longer than necessary</li>
          <li>Delete user data when contract ends</li>
          <li>Report security breaches immediately</li>
          <li>Use encrypted channels</li>
        </ul>
        <p>Violation → termination + legal action.</p>

        <h2>15. Developer Terms (Future)</h2>
        <p>Developers using open APIs MUST:</p>
        <ul>
          <li>Follow usage limits</li>
          <li>Maintain app security</li>
          <li>Not mislead users</li>
          <li>Not misuse QuickMela brand</li>
          <li>Not create competing clones</li>
          <li>Provide correct company details</li>
        </ul>

        <h2>16. Penalties for API Misuse</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Scraping</td>
              <td>IP ban</td>
            </tr>
            <tr>
              <td>Automated bidding</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>Data theft</td>
              <td>FIR + legal action</td>
            </tr>
            <tr>
              <td>Spam requests</td>
              <td>Throttling → ban</td>
            </tr>
            <tr>
              <td>Accessing unauthorized endpoints</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Leaking API keys</td>
              <td>Termination</td>
            </tr>
            <tr>
              <td>Abuse of admin APIs</td>
              <td>Device ban</td>
            </tr>
          </tbody>
        </table>

        <h2>17. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain secure APIs</li>
          <li>Apply rate-limits</li>
          <li>Encrypt sensitive data</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Use APIs legally</li>
          <li>Protect API keys</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Avoid granting unnecessary access</li>
        </ul>
        <h3>Partners</h3>
        <ul>
          <li>Follow integration rules</li>
          <li>Protect user data</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor abuse</li>
          <li>Investigate alerts</li>
        </ul>

        <h2>18. Policy Updates</h2>
        <p>This API security/integration policy may be updated anytime.</p>
      </article>
    </div>
  );
};

export default APIUsageDeveloperAccessIntegrationSecurityRateLimitingCompliancePolicy;
