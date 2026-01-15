import { supabaseAdmin } from '../../../supabaseAdmin';

export interface SalesLeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'converted' | 'lost';
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesDashboardSummary {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  leadsOverTime: { date: string; count: number }[];
  latestNotes: { id: string; leadId: string; note?: string; updated_at: string }[];
}

const ensureSupabase = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured');
  }
  return supabaseAdmin as any;
};

const getLeadCount = async (status?: SalesLeadRecord['status']) => {
  const client = ensureSupabase();
  const query = client.from('sales_leads').select('id', { head: true, count: 'exact' });
  if (status) {
    query.eq('status', status);
  }
  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
};

export const getDashboardSummary = async (): Promise<SalesDashboardSummary> => {
  const client = ensureSupabase();

  const [totalLeads, activeLeads, convertedLeads] = await Promise.all([
    getLeadCount(),
    getLeadCount('active'),
    getLeadCount('converted'),
  ]);

  const { data: overTimeData, error: overTimeError } = await client.rpc('get_lead_counts_by_day');
  if (overTimeError) {
    throw overTimeError;
  }

  const { data: latestLeads, error: latestError } = await client
    .from('sales_leads')
    .select('id, name, notes, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (latestError) {
    throw latestError;
  }

  return {
    totalLeads,
    activeLeads,
    convertedLeads,
    leadsOverTime: overTimeData || [],
    latestNotes:
      latestLeads?.map((lead: any) => ({
        id: lead.id,
        leadId: lead.id,
        note: lead.notes,
        updated_at: lead.updated_at,
      })) || [],
  };
};

export const listSalesLeads = async (params: { limit?: number; offset?: number; status?: string }) => {
  const client = ensureSupabase();
  const query = client.from('sales_leads').select('*', { count: 'exact' });

  if (params.status) {
    query.eq('status', params.status);
  }
  if (params.limit) {
    query.limit(params.limit);
  }
  if (params.offset) {
    const limit = params.limit || 20;
    query.range(params.offset, params.offset + limit - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  return {
    items: data || [],
    total: count || 0,
  };
};

export const createSalesLead = async (payload: Omit<SalesLeadRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const client = ensureSupabase();
  const { data, error } = await client.from('sales_leads').insert(payload).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const updateSalesLead = async (id: string, payload: Partial<Omit<SalesLeadRecord, 'id'>>) => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('sales_leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const deleteSalesLead = async (id: string) => {
  const client = ensureSupabase();
  const { error } = await client.from('sales_leads').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
};
