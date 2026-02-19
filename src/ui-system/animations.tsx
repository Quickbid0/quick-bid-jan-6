// Enhanced Animation System - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Comprehensive animation system with micro-interactions, transitions, and real-time feedback

import React from 'react';

// Core Animation Variants
export const animationVariants = {
  // Page Transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  slideInFromRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  slideInFromLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Gaming Animations
  gaming: {
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
    },

    glow: {
      boxShadow: [
        '0 0 0 0 rgba(249, 115, 22, 0.4)',
        '0 0 0 10px rgba(249, 115, 22, 0)',
        '0 0 0 0 rgba(249, 115, 22, 0)'
      ],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },

    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    },

    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.4, ease: "easeOut" }
    },

    spin: {
      rotate: 360,
      transition: { duration: 1, ease: "linear", repeat: Infinity }
    },

    float: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // Auction-Specific Animations
  auction: {
    countdownPulse: {
      scale: [1, 1.1, 1],
      boxShadow: [
        '0 0 0 0 rgba(239, 68, 68, 0.7)',
        '0 0 0 10px rgba(239, 68, 68, 0)',
        '0 0 0 0 rgba(239, 68, 68, 0)'
      ],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    },

    bidAccepted: {
      scale: [1, 1.2, 1],
      backgroundColor: ['#ffffff', '#10b981', '#ffffff'],
      transition: { duration: 0.6, ease: "easeOut" }
    },

    winningStreak: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.8, repeat: 3, ease: "easeInOut" }
    },

    bidIntensity: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // Fintech Animations
  fintech: {
    balanceUpdate: {
      scale: [1, 1.05, 1],
      color: ['#1d4ed8', '#10b981', '#1d4ed8'],
      transition: { duration: 0.5, ease: "easeOut" }
    },

    paymentSuccess: {
      scale: [1, 1.2, 1],
      backgroundColor: ['#ffffff', '#10b981', '#ffffff'],
      transition: { duration: 0.6, ease: "easeOut" }
    },

    secureGlow: {
      boxShadow: [
        '0 0 0 0 rgba(16, 185, 129, 0.4)',
        '0 0 0 10px rgba(16, 185, 129, 0)',
        '0 0 0 0 rgba(16, 185, 129, 0)'
      ],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // SaaS Animations
  saas: {
    insightReveal: {
      opacity: [0, 1],
      y: [20, 0],
      scale: [0.9, 1],
      transition: { duration: 0.6, ease: "easeOut" }
    },

    recommendation: {
      opacity: [0, 1],
      x: [-20, 0],
      transition: { duration: 0.4, ease: "easeOut" }
    },

    loadingDots: {
      opacity: [0.4, 1, 0.4],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  },

  // Loading States
  loading: {
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    },

    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },

    shimmer: {
      background: [
        'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)'
      ],
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }
  },

  // Notification Animations
  notifications: {
    slideInTop: {
      initial: { opacity: 0, y: -50, scale: 0.8 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.8 },
      transition: { duration: 0.4, ease: "easeOut" }
    },

    slideInBottom: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3, ease: "easeOut" }
    },

    bounceIn: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.3 },
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }
};

// Custom Hooks for Advanced Animations
export const useAnimatedCounter = (value: number, duration: number = 1000) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setIsAnimating(true);
    const startValue = displayValue;
    const difference = value - startValue;
    const steps = 60;
    const increment = difference / steps;
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setDisplayValue(startValue + (difference * easeOutProgress));

      if (currentStep < steps) {
        setTimeout(animate, duration / steps);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    animate();
  }, [value, duration]);

  return { displayValue, isAnimating };
};

export const useSpringValue = (value: number, config?: any) => {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, config);

  React.useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return springValue;
};

export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const controls = useAnimation();

  React.useEffect(() => {
    if (isHovered) {
      controls.start({ scale: 1.05, transition: { duration: 0.2 } });
    } else {
      controls.start({ scale: 1, transition: { duration: 0.2 } });
    }
  }, [isHovered, controls]);

  return {
    controls,
    hoverProps: {
      onHoverStart: () => setIsHovered(true),
      onHoverEnd: () => setIsHovered(false)
    }
  };
};

