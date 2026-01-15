import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { Trophy, Truck, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Add the InsuranceBadge component
const InsuranceBadge = ({ providerKey }: { providerKey?: string | null }) => {
  if (!providerKey) return null;

  const providerNameMap: Record<string, string> = {
    secure_insure: "Insured via SecureInsure",
  };

  const label = providerNameMap[providerKey] || "Insured";

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px]">
      {label}
    </span>
  );
};

interface WonAuctionRow {
  auction_id: string;
  status: string;
  final_price: number | null;
  product_id: string | null;
  product_title: string;
  product_category: string | null;
  product_image_url: string | null;
  payout_status: string | null;
  finance_provider_key?: string | null;
  finance_status?: string | null;
  insurance_provider_key?: string | null;
  delivery_mode: 'delivery' | 'pickup' | null;
  branch_name: string | null;
  pref_status: string | null;
  has_preferences: boolean;
  inspection_id?: string | null;
  inspection_grade?: string | null;
}

const MyWonAuctions: React.FC = () => {
  const [rows, setRows] = useState<WonAuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data, error: qError } = await supabase
        .from('auctions')
        .select(`
          id,
          status,
          payout_status,
          final_price,
          finance_provider_key,
          insurance_provider_key,
          finance_status,
          product:products(id, title, category, main_category, sub_category, image_url, image_urls),
          winner_delivery_preferences!left(
            delivery_mode,
            branch:locations(name),
            status
          ),
          inspections!left(
            id,
            final_status,
            final_grade
          )
        `)
        .eq('winner_id', userId)
        .order('actual_end_time', { ascending: false })
        .limit(100);

      if (qError) {
        console.error('MyWonAuctions load error', qError);
        setError('Failed to load your won auctions');
        setRows([]);
        setLoading(false);
        return;
      }

      const mapped: WonAuctionRow[] = (data || []).map((a: any) => {
        const product = a.product || {};
        const prefs = Array.isArray(a.winner_delivery_preferences) ? a.winner_delivery_preferences[0] : a.winner_delivery_preferences;
        const insp = Array.isArray(a.inspections) ? a.inspections[0] : a.inspections;
        const category =
          product.main_category || product.category || product.sub_category || null;
        const imageUrl =
          (Array.isArray(product.image_urls) && product.image_urls[0]) || product.image_url || null;
        return {
          auction_id: a.id,
          status: a.status,
          final_price: a.final_price ?? null,
          product_id: product.id ?? null,
          product_title: product.title || 'Product',
          product_category: category,
          product_image_url: imageUrl,
          payout_status: a.payout_status ?? null,
          finance_provider_key: a.finance_provider_key ?? null,
          insurance_provider_key: a.insurance_provider_key ?? null,
          finance_status: a.finance_status ?? null,
          delivery_mode: (prefs?.delivery_mode as 'delivery' | 'pickup' | null) || null,
          branch_name: prefs?.branch?.name || null,
          pref_status: prefs?.status || null,
          has_preferences: !!prefs,
          inspection_id: insp?.id ?? null,
          inspection_grade: insp?.final_grade ?? null,
        };
      });

      setRows(mapped);
    } catch (e) {
      console.error('MyWonAuctions unexpected error', e);
      setError('Unexpected error while loading your wins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;
      channel = supabase
        .channel('my-won-auctions')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `winner_id=eq.${userId}`,
        }, () => {
          loadData();
        })
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const renderNextStep = (row: WonAuctionRow) => {
    const status = (row.status || '').toLowerCase();
    const payout = (row.payout_status || 'pending').toLowerCase();
    const logistics = (row.pref_status || 'pending').toLowerCase();

    if (payout !== 'completed' && status === 'ended') {
      return (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Next step: complete payment to confirm your win.</p>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
            onClick={() => {
              if (!row.auction_id) return;
              navigate(`/pay/${row.auction_id}`, { state: { back: '/my/won-auctions' } });
            }}
          >
            Pay now
          </button>
        </>
      );
    }

    if (payout === 'completed' && !row.has_preferences) {
      return (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Payment received. Please share your delivery / pickup preferences.</p>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
            onClick={() => {
              if (!row.auction_id) return;
              navigate(`/delivery-preferences/${row.auction_id}`);
            }}
          >
            Submit delivery preferences
          </button>
        </>
      );
    }

    if (payout === 'completed' && logistics !== 'delivered' && logistics !== 'picked_up') {
      return (
        <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Payment done · delivery in progress
        </p>
      );
    }

    if (payout === 'completed' && (logistics === 'delivered' || logistics === 'picked_up')) {
      return (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Delivered / picked up
        </p>
      );
    }

    return (
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Awaiting admin update
      </p>
    );
  };

  if (loading) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Won Auctions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your wins…</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Won Auctions</h1>
                <p className="text-sm text-red-500 dark:text-red-400 font-medium">Failed to load your wins</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Won Auctions</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No wins yet</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No wins yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Place bids on active listings to see your wins here.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/catalog" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                Browse Auctions
              </Link>
              <Link to="/dashboard" className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            My Won Auctions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All auctions you have won, with payment status, delivery progress, and inspection certificates when available.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {rows.map((row) => {
          const logistics = (row.pref_status || 'pending').toLowerCase();
          const payout = (row.payout_status || 'pending').toLowerCase();
          const isAttention = payout !== 'completed' || (logistics !== 'delivered' && logistics !== 'picked_up');

          return (
            <div
              key={row.auction_id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {row.product_image_url && (
                  <img
                    src={row.product_image_url}
                    alt={row.product_title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
                    {row.product_title}
                  </div>
                  {row.product_category && (
                    <div className="text-[11px] text-gray-500 truncate">{row.product_category}</div>
                  )}
                  <div className="mt-1 text-[11px] text-gray-500 break-all">Auction ID: {row.auction_id}</div>
                </div>
              </div>

              <div className="grid gap-2 text-xs md:text-[13px] md:grid-cols-2">
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-500">Winning bid:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {row.final_price ? `₹${row.final_price.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] capitalize">
                      Status: {row.status}
                    </span>
                    {row.payout_status && (
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] capitalize ' +
                          (payout === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : payout === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200')
                        }
                      >
                        Payment: {row.payout_status.replace('_', ' ')}
                      </span>
                    )}
                    {row.finance_provider_key && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                        {row.finance_provider_key === 'demo_bank'
                          ? 'Financed via DemoBank'
                          : `Financed via ${row.finance_provider_key}`}
                      </span>
                    )}
                    <InsuranceBadge providerKey={row.insurance_provider_key} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                    <Truck className="h-3 w-3" />
                    {row.delivery_mode ? (
                      <span>
                        {row.delivery_mode === 'pickup'
                          ? `Pickup at ${row.branch_name || 'branch TBD'}`
                          : `Delivery – status: ${row.pref_status || 'pending'}`}
                      </span>
                    ) : (
                      <span>Delivery / pickup not set yet</span>
                    )}
                  </div>
                  {row.inspection_id && (
                    <div className="pt-1 text-[11px]">
                      <Link
                        to={`/inspection-report/${row.inspection_id}`}
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        View inspection certificate{row.inspection_grade ? ` (Grade ${row.inspection_grade})` : ''}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-2">
                  <div>{renderNextStep(row)}</div>
                  <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end mt-1">
                    {row.product_id && (
                      <Link
                        to={`/product/${row.product_id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        View product
                      </Link>
                    )}
                    {row.product_id && payout === 'completed' && (
                      <Link
                        to={`/finance/loans/apply?productId=${row.product_id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full border border-indigo-600 text-xs text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-gray-800"
                      >
                        Apply for loan
                      </Link>
                    )}
                    {payout === 'completed' && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => {
                          if (!row.auction_id) return;
                          navigate(`/invoice/${row.auction_id}`);
                        }}
                      >
                        Download invoice
                      </button>
                    )}
                    {isAttention && payout !== 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        Action needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyWonAuctions;
