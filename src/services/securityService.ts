// Security and Moderation Services
// Risk Detection Engine, Account Restrictions, Identity Verification, etc.

import { supabase } from '../config/supabaseClient';
import crypto from 'crypto';

// Types for Security System
export interface RiskEvent {
  userId: string;
  eventType: 'login_anomaly' | 'mass_reports' | 'sensitive_post' | 'device_change' | 'api_abuse' | 'policy_violation' | 'harassment' | 'fraud' | 'misinformation' | 'privacy_violation';
  severity: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface RiskScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface AccountRestriction {
  userId: string;
  restrictionType: 'warning' | 'visibility_limit' | 'temp_restrict' | 'verify_required' | 'suspend' | 'permanent_ban';
  reason: string;
  startAt: Date;
  endAt?: Date;
  appliedBy: string;
}

export interface IdentityVerification {
  userId: string;
  verificationType: 'aadhaar' | 'pan' | 'dl' | 'passport' | 'gst';
  status: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
  selfieUrl?: string;
  rejectionReason?: string;
}

export interface ContentReport {
  reporterId: string;
  reportedUserId: string;
  contentType: 'post' | 'comment' | 'auction' | 'profile' | 'product';
  contentId: string;
  reportReason: string;
  ipHash: string;
  deviceHash: string;
}

export interface AppealRequest {
  userId: string;
  restrictionId?: string;
  reportId?: string;
  explanation: string;
  evidenceUrls: string[];
  publicInterest: boolean;
  whistleblowerTag: boolean;
}

// Risk Scoring Rules Configuration
const RISK_SCORING_RULES = {
  login_anomaly: { severity: 'low', baseScore: 3 },
  device_change: { severity: 'medium', baseScore: 5 },
  mass_reports: { severity: 'high', baseScore: 15 },
  sensitive_post: { severity: 'high', baseScore: 10 },
  api_abuse: { severity: 'high', baseScore: 20 },
  policy_violation: { severity: 'medium', baseScore: 8 },
  harassment: { severity: 'medium', baseScore: 12 },
  fraud: { severity: 'high', baseScore: 25 },
  misinformation: { severity: 'medium', baseScore: 6 },
  privacy_violation: { severity: 'high', baseScore: 18 }
} as const;

// Security Service Class
export class SecurityService {
  private static instance: SecurityService;

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // 1. Risk Detection Engine
  async logRiskEvent(event: RiskEvent): Promise<void> {
    try {
      // Hash IP for privacy
      const ipHash = event.ipAddress ? crypto.createHash('sha256').update(event.ipAddress).digest('hex') : null;

      // Insert security event
      const { error: eventError } = await supabase
        .from('security_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          severity: event.severity,
          metadata: event.metadata || {},
          ip_address: event.ipAddress,
          user_agent: event.userAgent
        });

      if (eventError) {
        console.error('Failed to log security event:', eventError);
        return;
      }

      // Update risk score automatically
      await this.updateUserRiskScore(event.userId);

      // Check for critical violations that need immediate action
      if (event.severity === 'high' && ['fraud', 'api_abuse', 'mass_reports'].includes(event.eventType)) {
        await this.applyAutomaticRestriction(event.userId, event.eventType);
      }

    } catch (error) {
      console.error('Error logging risk event:', error);
    }
  }

