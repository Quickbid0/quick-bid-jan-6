import { supabase } from '../config/supabaseClient';

export interface GrowthLeadEventPayload {
  interest: string;
  page?: string;
  eventType: string;
  metadata?: Record<string, any>;
}

export const trackGrowthLeadEvent = async (payload: GrowthLeadEventPayload) => {
  const { error } = await supabase.from('growth_lead_events').insert({
    interest: payload.interest,
    page: payload.page,
    event_type: payload.eventType,
    metadata: payload.metadata ?? {},
  });

  if (error) {
    console.warn('Growth lead event logging failed', error);
  }
};
