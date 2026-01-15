import { supabase } from '../config/supabaseClient';

// Types aligned with current admin_audit_log table (supabase/migrations/20991231000000_wallet_escrow_ledger.sql)
export type AdminAuditTargetType =
  | 'user'
  | 'auction'
  | 'listing'
  | 'order'
  | 'wallet'
  | 'payment'
  | 'ticket'
  | 'policy_config'
  | 'system';

export interface AdminAuditEventInput {
  actionType: string; // e.g. 'KYC_APPROVE', 'KYC_REJECT', 'AUCTION_PAUSE'
  targetType?: AdminAuditTargetType | string; // stored as text in DB
  targetId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

/**
 * Minimal helper to log admin actions into public.admin_audit_log via Supabase.
 *
 * Table columns (from migration):
 * - id uuid primary key default gen_random_uuid()
 * - actor_id uuid references auth.users (id)
 * - action_type text not null
 * - target_type text
 * - target_id text
 * - before_state jsonb
 * - after_state jsonb
 * - created_at timestamptz not null default timezone('utc', now())
 */
export async function logAdminEvent(input: AdminAuditEventInput): Promise<void> {
  const {
    actionType,
    targetType = null,
    targetId = null,
    beforeState = null,
    afterState = null,
  } = input;

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn('adminAudit.logAdminEvent: failed to get session', sessionError.message);
      return;
    }

    const actorId = sessionData?.session?.user?.id;
    if (!actorId) {
      console.warn('adminAudit.logAdminEvent: no authenticated admin user');
      return;
    }

    const { error } = await supabase.from('admin_audit_log').insert({
      actor_id: actorId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      before_state: beforeState,
      after_state: afterState,
    });

    if (error) {
      console.warn('adminAudit.logAdminEvent: insert failed', error.message);
    }
  } catch (e: any) {
    console.warn('adminAudit.logAdminEvent: unexpected error', e?.message || e);
  }
}
