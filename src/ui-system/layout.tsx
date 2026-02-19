// UI System - Layout
// Standardized layout components for consistent page structures

import React from 'react';
import { cn } from '../lib/utils';
import { spacing } from './spacing';

// Container Component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = 'md',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Page Layout Component
interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  className
}) => (
  <div className={cn('min-h-screen bg-neutral-50', className)}>
    {header && (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {header}
      </header>
    )}

    <div className="flex">
      {sidebar && (
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-30">
          <div className="flex flex-col flex-grow bg-white border-r border-neutral-200 pt-16">
            {sidebar}
          </div>
        </aside>
      )}

      <main className={cn(
        'flex-1',
        sidebar ? 'lg:pl-64' : '',
        header ? 'pt-16' : ''
      )}>
        <div className="py-6">
          <Container>
            {children}
          </Container>
        </div>
      </main>
    </div>

    {footer && (
      <footer className="border-t bg-white">
        {footer}
      </footer>
    )}
  </div>
);

// Grid Layout Component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  responsive = true,
  className,
  ...props
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const responsiveCols = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  return (
    <div
      className={cn(
        'grid',
        responsiveCols[cols],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Flex Layout Components
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className,
  ...props
}) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Stack Layout Component (Vertical Flex)
interface StackProps extends Omit<FlexProps, 'direction'> {
  children: React.ReactNode;
  spacing?: FlexProps['gap'];
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  ...props
}) => (
  <Flex direction="col" gap={spacing} {...props}>
    {children}
  </Flex>
);

// Section Component
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'neutral' | 'primary' | 'transparent';
}

export const Section: React.FC<SectionProps> = ({
  children,
  size = 'lg',
  padding = 'lg',
  background = 'transparent',
  className,
  ...props
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    neutral: 'bg-neutral-50',
    primary: 'bg-primary-50',
    transparent: 'bg-transparent',
  };

  const paddingClasses = {
    none: 'py-0',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  return (
    <section
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      <Container size={size}>
        {children}
      </Container>
    </section>
  );
};

// Auction Layout Component (Specialized for QuickMela)
interface AuctionLayoutProps {
  children: React.ReactNode;
  imageSection?: React.ReactNode;
  infoSection?: React.ReactNode;
  bidSection?: React.ReactNode;
  detailsSection?: React.ReactNode;
  className?: string;
}

export const AuctionLayout: React.FC<AuctionLayoutProps> = ({
  children,
  imageSection,
  infoSection,
  bidSection,
  detailsSection,
  className
}) => (
  <div className={cn('space-y-6', className)}>
    {/* Image Section */}
    {imageSection && (
      <div className="w-full">
        {imageSection}
      </div>
    )}

    {/* Main Content Grid */}
    <Grid cols={2} gap="lg" className="gap-8">
      {/* Info Section */}
      <div className="space-y-6">
        {infoSection}
      </div>

      {/* Bid Section */}
      <div className="space-y-6">
        {bidSection}
      </div>
    </Grid>

    {/* Details Section */}
    {detailsSection && (
      <div className="w-full">
        {detailsSection}
      </div>
    )}

    {/* Custom Children */}
    {children}
  </div>
);

// Dashboard Layout Component
interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  header,
  sidebar,
  className
}) => (
  <div className={cn('min-h-screen bg-neutral-50', className)}>
    {/* Header */}
    {header && (
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        {header}
      </header>
    )}

    <div className="flex">
      {/* Sidebar */}
      {sidebar && (
        <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen">
          <div className="p-6">
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  </div>
);

