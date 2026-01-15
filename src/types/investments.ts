export type PlanType = 'fixed' | 'revenue_share';

export interface Investor {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  pan?: string;
  kyc_docs?: any;
  bank_account?: any;
  created_at?: string;
}

export interface Investment {
  id: string;
  investor_id: string;
  plan_type: PlanType;
  amount: string;
  tenure_months?: number | null;
  roi_percentage?: string | null;
  revenue_share_percentage?: string | null;
  target_return_percentage?: string | null;
  lock_in_until?: string | null;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  agreement_signed?: boolean;
  created_at?: string;
}
