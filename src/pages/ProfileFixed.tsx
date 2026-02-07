import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Settings,
  Camera,
  Edit2,
  Save,
  X,
  Package,
  Heart,
  Gavel,
  Clock,
  Star,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function ProfileFixed() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    joinDate: 'January 15, 2024',
    role: 'buyer',
    avatar: '',
    verified: true,
    rating: 4.8,
    totalBids: 45,
    wonAuctions: 12,
    totalSpent: 256000,
    watchlistCount: 23
  });

  const [formData, setFormData] = useState({ ...profile });

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile({ ...formData });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4011/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      localStorage.removeItem('demo-session');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bids', label: 'My Bids', icon: Gavel },
    { id: 'won', label: 'Won Auctions', icon: Package },
    { id: 'watchlist', label: 'Watchlist', icon: Heart }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            {isEditing && (
              <button className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
            )}
            {profile.verified && (
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile.address}</span>
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile.joinDate}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{profile.rating} rating</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Gavel className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{profile.totalBids}</span>
          </div>
          <p className="text-sm text-gray-600">Total Bids</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{profile.wonAuctions}</span>
          </div>
          <p className="text-sm text-gray-600">Won Auctions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{formatPrice(profile.totalSpent)}</span>
          </div>
          <p className="text-sm text-gray-600">Total Spent</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{profile.watchlistCount}</span>
          </div>
          <p className="text-sm text-gray-600">Watchlist</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/buyer/auctions')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Gavel className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">Browse Auctions</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate('/watchlist')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="font-medium">My Watchlist</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Wallet</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Bids</h3>
              <p className="text-gray-600">View and manage all your auction bids</p>
              <button
                onClick={() => navigate('/buyer/auctions')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Active Bids
              </button>
            </div>
          )}

          {activeTab === 'won' && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Won Auctions</h3>
              <p className="text-gray-600">Track your won auctions and deliveries</p>
              <button
                onClick={() => navigate('/my/won-auctions')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Won Items
              </button>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Watchlist</h3>
              <p className="text-gray-600">Items you're interested in</p>
              <button
                onClick={() => navigate('/watchlist')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Watchlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
