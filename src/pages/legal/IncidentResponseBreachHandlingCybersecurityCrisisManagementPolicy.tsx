import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const IncidentResponseBreachHandlingCybersecurityCrisisManagementPolicy: React.FC = () => {
  usePageSEO({
    title: 'Incident Response, Breach Handling & Cybersecurity Crisis Management Policy | QuickMela',
    description:
      'How QuickMela/Tekvoro detects, responds to, contains, recovers from, and reports security incidents and cyberattacks to protect users and systems.',
    canonicalPath: '/legal/incident-response-breach-handling-cybersecurity-crisis-management-policy',
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
            Incident Response, Breach Handling &amp; Cybersecurity Crisis Management Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Incident Response, Breach Handling &amp; Cybersecurity Crisis Management Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy ensures QuickMela/Tekvoro can detect, respond, contain, recover, and report any security incident or
          cyberattack quickly and safely.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy defines:</p>
        <ul>
          <li>How incidents are detected</li>
          <li>How breaches are contained</li>
          <li>How security threats are handled</li>
          <li>Who is responsible</li>
          <li>How evidence is preserved</li>
          <li>How users and authorities are notified</li>
          <li>How systems recover after attack</li>
        </ul>
        <p>It protects:</p>
        <ul>
          <li>User data</li>
          <li>Wallets &amp; payments</li>
          <li>Auction engine</li>
          <li>Server environments</li>
          <li>Admin systems</li>
          <li>Overall business continuity</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>All employees</li>
          <li>DevOps</li>
          <li>Security teams</li>
          <li>Admin users</li>
          <li>Backend/frontend systems</li>
          <li>APIs</li>
          <li>Database clusters</li>
          <li>Cloud infrastructure</li>
          <li>Vendors with system access</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Data breaches</li>
          <li>DDoS attacks</li>
          <li>Ransomware</li>
          <li>Malware infections</li>
          <li>Server compromise</li>
          <li>Credential leaks</li>
          <li>Unauthorized access</li>
          <li>Fraud escalation</li>
          <li>API abuse</li>
          <li>Auction manipulation attempts</li>
        </ul>

        <h2>3. Incident Severity Categories</h2>
        <h3>Low Severity</h3>
        <ul>
          <li>Minor errors</li>
          <li>Small bugs</li>
          <li>Non-critical API issues</li>
        </ul>
        <h3>Medium Severity</h3>
        <ul>
          <li>Small-scale unauthorized access</li>
          <li>Suspicious logs</li>
          <li>Unusual user behavior</li>
        </ul>
        <h3>High Severity</h3>
        <ul>
          <li>Wallet anomalies</li>
          <li>Failed admin login attempts</li>
          <li>Database access failures</li>
          <li>Suspicious API attacks</li>
        </ul>
        <h3>Critical Severity</h3>
        <ul>
          <li>Data breach</li>
          <li>Server compromise</li>
          <li>Ransomware attack</li>
          <li>Large-scale fraud</li>
          <li>Payment system breach</li>
          <li>KYC leak</li>
          <li>Major DDoS</li>
        </ul>
        <p>Critical events activate full crisis mode.</p>

        <h2>4. Incident Response Team (IRT)</h2>
        <p>Consists of:</p>
        <ul>
          <li>Incident Commander (CTO)</li>
          <li>Security Lead</li>
          <li>DevOps Lead</li>
          <li>Fraud Lead</li>
          <li>Compliance Officer</li>
          <li>Legal Counsel</li>
          <li>Support Manager</li>
        </ul>
        <p>They coordinate detection &rarr; containment &rarr; recovery.</p>

        <h2>5. Mandatory Incident Response Steps</h2>
        <h3>Step 1 — Detect the Incident</h3>
        <p>Systems continuously monitor:</p>
        <ul>
          <li>Logs</li>
          <li>Suspicious access</li>
          <li>API rate anomalies</li>
          <li>Wallet behavior</li>
          <li>Auction patterns</li>
          <li>Server CPU/network usage</li>
        </ul>
        <p>AI alerts security if an anomaly occurs.</p>

        <h3>Step 2 — Contain the Incident</h3>
        <p>Actions may include:</p>
        <ul>
          <li>Blocking malicious IPs</li>
          <li>Freezing accounts</li>
          <li>Disabling APIs</li>
          <li>Pausing auctions</li>
          <li>Cutting off external access</li>
          <li>Ending admin sessions</li>
          <li>Locking critical systems</li>
        </ul>
        <p>No changes or deletions allowed.</p>

        <h3>Step 3 — Preserve Evidence</h3>
        <p>Critical for legal defense.</p>
        <p>Collect:</p>
        <ul>
          <li>Logs</li>
          <li>Screenshots</li>
          <li>Network traces</li>
          <li>Code snapshots</li>
          <li>Database dumps</li>
          <li>Admin activity logs</li>
        </ul>
        <p>Everything stored in immutable, read-only form.</p>

        <h3>Step 4 — Investigate</h3>
        <p>Security team identifies:</p>
        <ul>
          <li>Root cause</li>
          <li>Attack vector</li>
          <li>Extent of damage</li>
          <li>Data affected</li>
          <li>Systems compromised</li>
          <li>Fraud patterns</li>
        </ul>
        <p>Logs from:</p>
        <ul>
          <li>API</li>
          <li>DB</li>
          <li>CDN</li>
          <li>KYC system</li>
          <li>Wallet engine</li>
        </ul>
        <p>are reviewed.</p>

        <h3>Step 5 — Eradicate</h3>
        <p>Remove:</p>
        <ul>
          <li>Malware</li>
          <li>Compromised accounts</li>
          <li>Malicious files</li>
          <li>Vulnerabilities</li>
          <li>Infected packages</li>
          <li>Expired tokens</li>
        </ul>
        <p>Patching occurs immediately.</p>

        <h3>Step 6 — Recover</h3>
        <p>Restore:</p>
        <ul>
          <li>Clean servers</li>
          <li>Payments</li>
          <li>Auctions</li>
          <li>KYC flows</li>
          <li>App backend</li>
          <li>Database replicas</li>
        </ul>
        <p>Rollback to last known safe backups if required.</p>

        <h3>Step 7 — Notify Stakeholders</h3>
        <p>Depending on severity:</p>
        <ul>
          <li>CEO/CTO</li>
          <li>Internal teams</li>
          <li>Law enforcement (if required)</li>
          <li>Regulators (if required by DPDP/RBI)</li>
          <li>Users (if their data was impacted)</li>
        </ul>
        <p>Transparency maintained following law.</p>

        <h3>Step 8 — Post-Incident Review</h3>
        <p>A formal report includes:</p>
        <ul>
          <li>Timeline</li>
          <li>Impact</li>
          <li>Actions taken</li>
          <li>Lessons learned</li>
          <li>Prevention measures</li>
          <li>Policy updates</li>
        </ul>
        <p>Submitted to:</p>
        <ul>
          <li>CEO</li>
          <li>Compliance</li>
          <li>Legal</li>
          <li>Board (if large incident)</li>
        </ul>

        <h2>6. User Notification Rules (DPDP Act Compliant)</h2>
        <p>Users must be notified IF:</p>
        <ul>
          <li>Their data was leaked</li>
          <li>Their account was accessed</li>
          <li>Their wallet was at risk</li>
          <li>Their KYC documents were involved</li>
        </ul>
        <p>Notification must include:</p>
        <ul>
          <li>What happened</li>
          <li>What data affected</li>
          <li>What actions taken</li>
          <li>What user should do next</li>
        </ul>
        <p>Users are NOT notified if:</p>
        <ul>
          <li>Incident is false-positive</li>
          <li>Investigation requires secrecy (law enforcement order)</li>
        </ul>

        <h2>7. Law Enforcement Involvement</h2>
        <p>Notify law enforcement for:</p>
        <ul>
          <li>Breaches affecting 1000+ users</li>
          <li>Wallet fraud</li>
          <li>KYC theft</li>
          <li>Organized cyberattacks</li>
          <li>Payment fraud</li>
          <li>Ransomware incidents</li>
          <li>Identity theft cases</li>
        </ul>
        <p>Platforms must cooperate under IT Act &amp; DPDP Act.</p>

        <h2>8. DDoS &amp; Attack Response</h2>
        <p>System triggers:</p>
        <ul>
          <li>Auto-scaling</li>
          <li>Firewall lockdown</li>
          <li>IP blocking</li>
          <li>Geo-blocking</li>
          <li>Rate limiting</li>
          <li>CDN protection</li>
        </ul>
        <p>No auction continues during major attack.</p>

        <h2>9. Ransomware Handling Policy</h2>
        <p>QuickMela DOES NOT:</p>
        <ul>
          <li>Pay ransom</li>
          <li>Negotiate with attackers</li>
        </ul>
        <p>Procedure:</p>
        <ul>
          <li>Cut all access</li>
          <li>Restore from backups</li>
          <li>Notify authorities</li>
          <li>Launch forensic audit</li>
        </ul>

        <h2>10. Communication Protocol</h2>
        <h3>Internal</h3>
        <ul>
          <li>Slack</li>
          <li>Email alerts</li>
          <li>SMS (critical)</li>
        </ul>
        <h3>External</h3>
        <ul>
          <li>Status page</li>
          <li>In-app notification</li>
          <li>Email (if required)</li>
        </ul>
        <p>Only authorized spokesperson speaks publicly:</p>
        <ul>
          <li>CEO</li>
          <li>CTO</li>
          <li>Legal representative</li>
        </ul>

        <h2>11. Vendor &amp; Third-Party Incident Rules</h2>
        <p>Vendors MUST notify platform within:</p>
        <ul>
          <li>6 hours for any breach</li>
          <li>1 hour for critical issues</li>
        </ul>
        <p>Vendor must:</p>
        <ul>
          <li>Provide full forensic report</li>
          <li>Provide logs</li>
          <li>Cooperate fully</li>
        </ul>
        <p>Vendor breach &rarr; Contract termination + legal action.</p>

        <h2>12. Penalties for Internal Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hiding an incident</td>
              <td>Immediate termination</td>
            </tr>
            <tr>
              <td>Deleting logs</td>
              <td>Criminal prosecution</td>
            </tr>
            <tr>
              <td>Unauthorized access</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Delayed reporting</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Mismanagement of breach</td>
              <td>Disciplinary + legal</td>
            </tr>
            <tr>
              <td>Sharing incident info publicly</td>
              <td>Legal action</td>
            </tr>
          </tbody>
        </table>

        <h2>13. Responsibilities</h2>
        <h3>Security Team</h3>
        <ul>
          <li>Detect incidents</li>
          <li>Lead investigation</li>
          <li>Patch systems</li>
        </ul>
        <h3>DevOps</h3>
        <ul>
          <li>Restore service</li>
          <li>Handle servers</li>
          <li>Block malicious traffic</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Regulatory reporting</li>
          <li>User notifications</li>
        </ul>
        <h3>Legal</h3>
        <ul>
          <li>Law enforcement coordination</li>
        </ul>
        <h3>All Employees</h3>
        <ul>
          <li>Report suspicious activities</li>
          <li>Not interfere in investigations</li>
        </ul>

        <h2>14. DR (Disaster Recovery) Integration</h2>
        <p>If incident causes system outage:</p>
        <ul>
          <li>BCDR policy activated</li>
          <li>Failover triggered</li>
          <li>Backup restoration used</li>
        </ul>
        <p>This ensures minimal downtime.</p>

        <h2>15. Policy Updates</h2>
        <p>Company may update this policy anytime.</p>
        <p>Updates published under the Legal section.</p>
      </article>
    </div>
  );
};

export default IncidentResponseBreachHandlingCybersecurityCrisisManagementPolicy;
