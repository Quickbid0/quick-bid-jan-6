import React, { useEffect, useState } from 'react';
import { adsService, AdSlotPayload } from '../../services/adsService';
import { toast } from 'react-hot-toast';

const emptySlot: AdSlotPayload = {
  slotType: 'banner_bottom',
  durationSec: 10,
  priceModel: 'flat',
  priceAmount: 0,
  assignedSponsorId: '',
  creativeUrl: '',
};

const AdminAdSlots: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdSlotPayload>(emptySlot);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = await adsService.listAdSlots();
      setSlots(data);
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to load ad slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleEdit = (slot: any) => {
    setEditingId(slot.slotId);
    setForm({
      slotId: slot.slotId,
      slotType: slot.slotType,
      durationSec: slot.durationSec,
      priceModel: slot.priceModel,
      priceAmount: slot.priceAmount,
      assignedSponsorId: slot.assignedSponsorId,
      creativeUrl: slot.creativeUrl,
    });
  };

  const handleDelete = async (slotId: string) => {
    if (!window.confirm('Delete this ad slot?')) return;
    try {
      await adsService.deleteAdSlot(slotId);
      toast.success('Ad slot deleted');
      loadSlots();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to delete ad slot');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await adsService.updateAdSlot(editingId, form);
        toast.success('Ad slot updated');
      } else {
        await adsService.createAdSlot(form);
        toast.success('Ad slot created');
      }
      setForm(emptySlot);
      setEditingId(null);
      loadSlots();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to save ad slot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ad Slots</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">All Ad Slots</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left">Slot</th>
                      <th className="py-2 text-left">Duration</th>
                      <th className="py-2 text-left">Pricing</th>
                      <th className="py-2 text-left">Sponsor</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((s) => (
                      <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2">{s.slotType}</td>
                        <td className="py-2">{s.durationSec}s</td>
                        <td className="py-2 text-xs">
                          <div>{s.priceModel}</div>
                          <div className="text-gray-500">₹{s.priceAmount}</div>
                        </td>
                        <td className="py-2 text-xs">{s.assignedSponsorId || '-'}</td>
                        <td className="py-2 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-indigo-600 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.slotId)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
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
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Ad Slot' : 'New Ad Slot'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Slot Type</label>
                <select
                  value={form.slotType}
                  onChange={(e) => setForm({ ...form, slotType: e.target.value as AdSlotPayload['slotType'] })}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="pre_roll">Pre-roll video</option>
                  <option value="mid_roll">Mid-roll</option>
                  <option value="post_roll">Post-roll</option>
                  <option value="banner_left">Banner left</option>
                  <option value="banner_bottom">Banner bottom</option>
                  <option value="banner_right">Banner right</option>
                  <option value="ticker">Ticker</option>
                  <option value="popup_card">Popup card</option>
                  <option value="timer_extension">Timer extension</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Duration (sec)</label>
                  <input
                    type="number"
                    value={form.durationSec}
                    onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={form.priceAmount}
                    onChange={(e) => setForm({ ...form, priceAmount: Number(e.target.value) })}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Pricing Model</label>
                <select
                  value={form.priceModel}
                  onChange={(e) => setForm({ ...form, priceModel: e.target.value as AdSlotPayload['priceModel'] })}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="flat">Flat</option>
                  <option value="cpm">CPM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Assigned Sponsor ID (optional)</label>
                <input
                  type="text"
                  value={form.assignedSponsorId}
                  onChange={(e) => setForm({ ...form, assignedSponsorId: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Creative URL (optional)</label>
                <input
                  type="text"
                  value={form.creativeUrl}
                  onChange={(e) => setForm({ ...form, creativeUrl: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 rounded text-sm mt-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Slot' : 'Create Slot'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdSlots;
