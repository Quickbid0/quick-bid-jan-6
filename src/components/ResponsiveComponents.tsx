// Responsive Container Component - Consistent Responsive Behavior
import React, { useState, useEffect } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  breakpoint = 'lg'
}) => {
  const [containerSize, setContainerSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setContainerSize('mobile');
      } else if (width < 1024) {
        setContainerSize('tablet');
      } else {
        setContainerSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMaxWidth = () => {
    switch (breakpoint) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-7xl';
    }
  };

  return (
    <div className={`${getMaxWidth()} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'gap-6',
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 ${cols.md ? `md:grid-cols-${cols.md}` : ''} ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''} ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''} ${gap} ${className}`}>
      {children}
    </div>
  );
};

// Touch Target Wrapper
interface TouchTargetProps {
  children: React.ReactNode;
  minSize?: 44;
  className?: string;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  minSize = 44,
  className = ''
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ 
        minWidth: `${minSize}px`, 
        minHeight: `${minSize}px`,
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  );
};

// Responsive Visibility Hook
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

// No Horizontal Scroll Wrapper
interface NoHorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const NoHorizontalScroll: React.FC<NoHorizontalScrollProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`overflow-x-auto ${className}`}
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: '-ms-autohiding-scrollbar'
      }}
    >
      {children}
    </div>
  );
};

// Consistent Spacing Hook
export const useConsistentSpacing = () => {
  const spacing = {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  };

  return spacing;
};
