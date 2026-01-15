import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Star, Shield, MapPin, Calendar, Package, 
  TrendingUp, Award, MessageSquare, Flag, Heart, 
  Building, Edit, Settings, Lock, Bell, CreditCard,
  ShieldCheck, AlertCircle, Clock, DollarSign, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';

// Types
type UserType = 'buyer' | 'seller' | 'admin' | 'company';
type VerificationStatus = 'verified' | 'pending' | 'unverified';
type AccountStatus = 'active' | 'suspended' | 'restricted';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  joined_date: string;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  user_type: UserType;
  stats: {
    total_bids: number;
    items_won: number;
    items_sold: number;
    total_spent: number;
    total_earned: number;
    success_rate: number;
    avg_rating: number;
    total_reviews: number;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  company_details?: {
    name: string;
    registration_number: string;
    gst_number: string;
    business_type: string;
    established_year: string;
    website?: string;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    amount?: number;
    timestamp: string;
    status?: string;
  }>;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { session, userProfile: currentUser } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  // Check if viewing own profile
  useEffect(() => {
    if (userId && currentUser?.id === userId) {
      setIsCurrentUser(true);
    }
  }, [userId, currentUser]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId || currentUser?.id)
          .single();

        if (error) throw error;

        if (data) {
          // Adapt the fetched data to the UserProfile interface
          const profileData: UserProfile = {
            id: data.id,
            name: data.full_name || 'Unknown User',
            email: data.email || '',
            phone: data.phone_number,
            avatar_url: data.avatar_url || '',
            cover_url: data.cover_url,
            bio: data.bio,
            location: data.location,
            joined_date: data.created_at || new Date().toISOString(),
            verification_status: data.verification_status || 'unverified',
            account_status: data.status || 'active',
            user_type: data.user_type || 'buyer',
            stats: {
              total_bids: 0,
              items_won: 0,
              items_sold: 0,
              total_spent: 0,
              total_earned: 0,
              success_rate: 0,
              avg_rating: 0,
              total_reviews: 0
            },
            badges: [],
            recent_activity: []
          };

          // Try to fetch company details if applicable
          if (data.user_type === 'company' || data.user_type === 'seller') {
             // In a real scenario, fetch from a separate table or jsonb field
             // For now, we leave it as undefined or minimal
          }

          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(`You ${!isFollowing ? 'followed' : 'unfollowed'} ${profile?.name}`);
  };

  const handleMessage = () => {
    // Implement messaging functionality
    toast.success(`Message sent to ${profile?.name}`);
  };

  const renderVerificationBadge = () => {
    if (!profile) return null;
    
    const statusConfig = {
      verified: {
        icon: <ShieldCheck className="h-4 w-4" />,
        text: 'Verified',
        color: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
      },
      pending: {
        icon: <Clock className="h-4 w-4" />,
        text: 'Verification Pending',
        color: 'bg-yellow-100 text-yellow-800',
        iconColor: 'text-yellow-600'
      },
      unverified: {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Unverified',
        color: 'bg-gray-100 text-gray-800',
        iconColor: 'text-gray-600'
      }
    };

    const config = statusConfig[profile.verification_status] || statusConfig.unverified;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className={`mr-1 ${config.iconColor}`}>
          {config.icon}
        </span>
        {config.text}
      </span>
    );
  };

  const renderStats = () => {
    if (!profile) return null;

    const stats = [
      {
        name: profile.user_type === 'seller' || profile.user_type === 'company' ? 'Items Sold' : 'Items Won',
        value: profile.user_type === 'seller' || profile.user_type === 'company' 
          ? profile.stats.items_sold 
          : profile.stats.items_won,
        icon: <Package className="h-6 w-6" />,
        change: '+12%',
        changeType: 'increase'
      },
      {
        name: 'Total Bids',
        value: profile.stats.total_bids,
        icon: <TrendingUp className="h-6 w-6" />,
        change: '+8%',
        changeType: 'increase'
      },
      {
        name: 'Success Rate',
        value: `${profile.stats.success_rate}%`,
        icon: <Award className="h-6 w-6" />,
        change: '+5%',
        changeType: 'increase'
      },
      {
        name: profile.user_type === 'buyer' ? 'Total Spent' : 'Total Earned',
        value: profile.user_type === 'buyer' 
          ? `₹${(profile.stats.total_spent / 100000).toFixed(1)}L` 
          : `₹${(profile.stats.total_earned / 100000).toFixed(1)}L`,
        icon: <DollarSign className="h-6 w-6" />,
        change: profile.user_type === 'buyer' ? '-3%' : '+15%',
        changeType: profile.user_type === 'buyer' ? 'decrease' : 'increase'
      }
    ];

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabs = () => {
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {['overview', 'activity', 'reviews', 'listings'].map((tab) => {
            const tabTitles = {
              overview: 'Overview',
              activity: 'Activity',
              reviews: 'Reviews',
              listings: profile?.user_type === 'company' ? 'Products' : 'Listings'
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tabTitles[tab as keyof typeof tabTitles]}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">About {profile.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and information.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                  </div>
                  {profile.phone && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.phone}</dd>
                    </div>
                  )}
                  {profile.location && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.location}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Member since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(profile.joined_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Account status</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {profile.account_status}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {profile.company_details && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Company Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.company_details.name}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Business Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.company_details.business_type}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">GST Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.company_details.gst_number}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Established</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.company_details.established_year}</dd>
                    </div>
                    {profile.company_details.website && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Website</dt>
                        <dd className="mt-1 text-sm">
                          <a 
                            href={profile.company_details.website.startsWith('http') ? 
                              profile.company_details.website : 
                              `https://${profile.company_details.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            {profile.company_details.website}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        );

      case 'activity':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {profile.recent_activity.map((activity) => (
                  <li key={activity.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          {activity.type === 'bid' && (
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                          )}
                          {activity.type === 'sale' && (
                            <DollarSign className="h-5 w-5 text-green-500" />
                          )}
                          {activity.type === 'review' && (
                            <Star className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {activity.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          {activity.amount && (
                            <p className="text-sm font-medium text-gray-900">
                              ₹{activity.amount.toLocaleString()}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Reviews ({profile.stats.total_reviews})
                </h3>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-gray-900 font-medium">
                    {profile.stats.avg_rating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({profile.stats.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to leave a review!
              </p>
            </div>
          </div>
        );

      case 'listings':
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {profile.user_type === 'company' ? 'Products' : 'Listings'}
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <p className="text-gray-500 text-sm">
                No {profile.user_type === 'company' ? 'products' : 'listings'} found.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No profile found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
        {profile.cover_url && (
          <img
            src={profile.cover_url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 pt-6 pb-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-full ring-4 ring-white"
                    src={profile.avatar_url}
                    alt={profile.name}
                  />
                  {isCurrentUser && (
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit profile picture</span>
                    </button>
                  )}
                </div>
                <div className="ml-6">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    {profile.user_type === 'company' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Building className="h-3 w-3 mr-1" />
                        Business
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                    </span>
                    {renderVerificationBadge()}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{profile.bio || 'No bio provided'}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {profile.location && (
                      <div className="flex items-center">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {profile.location}
                      </div>
                    )}
                    <div className="hidden md:flex ml-4 items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Member since {new Date(profile.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-3">
                {!isCurrentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={handleFollow}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-indigo-600 hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      <Heart className={`-ml-1 mr-2 h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      type="button"
                      onClick={handleMessage}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <MessageSquare className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                      Message
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Settings className="-ml-1 mr-2 h-4 w-4" />
                      Settings
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            {profile.badges.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 px-6 py-5 sm:px-8">
            {renderStats()}
          </div>

          {/* Side Navigation */}
          <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
            <div className="flex flex-wrap gap-3">
              <a href="/profile" className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50">Profile</a>
              <a href="/my/orders" className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50">Orders</a>
              <a href="/watchlist" className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50">Watchlist</a>
              <a href="/settings" className="px-3 py-1.5 rounded-md border border-gray-200 text-sm hover:bg-gray-50">Settings ⚙️</a>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-8">
            {renderTabs()}
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 sm:px-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
