import React, { useEffect, useState } from 'react';
import { adsService } from '../../services/adsService';
import { toast } from 'react-hot-toast';
import { DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Invoice {
  invoiceId: string;
  sponsorId: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt?: string;
}

const AdminAdBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filters, setFilters] = useState({ sponsorId: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sponsorId: '', campaignIds: [] as string[], dueDate: '' });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [invs, spons, camps] = await Promise.all([
        adsService.listInvoices(filters.sponsorId),
        adsService.listSponsors(),
        adsService.listCampaigns(),
      ]);
      setInvoices(invs || []);
      setSponsors(spons || []);
      setCampaigns(camps || []);
    } catch (e) {
      console.error('Failed to load billing data', e);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [filters.sponsorId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sponsorId || !form.campaignIds.length || !form.dueDate) {
      toast.error('Sponsor, campaigns, and due date are required');
      return;
    }
    try {
      setSaving(true);
      await adsService.createInvoice({
        sponsorId: form.sponsorId,
        campaignIds: form.campaignIds,
        dueDate: form.dueDate,
      });
      toast.success('Invoice created');
      setForm({ sponsorId: '', campaignIds: [], dueDate: '' });
      loadAll();
    } catch (e) {
      console.error('Failed to create invoice', e);
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await adsService.markInvoicePaid(invoiceId);
      toast.success('Invoice marked as paid');
      loadAll();
    } catch (e) {
      console.error('Failed to mark invoice paid', e);
      toast.error('Failed to update invoice');
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    !filters.status || inv.status === filters.status
  );

  const getSponsorName = (id: string) => sponsors.find((s) => s.sponsorId === id)?.name || id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ads Billing & Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage sponsorship invoices and payment status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h2>
              <div className="flex gap-2">
                <select
                  value={filters.sponsorId}
                  onChange={(e) => setFilters({ ...filters, sponsorId: e.target.value })}
                  className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">All sponsors</option>
                  {sponsors.map((s) => (
                    <option key={s.sponsorId} value={s.sponsorId}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-sm text-gray-500 py-8">
                No invoices yet. Generate one from the form on the right.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left">Invoice</th>
                      <th className="py-2 text-left">Sponsor</th>
                      <th className="py-2 text-left">Amount</th>
                      <th className="py-2 text-left">Due</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.invoiceId} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-xs font-mono">{inv.invoiceId}</td>
                        <td className="py-2 text-xs">{getSponsorName(inv.sponsorId)}</td>
                        <td className="py-2 text-xs">₹{inv.totalAmount.toLocaleString()}</td>
                        <td className="py-2 text-xs">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 text-xs">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              inv.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : inv.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {inv.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {inv.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {inv.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-xs">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(inv.invoiceId)}
                              className="text-emerald-600 hover:underline"
                            >
                              Mark paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate Invoice</h2>
            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Sponsor</label>
                <select
                  value={form.sponsorId}
                  onChange={(e) => setForm({ ...form, sponsorId: e.target.value, campaignIds: [] })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  required
                >
                  <option value="">Select sponsor</option>
                  {sponsors.map((s) => (
                    <option key={s.sponsorId} value={s.sponsorId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Campaigns</label>
                <div className="border rounded-lg px-3 py-2 max-h-40 overflow-y-auto text-xs bg-white dark:bg-gray-800">
                  {campaigns
                    .filter((c) => !form.sponsorId || c.sponsorId === form.sponsorId)
                    .map((c) => {
                      const checked = form.campaignIds.includes(c.campaignId);
                      return (
                        <label key={c.campaignId} className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(form.campaignIds);
                              if (e.target.checked) next.add(c.campaignId);
                              else next.delete(c.campaignId);
                              setForm({ ...form, campaignIds: Array.from(next) });
                            }}
                          />
                          <span>{c.campaignId}</span>
                        </label>
                      );
                    })}
                  {campaigns.filter((c) => !form.sponsorId || c.sponsorId === form.sponsorId).length === 0 && (
                    <div className="text-gray-500 text-xs">No campaigns for this sponsor.</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Generate Invoice
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdBilling;
