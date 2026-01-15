import React, { useEffect, useState } from 'react';
import { adsService, SponsorPayload, AdSlotPayload } from '../../services/adsService';
import { toast } from 'react-hot-toast';

interface CampaignForm {
  campaignId?: string;
  sponsorId: string;
  slotIds: string[];
  creativeUrl: string;
  startDate: string;
  endDate: string;
  impressionCap?: number;
  eventIdsText: string;
  pricingModel: 'flat' | 'cpm' | 'cpc';
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed';
}

const emptyCampaign: CampaignForm = {
  sponsorId: '',
  slotIds: [],
  creativeUrl: '',
  startDate: '',
  endDate: '',
  impressionCap: undefined,
  eventIdsText: '',
  pricingModel: 'flat',
  status: 'draft',
};

const AdminCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyCampaign);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingError, setApprovingError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [camps, spons, sl] = await Promise.all([
        adsService.listCampaigns(),
        adsService.listSponsors(),
        adsService.listAdSlots(),
      ]);
      setCampaigns(camps);
      setSponsors(spons);
      setSlots(sl);
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(refreshCampaigns, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshCampaigns = async () => {
    try {
      const camps = await adsService.listCampaigns();
      setCampaigns(camps);
    } catch (e) {
      console.error('failed refresh campaigns', e);
    }
  };

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_ADS_WS_URL;
    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);
    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'campaign_update' && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error('campaign ws parse', err);
      }
    };

    socket.addEventListener('message', onMessage);
    socket.addEventListener('error', () => setWsError('Live updates unavailable (ws error).'));
    socket.addEventListener('close', () => setWsError('Campaign websocket disconnected.'));

    return () => {
      socket.removeEventListener('message', onMessage);
      socket.close();
    };
  }, []);

  const handleEdit = (c: any) => {
    setEditingId(c.campaignId);
    setForm({
      campaignId: c.campaignId,
      sponsorId: c.sponsorId,
      slotIds: (c.slotIds || []).map((id: any) => id.toString()),
      creativeUrl: c.creativeUrl,
      startDate: c.startDate ? c.startDate.slice(0, 16) : '',
      endDate: c.endDate ? c.endDate.slice(0, 16) : '',
      impressionCap: c.impressionCap,
      eventIdsText: (c.eventIds || []).join(','),
      pricingModel: c.pricingModel || 'flat',
      status: c.status || 'draft',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await adsService.deleteCampaign(id);
      toast.success('Campaign deleted');
      loadAll();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to delete campaign');
    }
  };

  const handleStatusChange = async (id: string, status: CampaignForm['status']) => {
    try {
      await adsService.updateCampaign(id, { status });
      toast.success(`Campaign ${status}`);
      loadAll();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to update status');
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    setApprovingError(null);
    try {
      await adsService.updateCampaign(id, { status: 'active' });
      toast.success('Campaign approved');
      loadAll();
    } catch (e) {
      console.error('approve error', e);
      setApprovingError((e as Error).message || 'Unable to approve campaign');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setApprovingId(id);
    setApprovingError(null);
    try {
      await adsService.updateCampaign(id, { status: 'paused' });
      toast.success('Campaign marked as paused');
      loadAll();
    } catch (e) {
      console.error('reject error', e);
      setApprovingError((e as Error).message || 'Unable to pause campaign');
    } finally {
      setApprovingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sponsorId) {
      toast.error('Select a sponsor');
      return;
    }
    if (!form.slotIds.length) {
      toast.error('Select at least one slot');
      return;
    }
    if (!form.creativeUrl) {
      toast.error('Provide a creative URL');
      return;
    }
    try {
      setSaving(true);
      const payload: any = {
        sponsorId: form.sponsorId,
        slotIds: form.slotIds,
        creativeUrl: form.creativeUrl,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        impressionCap: form.impressionCap,
        eventIds: form.eventIdsText
          ? form.eventIdsText
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
        pricingModel: form.pricingModel,
        status: form.status,
      };

      if (editingId) {
        await adsService.updateCampaign(editingId, payload);
        toast.success('Campaign updated');
      } else {
        await adsService.createCampaign(payload);
        toast.success('Campaign created');
      }

      setForm(emptyCampaign);
      setEditingId(null);
      loadAll();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const selectedSponsor = sponsors.find((s) => s.sponsorId === form.sponsorId) as SponsorPayload | undefined;
  const pendingCampaigns = campaigns.filter((c) => c.status === 'pending' || c.status === 'review');
  const liveCampaigns = campaigns.filter((c) => c.status === 'active');
  const liveSpendTotal = liveCampaigns.reduce((sum, campaign) => sum + (campaign.totalSpend || 0), 0);
  const pendingBudget = pendingCampaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ad Campaigns</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <div className="mb-4 space-y-1">
              <h2 className="text-lg font-semibold">Existing Campaigns</h2>
              <p className="text-xs text-gray-500">Approve reviews, pause live spend, and keep the funnel moving.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <Card label="Pending approvals" value={pendingCampaigns.length} description={`Budget ₹${pendingBudget.toLocaleString()}`} />
              <Card label="Live spend" value={`₹${liveSpendTotal.toLocaleString()}`} description={`${liveCampaigns.length} live`} />
              <Card label="Live campaigns" value={liveCampaigns.length} description="Active slots" />
            </div>
            {approvingError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {approvingError}
              </div>
            )}
            {wsError && (
              <div className="mb-2 text-xs text-red-600">{wsError}</div>
            )}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left">Sponsor</th>
                      <th className="py-2 text-left">Slots</th>
                      <th className="py-2 text-left">Period</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => {
                      const sponsor = sponsors.find((s) => s.sponsorId === c.sponsorId);
                      const isPending = ['pending', 'review'].includes(c.status);
                      return (
                        <tr key={c._id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 text-xs">
                            <div>{sponsor?.name || c.sponsorId}</div>
                            <div className="text-gray-500">{c.pricingModel}</div>
                          </td>
                          <td className="py-2 text-xs">
                            {(c.slotIds || []).length} slots
                          </td>
                          <td className="py-2 text-xs">
                            <div>{c.startDate?.slice(0, 10)} → {c.endDate?.slice(0, 10)}</div>
                          </td>
                          <td className="py-2 text-xs capitalize">{c.status}</td>
                          <td className="py-2 text-right space-x-2 text-xs">
                            <button
                              onClick={() => handleEdit(c)}
                              className="text-indigo-600 hover:underline"
                            >
                              Edit
                            </button>
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApprove(c.campaignId)}
                                  disabled={approvingId === c.campaignId}
                                  className="text-emerald-600 hover:underline"
                                >
                                  {approvingId === c.campaignId ? 'Approving…' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleReject(c.campaignId)}
                                  disabled={approvingId === c.campaignId}
                                  className="text-orange-600 hover:underline"
                                >
                                  {approvingId === c.campaignId ? 'Rejecting…' : 'Reject'}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(c.campaignId, c.status === 'active' ? 'paused' : 'active')}
                                className="text-emerald-600 hover:underline"
                              >
                                {c.status === 'active' ? 'Pause' : 'Activate'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c.campaignId)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Campaign' : 'New Campaign'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Step 1: Sponsor */}
              <div>
                <label className="block text-xs font-medium mb-1">Sponsor</label>
                <select
                  value={form.sponsorId}
                  onChange={(e) => setForm({ ...form, sponsorId: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                >
                  <option value="">Select sponsor</option>
                  {sponsors.map((s) => (
                    <option key={s.sponsorId} value={s.sponsorId}>
                      {s.name} ({s.packageTier})
                    </option>
                  ))}
                </select>
                {selectedSponsor && (
                  <div className="mt-1 text-[11px] text-gray-500">
                    Package: {selectedSponsor.packageTier}
                  </div>
                )}
              </div>

              {/* Step 2: Slots */}
              <div>
                <label className="block text-xs font-medium mb-1">Slots</label>
                <div className="border rounded px-2 py-1 max-h-32 overflow-y-auto text-xs space-y-1">
                  {slots.map((sl: any) => {
                    const checked = form.slotIds.includes(sl.slotId);
                    return (
                      <label key={sl.slotId} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(form.slotIds);
                            if (e.target.checked) next.add(sl.slotId);
                            else next.delete(sl.slotId);
                            setForm({ ...form, slotIds: Array.from(next) });
                          }}
                        />
                        <span>{sl.slotType} · {sl.durationSec}s · ₹{sl.priceAmount}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Creative & Targeting */}
              <div>
                <label className="block text-xs font-medium mb-1">Creative URL</label>
                <input
                  type="text"
                  value={form.creativeUrl}
                  onChange={(e) => setForm({ ...form, creativeUrl: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Impression Cap (optional)</label>
                <input
                  type="number"
                  value={form.impressionCap ?? ''}
                  onChange={(e) => setForm({ ...form, impressionCap: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Event IDs (comma separated, optional)</label>
                <input
                  type="text"
                  value={form.eventIdsText}
                  onChange={(e) => setForm({ ...form, eventIdsText: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>

              {/* Step 4: Pricing & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Pricing Model</label>
                  <select
                    value={form.pricingModel}
                    onChange={(e) => setForm({ ...form, pricingModel: e.target.value as CampaignForm['pricingModel'] })}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="flat">Flat</option>
                    <option value="cpm">CPM</option>
                    <option value="cpc">CPC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CampaignForm['status'] })}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 rounded text-sm mt-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ label: string; value: string | number; description?: string }> = ({ label, value, description }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    {description && <p className="text-[11px] text-gray-400">{description}</p>}
  </div>
);

export default AdminCampaigns;
