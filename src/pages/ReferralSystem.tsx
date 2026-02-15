import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  Users,
  Gift,
  Copy,
  CheckCircle,
  Trophy,
  TrendingUp,
  DollarSign,
  UserPlus,
  Link,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

// Mock referral data
const mockReferralData = {
  referralCode: 'QUICKMELA2024',
  totalReferrals: 12,
  successfulReferrals: 8,
  pendingReferrals: 4,
  totalEarnings: 2400,
  availableRewards: 1200,
  referralHistory: [
    { name: 'Rahul S.', status: 'successful', reward: 200, date: '2024-02-10' },
    { name: 'Priya M.', status: 'successful', reward: 200, date: '2024-02-08' },
    { name: 'Amit K.', status: 'pending', reward: 0, date: '2024-02-05' },
    { name: 'Sneha R.', status: 'successful', reward: 200, date: '2024-02-03' },
    { name: 'Vikram T.', status: 'successful', reward: 200, date: '2024-02-01' }
  ],
  rewardTiers: [
    { referrals: 5, reward: 500, achieved: true },
    { referrals: 10, reward: 1000, achieved: true },
    { referrals: 25, reward: 2500, achieved: false },
    { referrals: 50, reward: 5000, achieved: false }
  ]
};

const ReferralSystem: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${mockReferralData.referralCode}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareReferral = (platform: string) => {
    const message = `Join QuickMela - India's premier auction platform! Use my referral code ${mockReferralData.referralCode} to get started. ${referralLink}`;
    const url = encodeURIComponent(message);

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join QuickMela&body=${url}`;
        break;
      default:
        copyToClipboard(referralLink, 'link');
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
              <p className="text-gray-600 mt-1">Invite friends and earn rewards together</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                Earn up to ₹5,000
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{mockReferralData.totalReferrals}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-gray-900">{mockReferralData.successfulReferrals}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockReferralData.totalEarnings)}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Gift className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockReferralData.availableRewards)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Referral Code & Share */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-blue-600">
                    {mockReferralData.referralCode}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(mockReferralData.referralCode, 'code')}
                    variant="outline"
                    size="sm"
                  >
                    {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Referral Link</p>
                    <p className="text-sm font-mono text-gray-800 truncate">{referralLink}</p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(referralLink, 'link')}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Share Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share & Invite</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => shareReferral('whatsapp')}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareReferral('telegram')}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3"
                >
                  <MessageCircle className="h-5 w-5" />
                  Telegram
                </Button>
                <Button
                  onClick={() => shareReferral('email')}
                  className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2 py-3"
                >
                  <Mail className="h-5 w-5" />
                  Email
                </Button>
                <Button
                  onClick={() => shareReferral('copy')}
                  variant="outline"
                  className="flex items-center justify-center gap-2 py-3"
                >
                  <Share2 className="h-5 w-5" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Share your referral link and earn ₹200 for each successful signup!
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Reward Tiers & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reward Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Milestones</h3>
              <div className="space-y-4">
                {mockReferralData.rewardTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      tier.achieved
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {tier.achieved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Trophy className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className={`font-medium ${tier.achieved ? 'text-green-800' : 'text-gray-700'}`}>
                          {tier.referrals} Referrals
                        </p>
                        <p className="text-sm text-gray-600">Earn {formatCurrency(tier.reward)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tier.achieved ? 'text-green-600' : 'text-gray-500'}`}>
                        {formatCurrency(tier.reward)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Referral History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>
              <div className="space-y-3">
                {mockReferralData.referralHistory.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{referral.name}</p>
                        <p className="text-sm text-gray-600">{new Date(referral.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'successful'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status}
                      </span>
                      {referral.reward > 0 && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          +{formatCurrency(referral.reward)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;
