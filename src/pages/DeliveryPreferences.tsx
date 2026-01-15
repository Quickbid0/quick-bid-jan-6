import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Loader2, Truck, Home, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

interface BranchOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface AuctionProduct {
  id: string;
  title: string;
  image_url?: string | null;
}

interface AuctionRow {
  id: string;
  status: string | null;
  final_price: number | null;
  product: AuctionProduct | null;
}

interface ExistingPrefs {
  delivery_mode: 'delivery' | 'pickup' | null;
  branch_id: string | null;
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

const DeliveryPreferences: React.FC = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<AuctionRow | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [prefs, setPrefs] = useState<ExistingPrefs | null>(null);

  const [mode, setMode] = useState<'delivery' | 'pickup' | ''>('');
  const [branchId, setBranchId] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [preferredTime, setPreferredTime] = useState('');

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

        const [{ data: sessionData }, { data: auctionData, error: auctionError }, { data: prefsData }, { data: branchesData }] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('auctions')
            .select(`id, status, final_price, product:products(id, title, image_url)`) // minimal product info
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
              country
            `)
            .eq('auction_id', auctionId)
            .maybeSingle(),
          supabase
            .from('locations')
            .select('id, name, city, state')
            .order('name', { ascending: true }),
        ] as any);

        if (auctionError || !auctionData) {
          console.error('DeliveryPreferences: failed loading auction', auctionError);
          setError('We could not find this auction.');
          setLoading(false);
          return;
        }

        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          setError('You must be logged in to manage delivery preferences.');
          setLoading(false);
          return;
        }

        setAuction(auctionData as AuctionRow);
        setPrefs((prefsData || null) as any);
        setBranches(
          (branchesData || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            city: b.city ?? null,
            state: b.state ?? null,
          })),
        );

        // Pre-fill mode and address from existing preferences if any
        if (prefsData) {
          const p = prefsData as ExistingPrefs;
          setMode((p.delivery_mode as any) || '');
          setBranchId(p.branch_id || '');
          setFullName(p.contact_name || '');
          setPhone(p.primary_phone || '');
          setAltPhone(p.alternate_phone || '');
          setAddress1(p.address_line1 || '');
          setAddress2(p.address_line2 || '');
          setCity(p.city || '');
          setState(p.state || '');
          setPincode(p.pincode || '');
          setCountry(p.country || 'India');
        } else {
          // Fallback: try to load profile name/phone for prefill
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', userId)
            .maybeSingle();
          if (profile) {
            setFullName(profile.name || '');
            setPhone(profile.phone || '');
          }
        }
      } catch (e) {
        console.error('DeliveryPreferences: unexpected load error', e);
        setError('Unexpected error while loading delivery preferences.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auctionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auctionId) return;

    if (!mode) {
      toast.error('Please choose Delivery to Address or Self Pickup.');
      return;
    }

    if (mode === 'pickup' && !branchId) {
      toast.error('Please choose a pickup branch.');
      return;
    }

    if (mode === 'delivery') {
      if (!fullName || !phone || !address1 || !city || !state || !pincode) {
        toast.error('Please fill all required address details (name, phone, address, city, state, pincode).');
        return;
      }
    }

    try {
      setSaving(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        toast.error('You must be logged in to save delivery preferences.');
        setSaving(false);
        return;
      }

      const upsertPayload: any = {
        auction_id: auctionId,
        winner_id: userId,
        delivery_mode: mode,
        branch_id: mode === 'pickup' ? branchId || null : null,
        status: prefs?.status || 'confirmed',
        contact_name: fullName || null,
        primary_phone: phone || null,
        alternate_phone: altPhone || null,
        address_line1: mode === 'delivery' ? address1 || null : null,
        address_line2: mode === 'delivery' ? address2 || null : null,
        city: mode === 'delivery' ? city || null : null,
        state: mode === 'delivery' ? state || null : null,
        pincode: mode === 'delivery' ? pincode || null : null,
        country: mode === 'delivery' ? country || null : null,
      };

      const { error: upsertError } = await supabase
        .from('winner_delivery_preferences')
        .upsert(upsertPayload, { onConflict: 'auction_id,winner_id' });

      if (upsertError) {
        console.error('DeliveryPreferences: upsert error', upsertError);
        toast.error(upsertError.message || 'Failed to save delivery preferences.');
        setSaving(false);
        return;
      }

      // Best-effort notification for seller that buyer submitted delivery preferences
      try {
        const { data: auctionRow } = await supabase
          .from('auctions')
          .select('seller_id, product:products(title)')
          .eq('id', auctionId)
          .maybeSingle();
        const sellerId = auctionRow?.seller_id as string | undefined;
        const productTitle = (auctionRow as any)?.product?.title || 'your listing';
        if (sellerId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: sellerId,
              type: 'delivery_preferences_submitted',
              title: 'Buyer submitted delivery preferences',
              message: `The winning buyer has shared delivery/pickup preferences for ${productTitle}.`,
              auction_id: auctionId,
              metadata: {
                auction_id: auctionId,
                delivery_mode: mode,
                branch_id: mode === 'pickup' ? branchId || null : null,
                city: mode === 'delivery' ? city || null : null,
                state: mode === 'delivery' ? state || null : null,
              },
              read: false,
              read_at: null,
            });
        }
      } catch (notifyErr) {
        console.warn('DeliveryPreferences: failed to insert notification', notifyErr);
      }

      toast.success('Delivery preferences submitted successfully.');
      navigate('/my/won-auctions');
    } catch (e: any) {
      console.error('DeliveryPreferences: save error', e);
      toast.error(e.message || 'Unexpected error while saving delivery preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen py-16">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Unable to load this auction.'}</p>
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
  const imageUrl =
    product?.image_url ||
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        type="button"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600"
        onClick={() => navigate('/my/won-auctions')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Won Auctions
      </button>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Delivery preferences</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tell us how you want to receive your won item. You can choose delivery to your address or self pickup from a branch.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={product?.title || 'Won product'}
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
              {product?.title || 'Won product'}
            </h2>
            {auction.final_price != null && (
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Winning bid: <span className="font-semibold">₹{Number(auction.final_price).toLocaleString()}</span>
              </p>
            )}
            <p className="mt-1 text-[11px] text-gray-500">Auction ID: {auction.id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Choose how you want to receive this item</h3>
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <button
              type="button"
              onClick={() => setMode('delivery')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border ${
                mode === 'delivery'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Home className="h-3 w-3" />
              Delivery to address
            </button>
            <button
              type="button"
              onClick={() => setMode('pickup')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border ${
                mode === 'pickup'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Truck className="h-3 w-3" />
              Self pickup from branch
            </button>
          </div>

          {mode === 'pickup' && (
            <div className="space-y-2 text-xs">
              <label className="block text-[11px] text-gray-500 mb-1">Pickup branch</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">Select branch…</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.city ? ` – ${b.city}` : ''}
                    {b.state ? `, ${b.state}` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                You&apos;ll receive pickup instructions and documents at this branch after payment is verified.
              </p>
            </div>
          )}

          {mode === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Full name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Name for delivery"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Alternate phone (optional)</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="Alternate contact"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">Address line 1</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="House / Flat / Street"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">Address line 2 (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apartment / Landmark"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">State</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Pincode</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit pincode"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Country</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">Preferred delivery date / time (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g. Weekdays after 6pm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            You can update these preferences later by contacting support.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs md:text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save preferences'}
            {!saving && <ArrowRight className="h-3 w-3" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryPreferences;
