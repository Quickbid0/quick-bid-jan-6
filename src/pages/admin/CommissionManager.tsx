import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Percent, DollarSign, Shield } from 'lucide-react';

interface CommissionSettingsDto {
  id: string;
  buyer_commission_percent: number;
  seller_commission_percent: number;
  platform_flat_fee_cents: number;
  category_overrides?: any | null;
  active?: boolean;
}

const CommissionManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [current, setCurrent] = useState<CommissionSettingsDto | null>(null);
  const [buyerPct, setBuyerPct] = useState<number>(10);
  const [sellerPct, setSellerPct] = useState<number>(3);
  const [platformFlatRupees, setPlatformFlatRupees] = useState<number>(0);

  const loadCurrent = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setLoading(false);
        toast.error('Admin auth token missing');
        return;
      }

      const resp = await fetch('/api/admin/commissions/current', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok || !body?.ok) {
        const msg = body?.error || 'Failed to load commission settings';
        toast.error(msg);
        setLoading(false);
        return;
      }

      const settings: CommissionSettingsDto = body.settings;
      setCurrent(settings);
      setBuyerPct(Number(settings.buyer_commission_percent ?? 10));
      setSellerPct(Number(settings.seller_commission_percent ?? 3));
      setPlatformFlatRupees(Math.round((settings.platform_flat_fee_cents || 0) / 100));
    } catch (e) {
      console.error('CommissionManager: loadCurrent error', e);
      toast.error('Unexpected error while loading commission settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (buyerPct < 0 || buyerPct > 100 || sellerPct < 0 || sellerPct > 100) {
        toast.error('Buyer and seller commission must be between 0 and 100');
        setSaving(false);
        return;
      }
      if (platformFlatRupees < 0) {
        toast.error('Platform flat fee cannot be negative');
        setSaving(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error('Admin auth token missing');
        setSaving(false);
        return;
      }

      const payload = {
        buyer_commission_percent: buyerPct,
        seller_commission_percent: sellerPct,
        platform_flat_fee_cents: Math.round(platformFlatRupees * 100),
      };

      const resp = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await resp.json().catch(() => ({}));

      if (!resp.ok || !body?.ok) {
        const msg = body?.error || 'Failed to save commission settings';
        toast.error(msg);
        setSaving(false);
        return;
      }

      toast.success('Commission settings updated');
      await loadCurrent();
    } catch (e) {
      console.error('CommissionManager: handleSave error', e);
      toast.error('Unexpected error while saving commission settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            Commission Manager
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure buyer, seller, and platform commissions used for all QuickMela settlements.
          </p>
        </div>
      </div>

      {current && (
        <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200">
          <div className="font-semibold mb-1">Current active settings</div>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span>Buyer: {current.buyer_commission_percent}%</span>
            <span>Seller: {current.seller_commission_percent}%</span>
            <span>Platform flat fee: ₹{Math.round((current.platform_flat_fee_cents || 0) / 100)}</span>
            {current.active === false && (
              <span className="text-red-500">(inactive)</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buyer commission (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={buyerPct}
              onChange={(e) => setBuyerPct(Number(e.target.value))}
              className="pl-9 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Seller commission (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={sellerPct}
              onChange={(e) => setSellerPct(Number(e.target.value))}
              className="pl-9 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform flat fee (₹)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="number"
              min={0}
              step={1}
              value={platformFlatRupees}
              onChange={(e) => setPlatformFlatRupees(Number(e.target.value))}
              className="pl-9 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save new configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommissionManager;
