import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BusinessContinuityDisasterRecoverySystemAvailabilityOutageCommunicationPolicy: React.FC = () => {
  usePageSEO({
    title:
      'Business Continuity, Disaster Recovery, System Availability & Outage Communication Policy | QuickMela',
    description:
      'Ensures QuickMela/Tekvoro remains functional, secure, and resilient during failures, disasters, and outages, with clear user and partner communication.',
    canonicalPath:
      '/legal/businesscontinuity-disasterrecovery-systemavailability-outagecommunication-policy',
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
            Business Continuity, Disaster Recovery, System Availability &amp; Outage Communication Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Business Continuity, Disaster Recovery, System Availability &amp; Outage Communication Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy ensures QuickMela/Tekvoro remains functional, secure, and resilient during system failures, data
          loss, outages, disasters, attacks, or emergencies, and clearly defines how users and partners are informed.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Reliable platform uptime</li>
          <li>Zero data loss</li>
          <li>Fast recovery from failures</li>
          <li>High-availability systems</li>
          <li>Protection against disasters</li>
          <li>Clear communication during outages</li>
          <li>Minimal business disruption</li>
          <li>Protection of financial transactions</li>
          <li>Compliance with IT/DPDP/CERT-In standards</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Backend systems</li>
          <li>Frontend systems</li>
          <li>Databases</li>
          <li>Auctions</li>
          <li>Bidding engine</li>
          <li>Wallet/payments</li>
          <li>Notifications</li>
          <li>Admin panels</li>
          <li>APIs</li>
          <li>Cloud services</li>
          <li>Vendor integrations</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Disaster recovery</li>
          <li>Backups</li>
          <li>Failover systems</li>
          <li>Outage reporting</li>
          <li>Incident response</li>
          <li>Business continuity planning</li>
        </ul>

        <h2>3. Business Impact Analysis (BIA)</h2>
        <p>Critical components:</p>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Criticality</th>
              <th>Max Allowed Downtime</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Auction Engine</td>
              <td>Highest</td>
              <td>0–5 minutes</td>
            </tr>
            <tr>
              <td>Payments/Wallet</td>
              <td>High</td>
              <td>&lt; 30 minutes</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>High</td>
              <td>&lt; 1 hour</td>
            </tr>
            <tr>
              <td>Admin Panel</td>
              <td>Medium</td>
              <td>2–4 hours</td>
            </tr>
            <tr>
              <td>Delivery Module</td>
              <td>Medium</td>
              <td>4 hours</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Low</td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>Marketing Systems</td>
              <td>Low</td>
              <td>24–48 hours</td>
            </tr>
          </tbody>
        </table>
        <p>This defines recovery priorities.</p>

        <h2>4. Data Backup Policy</h2>
        <h3>Backup Types</h3>
        <ul>
          <li>Daily full database backup</li>
          <li>Hourly incremental backup</li>
          <li>Real-time replication for critical tables</li>
          <li>Encrypted cloud backups</li>
        </ul>
        <h3>Backup Storage</h3>
        <ul>
          <li>Primary region → India</li>
          <li>Secondary region → Singapore/UAE (non-sensitive only)</li>
        </ul>
        <h3>Backup Retention</h3>
        <ul>
          <li>7 days (incremental)</li>
          <li>30 days (full backups)</li>
          <li>1 year (critical logs)</li>
          <li>10 years (financial audit logs)</li>
        </ul>
        <h3>Backup Integrity Testing</h3>
        <ul>
          <li>Weekly test restore</li>
          <li>Monthly full drill</li>
        </ul>

        <h2>5. Disaster Recovery (DR) Strategy</h2>
        <h3>Primary DR Objectives</h3>
        <ul>
          <li>RTO (Recovery Time Objective): ≤ 60 minutes</li>
          <li>RPO (Recovery Point Objective): ≤ 15 minutes</li>
          <li>Bid logs replicated in real-time</li>
        </ul>
        <p>DR Includes</p>
        <ul>
          <li>Hot standby server</li>
          <li>Failover environment</li>
          <li>Load balancers</li>
          <li>Redundant databases</li>
          <li>Multi-zone deployment</li>
          <li>Data replication</li>
          <li>Emergency reboot scripts</li>
        </ul>

        <h2>6. System Availability &amp; Uptime Guarantees</h2>
        <p>Aim for:</p>
        <ul>
          <li>99.5% uptime (minimum)</li>
          <li>99.9% uptime (target)</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Login</li>
          <li>Bidding</li>
          <li>Payments</li>
          <li>Listing operations</li>
          <li>Delivery updates</li>
        </ul>
        <p>Excludes:</p>
        <ul>
          <li>Scheduled maintenance</li>
          <li>Third-party outages</li>
        </ul>

        <h2>7. Scheduled Maintenance Rules</h2>
        <p>Maintenance window:</p>
        <ul>
          <li>1–2 hours</li>
        </ul>
        <p>Notification provided 24 hours in advance</p>
        <p>Done during low-traffic hours</p>
        <p>Users notified via:</p>
        <ul>
          <li>Banner</li>
          <li>Push notification</li>
          <li>Email (optional)</li>
        </ul>

        <h2>8. Unscheduled Outage Management</h2>
        <p>During unplanned outage:</p>
        <ul>
          <li>Incident detected (monitoring)</li>
          <li>Team alerted automatically</li>
          <li>Issue diagnosed</li>
          <li>System isolated if needed</li>
          <li>Fix deployed &amp; tested</li>
          <li>System restored</li>
        </ul>
        <p>Maximum first response time: 5 minutes</p>

        <h2>9. Outage Communication Protocol</h2>
        <p>During outages or downtime:</p>
        <ul>
          <li>Status page updated</li>
          <li>Messages on app/website</li>
          <li>Clear explanation of issue</li>
          <li>Expected resolution time</li>
          <li>Real-time updates for major outages</li>
        </ul>
        <p>Communication channels:</p>
        <ul>
          <li>In-app notifications</li>
          <li>Status portal</li>
          <li>Email (critical only)</li>
          <li>SMS (if payment impacted)</li>
        </ul>

        <h2>10. High-Risk Disaster Events Covered</h2>
        <p>Platform prepared for:</p>
        <ul>
          <li>Data center failure</li>
          <li>Server crash</li>
          <li>Network outage</li>
          <li>Power failure</li>
          <li>Cyberattack (DDoS, hacking attempt)</li>
          <li>Ransomware</li>
          <li>Hardware failure</li>
          <li>Code deployment errors</li>
          <li>Database corruption</li>
          <li>Payment gateway outage</li>
        </ul>

        <h2>11. Cyberattack Response Procedures</h2>
        <p>If attack detected:</p>
        <ul>
          <li>Isolate affected systems</li>
          <li>Block suspicious IPs</li>
          <li>Lock admin access</li>
          <li>Enable emergency firewall rules</li>
          <li>Notify security team</li>
          <li>Assess impact</li>
          <li>Recover from backups</li>
          <li>Report to CERT-In (if required)</li>
          <li>Notify affected users (if DPDP rules apply)</li>
        </ul>

        <h2>12. Emergency Mode Operations</h2>
        <p>During critical emergencies:</p>
        <ul>
          <li>Auctions paused</li>
          <li>Payments suspended</li>
          <li>Payouts held</li>
          <li>Admin operations restricted</li>
          <li>High-risk data locked</li>
          <li>Read-only mode activated</li>
        </ul>
        <p>Return to normal operations only after:</p>
        <ul>
          <li>Integrity verification</li>
          <li>Security review</li>
          <li>System stabilization</li>
        </ul>

        <h2>13. Failover &amp; Redundancy Rules</h2>
        <p>Platform must have:</p>
        <ul>
          <li>Multi-AZ (availability zone) support</li>
          <li>Redundant load balancers</li>
          <li>Secondary DB nodes</li>
          <li>Failover servers</li>
          <li>Auto-scaling</li>
          <li>Offline queueing system</li>
        </ul>
        <p>Failover tested quarterly.</p>

        <h2>14. Data Loss Prevention</h2>
        <p>Measures:</p>
        <ul>
          <li>Real-time replication</li>
          <li>Transaction logs</li>
          <li>Data validation</li>
          <li>Hashing &amp; checksums</li>
          <li>Strict database access rules</li>
        </ul>
        <p>Zero tolerance for data modification or deletion without logs.</p>

        <h2>15. Employee Roles in Disaster Recovery</h2>
        <h3>Disaster Recovery Lead</h3>
        <p>Coordinates entire recovery.</p>
        <h3>Security Lead</h3>
        <p>Manages system security, attacks.</p>
        <h3>DevOps Team</h3>
        <p>Restores servers and applications.</p>
        <h3>Database Administrator</h3>
        <p>Restores DB from backups.</p>
        <h3>Compliance Officer</h3>
        <p>Reports incidents to authorities.</p>
        <h3>Support Team</h3>
        <p>Communicates updates to users.</p>

        <h2>16. Recovery Testing &amp; Simulation</h2>
        <p>Performed:</p>
        <ul>
          <li>Monthly mini-tests</li>
          <li>Quarterly full DR drill</li>
          <li>Annual large-scale simulation</li>
          <li>Random emergency tests</li>
        </ul>
        <p>Documentation required for all drills.</p>

        <h2>17. Business Continuity for Operations</h2>
        <p>If digital systems fail:</p>
        <ul>
          <li>Manual record-keeping enabled temporarily</li>
          <li>Delivery operations continue with SMS/phone</li>
          <li>Auction scheduling postponed</li>
          <li>Seller onboarding paused</li>
          <li>Payment freezes until secure</li>
        </ul>
        <p>Goal: minimum disruption to users</p>

        <h2>18. Penalties for Misconduct During Outages</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hiding incidents</td>
              <td>Immediate termination</td>
            </tr>
            <tr>
              <td>Falsifying uptime data</td>
              <td>Legal + job loss</td>
            </tr>
            <tr>
              <td>Unauthorized recovery actions</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Deleting outage logs</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Exploiting outage for profit</td>
              <td>Permanent ban</td>
            </tr>
          </tbody>
        </table>

        <h2>19. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain DR systems</li>
          <li>Keep backups</li>
          <li>Provide high availability</li>
        </ul>
        <h3>DevOps</h3>
        <ul>
          <li>Handle outages</li>
          <li>Maintain servers</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Protect from attacks</li>
          <li>Monitor threats</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Report incidents</li>
          <li>Update legal records</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Follow instructions during outages</li>
        </ul>

        <h2>20. Policy Updates</h2>
        <p>This disaster recovery/business continuity policy may be updated anytime.</p>
      </article>
    </div>
  );
};

export default BusinessContinuityDisasterRecoverySystemAvailabilityOutageCommunicationPolicy;
