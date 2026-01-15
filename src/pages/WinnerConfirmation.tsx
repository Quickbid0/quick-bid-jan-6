import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { Trophy, Shield, Phone, MapPin, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import AuctionTypeBadge from '../components/auctions/AuctionTypeBadge';
import SellerInfoCard from '../components/auctions/SellerInfoCard';
import NextStepLabel from '../components/buyer/NextStepLabel';

const isValidIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return /^[6-9]\d{9}$/.test(digits.slice(1));
  }
  return false;
};

const isValidPincode = (value: string) => /^[1-9]\d{5}$/.test(value);

interface GstBreakup {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  gstRate: number;
  mode: 'margin' | 'normal' | 'none';
}

const calculateGstBreakup = (params: {
  productCategory: string;
  mainCategory?: string | null;
  finalPrice: number;
  condition?: string | null;
  purchasePrice?: number | null;
  state?: string | null;
}): GstBreakup => {
  const {
    productCategory,
    mainCategory,
    finalPrice,
    condition,
    purchasePrice,
    state = 'Telangana',
  } = params;

  const cat = (mainCategory || productCategory || '').toLowerCase();
  const isVehicle = /vehicle|car|bike|scooter|truck|tractor|bus|commercial|two wheeler|four wheeler/.test(cat);
  const isCreative = /art|painting|canvas|creative|handmade|craft/.test(cat);
  const isSecondHand = condition && condition !== 'new';

  const vehicleRate = 18;
  const artRate = 12;

  if (state === 'Telangana' && isVehicle && isSecondHand) {
    const cost = purchasePrice ?? 0;
    const margin = Math.max(finalPrice - cost, 0);
    const gstAmount = (margin * vehicleRate) / 100;
    return {
      baseAmount: finalPrice,
      gstAmount,
      totalAmount: finalPrice + gstAmount,
      gstRate: vehicleRate,
      mode: 'margin',
    };
  }

  if (state === 'Telangana' && isCreative && isSecondHand) {
    const gstAmount = (finalPrice * artRate) / 100;
    return {
      baseAmount: finalPrice,
      gstAmount,
      totalAmount: finalPrice + gstAmount,
      gstRate: artRate,
      mode: 'normal',
    };
  }

  return {
    baseAmount: finalPrice,
    gstAmount: 0,
    totalAmount: finalPrice,
    gstRate: 0,
    mode: 'none',
  };
};

interface WinnerAuction {
  id: string;
  status: string;
  winner_id: string | null;
  final_price: number | null;
  auction_type?: 'live' | 'timed' | 'flash' | 'tender' | null;
  seller?: {
    id: string;
  } | null;
  product: {
    id: string;
    title: string;
    image_url?: string | null;
    category?: string | null;
    main_category?: string | null;
    sub_category?: string | null;
    final_price?: number | null;
    current_price?: number | null;
    starting_price?: number | null;
  } | null;
}

interface PayoutSummary {
  sale_price: number | null;
  commission_amount: number | null;
  net_payout: number | null;
  status: string | null;
}