// Animated Components
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  variant?: 'gaming' | 'fintech' | 'saas';
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  variant = 'saas',
  className = ''
}) => {
  const variants = {
    gaming: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { delay, duration: 0.5, ease: "easeOut" }
    },
    fintech: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { delay, duration: 0.4, ease: "easeOut" }
    },
    saas: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay, duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div
      className={className}
      {...variants[variant]}
    >
      {children}
    </div>
  );
};

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'gaming' | 'fintech' | 'saas';
  loading?: boolean;
  success?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'saas',
  loading = false,
  success = false,
  className = '',
  ...props
}) => {
  const variants = {
    gaming: {
      hover: { scale: 1.05, boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)' },
      tap: { scale: 0.95 }
    },
    fintech: {
      hover: { scale: 1.02, backgroundColor: '#1d4ed8' },
      tap: { scale: 0.98 }
    },
    saas: {
      hover: { scale: 1.02, y: -2 },
      tap: { scale: 0.98 }
    }
  };

  return (
    <button
      className={className}
}
      whileTap={!loading && !success ? variants[variant].tap : {}}
 : {}}
}
      {...props}
    >
      <Fragment mode="wait">
        {loading && (
          <div
            key="loading"
}
}
}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
}
}
            />
            Loading...
          </div>
        )}

        {success && (
          <div
            key="success"
}
}
}
            className="flex items-center gap-2"
          >
            ✓ Success!
          </div>
        )}

        {!loading && !success && (
          <div
            key="content"
}
}
}
          >
            {children}
          </div>
        )}
      </Fragment>
    </button>
  );
};

// Real-time Feedback Components
interface RealTimeFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const RealTimeFeedback: React.FC<RealTimeFeedbackProps> = ({
  type,
  message,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: 'bg-emerald-500 border-emerald-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };

  return (
    <Fragment>
      {isVisible && (
        <div
}
}
}
}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border text-white shadow-lg max-w-sm ${colors[type]}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">{message}</div>
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
};

// Auction-Specific Animated Components
interface BidTickerProps {
  bids: Array<{
    id: string;
    bidder: string;
    amount: number;
    timestamp: Date;
    isYou?: boolean;
  }>;
  className?: string;
}

export const AnimatedBidTicker: React.FC<BidTickerProps> = ({ bids, className }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Fragment>
        {bids.slice(0, 5).map((bid, index) => (
          <div
            key={bid.id}
}
}
}
}
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              bid.isYou
                ? 'bg-emerald-500/20 border border-emerald-400'
                : 'bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {bid.isYou && (
                <div
}
}
                >
                  👑
                </div>
              )}
              <span className={`text-sm font-medium ${bid.isYou ? 'text-emerald-300' : 'text-white'}`}>
                {bid.isYou ? 'YOU' : bid.bidder}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold text-green-400"
}
}
}
              >
                ₹{(bid.amount / 100000).toFixed(1)}L
              </span>
              <span className="text-xs text-gray-400">
                {bid.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </Fragment>
    </div>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, variant = 'fade' }) => {
  const variants = {
    fade: animationVariants.pageTransition,
    slide: animationVariants.slideInFromRight,
    scale: animationVariants.scaleIn
  };

  return (
    <div {...variants[variant]}>
      {children}
    </div>
  );
};

// Staggered Animation Container
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div
      className={className}

      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) => (
        <div>
          {child}
        </div>
      ))}
    </div>
  );
};

// Gaming Achievement Animation
interface AchievementUnlockProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onClose: () => void;
}

export const AchievementUnlock: React.FC<AchievementUnlockProps> = ({
  title,
  description,
  icon: Icon,
  rarity,
  onClose
}) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600'
  };

  return (
    <Fragment>
      <div
}
}
}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
}
}
}
}
          className={`bg-gradient-to-br ${rarityColors[rarity]} p-8 rounded-2xl text-white text-center max-w-md mx-4`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
}
}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon className="w-8 h-8" />
          </div>

          <motion.h2
}
}
}
            className="text-2xl font-bold mb-2"
          >
            Achievement Unlocked!
          </motion.h2>

          <motion.h3
}
}
}
            className="text-xl font-semibold mb-2"
          >
            {title}
          </motion.h3>

          <motion.p
}
}
}
            className="text-white/80 mb-6"
          >
            {description}
          </motion.p>

          <div
}
}
}
          >
            <button
              onClick={onClose}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

// Export all animation utilities
