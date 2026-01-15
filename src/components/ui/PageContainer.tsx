import React from 'react';
import { colors } from './design-system';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'lg' 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-6 py-6',
    lg: 'px-8 py-8',
    xl: 'px-10 py-10',
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