const WinnerConfirmation: React.FC = () => {
  const { auctionId } = useParams();
  const [auction, setAuction] = useState<WinnerAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isKycOk, setIsKycOk] = useState<boolean>(true);
  const [payout, setPayout] = useState<PayoutSummary | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | ''>('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('IN');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const hasPreferences = Boolean(deliveryMode);
  const normalizedPayment = (paymentStatus || '').toLowerCase();
  const canProceedToPayment = Boolean(isWinner) && !!auctionId;
  const shouldPay = canProceedToPayment && (normalizedPayment === '' || normalizedPayment === 'rejected' || normalizedPayment === 'partial_payment');
  const canSetPreferences = Boolean(isWinner) && !!auctionId;

  useEffect(() => {
    const loadWinnerData = async () => {
      if (!auctionId) {
        setError('Missing auction reference.');
        setLoading(false);
        return;
      }

      try {
        const [{ data: { user } }, { data, error: auctionError }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from('auctions')
            .select(`
              id,
              status,
              winner_id,
              final_price,
              auction_type,
              seller:profiles(id),
              product:products(id, title, image_url, category, main_category, sub_category, final_price, current_price, starting_price)
            `)
            .eq('id', auctionId)
            .single(),
        ] as any);

        if (auctionError) {
          console.error('Error loading winner auction', auctionError);
          setError('We could not find this auction.');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('We could not find this auction.');
          setLoading(false);
          return;
        }

        setAuction(data as WinnerAuction);

        try {
          const [payoutRes, winPaymentsRes] = await Promise.all([
            supabase
              .from('payouts')
              .select('sale_price, commission_amount, net_payout, status')
              .eq('payout_reference', data.id)
              .maybeSingle(),
            user
              ? supabase
                  .from('win_payments')
                  .select('status, submitted_at')
                  .eq('auction_id', data.id)
                  .eq('buyer_id', user.id)
                  .order('submitted_at', { ascending: false })
                  .limit(1)
              : Promise.resolve({ data: null, error: null } as any),
          ]);

          if (payoutRes.error) {
            console.error('Error loading payout summary for winner confirmation', payoutRes.error);
          } else if (payoutRes.data) {
            const payoutRow: any = payoutRes.data;
            setPayout({
              sale_price: payoutRow.sale_price != null ? Number(payoutRow.sale_price) : null,
              commission_amount: payoutRow.commission_amount != null ? Number(payoutRow.commission_amount) : null,
              net_payout: payoutRow.net_payout != null ? Number(payoutRow.net_payout) : null,
              status: payoutRow.status || null,
            });
          } else {
            setPayout(null);
          }

          if (!('error' in winPaymentsRes) || winPaymentsRes.error) {
            if (winPaymentsRes && (winPaymentsRes as any).error) {
              console.error('Error loading win_payments for winner confirmation', (winPaymentsRes as any).error);
            }
          } else {
            const wpData = (winPaymentsRes as any).data as any[] | null;
            if (wpData && wpData.length > 0) {
              setPaymentStatus(wpData[0].status || null);
            } else {
              setPaymentStatus(null);
            }
          }
        } catch (payoutErr) {
          console.error('Unexpected error loading payout / win_payments for winner confirmation', payoutErr);
        }

        if (!user) {
          setIsWinner(null);
          setUserId(null);
        } else {
          const winner = data.winner_id === user.id;
          setIsWinner(winner);
          setUserId(user.id);

          if (winner) {
            try {
              // Check KYC status
              const { data: profile } = await supabase
                .from('profiles')
                .select('is_verified, verification_status, name, phone')
                .eq('id', user.id)
                .single();

              const kycOk = !!profile && ((profile as any).is_verified || (profile as any).verification_status === 'approved');
              setIsKycOk(kycOk);

              // Load existing winner delivery preferences, if any
              const { data: pref } = await supabase
                .from('winner_delivery_preferences')
                .select('*')
                .eq('auction_id', auctionId)
                .eq('winner_id', user.id)
                .maybeSingle();

              if (pref) {
                setDeliveryMode((pref as any).delivery_mode as 'delivery' | 'pickup');
                setAddressLine1((pref as any).address_line1 || '');
                setAddressLine2((pref as any).address_line2 || '');
                setCity((pref as any).city || '');
                setStateName((pref as any).state || '');
                setPincode((pref as any).pincode || '');
                setCountry((pref as any).country || 'IN');
                setPrimaryPhone((pref as any).primary_phone || '');
                setAlternatePhone((pref as any).alternate_phone || '');
                setContactName((pref as any).contact_name || '');
              } else {
                // Prefill with profile phone and name if available
                if (profile) {
                  setPrimaryPhone((profile as any).phone || '');
                  setContactName((profile as any).name || '');
                }
              }
            } catch (prefErr) {
              console.error('Error loading winner delivery preferences/profile', prefErr);
            }
          }
        }
      } catch (e) {
        console.error('Unexpected error loading winner data', e);
        setError('Something went wrong while loading your winner details.');
      } finally {
        setLoading(false);
      }
    };

    loadWinnerData();
  }, [auctionId]);

  if (loading) {
    return (
      <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Winner Confirmation</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your win details…</p>
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Winner Confirmation</h1>
                <p className="text-sm text-red-500 dark:text-red-400 font-medium">Failed to load your win details</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Winner details unavailable</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Retry
              </button>
              <Link to="/my/won-auctions" className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                My Wins
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return null;
  }

  const productTitle = auction.product?.title || 'Your item';
  const imageUrl =
    auction.product?.image_url ||
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80';

  const showWinnerWarning = isWinner === false;

  const productCategory = (auction.product?.main_category || auction.product?.category || auction.product?.sub_category || '').toLowerCase();
  const isVehicleCategory = /vehicle|car|bike|scooter|truck|tractor|bus|commercial|two wheeler|four wheeler/.test(productCategory);
  const isCreativeCategory = /art|painting|canvas|creative|handmade|craft/.test(productCategory);
  const productPrice =
    auction.final_price ??
    auction.product?.final_price ??
    auction.product?.current_price ??
    auction.product?.starting_price ??
    0;
  const isUnder40k = productPrice <= 40000;
  const deliveryAllowed = isCreativeCategory && !isVehicleCategory && isUnder40k && isKycOk;

  const gstBreakup: GstBreakup = calculateGstBreakup({
    productCategory: auction.product?.category || '',
    mainCategory: auction.product?.main_category || null,
    finalPrice: productPrice,
    // For now we assume second-hand condition and no purchase price details on client side.
    condition: 'used',
    purchasePrice: null,
    state: 'Telangana',
  });

  const handleSubmitPreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(null);
    setFormError(null);

    if (!auctionId || !userId) {
      setFormError('You must be logged in as the winner to save preferences.');
      return;
    }

    if (!deliveryMode) {
      setFormError('Please select whether you prefer delivery or pickup.');
      return;
    }

    if (!deliveryAllowed && deliveryMode === 'delivery') {
      setFormError('Home delivery is not available for this item. Please choose pickup from branch.');
      return;
    }

    if (deliveryAllowed && deliveryMode === 'delivery' && (!addressLine1 || !city || !stateName || !pincode)) {
      setFormError('Please fill address line 1, city, state and pincode for delivery.');
      return;
    }

    if (!primaryPhone) {
      setFormError('Please enter a primary phone number for coordination.');
      return;
    }

    if (!isValidIndianMobile(primaryPhone)) {
      setFormError('Please enter a valid Indian mobile number.');
      return;
    }

    if (deliveryAllowed && deliveryMode === 'delivery') {
      if (!isValidPincode(pincode)) {
        setFormError('Please enter a valid 6-digit PIN code.');
        return;
      }
    }

    setSaving(true);
    try {
      const { error: upsertError } = await supabase
        .from('winner_delivery_preferences')
        .upsert(
          {
            auction_id: auctionId,
            winner_id: userId,
            delivery_mode: deliveryMode,
            address_line1: addressLine1 || null,
            address_line2: addressLine2 || null,
            city: city || null,
            state: stateName || null,
            pincode: pincode || null,
            country: country || 'IN',
            primary_phone: primaryPhone,
            alternate_phone: alternatePhone || null,
            contact_name: contactName || null,
          },
          { onConflict: 'auction_id,winner_id' },
        );

      if (upsertError) {
        console.error('Error saving winner delivery preferences', upsertError);
        setFormError('Failed to save your delivery / pickup preferences. Please try again.');
        return;
      }

      setFormMessage('Your delivery / pickup preferences have been saved. Our team will review and contact you.');
    } catch (e) {
      console.error('Unexpected error saving winner delivery preferences', e);
      setFormError('Something went wrong while saving your preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="flex-shrink-0 relative">
            <img
              src={imageUrl}
              alt={productTitle}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 bg-yellow-100 rounded-full p-2 shadow">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                You won this auction
              </h1>
              {auction.auction_type && (
                <AuctionTypeBadge type={auction.auction_type as any} />
              )}
            </div>
            <div className="mb-2">
              <NextStepLabel auctionStatus={auction.status || null} paymentStatus={paymentStatus} />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {productTitle}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mt-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Auction ID: {auction.id}</span>
              </div>
              {auction.final_price && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    Winning bid: {auction.final_price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {auction.seller?.id && (
              <div className="mt-4 max-w-md space-y-2">
                <SellerInfoCard sellerId={auction.seller.id} />
                <div>
                  <Link
                    to={`/seller/${auction.seller.id}`}
                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                  >
                    View seller profile
                  </Link>
                </div>
              </div>
            )}

            {showWinnerWarning && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>
                  You are viewing this page, but our records show a different winner for this auction.
                  Please contact QuickMela support if you believe this is an error.
                </span>
              </div>
            )}
          </div>
        </div>

        {isWinner && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
            <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              What happens next
            </h2>
            <ol className="space-y-1 text-xs text-indigo-900/90 dark:text-indigo-100/90 list-decimal list-inside">
              <li>
                Complete payment or deposit as per the instructions shared by QuickMela / the seller.
              </li>
              <li>
                Share your delivery / pickup preferences below so our team can plan logistics.
              </li>
              <li>
                Track delivery or pickup updates via SMS / calls and your QuickMela account.
              </li>
            </ol>
          </div>
        )}

        {isWinner && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {shouldPay && (
                <Link
                  to={`/pay/${auctionId}`}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  Pay now
                </Link>
              )}
              {canSetPreferences && (
                <Link
                  to={`/delivery-preferences/${auctionId}`}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-indigo-700"
                >
                  {hasPreferences ? 'Update delivery preferences' : 'Set delivery preferences'}
                </Link>
              )}
              <Link
                to="/my/won-auctions"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Back to My Wins
              </Link>
            </div>
            {auctionId && (
              <Link
                to={`/order-tracking/${auctionId}`}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 underline"
              >
                Track delivery
              </Link>
            )}
          </div>
        )}

        {auction.final_price && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Charges summary (indicative)
              </h2>
              <p className="text-xs text-gray-700 dark:text-gray-200">
                Winning bid: ₹{gstBreakup.baseAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-200">
                GST{gstBreakup.mode === 'margin' ? ' (margin scheme)' : gstBreakup.mode === 'normal' ? '' : ' (not applicable)'}: ₹
                {gstBreakup.gstAmount.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                Total payable (approx.): ₹{gstBreakup.totalAmount.toLocaleString()}
              </p>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Exact GST and total payable may vary slightly based on final invoice and GST rules for
                second-hand vehicles and creative items in your state.
              </p>
            </div>
            {payout && (
              <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  How your payment is split (for transparency)
                </h2>
                <p className="text-xs text-gray-700 dark:text-gray-200">
                  Winning bid / sale price used for settlement:{' '}
                  <span className="font-semibold">
                    ₹{(payout.sale_price ?? auction.final_price).toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-200">
                  Platform commission & fees charged to seller:{' '}
                  <span className="font-semibold">
                    {payout.commission_amount != null
                      ? `₹${payout.commission_amount.toLocaleString()}`
                      : 'as per seller settlement terms'}
                  </span>
                </p>
                {payout.net_payout != null && (
                  <p className="text-xs text-gray-900 dark:text-gray-100 mt-1">
                    Seller receives after commission:{' '}
                    <span className="font-semibold">
                      ₹{payout.net_payout.toLocaleString()}
                    </span>
                  </p>
                )}
                {payout.status && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Seller settlement status:{' '}
                    <span className="capitalize">{payout.status.replace('_', ' ')}</span>
                  </p>
                )}
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  This commission is <span className="font-semibold">not an extra fee on top of your winning bid</span>.
                  It is deducted from the seller&apos;s payout for running the auction and buyer operations.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
              <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS & winner ID
              </h2>
              <p className="text-sm text-indigo-900/80 dark:text-indigo-100/90">
                We have sent an SMS to your registered mobile number with your winner ID / claim code
                for this auction. Please keep that SMS safe.
              </p>
              <p className="mt-2 text-xs text-indigo-900/70 dark:text-indigo-200/80">
                You must show this SMS (or a clear screenshot) along with your government ID when you
                claim the vehicle.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <h2 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ID proof required
              </h2>
              <p className="text-sm text-green-900/80 dark:text-green-100/90">
                At the time of delivery or pickup, you must show any valid government photo ID that
                matches the name on your QuickMela account.
              </p>
              <ul className="mt-2 text-xs text-green-900/80 dark:text-green-100/90 list-disc list-inside space-y-1">
                <li>Aadhaar card</li>
                <li>Driving licence</li>
                <li>Passport</li>
                <li>Any other accepted government ID</li>
              </ul>
              <p className="mt-2 text-xs text-green-900/80 dark:text-green-100/90">
                Carry original documents. You may also be asked to share a clear photo or screenshot
                for records.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery or pickup
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                Delivery availability depends on the specific vehicle and location.
              </p>
              <ul className="text-xs text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                <li>
                  If home delivery is available for this vehicle, you must pay the full winning amount
                  and applicable delivery charges to QuickMela before dispatch.
                </li>
                <li>
                  If delivery is not available, you will need to pick up the vehicle from the nearest
                  QuickMela / yard branch as mentioned in your final invoice or SMS.
                </li>
              </ul>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                Our team will share exact delivery / pickup instructions by SMS or call after basic
                verification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <h2 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Important refund policy
              </h2>
              <p className="text-sm text-red-900/80 dark:text-red-100/90">
                Once you win an auction for this vehicle, standard refund policies do not apply to the
                winning bid amount.
              </p>
              <ul className="mt-2 text-xs text-red-900/80 dark:text-red-100/90 list-disc list-inside space-y-1">
                <li>No refund or cancellation is allowed after you are declared the winner.</li>
                <li>Security deposits for losing bidders are refunded as per policy, but the winner&apos;s
                  obligations remain.</li>
              </ul>
              <p className="mt-2 text-xs text-red-900/70 dark:text-red-100/80">
                Please proceed only if you are ready to complete payment and take delivery / pickup of
                the vehicle.
              </p>
            </div>

            {isWinner && (
              <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Tell us how you want to receive the vehicle
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  This information helps QuickMela plan delivery or pickup. Our team may call you on
                  the number you provide to confirm details.
                </p>

                {formError && (
                  <div className="mb-3 text-xs text-red-600 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {formMessage && (
                  <div className="mb-3 text-xs text-green-600 flex items-start gap-1">
                    <CheckCircle className="h-3 w-3 mt-0.5" />
                    <span>{formMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitPreferences} className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery preference
                    </p>
                    <div className="flex flex-col gap-1 text-xs text-gray-800 dark:text-gray-100">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="delivery_mode"
                          value="delivery"
                          checked={deliveryMode === 'delivery'}
                          onChange={() => deliveryAllowed && setDeliveryMode('delivery')}
                          className="radio radio-xs"
                          disabled={!deliveryAllowed}
                        />
                        <span>
                          Deliver to my address
                          {!deliveryAllowed && ' (only for eligible verified art/crafts up to  40,000)'}
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="delivery_mode"
                          value="pickup"
                          checked={deliveryMode === 'pickup'}
                          onChange={() => setDeliveryMode('pickup')}
                          className="radio radio-xs"
                        />
                        <span>I will pick up from QuickMela yard / branch</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Contact name</label>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full text-xs"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Person who will receive / pick up the vehicle"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Primary phone</label>
                      <input
                        type="tel"
                        className="input input-sm input-bordered w-full text-xs"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">Alternate phone (optional)</label>
                      <input
                        type="tel"
                        className="input input-sm input-bordered w-full text-xs"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {deliveryAllowed && deliveryMode === 'delivery' && (
                    <div className="grid grid-cols-1 gap-3 mt-1">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Address line 1</label>
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full text-xs"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="House / flat, building, street"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Address line 2 (optional)</label>
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full text-xs"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Area, landmark"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1">City</label>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-full text-xs"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1">State</label>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-full text-xs"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="e.g. Maharashtra"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-1">Pincode</label>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-full text-xs"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="6-digit PIN"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Country</label>
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full text-xs"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save preference'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerConfirmation;
