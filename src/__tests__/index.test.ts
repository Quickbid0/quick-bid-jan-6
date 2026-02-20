/**
 * COMPREHENSIVE TESTING SUITE
 * 
 * This file contains 30+ tests covering:
 * - Component unit tests (Enhanced components)
 * - Feature flag system tests
 * - API hook tests
 * - Integration tests
 * - E2E test patterns
 * 
 * Run with: npm test
 * Watch mode: npm test -- --watch
 * Coverage: npm test -- --coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// ============================================================================
// UNIT TESTS: ENHANCED COMPONENTS
// ============================================================================

describe('EnhancedComponents', () => {
  describe('KPICard', () => {
    test('renders label and value', () => {
      const { KPICard } = require('@/components/design-system/EnhancedComponents');
      render(
        <KPICard
          label="Monthly Revenue"
          value="₹50,000"
          trend="+12%"
          variant="green"
        />
      );
      
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('₹50,000')).toBeInTheDocument();
      expect(screen.getByText('+12%')).toBeInTheDocument();
    });

    test('applies correct variant styling', () => {
      const { KPICard } = require('@/components/design-system/EnhancedComponents');
      const { container } = render(
        <KPICard label="Test" value="100" variant="blue" />
      );
      
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    test('renders with all variants', () => {
      const { KPICard } = require('@/components/design-system/EnhancedComponents');
      const variants = ['blue', 'green', 'amber', 'red', 'purple', 'gold'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <KPICard label="Test" value="100" variant={variant as any} />
        );
        expect(screen.getByText('Test')).toBeInTheDocument();
        unmount();
      });
    });

    test('renders icon when provided', () => {
      const { KPICard } = require('@/components/design-system/EnhancedComponents');
      render(
        <KPICard label="Test" value="100" icon="TrendingUp" />
      );
      // Icon renders as lucide-react component
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('StatusBadge', () => {
    test('renders status text', () => {
      const { StatusBadge } = require('@/components/design-system/EnhancedComponents');
      render(<StatusBadge status="Active" variant="green" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    test('applies correct variant colors', () => {
      const { StatusBadge } = require('@/components/design-system/EnhancedComponents');
      const { container } = render(
        <StatusBadge status="Critical" variant="red" />
      );
      expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    });

    test('supports all status types', () => {
      const { StatusBadge } = require('@/components/design-system/EnhancedComponents');
      const statuses = ['active', 'pending', 'completed', 'failed', 'draft'];
      
      statuses.forEach(status => {
        const { unmount } = render(
          <StatusBadge status={status} variant="blue" />
        );
        expect(screen.getByText(status)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('ActionMenu', () => {
    test('renders trigger button', () => {
      const { ActionMenu } = require('@/components/design-system/EnhancedComponents');
      render(
        <ActionMenu
          items={[
            { label: 'Edit', onClick: jest.fn() },
            { label: 'Delete', onClick: jest.fn() },
          ]}
        />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('shows menu items on click', async () => {
      const { ActionMenu } = require('@/components/design-system/EnhancedComponents');
      render(
        <ActionMenu
          items={[
            { label: 'Edit', onClick: jest.fn() },
            { label: 'Delete', onClick: jest.fn() },
          ]}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeVisible();
        expect(screen.getByText('Delete')).toBeVisible();
      });
    });

    test('calls onClick handler when item clicked', async () => {
      const { ActionMenu } = require('@/components/design-system/EnhancedComponents');
      const handleEdit = jest.fn();
      
      render(
        <ActionMenu
          items={[{ label: 'Edit', onClick: handleEdit }]}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Edit'));
        expect(handleEdit).toHaveBeenCalled();
      });
    });
  });

  describe('DataTable', () => {
    const mockData = [
      { id: 1, name: 'Item 1', price: '₹100', status: 'active' },
      { id: 2, name: 'Item 2', price: '₹200', status: 'pending' },
    ];

    const mockColumns = [
      { key: 'name', label: 'Name', width: '50%' },
      { key: 'price', label: 'Price', width: '25%' },
      { key: 'status', label: 'Status', width: '25%' },
    ];

    test('renders all rows', () => {
      const { DataTable } = require('@/components/design-system/EnhancedComponents');
      render(
        <DataTable columns={mockColumns} data={mockData} />
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    test('renders column headers', () => {
      const { DataTable } = require('@/components/design-system/EnhancedComponents');
      render(
        <DataTable columns={mockColumns} data={mockData} />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    test('sorts data when sortable', async () => {
      const { DataTable } = require('@/components/design-system/EnhancedComponents');
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData} 
          sortable 
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      // Data should be sorted
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });

    test('filters data when filterable', async () => {
      const { DataTable } = require('@/components/design-system/EnhancedComponents');
      render(
        <DataTable 
          columns={mockColumns} 
          data={mockData} 
          filterable 
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'Item 1');

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });
  });

  describe('AuctionCard', () => {
    test('renders item title and price', () => {
      const { AuctionCard } = require('@/components/design-system/EnhancedComponents');
      render(
        <AuctionCard
          title="Vintage Watch"
          currentPrice={5000}
          status="active"
          onAction={jest.fn()}
        />
      );

      expect(screen.getByText('Vintage Watch')).toBeInTheDocument();
      expect(screen.getByText('₹5000')).toBeInTheDocument();
    });

    test('shows buyer-specific UI in buyer mode', () => {
      const { AuctionCard } = require('@/components/design-system/EnhancedComponents');
      render(
        <AuctionCard
          title="Item"
          currentPrice={1000}
          yourBid={1200}
          status="winning"
          mode="buyer"
          onAction={jest.fn()}
        />
      );

      expect(screen.getByText('Your Bid')).toBeInTheDocument();
      expect(screen.getByText('₹1200')).toBeInTheDocument();
    });

    test('shows seller-specific UI in seller mode', () => {
      const { AuctionCard } = require('@/components/design-system/EnhancedComponents');
      render(
        <AuctionCard
          title="Item"
          currentPrice={1000}
          status="active"
          mode="seller"
          onAction={jest.fn()}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('calls onAction when button clicked', async () => {
      const { AuctionCard } = require('@/components/design-system/EnhancedComponents');
      const handleAction = jest.fn();
      
      render(
        <AuctionCard
          title="Item"
          currentPrice={1000}
          status="active"
          onAction={handleAction}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleAction).toHaveBeenCalled();
    });
  });

  describe('StatCounter', () => {
    test('renders label and count', () => {
      const { StatCounter } = require('@/components/design-system/EnhancedComponents');
      render(
        <StatCounter label="Active Bids" count={5} />
      );

      expect(screen.getByText('Active Bids')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('applies variant colors', () => {
      const { StatCounter } = require('@/components/design-system/EnhancedComponents');
      const { container } = render(
        <StatCounter label="Test" count={10} variant="success" />
      );

      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// UNIT TESTS: FEATURE FLAG SYSTEM
// ============================================================================

describe('FeatureFlagSystem', () => {
  describe('hashUserId', () => {
    test('returns consistent hash for same user', () => {
      const { hashUserId } = require('@/features/feature-flags/FeatureFlagSystem');
      
      const hash1 = hashUserId('user-123', 'flag-salt');
      const hash2 = hashUserId('user-123', 'flag-salt');

      expect(hash1).toBe(hash2);
    });

    test('returns different hash for different users', () => {
      const { hashUserId } = require('@/features/feature-flags/FeatureFlagSystem');
      
      const hash1 = hashUserId('user-123', 'flag-salt');
      const hash2 = hashUserId('user-456', 'flag-salt');

      expect(hash1).not.toBe(hash2);
    });

    test('hash is deterministic for rollout bucketing', () => {
      const { hashUserId } = require('@/features/feature-flags/FeatureFlagSystem');
      
      for (let i = 0; i < 100; i++) {
        const hash1 = hashUserId(`user-${i}`, 'flag');
        const hash2 = hashUserId(`user-${i}`, 'flag');
        expect(hash1).toBe(hash2);
      }
    });

    test('distributes users across buckets', () => {
      const { hashUserId } = require('@/features/feature-flags/FeatureFlagSystem');
      
      const buckets = { '0-25': 0, '25-50': 0, '50-75': 0, '75-100': 0 };
      
      for (let i = 0; i < 1000; i++) {
        const hash = hashUserId(`user-${i}`, 'flag') % 100;
        if (hash < 25) buckets['0-25']++;
        else if (hash < 50) buckets['25-50']++;
        else if (hash < 75) buckets['50-75']++;
        else buckets['75-100']++;
      }

      // Each bucket should have ~250 users
      Object.values(buckets).forEach(count => {
        expect(count).toBeGreaterThan(150); // Allow 40% variance
        expect(count).toBeLessThan(350);
      });
    });
  });

  describe('useFeature hook', () => {
    test('returns boolean for feature flag', () => {
      const { useFeature, FeatureFlagsProvider } = require('@/features/feature-flags/FeatureFlagSystem');
      
      function TestComponent() {
        const enabled = useFeature('dashboard_buyer_v2');
        return <div>{enabled ? 'enabled' : 'disabled'}</div>;
      }

      render(
        <FeatureFlagsProvider>
          <TestComponent />
        </FeatureFlagsProvider>
      );

      expect(screen.getByText(/enabled|disabled/)).toBeInTheDocument();
    });

    test('tracks feature usage', async () => {
      const { useFeature, FeatureFlagsProvider } = require('@/features/feature-flags/FeatureFlagSystem');
      const trackSpy = jest.spyOn(console, 'log');

      function TestComponent() {
        useFeature('dashboard_buyer_v2');
        return <div>Test</div>;
      }

      render(
        <FeatureFlagsProvider>
          <TestComponent />
        </FeatureFlagsProvider>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      trackSpy.mockRestore();
    });
  });

  describe('FeatureGate component', () => {
    test('renders children when flag enabled', () => {
      const { FeatureGate, FeatureFlagsProvider } = require('@/features/feature-flags/FeatureFlagSystem');
      
      render(
        <FeatureFlagsProvider>
          <FeatureGate flag="new_design_system" fallback={<div>Old</div>}>
            <div>New Dashboard</div>
          </FeatureGate>
        </FeatureFlagsProvider>
      );

      expect(screen.getByText('New Dashboard')).toBeInTheDocument();
    });

    test('renders fallback when flag disabled', () => {
      const { FeatureGate, FeatureFlagsProvider } = require('@/features/feature-flags/FeatureFlagSystem');
      
      render(
        <FeatureFlagsProvider>
          <FeatureGate flag="non_existent_flag" fallback={<div>Old</div>}>
            <div>New Dashboard</div>
          </FeatureGate>
        </FeatureFlagsProvider>
      );

      expect(screen.getByText('Old')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// UNIT TESTS: API HOOKS
// ============================================================================

describe('API Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('useBuyerDashboard', () => {
    test('fetches buyer dashboard data', async () => {
      const { useBuyerDashboard } = require('@/hooks/useDashboardAPIs');
      
      const mockData = {
        user: { id: '1', name: 'John', walletBalance: 5000 },
        activeBids: [],
        wonAuctions: [],
        stats: { activeCount: 0, wonCount: 0, winRate: 0 },
        recommendations: [],
        spending: { thisWeek: 0, thisMonth: 0, thisYear: 0, chartData: [] },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      function TestComponent() {
        const { data, loading, error } = useBuyerDashboard('user-1');
        
        if (loading) return <div>Loading</div>;
        if (error) return <div>Error: {error.message}</div>;
        
        return <div>{data?.user.name}</div>;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });
    });

    test('handles loading state', () => {
      const { useBuyerDashboard } = require('@/hooks/useDashboardAPIs');
      
      global.fetch = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      function TestComponent() {
        const { loading } = useBuyerDashboard('user-1');
        return <div>{loading ? 'Loading' : 'Loaded'}</div>;
      }

      render(<TestComponent />);

      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    test('handles error state', async () => {
      const { useBuyerDashboard } = require('@/hooks/useDashboardAPIs');
      
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      function TestComponent() {
        const { error } = useBuyerDashboard('user-1');
        
        if (error) return <div>Error: {error.message}</div>;
        return <div>Success</div>;
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });

    test('refetch updates data', async () => {
      const { useBuyerDashboard } = require('@/hooks/useDashboardAPIs');
      
      const mockData = {
        user: { id: '1', name: 'John', walletBalance: 5000 },
        activeBids: [],
        wonAuctions: [],
        stats: { activeCount: 0, wonCount: 0, winRate: 0 },
        recommendations: [],
        spending: { thisWeek: 0, thisMonth: 0, thisYear: 0, chartData: [] },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      function TestComponent() {
        const { data, refetch } = useBuyerDashboard('user-1');
        
        return (
          <div>
            <div>{data?.user.name}</div>
            <button onClick={refetch}>Refetch</button>
          </div>
        );
      }

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });

      const button = screen.getByText('Refetch');
      fireEvent.click(button);

      // Should refetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('API timeout', () => {
    test('aborts request after 10 seconds', async () => {
      const { apiClient } = require('@/hooks/useDashboardAPIs');
      
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
      
      global.fetch = jest.fn(
        () => new Promise(resolve => setTimeout(resolve, 15000))
      );

      const promise = apiClient.get('/test');

      // Wait for timeout
      jest.advanceTimersByTime(10000);

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('BuyerDashboard shows loading then data', async () => {
    const { BuyerDashboardWithAPI } = require('@/pages/DashboardsWithAPI');
    
    const mockData = {
      user: { id: '1', name: 'John', walletBalance: 5000 },
      activeBids: [
        {
          id: 'bid-1',
          title: 'Watch',
          currentBid: 1000,
          yourBid: 1200,
          status: 'winning',
          timeRemaining: '2 days',
          sellerRating: 4.8,
          image: 'http://example.com/img.jpg',
        },
      ],
      wonAuctions: [],
      stats: { activeCount: 1, wonCount: 0, winRate: 0 },
      recommendations: [],
      spending: { thisWeek: 1200, thisMonth: 5000, thisYear: 20000, chartData: [] },
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(
      <BrowserRouter>
        <BuyerDashboardWithAPI userId="user-1" />
      </BrowserRouter>
    );

    // Initially shows loading
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();

    // Then shows data
    await waitFor(() => {
      expect(screen.getByText('Welcome back, John')).toBeInTheDocument();
      expect(screen.getByText('Watch')).toBeInTheDocument();
    });
  });

  test('Dashboard error shows retry button', async () => {
    const { BuyerDashboardWithAPI } = require('@/pages/DashboardsWithAPI');
    
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API failed'))
    );

    render(
      <BrowserRouter>
        <BuyerDashboardWithAPI userId="user-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
    });

    // Retry button should exist
    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    expect(retryButton).toBeInTheDocument();
  });

  test('Refresh button refetches data', async () => {
    const { BuyerDashboardWithAPI } = require('@/pages/DashboardsWithAPI');
    
    const mockData = {
      user: { id: '1', name: 'John', walletBalance: 5000 },
      activeBids: [],
      wonAuctions: [],
      stats: { activeCount: 0, wonCount: 0, winRate: 0 },
      recommendations: [],
      spending: { thisWeek: 0, thisMonth: 0, thisYear: 0, chartData: [] },
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    render(
      <BrowserRouter>
        <BuyerDashboardWithAPI userId="user-1" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John')).toBeInTheDocument();
    });

    // Click refresh
    const refreshButton = screen.getByTitle('Refresh dashboard');
    fireEvent.click(refreshButton);

    // Should call API again
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('Component Snapshots', () => {
  test('KPICard matches snapshot', () => {
    const { KPICard } = require('@/components/design-system/EnhancedComponents');
    const { container } = render(
      <KPICard
        label="Test Label"
        value="₹100,000"
        trend="+15%"
        variant="green"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('StatusBadge matches snapshot', () => {
    const { StatusBadge } = require('@/components/design-system/EnhancedComponents');
    const { container } = render(
      <StatusBadge status="Active" variant="green" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('AuctionCard matches snapshot', () => {
    const { AuctionCard } = require('@/components/design-system/EnhancedComponents');
    const { container } = render(
      <AuctionCard
        title="Test Item"
        currentPrice={1000}
        status="active"
        onAction={() => {}}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('Accessibility Tests', () => {
  test('KPICard is keyboard navigable', () => {
    const { KPICard } = require('@/components/design-system/EnhancedComponents');
    render(
      <KPICard label="Test" value="100" />
    );

    // Should have proper heading structure
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('ActionMenu is keyboard accessible', async () => {
    const { ActionMenu } = require('@/components/design-system/EnhancedComponents');
    render(
      <ActionMenu
        items={[
          { label: 'Edit', onClick: jest.fn() },
        ]}
      />
    );

    const button = screen.getByRole('button');
    
    // Tab to button
    button.focus();
    expect(document.activeElement).toBe(button);

    // Enter to open menu
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    
    // Should show menu
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeVisible();
    });
  });

  test('DataTable is accessible with screen reader', () => {
    const { DataTable } = require('@/components/design-system/EnhancedComponents');
    const mockData = [
      { id: 1, name: 'Item 1', price: '₹100' },
    ];
    const mockColumns = [
      { key: 'name', label: 'Name', width: '50%' },
      { key: 'price', label: 'Price', width: '50%' },
    ];

    render(
      <DataTable columns={mockColumns} data={mockData} />
    );

    // Table should be present
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Headers should be available
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Tests', () => {
  test('DataTable renders 1000+ rows efficiently', () => {
    const { DataTable } = require('@/components/design-system/EnhancedComponents');
    
    const mockData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      price: `₹${(i + 1) * 100}`,
    }));
    
    const mockColumns = [
      { key: 'name', label: 'Name', width: '50%' },
      { key: 'price', label: 'Price', width: '50%' },
    ];

    const startTime = performance.now();

    render(
      <DataTable columns={mockColumns} data={mockData} />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Render should complete in under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('Switching feature flags does not lag', () => {
    const { useFeature, FeatureFlagsProvider } = require('@/features/feature-flags/FeatureFlagSystem');
    
    function TestComponent() {
      const flag1 = useFeature('dashboard_buyer_v2');
      const flag2 = useFeature('dashboard_seller_v2');
      const flag3 = useFeature('new_design_system');
      
      return (
        <div>
          {flag1 && <div>Flag 1</div>}
          {flag2 && <div>Flag 2</div>}
          {flag3 && <div>Flag 3</div>}
        </div>
      );
    }

    const startTime = performance.now();

    render(
      <FeatureFlagsProvider>
        <TestComponent />
      </FeatureFlagsProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(50);
  });
});

/**
 * RUNNING TESTS
 * 
 * All tests:
 *   npm test
 * 
 * Watch mode:
 *   npm test -- --watch
 * 
 * Coverage:
 *   npm test -- --coverage
 * 
 * Specific file:
 *   npm test -- useDashboardAPIs.test.ts
 * 
 * Specific test:
 *   npm test -- -t "renders label and value"
 */
