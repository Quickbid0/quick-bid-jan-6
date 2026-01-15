import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { Loader2, ArrowLeft } from 'lucide-react';

interface InvoiceAuction {
  id: string;
  status: string | null;
  final_price: number | null;
  created_at: string | null;
  product?: {
    id: string;
    title: string;
    category?: string | null;
    main_category?: string | null;
    sub_category?: string | null;
  } | null;
  seller?: {
    id: string;
    full_name?: string | null;
  } | null;
  winner?: {
    id: string;
    name?: string | null;
  } | null;
  payout_status?: string | null;
  payout_sale_price?: number | null;
  payout_commission?: number | null;
  payout_net_payout?: number | null;
}

const WinInvoice: React.FC = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<InvoiceAuction | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!auctionId) {
        setError('Missing auction reference.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [{ data: sessionData }, { data: auctionData, error: auctionError }, { data: payoutData }] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('auctions')
            .select(`
              id,
              status,
              final_price,
              created_at,
              product:products(id, title, category, main_category, sub_category),
              seller:profiles(id, full_name),
              winner:profiles!auctions_winner_id_fkey(id, name)
            `)
            .eq('id', auctionId)
            .single(),
          supabase
            .from('payouts')
            .select('status, sale_price, commission_amount, net_payout')
            .eq('payout_reference', auctionId)
            .maybeSingle(),
        ] as any);

        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          setError('You must be logged in to view this invoice.');
          setLoading(false);
          return;
        }

        if (auctionError || !auctionData) {
          console.error('WinInvoice: error loading auction', auctionError);
          setError('We could not find this auction for invoicing.');
          setLoading(false);
          return;
        }

        const auctionRow: InvoiceAuction = {
          ...(auctionData as any),
          payout_status: payoutData?.status ?? null,
          payout_sale_price: payoutData?.sale_price != null ? Number(payoutData.sale_price) : null,
          payout_commission: payoutData?.commission_amount != null ? Number(payoutData.commission_amount) : null,
          payout_net_payout: payoutData?.net_payout != null ? Number(payoutData.net_payout) : null,
        };

        // Basic access guard: only winner sees this invoice (admin could reuse separate view)
        if (auctionRow.winner?.id && auctionRow.winner.id !== userId) {
          setError('This invoice is only available to the winning buyer.');
          setLoading(false);
          return;
        }

        setAuction(auctionRow);
      } catch (e) {
        console.error('WinInvoice: unexpected error', e);
        setError('Unexpected error while loading invoice.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auctionId]);

  // Optionally prompt browser print once invoice is loaded
  useEffect(() => {
    if (!loading && auction) {
      // Small timeout so layout can render before print dialog
      const t = setTimeout(() => {
        if (window && window.print) {
          // window.print(); // Uncomment in production if you want auto print
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [loading, auction]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-height-screen py-16">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Unable to load invoice for this auction.'}</p>
        <Link
          to="/my/won-auctions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Won Auctions
        </Link>
      </div>
    );
  }

  const product = auction.product;
  const category =
    (product?.main_category || product?.category || product?.sub_category || '') || '';
  const saleAmount = auction.final_price != null ? Number(auction.final_price) : 0;
  const invoiceDate = auction.created_at
    ? new Date(auction.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 print:px-8 print:py-8 bg-white text-gray-900">
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Invoice</h1>
          <p className="text-xs text-gray-600">Invoice for winning auction</p>
        </div>
        <div className="text-right text-xs text-gray-600">
          <p>Invoice Date: {invoiceDate}</p>
          <p>Invoice ID: INV-{auction.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4 text-xs">
        <div>
          <h2 className="font-semibold mb-1 text-gray-800">Bill To (Buyer)</h2>
          <p className="text-gray-700 font-medium">{auction.winner?.name || 'Winning Buyer'}</p>
          <p className="text-gray-500">User ID: {auction.winner?.id}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-1 text-gray-800">Seller</h2>
          <p className="text-gray-700 font-medium">{auction.seller?.full_name || 'Seller'}</p>
          <p className="text-gray-500">Seller ID: {auction.seller?.id}</p>
        </div>
      </div>

      <div className="mb-4 border border-gray-200 rounded-lg text-xs">
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 flex text-xs">
          <div className="flex-1">Item</div>
          <div className="w-24 text-right">Amount (₹)</div>
        </div>
        <div className="px-4 py-3 flex items-start">
          <div className="flex-1 pr-4">
            <p className="font-medium text-gray-900">{product?.title || 'Won auction item'}</p>
            {category && (
              <p className="text-[11px] text-gray-500">Category: {category}</p>
            )}
            <p className="text-[11px] text-gray-500 mt-1">Auction ID: {auction.id}</p>
          </div>
          <div className="w-24 text-right text-sm font-semibold text-gray-900">
            {saleAmount.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end text-xs">
        <div className="w-56 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{saleAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discounts / Coupons</span>
            <span className="font-medium">₹0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees (if applicable)</span>
            <span className="font-medium">₹0</span>
          </div>
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between">
            <span className="font-semibold text-gray-800">Total Amount</span>
            <span className="font-bold text-gray-900">₹{saleAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 space-y-1 mb-6">
        <p>
          This invoice is for your winning bid on QuickBid. Commission and platform fees are deducted from the seller&apos;s
          payout, not added on top of your winning bid.
        </p>
        <p>
          This is a computer-generated document. For any clarifications, please contact QuickBid support with your auction ID
          <span className="font-semibold"> {auction.id}</span>.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 print:hidden text-xs">
        <button
          type="button"
          onClick={() => navigate('/my/won-auctions')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to My Won Auctions
        </button>
        <div className="flex gap-2">
          {auction.status === 'payment_pending' && (
            <button
              type="button"
              onClick={() => navigate(`/pay/${auction.id}`)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
            >
              Pay Now
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
          >
            Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinInvoice;
