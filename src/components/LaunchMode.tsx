// Launch Mode UI Components
// These components dynamically show based on feature flags and campaign status

import React, { useEffect, useState } from 'react';
import { Sparkles, Gift, Users, TrendingUp, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LaunchBannerProps {
  isVisible: boolean;
  campaignName?: string;
  endDate?: Date;
  benefits: string[];
}

export const LaunchBanner: React.FC<LaunchBannerProps> = ({
  isVisible,
  campaignName = 'Launch Week',
  endDate,
  benefits
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (endDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

          setTimeLeft(days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`);
        } else {
          setTimeLeft('Ended');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [endDate]);

  if (!isVisible || isDismissed) return null;

  return (
    <Fragment>
      <div
}
}
}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="font-bold text-lg">{campaignName}</span>
              </div>

              {timeLeft && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{timeLeft} left</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <span key={index} className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {benefit}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

interface FreeWeekBadgeProps {
  type: 'buyer' | 'seller';
  isActive: boolean;
}

export const FreeWeekBadge: React.FC<FreeWeekBadgeProps> = ({ type, isActive }) => {
  if (!isActive) return null;

  return (
    <div
}
}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
    >
      <Gift className="h-4 w-4" />
      FREE {type.toUpperCase()} WEEK
      <Sparkles className="h-3 w-3 text-yellow-300" />
    </div>
  );
};

interface AccountTierBadgeProps {
  tier: {
    name: string;
    badge: string;
    walletBonus: number;
  };
  isVisible: boolean;
}

export const AccountTierBadge: React.FC<AccountTierBadgeProps> = ({ tier, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
}
}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
    >
      <span className="text-lg">{tier.badge}</span>
      <span>{tier.name}</span>
      {tier.walletBonus > 0 && (
        <span className="bg-black/20 text-xs px-2 py-0.5 rounded-full">
          +₹{tier.walletBonus}
        </span>
      )}
    </div>
  );
};

interface LaunchModeOverlayProps {
  isActive: boolean;
  campaignName?: string;
  userBenefits: string[];
}

export const LaunchModeOverlay: React.FC<LaunchModeOverlayProps> = ({
  isActive,
  campaignName,
  userBenefits
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Fragment>
      {showModal && (
        <div
}
}
}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
}
}
}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 {campaignName || 'Launch Mode'} Active!
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Special launch benefits are now available to you!
              </p>

              <div className="space-y-3 mb-6">
                {userBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
              >
                Start Exploring 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

interface ReferralPromptProps {
  isVisible: boolean;
  referralCode: string;
  onShare: () => void;
}

export const ReferralPrompt: React.FC<ReferralPromptProps> = ({
  isVisible,
  referralCode,
  onShare
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('referral_prompt_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('referral_prompt_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
}
}
}
      className="fixed bottom-4 right-4 z-40 max-w-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Earn Rewards!</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Share your referral code and earn rewards when friends join!
        </p>

        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-center">
            {referralCode}
          </code>
        </div>

        <button
          onClick={() => {
            onShare();
            toast.success('Referral link copied to clipboard!');
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all text-sm font-semibold flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Share & Earn
        </button>
      </div>
    </div>
  );
};

// Launch Mode Hook for managing feature flags and campaign state
export const useLaunchMode = () => {
  const [launchMode, setLaunchMode] = useState({
    isActive: false,
    campaignName: '',
    freeBuyerWeek: false,
    freeSellerWeek: false,
    userBenefits: [] as string[],
    accountTier: null as any,
  });

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll simulate launch mode being active
    setLaunchMode({
      isActive: true,
      campaignName: 'QuickMela Launch Week',
      freeBuyerWeek: true,
      freeSellerWeek: true,
      userBenefits: [
        'Free bidding for buyers',
        'Free listings for sellers',
        'Bonus wallet credits',
        'Exclusive Founding Member badge',
        'Priority customer support'
      ],
      accountTier: {
        name: 'Founding Buyer',
        badge: '🏆',
        walletBonus: 500,
      },
    });
  }, []);

  return launchMode;
};

