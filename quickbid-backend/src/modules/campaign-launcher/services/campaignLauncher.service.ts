import { supabaseAdmin } from '../../../supabaseAdmin';

export interface CampaignScheduleRecord {
  id: string;
  campaign_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'executed' | 'failed';
  created_at: string;
}

export interface CampaignLogRecord {
  id: string;
  campaign_id: string;
  status: 'launched' | 'scheduled' | 'failed';
  payload: Record<string, unknown>;
  created_at: string;
}

const ensureSupabase = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase client missing');
  }
  return supabaseAdmin as any;
};

export const logCampaignEvent = async (log: Omit<CampaignLogRecord, 'id' | 'created_at'>) => {
  const client = ensureSupabase();
  const { data, error } = await client.from('campaign_logs').insert(log).select().single();
  if (error) {
    throw error;
  }
  return data;
};

export const scheduleCampaign = async (campaignId: string, scheduledAt: string) => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('campaign_schedule')
    .insert({ campaign_id: campaignId, scheduled_at: scheduledAt, status: 'scheduled' })
    .select()
    .single();
  if (error) {
    throw error;
  }
  await logCampaignEvent({ campaign_id: campaignId, status: 'scheduled', payload: { scheduledAt } });
  return data;
};

export const markScheduleExecuted = async (scheduleId: string) => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('campaign_schedule')
    .update({ status: 'executed' })
    .eq('id', scheduleId)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};
