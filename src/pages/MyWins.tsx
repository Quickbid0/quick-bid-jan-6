import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { AlertCircle, Loader2, Trophy, ArrowRight, User, CheckCircle, Clock } from 'lucide-react';
import NextStepLabel from '../components/buyer/NextStepLabel';

interface WinAuction {
  id: string;
  auction_type: 'live' | 'timed' | 'tender' | string | null;
  status: string | null;
  final_price: number | null;
  created_at: string | null;
  product?: {
    id: string;
    title: string;
    image_url?: string | null;
  } | null;
  seller?: {
    id: string;
    full_name?: string | null;
  } | null;
}

interface PayoutSummary {
  payout_reference: string;
  status: string | null;
  net_payout: number | null;
}

const MyWins: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wins, setWins] = useState<WinAuction[]>([]);
  const [payoutsByAuction, setPayoutsByAuction] = useState<Record<string, PayoutSummary | undefined>>({});
  const [paymentStatusByAuction, setPaymentStatusByAuction] = useState<Record<string, string | undefined>>({});
  const [paymentTimeByAuction, setPaymentTimeByAuction] = useState<Record<string, string | undefined>>({});
  const [settlementEtaBySeller, setSettlementEtaBySeller] = useState<
    Record<
      string,
      {
        minDays: number;
        maxDays: number;
        medianDays: number;
        label: string;
      }
    >
  >({});

  useEffect(() => {
    const loadWins = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          setError('You must be logged in to view your wins.');
          setLoading(false);
          return;
        }

        const { data: auctions, error: auctionsError } = await supabase
          .from('auctions')
          .select(
            `id, auction_type, status, final_price, created_at,
             product:products(id, title, image_url),
             seller:profiles(id, full_name)`
          )
          .eq('winner_id', user.id)
          .order('created_at', { ascending: false });

        if (auctionsError) {
          console.error('Error loading wins for MyWins page', auctionsError);
          setError('Failed to load your wins. Please try again later.');
          setLoading(false);
          return;
        }

        const mappedWins: WinAuction[] = (auctions || []).map((a: any) => ({
          id: a.id,
          auction_type: a.auction_type,
          status: a.status,
          final_price: a.final_price,
          created_at: a.created_at,
          product: a.product || null,
          seller: a.seller || null,
        }));

        setWins(mappedWins);

        if (mappedWins.length > 0) {
          const auctionIds = mappedWins.map((w) => w.id);

          // Load seller payouts (for transparency block)
          const [payoutsRes, winPaymentsRes] = await Promise.all([
            supabase
              .from('payouts')
              .select('payout_reference, status, net_payout')
              .in('payout_reference', auctionIds),
            supabase
              .from('win_payments')
              .select('auction_id, status, buyer_id, submitted_at')
              .in('auction_id', auctionIds)
              .eq('buyer_id', user.id)
              .order('submitted_at', { ascending: false }),
          ]);

          if (payoutsRes.error) {
            console.error('Error loading payouts for MyWins page', payoutsRes.error);
          } else {
            const map: Record<string, PayoutSummary> = {};
            (payoutsRes.data || []).forEach((p: any) => {
              if (p.payout_reference) {
                map[p.payout_reference] = {
                  payout_reference: p.payout_reference,
                  status: p.status || null,
                  net_payout: p.net_payout != null ? Number(p.net_payout) : null,
                };
              }
            });
            setPayoutsByAuction(map);
          }

          if (winPaymentsRes.error) {
            console.error('Error loading win_payments for MyWins page', winPaymentsRes.error);
          } else {
            const statusMap: Record<string, string | undefined> = {};
            const timeMap: Record<string, string | undefined> = {};
            // Because we ordered submitted_at desc, first occurrence per auction_id is the latest
            (winPaymentsRes.data || []).forEach((wp: any) => {
              const aid = wp.auction_id as string | undefined;
              if (!aid) return;
              if (!statusMap[aid]) {
                statusMap[aid] = wp.status || null;
                timeMap[aid] = wp.submitted_at || null;
              }
            });
            setPaymentStatusByAuction(statusMap);
            setPaymentTimeByAuction(timeMap);
          }

          // Best-effort seller-level settlement ETA using AI endpoint, cached per seller
          try {
            const sellerToAuction: Record<string, string> = {};
            mappedWins.forEach((w) => {
              const sellerId = w.seller?.id;
              if (sellerId && !sellerToAuction[sellerId]) {
                sellerToAuction[sellerId] = w.id;
              }
            });

            const sellerIds = Object.keys(sellerToAuction);
            if (sellerIds.length > 0) {
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData?.session?.access_token;
              if (token) {
                const nextMap: typeof settlementEtaBySeller = { ...settlementEtaBySeller };

                await Promise.all(
                  sellerIds.map(async (sellerId) => {
                    if (nextMap[sellerId]) return;
                    const auctionId = sellerToAuction[sellerId];
                    if (!auctionId) return;
                    try {
                      const resp = await fetch(
                        `/api/ai/settlement-eta/${encodeURIComponent(auctionId)}`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );
                      if (!resp.ok) return;
                      const body = await resp.json();
                      if (!body) return;
                      nextMap[sellerId] = {
                        minDays: typeof body.minDays === 'number' ? body.minDays : 3,
                        maxDays: typeof body.maxDays === 'number' ? body.maxDays : 5,
                        medianDays: typeof body.medianDays === 'number' ? body.medianDays : 4,
                        label: typeof body.label === 'string' ? body.label : '',
                      };
                    } catch (e) {
                      console.warn('MyWins: failed to load settlement ETA for seller', sellerId, e);
                    }
                  }),
                );

                setSettlementEtaBySeller(nextMap);
              }
            }
          } catch (e) {
            console.warn('MyWins: failed to load settlement ETA hints', e);
          }
        }
      } catch (e) {
        console.error('Unexpected error loading MyWins data', e);
        setError('Something went wrong while loading your wins.');
      } finally {
        setLoading(false);
      }
    };

    loadWins();
  }, []);

  const getAuctionTypeLabel = (type: WinAuction['auction_type']) => {
    if (type === 'live') return 'Live Auction';
    if (type === 'timed') return 'Timed Auction';
    if (type === 'tender') return 'Tender Auction';
    return 'Auction';
  };

  const getAuctionRoute = (win: WinAuction) => {
    if (win.auction_type === 'live') return `/live-auction/${win.id}`;
    if (win.auction_type === 'timed') return `/timed-auction/${win.id}`;
    if (win.auction_type === 'tender') return `/tender-auction/${win.id}`;
    return `/live-auction/${win.id}`;
  };

  const getAuctionStatusChip = (status: string | null | undefined) => {
    if (!status) return { label: 'Status: unknown', className: 'bg-gray-100 text-gray-700' };
    const normalized = status.toLowerCase();
    if (normalized === 'active' || normalized === 'live') {
      return { label: 'Auction live', className: 'bg-green-50 text-green-700' };
    }
    if (normalized === 'ended' || normalized === 'completed') {
      return { label: 'Auction ended', className: 'bg-gray-100 text-gray-700' };
    }
    return { label: `Status: ${status}`, className: 'bg-gray-100 text-gray-700' };
  };

  const getPaymentStatusChip = (status: string | null | undefined, updatedAt?: string | null) => {
    if (!status) {
      return {
        label: 'Payment: unknown',
        tooltip: 'Payment status unknown',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
      } as const;
    }
    const s = status.toLowerCase();
    switch (s) {
      case 'pending_verification':
        return {
          label: 'Verification pending',
          tooltip: 'Payment submitted. Accounts team is verifying this payment.',
          className:
            'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        } as const;
      case 'approved':
        return {
          label: 'Payment approved',
          tooltip: 'Payment verified. Next step: wait for delivery / pickup instructions.',
          className:
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        } as const;
      case 'rejected':
        return {
          label: 'Rejected',
          tooltip: 'Payment was rejected. Please resubmit correct details or contact support.',
          className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        } as const;
      case 'pending_documents':
        return {
          label: 'Docs needed',
          tooltip: 'More documents are required to verify this payment.',
          className:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        } as const;
      case 'partial_payment':
        return {
          label: 'Partial payment',
          tooltip: 'We received a partial payment. Please complete the remaining amount.',
          className:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        } as const;
      case 'refund_in_progress':
        return {
          label: 'Refund in progress',
          tooltip: 'A refund is in progress for this payment.',
          className:
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
        } as const;
      default:
        return {
          label: s,
          tooltip: 'Payment status: ' + s,
          className:
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
        } as const;
    }
  };

  const buildPaymentTooltip = (status: string | null | undefined, updatedAt?: string | null | undefined) => {
    const base = getPaymentStatusChip(status, updatedAt).tooltip;
    if (!updatedAt) return base;
    const dt = new Date(updatedAt);
    if (Number.isNaN(dt.getTime())) return base;
    return `${base} Last updated: ${dt.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">My Wins</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Wins</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            All auctions where you have been declared the winner, with quick links to details and seller profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/auction-preview')}
          className="hidden sm:inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Browse upcoming auctions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {wins.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">You have no wins yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Join live, timed, or tender auctions and your successful wins will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auction-preview')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Explore upcoming auctions
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {wins.map((win) => {
            const payout = payoutsByAuction[win.id];
            const imageUrl =
              win.product?.image_url ||
              'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80';
            const statusChip = getAuctionStatusChip(win.status);

            return (
              <div
                key={win.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={win.product?.title || 'Won auction'}
                    className="w-28 h-28 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                        <Trophy className="h-3 w-3" />
                        Won
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusChip.className}`}>
                        {statusChip.label}
                      </span>
                      {paymentStatusByAuction[win.id] && (() => {
                        const chip = getPaymentStatusChip(paymentStatusByAuction[win.id], paymentTimeByAuction[win.id]);
                        return (
                          <span
                            title={buildPaymentTooltip(paymentStatusByAuction[win.id] || null, paymentTimeByAuction[win.id])}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${chip.className}`}
                          >
                            {chip.label}
                          </span>
                        );
                      })()}
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {getAuctionTypeLabel(win.auction_type)}
                      </span>
                    </div>
                    <div className="mb-1">
                      <NextStepLabel
                        auctionStatus={win.status || null}
                        paymentStatus={paymentStatusByAuction[win.id] || null}
                      />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {win.product?.title || 'Won auction'}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                      {win.final_price != null && (
                        <span>
                          Winning bid: <span className="font-semibold">₹{Number(win.final_price).toLocaleString()}</span>
                        </span>
                      )}
                      {win.created_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Won on {new Date(win.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {win.seller?.full_name && (
                        <span>
                          Seller: <span className="font-medium">{win.seller.full_name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div className="space-y-0.5 text-gray-600 dark:text-gray-300">
                      {payout ? (
                        <>
                          <p>
                            Seller settlement status:{' '}
                            <span className="font-semibold capitalize">{(payout.status || 'pending').replace('_', ' ')}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            This does not change what you pay. Commission, if any, is deducted from the seller&apos;s payout.
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Seller settlement is being computed for this win. This will not affect your payable amount.
                        </p>
                      )}
                      {win.seller?.id && settlementEtaBySeller[win.seller.id] && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Typical settlement for this seller:{' '}
                          {(() => {
                            const eta = settlementEtaBySeller[win.seller!.id];
                            return eta.minDays === eta.maxDays
                              ? `${eta.medianDays} day${eta.medianDays === 1 ? '' : 's'}`
                              : `${eta.minDays}–${eta.maxDays} days`;
                          })()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                      {win.status && win.status.toLowerCase() === 'payment_pending' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/pay/${win.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                        >
                          Pay now
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                      {paymentStatusByAuction[win.id] && (
                        <button
                          type="button"
                          onClick={() => navigate(`/pay/${win.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          View payment status
                        </button>
                      )}
                      <Link
                        to={`/winner/${win.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                      >
                        View winner details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      {win.seller?.id && (
                        <Link
                          to={`/seller/${win.seller.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Seller profile
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(getAuctionRoute(win))}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-indigo-200 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        View auction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyWins;
