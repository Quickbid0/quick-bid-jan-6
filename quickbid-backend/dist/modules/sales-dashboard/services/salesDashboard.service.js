"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalesLead = exports.updateSalesLead = exports.createSalesLead = exports.listSalesLeads = exports.getDashboardSummary = void 0;
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const ensureSupabase = () => {
    if (!supabaseAdmin_1.supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    return supabaseAdmin_1.supabaseAdmin;
};
const getLeadCount = async (status) => {
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
const getDashboardSummary = async () => {
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
        latestNotes: latestLeads?.map((lead) => ({
            id: lead.id,
            leadId: lead.id,
            note: lead.notes,
            updated_at: lead.updated_at,
        })) || [],
    };
};
exports.getDashboardSummary = getDashboardSummary;
const listSalesLeads = async (params) => {
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
exports.listSalesLeads = listSalesLeads;
const createSalesLead = async (payload) => {
    const client = ensureSupabase();
    const { data, error } = await client.from('sales_leads').insert(payload).select().single();
    if (error) {
        throw error;
    }
    return data;
};
exports.createSalesLead = createSalesLead;
const updateSalesLead = async (id, payload) => {
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
exports.updateSalesLead = updateSalesLead;
const deleteSalesLead = async (id) => {
    const client = ensureSupabase();
    const { error } = await client.from('sales_leads').delete().eq('id', id);
    if (error) {
        throw error;
    }
    return true;
};
exports.deleteSalesLead = deleteSalesLead;
