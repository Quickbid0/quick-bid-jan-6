import { supabaseAdmin } from '../../../supabaseAdmin';

export interface MarketingCampaignRecord {
  id: string;
  title: string;
  audience: string;
  budget: number;
  content: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
}

const ensureSupabase = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase client missing');
  }
  return supabaseAdmin as any;
};

export const createCampaign = async (payload: Omit<MarketingCampaignRecord, 'id' | 'created_at'>) => {
  const client = ensureSupabase();
  const { data, error } = await client.from('marketing_campaigns').insert(payload).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const getCampaigns = async () => {
  const client = ensureSupabase();
  const { data, error } = await client.from('marketing_campaigns').select('*').order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data || [];
};

export const getCampaignById = async (id: string) => {
  const client = ensureSupabase();
  const { data, error } = await client.from('marketing_campaigns').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('Campaign not found');
  }
  return data;
};

export const updateCampaign = async (id: string, payload: Partial<Omit<MarketingCampaignRecord, 'id' | 'created_at'>>) => {
  const client = ensureSupabase();
  const { data, error } = await client.from('marketing_campaigns').update(payload).eq('id', id).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const deleteCampaign = async (id: string) => {
  const client = ensureSupabase();
  const { error } = await client.from('marketing_campaigns').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return true;
};
