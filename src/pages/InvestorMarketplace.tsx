import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, PlusCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface InvestmentVehicle {
  id: string;
  name: string;
  type: 'bank' | 'nbfc' | 'private';
  minTicket: number;
  maxTicket: number;
  expectedIRR: number;
  tenureMonths: number;
  location: string;
  verified: boolean;
  description: string;
}

const mockVehicles: InvestmentVehicle[] = [
  {
    id: 'inv-001',
    name: 'NBFC Asset Recovery Fund',
    type: 'nbfc',
    minTicket: 500000,
    maxTicket: 5000000,
    expectedIRR: 18,
    tenureMonths: 18,
    location: 'Mumbai, Maharashtra',
    verified: true,
    description: 'Pool of seized vehicles auction pipeline across West India.'
  },
  {
    id: 'inv-002',
    name: 'Bank Distressed Assets Lot',
    type: 'bank',
    minTicket: 1000000,
    maxTicket: 10000000,
    expectedIRR: 16,
    tenureMonths: 24,
    location: 'Delhi, NCR',
    verified: true,
    description: 'Portfolio of retail NPAs with auction recoveries managed via QuickBid.'
  }
];

const STORAGE_KEY = 'investor-listings';

const InvestorMarketplace: React.FC = () => {
  const [vehicles, setVehicles] = useState<InvestmentVehicle[]>(mockVehicles);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'private' as 'bank' | 'nbfc' | 'private',
    minTicket: '',
    maxTicket: '',
    expectedIRR: '',
    tenureMonths: '12',
    location: '',
    description: ''
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: InvestmentVehicle[] = JSON.parse(raw);
        setVehicles(parsed);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockVehicles));
        setVehicles(mockVehicles);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.description || !form.minTicket || !form.maxTicket || !form.expectedIRR) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const isDemo = !!localStorage.getItem('demo-session');
      if (isDemo) {
        const newVehicle: InvestmentVehicle = {
          id: `inv-${Date.now()}`,
          name: form.name,
          type: form.type,
          minTicket: parseInt(form.minTicket, 10),
          maxTicket: parseInt(form.maxTicket, 10),
          expectedIRR: parseFloat(form.expectedIRR),
          tenureMonths: parseInt(form.tenureMonths, 10),
          location: form.location,
          verified: false,
          description: form.description
        };
        await new Promise(r => setTimeout(r, 600));
        setVehicles(prev => {
          const updated = [newVehicle, ...prev];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        setFormOpen(false);
        toast.success('Listing submitted (demo). Awaiting admin approval.');
        return;
      }

      // TODO: Wire real API/Supabase insert and admin approval workflow
      await new Promise(r => setTimeout(r, 600));
      const newVehicle: InvestmentVehicle = {
        id: `inv-${Date.now()}`,
        name: form.name,
        type: form.type,
        minTicket: parseInt(form.minTicket, 10),
        maxTicket: parseInt(form.maxTicket, 10),
        expectedIRR: parseFloat(form.expectedIRR),
        tenureMonths: parseInt(form.tenureMonths, 10),
        location: form.location,
        verified: false,
        description: form.description
      };
      setVehicles(prev => {
        const updated = [newVehicle, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      toast.success('Listing submitted! Awaiting admin approval.');
      setFormOpen(false);
    } catch (err) {
      toast.error('Failed to submit listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investor Marketplace</h1>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5" />
          New Listing
        </button>
      </div>

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{v.name}</h3>
              {v.verified ? (
                <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs">
                  <AlertCircle className="h-4 w-4" /> Pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{v.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="font-medium uppercase">{v.type}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{v.location}</span></div>
              <div><span className="text-gray-500">Ticket:</span> <span className="font-medium">₹{v.minTicket.toLocaleString()} - ₹{v.maxTicket.toLocaleString()}</span></div>
              <div><span className="text-gray-500">Expected IRR:</span> <span className="font-medium">{v.expectedIRR}%</span></div>
              <div><span className="text-gray-500">Tenure:</span> <span className="font-medium">{v.tenureMonths} months</span></div>
            </div>
            <button className="w-full mt-4 bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 text-sm">View Details</button>
          </motion.div>
        ))}
      </div>

      {/* New Listing Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Submit New Investment Vehicle</h2>
              <button onClick={() => setFormOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                  <option value="bank">Bank</option>
                  <option value="nbfc">NBFC</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input className="w-full border rounded-lg px-3 py-2" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Ticket (₹) *</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.minTicket} onChange={e => setForm({ ...form, minTicket: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Ticket (₹) *</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2" value={form.maxTicket} onChange={e => setForm({ ...form, maxTicket: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected IRR (%) *</label>
                <input type="number" step="0.1" className="w-full border rounded-lg px-3 py-2" value={form.expectedIRR} onChange={e => setForm({ ...form, expectedIRR: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenure (months)</label>
                <select className="w-full border rounded-lg px-3 py-2" value={form.tenureMonths} onChange={e => setForm({ ...form, tenureMonths: e.target.value })}>
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea rows={4} className="w-full border rounded-lg px-3 py-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-2">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center gap-2">
                  {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>) : (<><CheckCircle2 className="h-4 w-4" /> Submit</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorMarketplace;
