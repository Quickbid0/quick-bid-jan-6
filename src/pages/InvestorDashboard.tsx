import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

interface InvestmentRow {
  id: string;
  plan_type: string;
  amount: number;
  status: string;
  created_at: string;
  agreement_status?: string | null;
}

interface LedgerEntry {
  id: number;
  entry_type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

const InvestorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [investorId, setInvestorId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!user?.email) {
          setError('No user email found for investor lookup');
          return;
        }

        const { data: investor, error: invErr } = await supabase
          .from('investors')
          .select('id, kyc_status')
          .eq('email', user.email)
          .maybeSingle();

        if (invErr) throw invErr;
        if (!investor) {
          setError('No investor profile found for your account yet. Apply to invest first.');
          return;
        }

        const invId = investor.id as string;
        setInvestorId(invId);
        setKycStatus((investor.kyc_status as string | null) || null);

        const { data: invs, error: invsErr } = await supabase
          .from('investments')
          .select('id, plan_type, amount, status, created_at, agreement_status')
          .eq('investor_id', invId)
          .order('created_at', { ascending: false });

        if (invsErr) throw invsErr;
        setInvestments((invs || []) as any);

        if (invs && invs.length > 0) {
          await loadLedger(invs[0].id as string);
        }
      } catch (e: any) {
        console.error('InvestorDashboard load error', e);
        setError(e.message || 'Failed to load investor data');
      } finally {
        setLoading(false);
      }
    };

    const loadLedger = async (investmentId: string) => {
      try {
        const res = await fetch(`/.netlify/functions/investment-ledger?investment_id=${encodeURIComponent(investmentId)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load ledger');
        }
        const data = await res.json();
        setLedger(data.entries || []);
        setSelectedInvestment(investmentId);
      } catch (e: any) {
        console.error('loadLedger error', e);
        setError(e.message || 'Failed to load ledger');
      }
    };

    // expose helper so we can call from JSX
    (window as any)._qm_load_investor_ledger = loadLedger;

    void load();
  }, []);

  const handleSelectInvestment = async (id: string) => {
    const fn = (window as any)._qm_load_investor_ledger as (id: string) => Promise<void>;
    if (fn) await fn(id);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investor Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          View your QuickMela investment applications, status, and ledger entries.
        </p>
        {kycStatus && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
              KYC: {kycStatus.replace('_', ' ')}
            </span>
          </div>
        )}
      </header>

      {investments.some((inv) => inv.status === 'active' && inv.agreement_status !== 'signed') && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3 text-xs md:text-sm">
          Your investment is active but the Investment Agreement is not marked as signed yet. If you have already signed,
          this may simply be pending back-office update. For any questions, please contact support.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!error && (!investorId || investments.length === 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-sm text-gray-700 dark:text-gray-200">
          <p>No investments found yet. You can start by applying on the Invest page.</p>
        </div>
      )}

      {investments.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Your investments</h2>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Plan</th>
                  <th className="px-3 py-2 text-left font-medium">Amount (₹)</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Agreement</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {investments.map((inv) => (
                  <tr key={inv.id} className={selectedInvestment === inv.id ? 'bg-primary-50/60 dark:bg-primary-900/20' : ''}>
                    <td className="px-3 py-2 font-mono text-xs truncate max-w-[160px]">{inv.id}</td>
                    <td className="px-3 py-2 capitalize">{inv.plan_type.replace('_', ' ')}</td>
                    <td className="px-3 py-2">{inv.amount}</td>
                    <td className="px-3 py-2 capitalize">{inv.status}</td>
                    <td className="px-3 py-2 text-xs capitalize">{inv.agreement_status || 'pending'}</td>
                    <td className="px-3 py-2 text-xs">{new Date(inv.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleSelectInvestment(inv.id)}
                        className="btn btn-xs btn-outline"
                      >
                        View ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedInvestment && ledger.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Ledger for investment {selectedInvestment}</h2>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Amount (₹)</th>
                  <th className="px-3 py-2 text-left font-medium">Balance After (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-3 py-2 text-xs">{new Date(entry.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 capitalize">{entry.entry_type}</td>
                    <td className="px-3 py-2">{entry.amount}</td>
                    <td className="px-3 py-2">{entry.balance_after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default InvestorDashboard;
