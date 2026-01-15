import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { 
  Star, 
  Shield, 
  MapPin, 
  Calendar,
  Package,
  TrendingUp,
  Award,
  MessageSquare,
  Flag,
  Eye,
  Heart,
  DollarSign,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  joined_date: string;
  verification_status: 'verified' | 'pending' | 'unverified';
  rating: number;
  total_reviews: number;
  badges: string[];
  user_type: 'buyer' | 'seller' | 'company';
  stats: {
    items_sold: number;
    items_bought: number;
    total_bids: number;
    success_rate: number;
    total_spent: number;
    total_earned: number;
  };
  recent_activity: any[];
  specializations?: string[];
  company_details?: {
    gst_number: string;
    established_year: string;
    business_type: string;
  };
}

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [following, setFollowing] = useState(false);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      if (!id) return;

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching user profile:', profileError);
        setProfile(null);
        return;
      }

      const userType = profileData.user_type || (profileData.role === 'seller' ? 'seller' : 'buyer');
      
      // Initialize stats
      const stats = {
        items_sold: 0,
        items_bought: 0,
        total_bids: 0,
        success_rate: 0,
        total_spent: 0,
        total_earned: 0
      };

      let recentActivity: any[] = [];
      let fetchedListings: any[] = [];

      // 2. Fetch related data based on user type
      if (userType === 'seller' || userType === 'company') {
        // Fetch Seller Stats
        const { data: auctions } = await supabase
          .from('auctions')
          .select('id, status, current_price, final_price, created_at, title, product:products(image_url, title)')
          .eq('seller_id', id);

        const { data: payouts } = await supabase
          .from('payouts')
          .select('net_payout, status')
          .eq('seller_id', id);

        const soldAuctions = (auctions || []).filter((a: any) => a.status === 'sold' || a.status === 'completed');
        const activeAuctions = (auctions || []).filter((a: any) => a.status === 'active' || a.status === 'live');
        
        stats.items_sold = soldAuctions.length;
        stats.total_earned = (payouts || []).reduce((acc: number, p: any) => acc + (p.net_payout || 0), 0);
        
        fetchedListings = activeAuctions.map((a: any) => ({
            id: a.id,
            title: a.title || a.product?.title || 'Auction Item',
            image_url: a.product?.image_url || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
            current_price: a.current_price,
            status: a.status
        }));

        // Recent activity for seller: recently sold or listed
        recentActivity = (auctions || [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((a: any) => ({
                type: a.status === 'sold' ? 'sold' : 'posted',
                item: a.title || a.product?.title || 'Item',
                amount: a.final_price || a.current_price,
                time: new Date(a.created_at).toLocaleDateString()
            }));

      } else {
        // Buyer Stats
        const { data: bids } = await supabase
          .from('bids')
          .select('amount, created_at, auction:auctions(title)')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(50);

        const { data: wins } = await supabase
          .from('auctions')
          .select('final_price, title')
          .eq('winner_id', id);

        stats.total_bids = (bids || []).length;
        stats.items_bought = (wins || []).length;
        stats.total_spent = (wins || []).reduce((acc: number, w: any) => acc + (w.final_price || 0), 0);
        
        // Calculate success rate roughly
        stats.success_rate = stats.total_bids > 0 ? Math.round((stats.items_bought / stats.total_bids) * 100) : 0;

        recentActivity = (bids || []).slice(0, 5).map((b: any) => ({
            type: 'bid',
            item: b.auction?.title || 'Item',
            amount: b.amount,
            time: new Date(b.created_at).toLocaleDateString()
        }));
      }

      setListings(fetchedListings);

      // Construct Profile Object
      const constructedProfile: UserProfile = {
        id: profileData.id,
        name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : (profileData.email?.split('@')[0] || 'User'),
        avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80',
        bio: profileData.bio || `Member since ${new Date(profileData.created_at).getFullYear()}`,
        location: profileData.city || profileData.state || 'India',
        joined_date: profileData.created_at,
        verification_status: profileData.verification_status || (profileData.kyc_verified ? 'verified' : 'pending'),
        rating: 4.5, // Default rating if no reviews table easily accessible
        total_reviews: 0,
        badges: profileData.verification_status === 'verified' ? ['Verified User'] : [],
        user_type: userType,
        stats: stats,
        recent_activity: recentActivity,
        company_details: profileData.company_details,
        specializations: profileData.specializations
      };

      setProfile(constructedProfile);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setFollowing(!following);
    toast.success(following ? 'Unfollowed user' : 'Following user');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              {profile.verification_status === 'verified' && (
                <Shield className="h-6 w-6 text-green-500" />
              )}
              {profile.user_type === 'company' && (
                <Building className="h-6 w-6 text-blue-500" />
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">{profile.bio}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.joined_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {profile.rating} ({profile.total_reviews} reviews)
              </div>
              {profile.user_type === 'company' && profile.company_details && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Est. {profile.company_details.established_year}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.badges.map((badge, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full flex items-center gap-1"
                >
                  <Award className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>

            {profile.specializations && profile.specializations.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
          </div>
        </div>
      </div>

      {/* Company Details (if applicable) */}
      {profile.user_type === 'company' && profile.company_details && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">GST Number</p>
              <p className="font-semibold">{profile.company_details.gst_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Established</p>
              <p className="font-semibold">{profile.company_details.established_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="font-semibold">{profile.company_details.business_type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.items_sold}</p>
          <p className="text-sm text-gray-500">Items Sold</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.items_bought}</p>
          <p className="text-sm text-gray-500">Items Bought</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.total_bids}</p>
          <p className="text-sm text-gray-500">Total Bids</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.success_rate}%</p>
          <p className="text-sm text-gray-500">Success Rate</p>
        </div>
      </div>

      {/* Financial Stats (for sellers/companies) */}
      {(profile.user_type === 'seller' || profile.user_type === 'company') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">₹{(profile.stats.total_earned / 100000).toFixed(1)}L</p>
            <p className="text-sm text-gray-500">Total Earned</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">₹{(profile.stats.total_spent / 100000).toFixed(1)}L</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'activity', label: 'Recent Activity' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'listings', label: profile.user_type === 'company' ? 'Products' : 'Listings' }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">About {profile.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>
            
            {profile.specializations && profile.specializations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Specializations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {profile.specializations.map((spec, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <p className="font-medium text-sm">{spec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.company_details && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-semibold">{profile.company_details.business_type}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-semibold">{profile.company_details.gst_number}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-semibold">{profile.company_details.established_year}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {profile.recent_activity.length === 0 ? (
                <p className="text-gray-500">No recent activity.</p>
            ) : (
                profile.recent_activity.map((activity, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                    <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                        activity.type === 'won' ? 'bg-green-100 text-green-600' :
                        activity.type === 'sold' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'bid' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                    }`}>
                        {activity.type === 'won' && <Award className="h-4 w-4" />}
                        {activity.type === 'sold' && <Package className="h-4 w-4" />}
                        {activity.type === 'bid' && <TrendingUp className="h-4 w-4" />}
                        {activity.type === 'posted' && <Package className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-medium">
                        {activity.type === 'bid' ? 'Placed bid on' : 
                        activity.type === 'won' ? 'Won auction for' : 
                        activity.type === 'sold' ? 'Sold' :
                        activity.type === 'posted' ? 'Posted' : ''} {activity.item}
                        </p>
                        {activity.amount > 0 && (
                        <p className="text-sm text-gray-500">₹{activity.amount.toLocaleString()}</p>
                        )}
                    </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                </motion.div>
                ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Reviews ({profile.total_reviews})</h3>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(profile.rating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-lg">{profile.rating}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Mock reviews for now as no reviews table was identified clearly */}
              <p className="text-gray-500">No reviews yet.</p>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {profile.user_type === 'company' ? 'Recent Products' : 'Active Listings'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.length === 0 ? (
                  <p className="text-gray-500">No active listings.</p>
              ) : (
                  listings.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-medium mb-1 truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">
                            {item.status}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600">
                            ₹{item.current_price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
