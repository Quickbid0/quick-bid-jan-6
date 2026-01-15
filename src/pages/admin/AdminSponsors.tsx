import React, { useEffect, useState } from 'react';
import { adsService, SponsorPayload } from '../../services/adsService';
import { toast } from 'react-hot-toast';

const emptyForm: SponsorPayload = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  gstNumber: '',
  packageTier: 'Bronze',
  logoUrl: '',
  agentId: '',
};

const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SponsorPayload>(emptyForm);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const data = await adsService.listSponsors();
      setSponsors(data);
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  const handleEdit = (sponsor: any) => {
    setEditingId(sponsor.sponsorId);
    setForm({
      sponsorId: sponsor.sponsorId,
      name: sponsor.name,
      contactPerson: sponsor.contactPerson,
      email: sponsor.email,
      phone: sponsor.phone,
      gstNumber: sponsor.gstNumber,
      packageTier: sponsor.packageTier,
      logoUrl: sponsor.logoUrl,
      agentId: sponsor.agentId,
    });
  };

  const handleDelete = async (sponsorId: string) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await adsService.deleteSponsor(sponsorId);
      toast.success('Sponsor deleted');
      loadSponsors();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to delete sponsor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await adsService.updateSponsor(editingId, form);
        toast.success('Sponsor updated');
      } else {
        await adsService.createSponsor(form);
        toast.success('Sponsor created');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadSponsors();
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message || 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sponsors</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">All Sponsors</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Contact</th>
                      <th className="py-2 text-left">Package</th>
                      <th className="py-2 text-left">Agent</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsors.map((s) => (
                      <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2">{s.name}</td>
                        <td className="py-2 text-xs">
                          <div>{s.contactPerson}</div>
                          <div className="text-gray-500">{s.email}</div>
                        </td>
                        <td className="py-2">{s.packageTier}</td>
                        <td className="py-2">{s.agentId || '-'}</td>
                        <td className="py-2 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-indigo-600 hover:underline text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.sponsorId)}
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
              {editingId ? 'Edit Sponsor' : 'New Sponsor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">GST</label>
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Package</label>
                <select
                  value={form.packageTier}
                  onChange={(e) => setForm({ ...form, packageTier: e.target.value as SponsorPayload['packageTier'] })}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Logo URL</label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Agent ID (optional)</label>
                <input
                  type="text"
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 rounded text-sm mt-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Sponsor' : 'Create Sponsor'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSponsors;