  async getUserRiskScore(userId: string): Promise<RiskScore> {
    try {
      // Get security events from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error } = await supabase
        .from('security_events')
        .select('event_type, severity, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching security events:', error);
        return { score: 0, level: 'low', factors: [] };
      }

      let totalScore = 0;
      const factors: string[] = [];

      events.forEach((event: any) => {
        const rule = RISK_SCORING_RULES[event.event_type as keyof typeof RISK_SCORING_RULES];
        if (rule) {
          let eventScore = rule.baseScore;

          // Apply severity multiplier
          switch (event.severity) {
            case 'low': eventScore *= 1; break;
            case 'medium': eventScore *= 2; break;
            case 'high': eventScore *= 3; break;
          }

          totalScore += eventScore;
          factors.push(`${event.event_type} (${event.severity})`);
        }
      });

      // Determine risk level
      let level: RiskScore['level'] = 'low';
      if (totalScore >= 100) level = 'critical';
      else if (totalScore >= 50) level = 'high';
      else if (totalScore >= 20) level = 'medium';

      return { score: totalScore, level, factors };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return { score: 0, level: 'low', factors: [] };
    }
  }

  private async updateUserRiskScore(userId: string): Promise<void> {
    try {
      const riskScore = await this.getUserRiskScore(userId);

      // Update user security status
      const { error } = await supabase
        .from('user_security_status')
        .upsert({
          user_id: userId,
          risk_score: riskScore.score,
          risk_level: riskScore.level,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating user risk score:', error);
      }
    } catch (error) {
      console.error('Error updating risk score:', error);
    }
  }

  // 2. Account Restrictions
  async applyRestriction(restriction: AccountRestriction): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('account_restrictions')
        .insert({
          user_id: restriction.userId,
          restriction_type: restriction.restrictionType,
          reason: restriction.reason,
          applied_by: restriction.appliedBy,
          start_at: restriction.startAt.toISOString(),
          end_at: restriction.endAt?.toISOString(),
          is_active: true
        });

      if (error) {
        console.error('Error applying restriction:', error);
        return false;
      }

      // Update user security status
      const isRestricted = restriction.restrictionType !== 'warning';
      await supabase
        .from('user_security_status')
        .upsert({
          user_id: restriction.userId,
          is_restricted: isRestricted,
          restriction_reason: restriction.reason,
          restricted_at: restriction.startAt.toISOString(),
          restriction_expires_at: restriction.endAt?.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Log security event
      await this.logSecurityEvent(restriction.userId, 'Restriction applied', {
        restrictionType: restriction.restrictionType,
        reason: restriction.reason,
        appliedBy: restriction.appliedBy
      });

      return true;
    } catch (error) {
      console.error('Error applying restriction:', error);
      return false;
    }
  }

  async applyAutomaticRestriction(userId: string, triggerEvent: string): Promise<void> {
    const restriction: AccountRestriction = {
      userId,
      restrictionType: 'temp_restrict',
      reason: `Automatic restriction due to ${triggerEvent}`,
      startAt: new Date(),
      endAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      appliedBy: 'system'
    };

    await this.applyRestriction(restriction);
  }

  async liftRestriction(userId: string, adminId: string, notes?: string): Promise<boolean> {
    try {
      // Update active restrictions
      const { error: updateError } = await supabase
        .from('account_restrictions')
        .update({
          is_active: false,
          end_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (updateError) {
        console.error('Error lifting restriction:', updateError);
        return false;
      }

      // Update user security status
      const { error: statusError } = await supabase
        .from('user_security_status')
        .update({
          is_restricted: false,
          restriction_reason: null,
          restricted_at: null,
          restriction_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (statusError) {
        console.error('Error updating security status:', statusError);
      }

      // Log admin action
      await this.logAdminAction(adminId, 'restrict', {
        action: 'lift_restriction',
        targetUserId: userId,
        notes: notes || 'Restriction lifted by admin'
      });

      return true;
    } catch (error) {
      console.error('Error lifting restriction:', error);
      return false;
    }
  }

  // 3. Identity Verification
  async submitIdentityVerification(verification: IdentityVerification): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('identity_verifications')
        .insert({
          user_id: verification.userId,
          verification_type: verification.verificationType,
          document_url: verification.documentUrl,
          selfie_url: verification.selfieUrl,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting identity verification:', error);
        return false;
      }

      // Update user security status to require verification
      await supabase
        .from('user_security_status')
        .upsert({
          user_id: verification.userId,
          verification_required: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      return true;
    } catch (error) {
      console.error('Error submitting identity verification:', error);
      return false;
    }
  }

  async reviewIdentityVerification(
    verificationId: string,
    adminId: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('identity_verifications')
        .update({
          status,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? notes : null
        })
        .eq('id', verificationId);

      if (error) {
        console.error('Error reviewing identity verification:', error);
        return false;
      }

      // If verified, update user status
      if (status === 'verified') {
        const { data: verification } = await supabase
          .from('identity_verifications')
          .select('user_id')
          .eq('id', verificationId)
          .single();

        if (verification) {
          await supabase
            .from('user_security_status')
            .update({
              verification_required: false,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', verification.user_id);
        }
      }

      // Log admin action
      await this.logAdminAction(adminId, 'verify', {
        action: status === 'verified' ? 'approve_identity' : 'reject_identity',
        targetVerificationId: verificationId,
        notes: notes || `${status} identity verification`
      });

      return true;
    } catch (error) {
      console.error('Error reviewing identity verification:', error);
      return false;
    }
  }

  // 4. Content Reporting System
  async submitReport(report: ContentReport): Promise<boolean> {
    try {
      // Check for coordinated reporting (same IP/device reporting multiple times)
      const { data: existingReports } = await supabase
        .from('content_reports')
        .select('id')
        .eq('ip_hash', report.ipHash)
        .eq('reported_user_id', report.reportedUserId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      const isCoordinated = (existingReports?.length || 0) > 3;

      // Calculate report weight (reduce for suspicious patterns)
      let reportWeight = 1;
      if (isCoordinated) reportWeight = 0.5;

      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: report.reporterId,
          reported_user_id: report.reportedUserId,
          content_type: report.contentType,
          content_id: report.contentId,
          report_reason: report.reportReason,
          report_weight: reportWeight,
          ip_hash: report.ipHash,
          device_hash: report.deviceHash,
          is_coordinated: isCoordinated,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting report:', error);
        return false;
      }

      // Check if this triggers automatic action
      await this.checkReportThreshold(report.reportedUserId);

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      return false;
    }
  }

  private async checkReportThreshold(reportedUserId: string): Promise<void> {
    try {
      // Count recent reports
      const { count } = await supabase
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('reported_user_id', reportedUserId)
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if ((count || 0) >= 5) {
        // Trigger risk event for mass reports
        await this.logRiskEvent({
          userId: reportedUserId,
          eventType: 'mass_reports',
          severity: 'high',
          metadata: { reportCount: count }
        });
      }
    } catch (error) {
      console.error('Error checking report threshold:', error);
    }
  }

  // 5. Appeal System
  async submitAppeal(appeal: AppealRequest): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_appeals')
        .insert({
          user_id: appeal.userId,
          related_restriction_id: appeal.restrictionId,
          related_report_id: appeal.reportId,
          appeal_type: appeal.restrictionId ? 'restriction_appeal' : 'content_removal_appeal',
          explanation: appeal.explanation,
          evidence_urls: appeal.evidenceUrls,
          public_interest: appeal.publicInterest,
          whistleblower_tag: appeal.whistleblowerTag,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting appeal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error submitting appeal:', error);
      return false;
    }
  }

  async reviewAppeal(
    appealId: string,
    adminId: string,
    decision: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_appeals')
        .update({
          status: decision,
          admin_notes: adminNotes,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          decision: decision === 'approved' ? 'restore' : 'keep_restricted'
        })
        .eq('id', appealId);

      if (error) {
        console.error('Error reviewing appeal:', error);
        return false;
      }

      // If appeal approved, lift restriction
      if (decision === 'approved') {
        const { data: appeal } = await supabase
          .from('content_appeals')
          .select('user_id, related_restriction_id')
          .eq('id', appealId)
          .single();

        if (appeal && appeal.related_restriction_id) {
          await this.liftRestriction(appeal.user_id, adminId, 'Appeal approved');
        }
      }

      // Log admin action
      await this.logAdminAction(adminId, 'appeal', {
        action: decision === 'approved' ? 'approve_appeal' : 'reject_appeal',
        targetAppealId: appealId,
        notes: adminNotes || `Appeal ${decision}`
      });

      return true;
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      return false;
    }
  }

  // 6. Transparency Logs
  async logSecurityEvent(
    userId: string,
    message: string,
    category: 'login' | 'restriction' | 'verification' | 'appeal' | 'report' = 'general',
    relatedEventId?: string,
    relatedRestrictionId?: string,
    relatedAppealId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('user_security_logs')
        .insert({
          user_id: userId,
          message,
          category,
          related_event_id: relatedEventId,
          related_restriction_id: relatedRestrictionId,
          related_appeal_id: relatedAppealId,
          visible_to_user: true
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // 7. Admin Action Logging
  async logAdminAction(
    adminId: string,
    actionType: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('admin_moderation_actions')
        .insert({
          admin_id: adminId,
          action_type: actionType,
          target_user_id: details.targetUserId,
          target_content_id: details.targetContentId,
          target_content_type: details.targetContentType,
          notes: details.notes,
          severity: details.severity || 'medium'
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // 8. Check User Access Permissions
  async checkUserAccess(userId: string): Promise<{
    canPost: boolean;
    canBid: boolean;
    canComment: boolean;
    restrictions: any[];
    verificationRequired: boolean;
    restrictionMessage?: string;
  }> {
    try {
      // Get user security status
      const { data: securityStatus } = await supabase
        .from('user_security_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get active restrictions
      const { data: restrictions } = await supabase
        .from('account_restrictions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('start_at', { ascending: false });

      const activeRestrictions = restrictions || [];
      const isRestricted = securityStatus?.is_restricted || activeRestrictions.length > 0;
      const verificationRequired = securityStatus?.verification_required || false;

      let canPost = true;
      let canBid = true;
      let canComment = true;
      let restrictionMessage: string | undefined;

      if (isRestricted) {
        const highestRestriction = activeRestrictions[0];
        if (highestRestriction) {
          restrictionMessage = `Your account is temporarily restricted due to: ${highestRestriction.reason}`;

          // Determine permissions based on restriction type
          switch (highestRestriction.restriction_type) {
            case 'temp_restrict':
            case 'suspend':
              canPost = false;
              canBid = false;
              canComment = false;
              break;
            case 'visibility_limit':
              canPost = true; // Posts are limited but allowed
              canBid = true;
              canComment = true;
              break;
            case 'warning':
              // Full access but with warning
              break;
          }
        }
      }

      if (verificationRequired) {
        restrictionMessage = (restrictionMessage ? restrictionMessage + '. ' : '') +
          'Identity verification is required to continue using all features.';
      }

      return {
        canPost,
        canBid,
        canComment,
        restrictions: activeRestrictions,
        verificationRequired,
        restrictionMessage
      };
    } catch (error) {
      console.error('Error checking user access:', error);
      return {
        canPost: true,
        canBid: true,
        canComment: true,
        restrictions: [],
        verificationRequired: false
      };
    }
  }

  // 9. Legal Compliance Checks (IT Act, IT Rules, etc.)
  async performComplianceCheck(userId: string, action: string): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check user security status
      const { data: securityStatus } = await supabase
        .from('user_security_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      // IT Act 2000 compliance
      if (securityStatus?.risk_level === 'critical') {
        violations.push('IT Act 2000: High-risk user activity detected');
        recommendations.push('Require identity verification under IT Rules 2021');
      }

      // RBI Fair Practices compliance (for financial auctions)
      if (action === 'bid' && securityStatus?.verification_required) {
        violations.push('RBI Fair Practices: Unverified user attempting financial transaction');
        recommendations.push('Block transaction until identity verification');
      }

      // Consumer Protection Act compliance
      if (securityStatus?.is_restricted) {
        recommendations.push('Consumer Protection Act: Provide clear appeal process');
      }

      return {
        compliant: violations.length === 0,
        violations,
        recommendations
      };
    } catch (error) {
      console.error('Error performing compliance check:', error);
      return {
        compliant: true,
        violations: [],
        recommendations: []
      };
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
