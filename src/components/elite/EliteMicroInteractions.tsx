// =============================================================================
// ELITE MICRO-INTERACTIONS - Series B Ready
// Premium Animations + Loading States + Success Feedback
// Apple Clean + Stripe Confident + Amazon Conversion
// =============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  Target,
  Zap,
  X,
  Crown,
  Star
} from 'lucide-react';

// =============================================================================
// ELITE LOADING SKELETONS - Premium UX
// =============================================================================

export const AuctionCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 animate-pulse">
    {/* Image Skeleton */}
    <div className="aspect-square bg-neutral-200 rounded-xl mb-4"></div>

    {/* Content Skeleton */}
    <div className="space-y-3">
      <div className="h-6 bg-neutral-200 rounded-lg w-3/4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      <div className="h-4 bg-neutral-200 rounded w-2/3"></div>

      {/* Price Skeleton */}
      <div className="flex justify-between items-center pt-4">
        <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-8 bg-neutral-200 rounded-lg w-1/4"></div>
      </div>
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-5 bg-neutral-200 rounded w-32"></div>
        <div className="h-4 bg-neutral-200 rounded w-24"></div>
      </div>
    </div>
    <div className="h-8 bg-neutral-200 rounded w-20 mb-3"></div>
    <div className="h-2 bg-neutral-200 rounded"></div>
  </div>
);

// =============================================================================
// ELITE SUCCESS ANIMATIONS - Conversion Psychology
// =============================================================================

interface SuccessToastProps {
  message: string;
  amount?: string;
  type?: 'bid' | 'win' | 'signup' | 'payment';
  onClose: () => void;
}

