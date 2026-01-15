import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { Loader2, ArrowLeft, MapPin, Truck, Phone } from 'lucide-react';

interface DeliveryAuction {
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
    phone?: string | null;
  } | null;
}

interface DeliveryPrefs {
  delivery_mode: 'delivery' | 'pickup' | null;
  branch_id: string | null;
  branch_name: string | null;
  status: string | null;
  contact_name: string | null;
  primary_phone: string | null;
  alternate_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

const AdminDeliverySlip: React.FC = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<DeliveryAuction | null>(null);
  const [prefs, setPrefs] = useState<DeliveryPrefs | null>(null);

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

        const [{ data: auctionData, error: auctionError }, { data: prefsData }] = await Promise.all([
          supabase
            .from('auctions')
            .select(`
              id,
              status,
              final_price,
              created_at,
              product:products(id, title, category, main_category, sub_category),
              seller:profiles(id, full_name),
              winner:profiles(id, name, phone)
            `)
            .eq('id', auctionId)
            .single(),
          supabase
            .from('winner_delivery_preferences')
            .select(`
              delivery_mode,
              branch_id,
              status,
              contact_name,
              primary_phone,
              alternate_phone,
              address_line1,
              address_line2,
              city,
              state,
              pincode,
              country,
              branch:locations(name)
            `)
            .eq('auction_id', auctionId)
            .maybeSingle(),
        ] as any);

        if (auctionError || !auctionData) {
          console.error('AdminDeliverySlip: error loading auction', auctionError);
          setError('We could not find this auction for delivery slip.');
          setLoading(false);
          return;
        }

        setAuction(auctionData as DeliveryAuction);
        if (prefsData) {
          setPrefs({
            delivery_mode: prefsData.delivery_mode || null,
            branch_id: prefsData.branch_id || null,
            branch_name: prefsData.branch?.name || null,
            status: prefsData.status || null,
            contact_name: prefsData.contact_name || null,
            primary_phone: prefsData.primary_phone || null,
            alternate_phone: prefsData.alternate_phone || null,
            address_line1: prefsData.address_line1 || null,
            address_line2: prefsData.address_line2 || null,
            city: prefsData.city || null,
            state: prefsData.state || null,
            pincode: prefsData.pincode || null,
            country: prefsData.country || null,
          });
        } else {
          setPrefs(null);
        }
      } catch (e) {
        console.error('AdminDeliverySlip: unexpected error', e);
        setError('Unexpected error while loading delivery slip.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auctionId]);

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
        <p className="text-sm text-red-600 mb-4">{error || 'Unable to load delivery slip for this auction.'}</p>
        <Link
          to="/admin/winners"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Winners
        </Link>
      </div>
    );
  }

  const product = auction.product;
  const invoiceDate = auction.created_at
    ? new Date(auction.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();
  const category =
    (product?.main_category || product?.category || product?.sub_category || '') || '';

  const maskedPhone = (phone?: string | null) => {
    if (!phone) return '';
    if (phone.length <= 4) return '****';
    return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`;
  };

  const deliveryLine = (() => {
    if (!prefs) return 'Buyer delivery preferences not submitted';
    if (prefs.delivery_mode === 'pickup') {
      return `Self pickup at ${prefs.branch_name || 'branch TBD'}`;
    }
    if (prefs.delivery_mode === 'delivery') {
      const parts = [prefs.address_line1, prefs.address_line2, prefs.city, prefs.state, prefs.pincode]
        .filter(Boolean)
        .join(', ');
      return parts || 'Delivery address on file';
    }
    return 'Mode not yet selected';
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 print:px-8 print:py-8 bg-white text-gray-900">
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Delivery Slip</h1>
          <p className="text-xs text-gray-600">For warehouse / yard / pickup desk</p>
        </div>
        <div className="text-right text-xs text-gray-600">
          <p>Date: {invoiceDate}</p>
          <p>Ref: DEL-{auction.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-lg p-4 text-xs">
        <div>
          <h2 className="font-semibold mb-1 text-gray-800">Auction / Product</h2>
          <p className="text-gray-800 font-medium">{product?.title || 'Product'}</p>
          {category && <p className="text-gray-500 text-[11px]">Category: {category}</p>}
          <p className="text-gray-500 text-[11px]">Auction ID: {auction.id}</p>
          {auction.final_price != null && (
            <p className="text-gray-700 text-[11px] mt-1">
              Winning bid: <span className="font-semibold">₹{Number(auction.final_price).toLocaleString()}</span>
            </p>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-1 text-gray-800">Buyer</h2>
          <p className="text-gray-800 font-medium">{auction.winner?.name || 'Winner'}</p>
          <p className="text-gray-500 text-[11px]">Winner ID: {auction.winner?.id}</p>
          <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-1">
            <Phone className="h-3 w-3" />
            Phone: {maskedPhone(auction.winner?.phone || prefs?.primary_phone || undefined) || 'N/A'}
          </p>
        </div>
      </div>

      <div className="mb-3 border border-gray-200 rounded-lg p-4 text-xs space-y-2">
        <h2 className="font-semibold mb-1 text-gray-800 flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Delivery / Pickup Instructions
        </h2>
        <p className="text-gray-700">{deliveryLine}</p>
        {prefs?.delivery_mode === 'pickup' && prefs.branch_name && (
          <p className="text-gray-500 text-[11px] flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Pickup branch: <span className="font-medium">{prefs.branch_name}</span>
          </p>
        )}
        {prefs?.status && (
          <p className="text-gray-500 text-[11px]">Logistics status: {prefs.status.replace('_', ' ')}</p>
        )}
      </div>

      <div className="text-[11px] text-gray-500 space-y-1 mb-6">
        <p>
          This slip is for internal use at the yard / warehouse / pickup desk. Verify the winner&apos;s ID and mask-sensitive
          details when sharing externally.
        </p>
        <p>
          For any discrepancies, contact QuickBid support quoting Auction ID <span className="font-semibold">{auction.id}</span>.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 print:hidden text-xs">
        <button
          type="button"
          onClick={() => navigate('/admin/winners')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Admin Winners
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
        >
          Print / Download PDF
        </button>
      </div>
    </div>
  );
};

export default AdminDeliverySlip;
