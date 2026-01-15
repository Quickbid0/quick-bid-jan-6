import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from './models/Role';
import { Permission } from './models/Permission';
import { RolePermission } from './models/RolePermission';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickmela-community';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for RBAC seeding');

  const permissions = [
    {
      key: 'rbac.manage',
      module: 'rbac',
      action: 'manage',
      label: 'Manage RBAC',
      description: 'Full access to role and permission management (Super Admin only)',
    },
    {
      key: 'rbac.roles.manage',
      module: 'rbac',
      action: 'roles.manage',
      label: 'Manage roles',
      description: 'Create, update, and delete roles',
    },
    {
      key: 'rbac.permissions.manage',
      module: 'rbac',
      action: 'permissions.manage',
      label: 'Manage permissions',
      description: 'Assign and revoke permissions for roles',
    },
    {
      key: 'rbac.user_roles.manage',
      module: 'rbac',
      action: 'user_roles.manage',
      label: 'Manage user roles',
      description: 'Assign and manage roles for users',
    },
    {
      key: 'referral.settings.manage',
      module: 'referral',
      action: 'settings.manage',
      label: 'Manage referral settings',
      description: 'Configure referral bonus rules and limits',
    },
    {
      key: 'referral.history.view_all',
      module: 'referral',
      action: 'history.view_all',
      label: 'View all referral history',
      description: 'View referral bonus and fraud history for all users',
    },
    {
      key: 'referral.payout.approve',
      module: 'referral',
      action: 'payout.approve',
      label: 'Approve referral payouts',
      description: 'Approve or reject referral bonus payouts',
    },
    {
      key: 'referral.bonus.freeze',
      module: 'referral',
      action: 'bonus.freeze',
      label: 'Freeze referral bonuses',
      description: 'Freeze or unfreeze referral bonuses for fraud review',
    },
    {
      key: 'wallet.referral.view',
      module: 'wallet',
      action: 'referral.view',
      label: 'View referral wallet entries',
      description: 'View wallet entries related to referral bonuses',
    },
    // --- Core staff / org management ---
    {
      key: 'staff.view',
      module: 'staff',
      action: 'view',
      label: 'View staff',
      description: 'View staff profiles and roles',
    },
    {
      key: 'staff.manage',
      module: 'staff',
      action: 'manage',
      label: 'Manage staff',
      description: 'Create, update, and disable staff accounts',
    },
    {
      key: 'staff.approve',
      module: 'staff',
      action: 'approve',
      label: 'Approve staff',
      description: 'Approve or reject staff and role assignment requests',
    },
    {
      key: 'branches.view',
      module: 'branches',
      action: 'view',
      label: 'View branches',
      description: 'View branches and their details',
    },
    {
      key: 'branches.manage',
      module: 'branches',
      action: 'manage',
      label: 'Manage branches',
      description: 'Create and update branches and assign managers',
    },
    {
      key: 'departments.view',
      module: 'departments',
      action: 'view',
      label: 'View departments',
      description: 'View departments and their structure',
    },
    {
      key: 'departments.manage',
      module: 'departments',
      action: 'manage',
      label: 'Manage departments',
      description: 'Create and update departments and assign heads',
    },
    // --- Auctions / winners / disputes ---
    {
      key: 'auctions.view_all',
      module: 'auctions',
      action: 'view_all',
      label: 'View all auctions',
      description: 'View auctions across the platform',
    },
    {
      key: 'auctions.manage',
      module: 'auctions',
      action: 'manage',
      label: 'Manage auctions',
      description: 'Create, update, and cancel auctions',
    },
    {
      key: 'auctions.settle',
      module: 'auctions',
      action: 'settle',
      label: 'Settle auctions',
      description: 'Handle post-auction settlement and winner confirmation',
    },
    {
      key: 'auctions.disputes.handle',
      module: 'auctions',
      action: 'disputes.handle',
      label: 'Handle auction disputes',
      description: 'Review and resolve disputes related to auctions',
    },
    // --- KYC / sellers ---
    {
      key: 'kyc.review',
      module: 'kyc',
      action: 'review',
      label: 'Review KYC',
      description: 'View and review user KYC documents',
    },
    {
      key: 'kyc.approve',
      module: 'kyc',
      action: 'approve',
      label: 'Approve KYC',
      description: 'Approve or reject user KYC',
    },
    {
      key: 'sellers.onboard.approve',
      module: 'sellers',
      action: 'onboard.approve',
      label: 'Approve seller onboarding',
      description: 'Approve or reject new seller onboarding requests',
    },
    {
      key: 'sellers.disputes.handle',
      module: 'sellers',
      action: 'disputes.handle',
      label: 'Handle seller disputes',
      description: 'Review and resolve disputes involving sellers',
    },
    // --- Finance ---
    {
      key: 'finance.view',
      module: 'finance',
      action: 'view',
      label: 'View finance data',
      description: 'View finance information, payouts and settlements',
    },
    {
      key: 'finance.refunds.approve',
      module: 'finance',
      action: 'refunds.approve',
      label: 'Approve refunds',
      description: 'Approve or reject refunds for buyers and sellers',
    },
    {
      key: 'finance.payouts.manage',
      module: 'finance',
      action: 'payouts.manage',
      label: 'Manage payouts',
      description: 'Process and manage payouts and settlements',
    },
    // --- Support ---
    {
      key: 'support.tickets.manage',
      module: 'support',
      action: 'tickets.manage',
      label: 'Manage support tickets',
      description: 'Respond to and manage buyer/seller support tickets',
    },
    {
      key: 'support.chat.manage',
      module: 'support',
      action: 'chat.manage',
      label: 'Manage support chat',
      description: 'Handle live chat and messaging support',
    },
    // --- Logs / compliance / fraud ---
    {
      key: 'logs.view',
      module: 'logs',
      action: 'view',
      label: 'View logs',
      description: 'View basic operational logs',
    },
    {
      key: 'logs.audit.view',
      module: 'logs',
      action: 'audit.view',
      label: 'View audit logs',
      description: 'View detailed audit logs of staff actions',
    },
    {
      key: 'fraud.alerts.review',
      module: 'fraud',
      action: 'alerts.review',
      label: 'Review fraud alerts',
      description: 'Review suspicious activity and fraud alerts',
    },
    {
      key: 'fraud.users.block',
      module: 'fraud',
      action: 'users.block',
      label: 'Block fraud users',
      description: 'Block or unblock users flagged for fraud',
    },
    {
      key: 'marketing.campaigns.view',
      module: 'marketing',
      action: 'campaigns.view',
      label: 'View marketing campaigns',
      description: 'View and read marketing campaigns and details',
    },
    {
      key: 'marketing.analytics.view',
      module: 'marketing',
      action: 'analytics.view',
      label: 'View marketing analytics',
      description: 'View campaign analytics and performance metrics',
    },
    {
      key: 'sales.leads.view',
      module: 'sales',
      action: 'leads.view',
      label: 'View sales leads',
      description: 'View sales leads and dashboard summaries',
    },
    {
      key: 'sales.leads.manage',
      module: 'sales',
      action: 'leads.manage',
      label: 'Manage sales leads',
      description: 'Create, update, and manage sales leads',
    },
    {
      key: 'campaigns.launches.view',
      module: 'campaigns',
      action: 'launches.view',
      label: 'View launches',
      description: 'View launch plans and timelines',
    },
    {
      key: 'campaigns.performance.view',
      module: 'campaigns',
      action: 'performance.view',
      label: 'View launch performance',
      description: 'View performance stats and post-launch reports',
    },
    {
      key: 'product.verify',
      module: 'product',
      action: 'verify',
      label: 'Verify products',
      description: 'Approve, reject, or request docs for product verification',
    },
  ];

  const roles = [
    {
      key: 'super_admin',
      name: 'Super Admin',
      description: 'Full system administrator with all permissions',
      level: 'global',
      isSystem: true,
      canOverride: true,
      canApproveRoleChanges: true,
      canViewAuditLogs: true,
    },
    // --- Company-level admin ---
    {
      key: 'admin',
      name: 'Admin',
      description: 'Admin with management permissions but limited overrides',
      level: 'global',
      isSystem: true,
      canOverride: false,
      canApproveRoleChanges: true,
      canViewAuditLogs: true,
    },
    // --- Finance / fraud core roles (existing) ---
    {
      key: 'finance_manager',
      name: 'Finance Manager',
      description: 'Manages payouts and financial approvals',
      level: 'global',
      isSystem: true,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: true,
    },
    {
      key: 'ai_fraud_officer',
      name: 'AI Fraud Officer',
      description: 'Reviews and freezes suspicious referral activity',
      level: 'global',
      isSystem: true,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: true,
    },
    // --- Department heads ---
    {
      key: 'operations_head',
      name: 'Operations Head',
      description: 'Leads daily auction operations and product validation',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'seller_mgmt_head',
      name: 'Seller Management Head',
      description: 'Leads seller onboarding and dispute management',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'buyer_support_head',
      name: 'Buyer Support Head',
      description: 'Leads buyer support and ticketing operations',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'finance_head',
      name: 'Finance Head',
      description: 'Leads finance and accounts department',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: true,
    },
    {
      key: 'compliance_head',
      name: 'Compliance & Fraud Control Head',
      description: 'Leads compliance and fraud control operations',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: true,
    },
    {
      key: 'technical_head',
      name: 'Technical Head',
      description: 'Leads technical operations and releases',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: true,
    },
    // --- Department staff ---
    {
      key: 'operations_staff',
      name: 'Operations Staff',
      description: 'Operations team member handling daily auctions',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'seller_mgmt_staff',
      name: 'Seller Management Staff',
      description: 'Seller management team member',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'buyer_support_staff',
      name: 'Buyer Support Staff',
      description: 'Buyer support team member',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'finance_staff',
      name: 'Finance Staff',
      description: 'Finance and accounts team member',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'compliance_staff',
      name: 'Compliance Staff',
      description: 'Compliance and fraud control team member',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'technical_staff',
      name: 'Technical Staff',
      description: 'Technical and support engineering team member',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    // --- Branch-level roles ---
    {
      key: 'branch_manager',
      name: 'Branch Manager',
      description: 'Manages branch staff, local deals, and cash coordination',
      level: 'branch',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'branch_staff',
      name: 'Branch Staff',
      description: 'Branch staff with limited operational access',
      level: 'branch',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'marketing',
      name: 'Marketing Services',
      description: 'Marketplace marketing and placements team',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'sales',
      name: 'Sales Support',
      description: 'Enterprise sales enablement and deal coordination',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
    {
      key: 'campaigns',
      name: 'Launch Campaigns',
      description: 'Seasonal launches and influencer drop coordination',
      level: 'department',
      isSystem: false,
      canOverride: false,
      canApproveRoleChanges: false,
      canViewAuditLogs: false,
    },
  ];

  // Upsert roles
  const roleDocs: Record<string, any> = {};
  for (const role of roles) {
    const doc = await Role.findOneAndUpdate(
      { key: role.key },
      { $set: role },
      { upsert: true, new: true }
    ).lean();
    roleDocs[role.key] = doc;
    console.log(`Upserted role ${role.key}`);
  }

  // Upsert permissions
  const permDocs: Record<string, any> = {};
  for (const perm of permissions) {
    const doc = await Permission.findOneAndUpdate(
      { key: perm.key },
      { $set: perm },
      { upsert: true, new: true }
    ).lean();
    permDocs[perm.key] = doc;
    console.log(`Upserted permission ${perm.key}`);
  }

  const mappings: Array<{ roleKey: string; permKey: string }> = [
    // Super admin gets everything
    ...permissions.map((p) => ({ roleKey: 'super_admin', permKey: p.key })),

    // --- Admin: strong company-level operations ---
    { roleKey: 'admin', permKey: 'rbac.roles.manage' },
    { roleKey: 'admin', permKey: 'rbac.permissions.manage' },
    { roleKey: 'admin', permKey: 'rbac.user_roles.manage' },
    { roleKey: 'admin', permKey: 'referral.settings.manage' },
    { roleKey: 'admin', permKey: 'referral.history.view_all' },
    { roleKey: 'admin', permKey: 'referral.payout.approve' },
    { roleKey: 'admin', permKey: 'wallet.referral.view' },
    // Staff/org
    { roleKey: 'admin', permKey: 'staff.view' },
    { roleKey: 'admin', permKey: 'staff.manage' },
    { roleKey: 'admin', permKey: 'staff.approve' },
    { roleKey: 'admin', permKey: 'branches.view' },
    { roleKey: 'admin', permKey: 'branches.manage' },
    { roleKey: 'admin', permKey: 'departments.view' },
    { roleKey: 'admin', permKey: 'departments.manage' },
    // Auctions / KYC / sellers / finance / support / logs
    { roleKey: 'admin', permKey: 'auctions.view_all' },
    { roleKey: 'admin', permKey: 'auctions.manage' },
    { roleKey: 'admin', permKey: 'auctions.settle' },
    { roleKey: 'admin', permKey: 'auctions.disputes.handle' },
    { roleKey: 'admin', permKey: 'kyc.review' },
    { roleKey: 'admin', permKey: 'kyc.approve' },
    { roleKey: 'admin', permKey: 'sellers.onboard.approve' },
    { roleKey: 'admin', permKey: 'sellers.disputes.handle' },
    { roleKey: 'admin', permKey: 'finance.view' },
    { roleKey: 'admin', permKey: 'finance.refunds.approve' },
    { roleKey: 'admin', permKey: 'finance.payouts.manage' },
    { roleKey: 'admin', permKey: 'support.tickets.manage' },
    { roleKey: 'admin', permKey: 'support.chat.manage' },
    { roleKey: 'admin', permKey: 'logs.view' },

    // --- Finance manager (referral/finance focused) ---
    { roleKey: 'finance_manager', permKey: 'referral.history.view_all' },
    { roleKey: 'finance_manager', permKey: 'referral.payout.approve' },
    { roleKey: 'finance_manager', permKey: 'wallet.referral.view' },
    { roleKey: 'finance_manager', permKey: 'finance.view' },
    { roleKey: 'finance_manager', permKey: 'finance.refunds.approve' },
    { roleKey: 'finance_manager', permKey: 'finance.payouts.manage' },

    // --- AI fraud officer (referral + fraud controls) ---
    { roleKey: 'ai_fraud_officer', permKey: 'referral.history.view_all' },
    { roleKey: 'ai_fraud_officer', permKey: 'referral.bonus.freeze' },
    { roleKey: 'ai_fraud_officer', permKey: 'logs.view' },
    { roleKey: 'ai_fraud_officer', permKey: 'logs.audit.view' },
    { roleKey: 'ai_fraud_officer', permKey: 'fraud.alerts.review' },
    { roleKey: 'ai_fraud_officer', permKey: 'fraud.users.block' },

    // --- Department heads ---
    // Operations: auctions + winners + disputes
    { roleKey: 'operations_head', permKey: 'auctions.view_all' },
    { roleKey: 'operations_head', permKey: 'auctions.manage' },
    { roleKey: 'operations_head', permKey: 'auctions.settle' },
    { roleKey: 'operations_head', permKey: 'auctions.disputes.handle' },

    // Seller management: onboarding, KYC, seller disputes
    { roleKey: 'seller_mgmt_head', permKey: 'kyc.review' },
    { roleKey: 'seller_mgmt_head', permKey: 'kyc.approve' },
    { roleKey: 'seller_mgmt_head', permKey: 'sellers.onboard.approve' },
    { roleKey: 'seller_mgmt_head', permKey: 'sellers.disputes.handle' },

    // Buyer support: tickets, chat, some KYC support
    { roleKey: 'buyer_support_head', permKey: 'support.tickets.manage' },
    { roleKey: 'buyer_support_head', permKey: 'support.chat.manage' },
    { roleKey: 'buyer_support_head', permKey: 'kyc.review' },

    // Finance head: finance module
    { roleKey: 'finance_head', permKey: 'finance.view' },
    { roleKey: 'finance_head', permKey: 'finance.refunds.approve' },
    { roleKey: 'finance_head', permKey: 'finance.payouts.manage' },

    // Compliance head: logs + fraud
    { roleKey: 'compliance_head', permKey: 'logs.view' },
    { roleKey: 'compliance_head', permKey: 'logs.audit.view' },
    { roleKey: 'compliance_head', permKey: 'fraud.alerts.review' },
    { roleKey: 'compliance_head', permKey: 'fraud.users.block' },

    // Technical head: visibility into logs
    { roleKey: 'technical_head', permKey: 'logs.view' },

    // --- Department staff (lighter access) ---
    // Operations staff: view + manage auctions but no settle/disputes
    { roleKey: 'operations_staff', permKey: 'auctions.view_all' },
    { roleKey: 'operations_staff', permKey: 'auctions.manage' },

    // Seller management staff: KYC review, seller disputes assist
    { roleKey: 'seller_mgmt_staff', permKey: 'kyc.review' },
    { roleKey: 'seller_mgmt_staff', permKey: 'sellers.disputes.handle' },

    // Buyer support staff: support tickets/chat
    { roleKey: 'buyer_support_staff', permKey: 'support.tickets.manage' },
    { roleKey: 'buyer_support_staff', permKey: 'support.chat.manage' },

    // Finance staff: read-only finance + assist refunds
    { roleKey: 'finance_staff', permKey: 'finance.view' },

    // Compliance staff: view logs and fraud alerts
    { roleKey: 'compliance_staff', permKey: 'logs.view' },
    { roleKey: 'compliance_staff', permKey: 'fraud.alerts.review' },

    // Technical staff: basic logs
    { roleKey: 'technical_staff', permKey: 'logs.view' },

    // --- Branch-level ---
    // Branch manager: local auctions/staff/finance (scope enforced elsewhere)
    { roleKey: 'branch_manager', permKey: 'auctions.view_all' },
    { roleKey: 'branch_manager', permKey: 'auctions.manage' },
    { roleKey: 'branch_manager', permKey: 'staff.view' },
    { roleKey: 'branch_manager', permKey: 'finance.view' },
    { roleKey: 'branch_manager', permKey: 'finance.refunds.approve' },

    // Branch staff: limited auctions only
    { roleKey: 'branch_staff', permKey: 'auctions.view_all' },
    { roleKey: 'marketing', permKey: 'marketing.campaigns.view' },
    { roleKey: 'marketing', permKey: 'marketing.analytics.view' },
    { roleKey: 'sales', permKey: 'sales.leads.view' },
    { roleKey: 'sales', permKey: 'sales.leads.manage' },
    { roleKey: 'campaigns', permKey: 'campaigns.launches.view' },
    { roleKey: 'campaigns', permKey: 'campaigns.performance.view' },
    { roleKey: 'admin', permKey: 'product.verify' },
  ];

  for (const m of mappings) {
    const role = roleDocs[m.roleKey];
    const perm = permDocs[m.permKey];
    if (!role || !perm) continue;

    await RolePermission.findOneAndUpdate(
      { roleId: role._id, permissionId: perm._id },
      { $setOnInsert: { allowed: true } },
      { upsert: true, new: true }
    );
  }

  console.log('RBAC seeding complete');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('RBAC seeding failed', err);
  process.exit(1);
});