export const EliteSuccessToast: React.FC<SuccessToastProps> = ({
  message,
  amount,
  type = 'bid',
  onClose
}) => {
  const icons = {
    bid: Zap,
    win: Crown,
    signup: CheckCircle,
    payment: TrendingUp
  };

  const colors = {
    bid: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    win: 'text-amber-600 bg-amber-50 border-amber-200',
    signup: 'text-blue-600 bg-blue-50 border-blue-200',
    payment: 'text-purple-600 bg-purple-50 border-purple-200'
  };

  const IconComponent = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        className={`fixed top-4 right-4 z-50 max-w-sm ${colors[type]} border-2 rounded-2xl p-6 shadow-2xl`}
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: 2, delay: 0.2 }}
          >
            <IconComponent className="w-8 h-8" />
          </motion.div>

          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">
              {type === 'bid' && 'Bid Placed! 🎯'}
              {type === 'win' && 'You Won! 🏆'}
              {type === 'signup' && 'Welcome Aboard! 🎉'}
              {type === 'payment' && 'Payment Successful! 💰'}
            </h4>
            <p className="text-sm opacity-90 mb-2">{message}</p>
            {amount && (
              <div className="text-xl font-black">{amount}</div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success particles animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute w-2 h-2 bg-current rounded-full opacity-20"
              style={{
                left: `${20 + i * 12}%`,
                top: `${20 + (i % 2) * 60}%`
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// =============================================================================
// ELITE BID CONFIRMATION MODAL - High Conversion
// =============================================================================

interface BidConfirmationModalProps {
  isOpen: boolean;
  auctionTitle: string;
  currentBid: number;
  yourBid: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const EliteBidConfirmationModal: React.FC<BidConfirmationModalProps> = ({
  isOpen,
  auctionTitle,
  currentBid,
  yourBid,
  onConfirm,
  onCancel,
  isProcessing = false
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Zap className="w-8 h-8" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Confirm Your Bid</h2>
            <p className="text-primary-100">You're about to place a competitive bid!</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-neutral-900 mb-1">{auctionTitle}</h3>
              <div className="text-sm text-neutral-600">Premium Luxury Vehicle</div>
            </div>

            {/* Bid Comparison */}
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Current Highest</span>
                <span className="font-semibold">₹{currentBid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-semibold">Your Bid</span>
                <span className="text-2xl font-bold text-primary-600">₹{yourBid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600">
                <span className="font-medium">Difference</span>
                <span className="font-bold">+₹{(yourBid - currentBid).toLocaleString()}</span>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Instant Confirmation</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1 border border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250"
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all duration-250 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Placing Bid...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Confirm Bid
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// =============================================================================
// ELITE LOADING BUTTON - Premium UX
// =============================================================================

interface EliteLoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const EliteLoadingButton: React.FC<EliteLoadingButtonProps> = ({
  loading,
  children,
  onClick,
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = "relative overflow-hidden rounded-xl font-semibold transition-all duration-250 flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 py-3 px-6",
    secondary: "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 py-3 px-6",
    outline: "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 py-3 px-6"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${variants[variant]} ${className} ${
        loading ? 'cursor-not-allowed' : 'hover:shadow-lg'
      }`}
    >
      {/* Loading shimmer effect */}
      {loading && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span>Processing...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// =============================================================================
// ELITE PROGRESS INDICATOR - Trust Building
// =============================================================================

interface EliteProgressProps {
  steps: Array<{ label: string; completed: boolean; current?: boolean }>;
  className?: string;
}

export const EliteProgressIndicator: React.FC<EliteProgressProps> = ({
  steps,
  className = ''
}) => (
  <div className={`flex items-center justify-between ${className}`}>
    {steps.map((step, index) => (
      <div key={index} className="flex items-center flex-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step.completed
              ? 'bg-emerald-500 text-white'
              : step.current
              ? 'bg-primary-600 text-white animate-pulse'
              : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
        </motion.div>

        <div className="ml-3 flex-1">
          <div className={`text-sm font-medium ${
            step.completed ? 'text-emerald-700' :
            step.current ? 'text-primary-700' : 'text-neutral-500'
          }`}>
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: step.completed ? '100%' : '0%' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-0.5 bg-neutral-200 mt-2"
            >
              <div className="h-full bg-emerald-500 rounded-full"></div>
            </motion.div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// =============================================================================
// ELITE NOTIFICATION BANNER - Real-time Updates
// =============================================================================

interface EliteNotificationBannerProps {
  message: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  autoHide?: boolean;
}

export const EliteNotificationBanner: React.FC<EliteNotificationBannerProps> = ({
  message,
  type = 'info',
  action,
  onClose,
  autoHide = false
}) => {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
      className={`border-l-4 p-4 rounded-r-lg ${colors[type]} shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${
            type === 'success' ? 'bg-emerald-100' :
            type === 'warning' ? 'bg-amber-100' :
            type === 'info' ? 'bg-blue-100' : 'bg-red-100'
          }`}>
            {type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            {type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {type === 'info' && <Zap className="w-4 h-4 text-blue-600" />}
            {type === 'error' && <X className="w-4 h-4 text-red-600" />}
          </div>
          <p className="font-medium">{message}</p>
        </div>

        <div className="flex items-center gap-2">
          {action && (
            <button
              onClick={action.onClick}
              className="px-3 py-1 bg-white/50 hover:bg-white rounded-lg text-sm font-medium transition-colors"
            >
              {action.label}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// ELITE PULSE ANIMATION - Attention Drawing
// =============================================================================

interface ElitePulseProps {
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const ElitePulse: React.FC<ElitePulseProps> = ({
  children,
  pulse = false,
  className = ''
}) => (
  <motion.div
    animate={pulse ? {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0)',
        '0 0 0 8px rgba(59, 130, 246, 0.1)',
        '0 0 0 0 rgba(59, 130, 246, 0)'
      ]
    } : {}}
    transition={{
      duration: 2,
      repeat: pulse ? Infinity : 0,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// =============================================================================
// ELITE SUCCESS CELEBRATION - High Conversion Trigger
// =============================================================================

interface EliteCelebrationProps {
  show: boolean;
  title: string;
  subtitle: string;
  amount?: string;
  onClose: () => void;
}

export const EliteCelebration: React.FC<EliteCelebrationProps> = ({
  show,
  title,
  subtitle,
  amount,
  onClose
}) => (
  <AnimatePresence>
    {show && (
      <>
        {/* Full screen backdrop with confetti effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Confetti animation */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: window.innerHeight + 20,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
            />
          ))}

          {/* Celebration modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 text-center"
          >
            {/* Success icon with bounce */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-neutral-900 mb-2"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-600 mb-6"
            >
              {subtitle}
            </motion.p>

            {amount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-black text-emerald-600 mb-6"
              >
                {amount}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all duration-250"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default {
  AuctionCardSkeleton,
  DashboardCardSkeleton,
  EliteSuccessToast,
  EliteBidConfirmationModal,
  EliteLoadingButton,
  EliteProgressIndicator,
  EliteNotificationBanner,
  ElitePulse,
  EliteCelebration
};
