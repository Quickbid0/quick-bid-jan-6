"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaign = exports.updateCampaign = exports.getCampaignById = exports.getCampaigns = exports.createCampaign = void 0;
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const ensureSupabase = () => {
    if (!supabaseAdmin_1.supabaseAdmin) {
        throw new Error('Supabase client missing');
    }
    return supabaseAdmin_1.supabaseAdmin;
};
const createCampaign = async (payload) => {
    const client = ensureSupabase();
    const { data, error } = await client.from('marketing_campaigns').insert(payload).select().single();
    if (error) {
        throw error;
    }
    return data;
};
exports.createCampaign = createCampaign;
const getCampaigns = async () => {
    const client = ensureSupabase();
    const { data, error } = await client.from('marketing_campaigns').select('*').order('created_at', { ascending: false });
    if (error) {
        throw error;
    }
    return data || [];
};
exports.getCampaigns = getCampaigns;
const getCampaignById = async (id) => {
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
exports.getCampaignById = getCampaignById;
const updateCampaign = async (id, payload) => {
    const client = ensureSupabase();
    const { data, error } = await client.from('marketing_campaigns').update(payload).eq('id', id).select().single();
    if (error) {
        throw error;
    }
    return data;
};
exports.updateCampaign = updateCampaign;
const deleteCampaign = async (id) => {
    const client = ensureSupabase();
    const { error } = await client.from('marketing_campaigns').delete().eq('id', id);
    if (error) {
        throw error;
    }
    return true;
};
exports.deleteCampaign = deleteCampaign;
