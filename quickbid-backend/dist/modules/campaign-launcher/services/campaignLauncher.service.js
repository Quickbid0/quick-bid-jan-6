"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markScheduleExecuted = exports.scheduleCampaign = exports.logCampaignEvent = void 0;
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const ensureSupabase = () => {
    if (!supabaseAdmin_1.supabaseAdmin) {
        throw new Error('Supabase client missing');
    }
    return supabaseAdmin_1.supabaseAdmin;
};
const logCampaignEvent = async (log) => {
    const client = ensureSupabase();
    const { data, error } = await client.from('campaign_logs').insert(log).select().single();
    if (error) {
        throw error;
    }
    return data;
};
exports.logCampaignEvent = logCampaignEvent;
const scheduleCampaign = async (campaignId, scheduledAt) => {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('campaign_schedule')
        .insert({ campaign_id: campaignId, scheduled_at: scheduledAt, status: 'scheduled' })
        .select()
        .single();
    if (error) {
        throw error;
    }
    await (0, exports.logCampaignEvent)({ campaign_id: campaignId, status: 'scheduled', payload: { scheduledAt } });
    return data;
};
exports.scheduleCampaign = scheduleCampaign;
const markScheduleExecuted = async (scheduleId) => {
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
exports.markScheduleExecuted = markScheduleExecuted;
