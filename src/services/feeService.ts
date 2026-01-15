import { supabase } from '../config/supabaseClient';

export type FeeContext = {
  productId?: string;
  orderId?: string;
  categoryId?: string | null;
  partnerId?: string | null;
  amountBase?: number; // e.g., final price for commission
};

export type FeeComponents = {
  commission?: number;
  listing?: number;
  convenience?: number;
  penalty?: number;
};

export class FeeService {
  // Find best active rule; simple priority: exact category -> partner -> latest active
  async getActiveRule(categoryId?: string | null, partnerId?: string | null): Promise<any | null> {
    const now = new Date().toISOString();
    // Try category scoped first
    const { data, error } = await supabase
      .from('fee_rules')
      .select('*')
      .eq('active', true)
      .lte('start_at', now)
      .or(`end_at.is.null,end_at.gt.${now}`)
      .eq('scope_category_id', categoryId || null)
      .order('start_at', { ascending: false })
      .limit(1);
    if (error) console.warn('fee_rules query (cat) error', error);
    if (data && data[0]) return data[0];

    // Try partner scoped
    const res2 = await supabase
      .from('fee_rules')
      .select('*')
      .eq('active', true)
      .lte('start_at', now)
      .or(`end_at.is.null,end_at.gt.${now}`)
      .eq('scope_partner_id', partnerId || '')
      .order('start_at', { ascending: false })
      .limit(1);
    if (res2.error) console.warn('fee_rules query (partner) error', res2.error);
    if (res2.data && res2.data[0]) return res2.data[0];

    // Fallback: latest active any
    const res3 = await supabase
      .from('fee_rules')
      .select('*')
      .eq('active', true)
      .lte('start_at', now)
      .or(`end_at.is.null,end_at.gt.${now}`)
      .order('start_at', { ascending: false })
      .limit(1);
    if (res3.error) console.warn('fee_rules query (any) error', res3.error);
    return (res3.data && res3.data[0]) || null;
  }

  // Calculate components based on rule and context
  calculateComponents(rule: any, ctx: FeeContext): FeeComponents {
    const components: FeeComponents = {};
    const base = ctx.amountBase || 0;
    if (rule) {
      if (rule.commission_percent && base > 0) {
        components.commission = Math.round((Number(rule.commission_percent) / 100) * base);
      }
      if (rule.listing_fee) components.listing = Number(rule.listing_fee);
      if (rule.convenience_fee) components.convenience = Number(rule.convenience_fee);
      if (rule.penalty_fee) components.penalty = Number(rule.penalty_fee);
    }
    return components;
  }

  total(components: FeeComponents): number {
    return ['commission', 'listing', 'convenience', 'penalty']
      .map(k => (components as any)[k] || 0)
      .reduce((a, b) => a + b, 0);
  }

  async recordApplication(ruleId: string | null, ctx: FeeContext, components: FeeComponents, actor: string = 'system'): Promise<void> {
    const total = this.total(components);
    await supabase.from('fee_applications').insert([{
      rule_id: ruleId,
      context_product_id: ctx.productId || null,
      context_order_id: ctx.orderId || null,
      components,
      total,
      actor,
    }]);
  }
}

export const feeService = new FeeService();
