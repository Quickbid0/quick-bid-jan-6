import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { 
  User, 
  Building, 
  Shield, 
  Star, 
  MapPin, 
  Calendar,
  Package,
  TrendingUp,
  Award,
  CheckCircle,
  Phone,
  Mail,
  Eye,
  DollarSign,
  MessageSquare,
  Heart,
  Flag,
  Gavel
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SellerTrustSummary from '../components/auctions/SellerTrustSummary';
import { useSession } from '../context/SessionContext';

interface SellerProfile {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'third_party';
  avatar_url: string;
  bio: string;
  location: string;
  joined_date: string;
  verification_status: 'verified' | 'pending' | 'unverified';
  rating: number;
  total_sales: number;
  active_listings: number;
  response_rate: number;
  company_details?: {
    gst_number: string;
    license_number: string;
    established_year: string;
    business_type: string;
  };
}

const SellerProfile = () => {
  const { id } = useParams();
  const { isAdmin } = useSession();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [following, setFollowing] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ label: string; amount: number }[]>([]);

  const getTrustTier = () => {
    if (!seller) {
      return {
        label: 'New seller',
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        description: 'Just getting started on the marketplace',
      };
    }

    const verified = seller.verification_status === 'verified';
    const highRating = seller.rating >= 4.7;
    const midRating = seller.rating >= 4.2;
    const strongVolume = (seller.total_sales || 0) >= 500000;
    const someVolume = (seller.total_sales || 0) >= 100000;

    if (verified && highRating && strongVolume) {
      return {
        label: 'Top Rated Seller',
        color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        description: 'High rating, verified KYC, and strong sales history',
      };
    }

    if (verified && (midRating || someVolume)) {
      return {
        label: 'Trusted Seller',
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        description: 'Verified identity with a solid track record',
      };
    }

    return {
      label: 'New seller',
      color: 'bg-gray-100 text-gray-800 border border-gray-200',
      description: 'Building reputation on QuickBid',
    };
  };

  useEffect(() => {
    if (id) {
      fetchSellerProfile();
    }
  }, [id]);

  const fetchSellerProfile = async () => {
    try {
      if (!id) {
        setSeller(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/sellers/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load seller profile: ${res.status}`);
      }

      const data = await res.json();

      const totalSalesAmount =
        (data.totalSalesAmount ?? data.total_sales ?? data.totalItemsSold ?? 0) as number;
      const totalAuctions =
        (data.totalAuctions ?? data.total_auctions ?? 0) as number;

      const profile: SellerProfile = {
        id: data.sellerId || id,
        name: data.name || 'Seller',
        type: (data.type as SellerProfile['type']) || 'individual',
        avatar_url:
          data.avatarUrl ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        bio:
          data.bio ||
          'Seller on QuickBid. This profile is powered by real auction and settlement data.',
        location: data.location || 'India',
        joined_date: data.joinedAt || new Date().toISOString(),
        verification_status:
          data.verificationStatus === 'verified' || data.kyc_status === 'verified'
            ? 'verified'
            : 'pending',
        rating: data.rating ?? 4.5,
        total_sales: totalSalesAmount,
        active_listings: totalAuctions,
        response_rate: data.responseRate ?? 95,
        company_details: data.companyDetails,
      };

      setSeller(profile);

      const { data: auctions, error: auctionsError } = await supabase
        .from('auctions')
        .select(
          `
          id,
          auction_type,
          status,
          current_price,
          product:products(id, title, image_url, category)
        `
        )
        .eq('seller_id', id);

      if (auctionsError) {
        console.error('Error loading seller auctions for profile', auctionsError);
        setProducts([]);
      } else {
        const mappedProducts = (auctions || []).map((a: any) => ({
          id: a.product?.id || a.id,
          auction_id: a.id,
          auction_type: a.auction_type as 'live' | 'timed' | 'tender' | null,
          title: a.product?.title || 'Auction item',
          image_url:
            a.product?.image_url ||
            'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
          current_price: a.current_price ?? 0,
          status: a.status === 'active' || a.status === 'live' ? 'active' : 'sold',
          category: a.product?.category || 'General',
        }));
        setProducts(mappedProducts);
      }

      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('net_payout, status, created_at')
        .eq('seller_id', id);

      if (payoutsError) {
        console.error('Error loading seller payouts for profile', payoutsError);
        setTotalEarnings(0);
      } else {
        const completed = (payouts || []).filter((p: any) => p.status === 'completed');

        const sum = completed.reduce((acc: number, p: any) => {
          if (p.net_payout != null) {
            return acc + Number(p.net_payout);
          }
          return acc;
        }, 0);
        setTotalEarnings(sum);

        const now = new Date();
        const buckets: { [key: string]: number } = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          buckets[key] = 0;
        }

        completed.forEach((p: any) => {
          if (!p.created_at) return;
          const d = new Date(p.created_at);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          if (buckets[key] != null && p.net_payout != null) {
            buckets[key] += Number(p.net_payout);
          }
        });

        const ordered: { label: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          const monthLabel = d.toLocaleString('default', { month: 'short' });
          ordered.push({ label: monthLabel, amount: buckets[key] || 0 });
        }
        setMonthlyRevenue(ordered);
      }

      setReviews([]);
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  const getSellerTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building className="h-6 w-6 text-blue-500" />;
      case 'third_party':
        return <Shield className="h-6 w-6 text-purple-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };

  const getSellerTypeBadge = (type: string) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'third_party':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFollow = () => {
    setFollowing(!following);
    toast.success(following ? 'Unfollowed seller' : 'Following seller');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Seller not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Seller Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            <img
              src={seller.avatar_url}
              alt={seller.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{seller.name}</h1>
              {seller.verification_status === 'verified' && (
                <Shield className="h-6 w-6 text-green-500" />
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getSellerTypeBadge(seller.type)}`}>
                {getSellerTypeIcon(seller.type)}
                {seller.type === 'company' ? 'Company' : seller.type === 'third_party' ? 'Third Party' : 'Individual'}
              </span>
            </div>
            
            <div className="mb-3">
              <SellerTrustSummary
                name={seller.name}
                avatarUrl={seller.avatar_url}
                verified={seller.verification_status === 'verified'}
                verificationLabelVerified="Verified seller"
                verificationLabelPending="Verification in progress"
                rating={seller.rating}
                auctionsCount={seller.total_sales}
                profileHref={null}
                size="md"
              />
            </div>

            {(() => {
              const tier = getTrustTier();
              return (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${tier.color}`}>
                    <Shield className="h-3.5 w-3.5" />
                    {tier.label}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {tier.description}
                  </span>
                </div>
              );
            })()}

            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">{seller.bio}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {seller.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(seller.joined_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {seller.rating} rating ({reviews.length} reviews)
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                following 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Heart className="h-4 w-4" />
              {following ? 'Following' : 'Follow'}
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Report
            </button>

            {isAdmin && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300 flex flex-col gap-1">
                <span className="uppercase tracking-wide text-[10px] text-gray-400">
                  Admin shortcuts
                </span>
                <Link
                  to={`/admin/winners?sellerId=${encodeURIComponent(seller.id)}`}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
                >
                  <Eye className="h-3 w-3" />
                  View payouts for this seller
                </Link>
                <Link
                  to="/admin/seller-earnings"
                  className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white underline"
                >
                  <DollarSign className="h-3 w-3" />
                  Open seller earnings dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Details (if applicable) */}
      {seller.type === 'company' && seller.company_details && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="font-semibold">{seller.company_details.gst_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Number</p>
              <p className="font-semibold">{seller.company_details.license_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Established</p>
              <p className="font-semibold">{seller.company_details.established_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="font-semibold">{seller.company_details.business_type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{(seller.total_sales || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Sales Volume</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalEarnings.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Earnings (paid out)</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{seller.rating}</p>
          <p className="text-sm text-gray-500">Average Rating</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{seller.response_rate}%</p>
          <p className="text-sm text-gray-500">Response Rate</p>
        </div>
      </div>

      {monthlyRevenue.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Sales trend (last 6 months)
            </h2>
            <span className="text-xs text-gray-500">Based on completed payouts</span>
          </div>
          <div className="flex items-end gap-3 h-24">
            {monthlyRevenue.map((m) => {
              const max = Math.max(...monthlyRevenue.map((x) => x.amount || 0)) || 1;
              const height = (m.amount / max) * 100;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t bg-emerald-500/80 dark:bg-emerald-400/80"
                    style={{ height: `${height}%` }}
                    aria-hidden="true"
                  />
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">
                    {m.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'products', label: 'Products' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'about', label: 'About' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gavel className="h-4 w-4 text-green-600" />
                Active Auctions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter((p: any) => p.status === 'active').length === 0 && (
                  <p className="text-sm text-gray-500 col-span-full">
                    No active auctions for this seller right now.
                  </p>
                )}
                {products
                  .filter((p: any) => p.status === 'active')
                  .map((product: any) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.current_price.toLocaleString()}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <Link
                          to={
                            product.auction_type === 'live'
                              ? `/live-auction/${product.auction_id}`
                              : product.auction_type === 'timed'
                              ? `/timed-auction/${product.auction_id}`
                              : `/tender-auction/${product.auction_id}`
                          }
                          className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg text-center block hover:bg-indigo-700"
                        >
                          View Auction
                        </Link>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-700" />
                Completed Auctions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter((p: any) => p.status !== 'active').length === 0 && (
                  <p className="text-sm text-gray-500 col-span-full">
                    No completed auctions listed yet.
                  </p>
                )}
                {products
                  .filter((p: any) => p.status !== 'active')
                  .map((product: any) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-700">
                            ₹{product.current_price.toLocaleString()}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {product.status === 'sold' ? 'Sold' : product.status}
                          </span>
                        </div>
                        <Link
                          to={
                            product.auction_type === 'live'
                              ? `/live-auction/${product.auction_id}`
                              : product.auction_type === 'timed'
                              ? `/timed-auction/${product.auction_id}`
                              : `/tender-auction/${product.auction_id}`
                          }
                          className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-center block hover:bg-gray-200"
                        >
                          View Auction
                        </Link>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(seller.rating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-lg">{seller.rating}</span>
              </div>
            </div>
            
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <span className="font-medium">{review.buyer_name}</span>
                      {review.verified_purchase && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{review.comment}</p>
                <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About {seller.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{seller.bio}</p>
            </div>
            
            {seller.company_details && (
              <div>
                <h3 className="font-semibold mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-semibold">{seller.company_details.business_type}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-semibold">{seller.company_details.gst_number}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-semibold">{seller.company_details.established_year}</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">License</p>
                    <p className="font-semibold">{seller.company_details.license_number}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">Contact through platform messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">Available during business hours</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Verification Status</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600">Verified Seller</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Identity verified, business documents approved, and payment methods confirmed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;