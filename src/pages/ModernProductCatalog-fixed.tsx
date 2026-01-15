// Product Catalog - Enterprise Design System (UX Consistent)
import React, { useState, useEffect } from 'react';
import { designTokens } from '../design-system/tokens-fixed';
import { Button, SmartImage, UXGuard, EmptyState, LoadingState, DisabledAction } from '../integration/component-map';
import { UserRole } from '../design-system/types';

const ModernProductCatalog: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    // Determine user role
    const demoSession = localStorage.getItem('demo-session');
    if (demoSession) {
      const demoData = JSON.parse(demoSession);
      setUserRole(`demo_${demoData.user?.user_metadata?.role || 'guest'}` as UserRole);
    }

    // Load products
    setTimeout(() => {
      setProducts(Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Premium Product ${i + 1}`,
        description: 'High-quality item with excellent condition and verified authenticity',
        price: Math.floor(Math.random() * 50000) + 1000,
        image: `https://picsum.photos/280/200?random=${i + 100}`,
        category: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'][i % 5],
        isLive: Math.random() > 0.5,
        bids: Math.floor(Math.random() * 50),
        timeLeft: Math.random() > 0.7 ? `${Math.floor(Math.random() * 24)}h` : undefined
      })));
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'under-5000' && product.price >= 5000) return false;
      if (filters.priceRange === '5000-10000' && (product.price < 5000 || product.price > 10000)) return false;
      if (filters.priceRange === 'over-10000' && product.price <= 10000) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'newest': return b.id - a.id;
      case 'ending-soon': return (a.timeLeft ? 0 : 1) - (b.timeLeft ? 0 : 1);
      default: return 0;
    }
  });

  const canBrowse = userRole !== 'guest';
  const canBid = ['demo_buyer', 'beta_buyer'].includes(userRole);
  const canSell = ['demo_seller', 'beta_seller'].includes(userRole);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.neutral[50],
    }}>
      {/* Header with consistent spacing */}
      <header style={{
        backgroundColor: designTokens.colors.neutral[0],
        borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
        padding: designTokens.spacing.lg,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: designTokens.elevation.sm,
      }}>
        <div style={{
          maxWidth: designTokens.container.xl,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize['2xl'],
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.neutral[900],
          }}>
            Product Catalog
          </h1>
          
          <div style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.neutral[600],
            }}>
              {sortedProducts.length} items
            </span>
          </div>
        </div>
      </header>

      {/* Filter Bar - Consistent spacing */}
      <section style={{
        backgroundColor: designTokens.colors.neutral[0],
        padding: `${designTokens.spacing.xl} 0`,
        borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
      }}>
        <div style={{
          maxWidth: designTokens.container.xl,
          margin: '0 auto',
          display: 'flex',
          gap: designTokens.spacing.lg,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <label style={{
              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.neutral[700],
              marginBottom: designTokens.spacing.xs,
            }}>
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.lg,
                backgroundColor: designTokens.colors.neutral[0],
                color: designTokens.colors.neutral[900],
                minWidth: '120px',
              }}
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <label style={{
              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.neutral[700],
              marginBottom: designTokens.spacing.xs,
            }}>
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.lg,
                backgroundColor: designTokens.colors.neutral[0],
                color: designTokens.colors.neutral[900],
                minWidth: '120px',
              }}
            >
              <option value="all">All Prices</option>
              <option value="under-5000">Under ₹5,000</option>
              <option value="5000-10000">₹5,000 - ₹10,000</option>
              <option value="over-10000">Over ₹10,000</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
            <label style={{
              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.neutral[700],
              marginBottom: designTokens.spacing.xs,
            }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                border: `1px solid ${designTokens.colors.neutral[300]}`,
                borderRadius: designTokens.borderRadius.lg,
                backgroundColor: designTokens.colors.neutral[0],
                color: designTokens.colors.neutral[900],
                minWidth: '120px',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content - Consistent spacing */}
      <main style={{
        maxWidth: designTokens.container.xl,
        margin: '0 auto',
        padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
      }}>
        {loading ? (
          <LoadingState message="Loading products..." />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your filters or browse all categories"
            action={{
              text: "Clear Filters",
              onClick: () => setFilters({ category: 'all', priceRange: 'all', sortBy: 'newest' })
            }}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: designTokens.spacing.lg,
          }}>
            {sortedProducts.map((product) => (
              <UXGuard key={product.id} role={canBid ? 'demo_buyer' : 'guest'}>
                <div
                  style={{
                    backgroundColor: designTokens.colors.neutral[0],
                    border: `1px solid ${designTokens.colors.neutral[200]}`,
                    borderRadius: designTokens.borderRadius.xl,
                    overflow: 'hidden',
                    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => window.location.href = `/product/${product.id}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = designTokens.elevation.lg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = designTokens.elevation.sm;
                  }}
                >
                  {/* Product Image - No broken images */}
                  <SmartImage
                    src={product.image}
                    alt={product.name}
                    aspectRatio="landscape"
                  />
                  
                  {/* Product Info - Consistent typography */}
                  <div style={{
                    padding: designTokens.spacing.lg,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: designTokens.spacing.md,
                    }}>
                      <h3 style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.neutral[900],
                        margin: 0,
                        lineHeight: designTokens.typography.lineHeight.tight,
                      }}>
                        {product.name}
                      </h3>
                      
                      {product.isLive && (
                        <span style={{
                          backgroundColor: designTokens.colors.success[100],
                          color: designTokens.colors.success[800],
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                          borderRadius: designTokens.borderRadius.full,
                          fontSize: designTokens.typography.fontSize.xs,
                          fontWeight: designTokens.typography.fontWeight.medium,
                        }}>
                          Live
                        </span>
                      )}
                    </div>
                    
                    <p style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      lineHeight: designTokens.typography.lineHeight.normal,
                      marginBottom: designTokens.spacing.md,
                    }}>
                      {product.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{
                          fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                          fontSize: designTokens.typography.fontSize.sm,
                          color: designTokens.colors.neutral[500],
                        }}>
                          Current Bid
                        </div>
                        <div style={{
                          fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                          fontSize: designTokens.typography.fontSize.xl,
                          fontWeight: designTokens.typography.fontWeight.bold,
                          color: designTokens.colors.primary[600],
                        }}>
                          ₹{product.price.toLocaleString()}
                        </div>
                      </div>
                      
                      {product.timeLeft && (
                        <div style={{
                          textAlign: 'right',
                        }}>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.xs,
                            color: designTokens.colors.neutral[500],
                          }}>
                            Time Left
                          </div>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.base,
                            fontWeight: designTokens.typography.fontWeight.medium,
                            color: designTokens.colors.warning[600],
                          }}>
                            {product.timeLeft}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bid Button - Consistent with UX rules */}
                    {canBid ? (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => window.location.href = `/product/${product.id}#bid`}
                      >
                        Place Bid
                      </Button>
                    ) : (
                      <DisabledAction
                        reason="Sign up to place bids"
                        tooltip="Create a free account to start bidding"
                      >
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          disabled
                        >
                          Place Bid
                        </Button>
                      </DisabledAction>
                    )}
                  </div>
                </div>
              </UXGuard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ModernProductCatalog;
