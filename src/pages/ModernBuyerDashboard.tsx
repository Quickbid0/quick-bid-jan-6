// Modern Buyer Dashboard - Enterprise Design System
import React, { useState, useEffect } from 'react';
import { designTokens } from '../design-system/tokens-fixed';
import { Button, SmartImage, UXGuard, EmptyState, LoadingState, DisabledAction } from '../integration/component-map';
import { UserRole } from '../design-system/types';

const ModernBuyerDashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeBids: 0,
    wonAuctions: 0,
    totalSpent: 0,
    savedItems: 0,
    notifications: 0,
    recommendations: [],
    endingSoon: [],
    newItems: [],
    nextActions: []
  });

  useEffect(() => {
    // Determine user role
    const demoSession = localStorage.getItem('demo-session');
    if (demoSession) {
      const demoData = JSON.parse(demoSession);
      setUserRole(`demo_${demoData.user?.user_metadata?.role || 'guest'}` as UserRole);
    }

    // Load dashboard data
    setTimeout(() => {
      setDashboardData({
        activeBids: 3,
        wonAuctions: 12,
        totalSpent: 45600,
        savedItems: 28,
        notifications: 5,
        recommendations: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          name: `Premium Item ${i + 1}`,
          price: Math.floor(Math.random() * 20000) + 5000,
          image: `https://picsum.photos/200/200?random=${i + 50}`,
          category: ['Electronics', 'Fashion', 'Home', 'Sports'][i % 4],
          timeLeft: Math.random() > 0.7 ? `${Math.floor(Math.random() * 24)}h` : undefined
        })),
        endingSoon: Array.from({ length: 6 }, (_, i) => ({
          id: i + 100,
          name: `Ending Soon ${i + 1}`,
          price: Math.floor(Math.random() * 15000) + 2000,
          image: `https://picsum.photos/200/200?random=${i + 100}`,
          timeLeft: `${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`,
          currentBid: Math.floor(Math.random() * 10000) + 1000
        })),
        newItems: Array.from({ length: 8 }, (_, i) => ({
          id: i + 200,
          name: `New Arrival ${i + 1}`,
          price: Math.floor(Math.random() * 25000) + 3000,
          image: `https://picsum.photos/200/200?random=${i + 200}`,
          category: ['Electronics', 'Fashion', 'Home', 'Sports'][i % 4]
        })),
        nextActions: [
          { id: 1, type: 'bid', title: 'Place bid on Vintage Camera', priority: 'high' },
          { id: 2, type: 'payment', title: 'Complete payment for Laptop', priority: 'high' },
          { id: 3, type: 'review', title: 'Leave review for Smart Watch', priority: 'medium' },
          { id: 4, type: 'shipping', title: 'Confirm shipping address', priority: 'medium' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const canBrowse = userRole !== 'guest';
  const canBid = ['demo_buyer', 'beta_buyer'].includes(userRole);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.neutral[50],
    }}>
      {/* Header */}
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
            margin: 0,
          }}>
            Buyer Dashboard
          </h1>
          
          <div style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            alignItems: 'center',
          }}>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/catalog'}
            >
              Browse Catalog
            </Button>
            
            <Button
              variant="primary"
              onClick={() => window.location.href = '/wallet'}
            >
              Wallet
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <LoadingState message="Loading dashboard..." />
      ) : (
        <main style={{
          maxWidth: designTokens.container.xl,
          margin: '0 auto',
          padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
        }}>
          {/* Hero Summary Section - Single Card */}
          <section style={{
            background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[800]} 100%)`,
            color: 'white',
            borderRadius: designTokens.borderRadius.xl,
            padding: designTokens.spacing.xl,
            marginBottom: designTokens.spacing['3xl'],
            boxShadow: designTokens.elevation.lg,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.xl,
            }}>
              <div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.primary[100],
                  marginBottom: designTokens.spacing.xs,
                }}>
                  Active Bids
                </div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize['3xl'],
                  fontWeight: designTokens.typography.fontWeight.bold,
                  lineHeight: designTokens.typography.lineHeight.tight,
                }}>
                  {dashboardData.activeBids}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.primary[100],
                  marginBottom: designTokens.spacing.xs,
                }}>
                  Won Auctions
                </div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize['3xl'],
                  fontWeight: designTokens.typography.fontWeight.bold,
                  lineHeight: designTokens.typography.lineHeight.tight,
                }}>
                  {dashboardData.wonAuctions}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.primary[100],
                  marginBottom: designTokens.spacing.xs,
                }}>
                  Total Spent
                </div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize['3xl'],
                  fontWeight: designTokens.typography.fontWeight.bold,
                  lineHeight: designTokens.typography.lineHeight.tight,
                }}>
                  ₹{dashboardData.totalSpent.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.primary[100],
                  marginBottom: designTokens.spacing.xs,
                }}>
                  Saved Items
                </div>
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize['3xl'],
                  fontWeight: designTokens.typography.fontWeight.bold,
                  lineHeight: designTokens.typography.lineHeight.tight,
                }}>
                  {dashboardData.savedItems}
                </div>
              </div>
            </div>
          </section>

          {/* Next Actions Section - Actionable Items Only */}
          <section style={{
            marginBottom: designTokens.spacing['3xl'],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                margin: 0,
              }}>
                🎯 Next Actions
              </h2>
              
              <Button
                variant="text"
                onClick={() => window.location.href = '/notifications'}
              >
                View All ({dashboardData.notifications})
              </Button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: designTokens.spacing.lg,
            }}>
              {dashboardData.nextActions.map((action) => (
                <UXGuard key={action.id} role={canBid ? 'demo_buyer' : 'guest'}>
                  <div
                    style={{
                      backgroundColor: designTokens.colors.neutral[0],
                      border: `1px solid ${designTokens.colors.neutral[200]}`,
                      borderRadius: designTokens.borderRadius.xl,
                      padding: designTokens.spacing.lg,
                      boxShadow: designTokens.elevation.sm,
                      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      // Handle action based on type
                      switch (action.type) {
                        case 'bid':
                          window.location.href = `/product/${action.id}`;
                          break;
                        case 'payment':
                          window.location.href = `/payments/${action.id}`;
                          break;
                        case 'review':
                          window.location.href = `/reviews/${action.id}`;
                          break;
                        case 'shipping':
                          window.location.href = `/shipping/${action.id}`;
                          break;
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.sm;
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: designTokens.spacing.md,
                    }}>
                      <div style={{
                        backgroundColor: action.priority === 'high' ? designTokens.colors.error[100] : designTokens.colors.primary[100],
                        color: action.priority === 'high' ? designTokens.colors.error[800] : designTokens.colors.primary[800],
                        padding: designTokens.spacing.sm,
                        borderRadius: designTokens.borderRadius.full,
                        fontSize: designTokens.typography.fontSize.xs,
                        fontWeight: designTokens.typography.fontWeight.medium,
                        textTransform: 'uppercase',
                        minWidth: '60px',
                        textAlign: 'center',
                      }}>
                        {action.type}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                          fontSize: designTokens.typography.fontSize.lg,
                          fontWeight: designTokens.typography.fontWeight.semibold,
                          color: designTokens.colors.neutral[900],
                          margin: `0 0 ${designTokens.spacing.sm} 0`,
                          lineHeight: designTokens.typography.lineHeight.tight,
                        }}>
                          {action.title}
                        </h3>
                        
                        <p style={{
                          fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                          fontSize: designTokens.typography.fontSize.sm,
                          color: designTokens.colors.neutral[600],
                          margin: 0,
                          lineHeight: designTokens.typography.lineHeight.normal,
                        }}>
                          {action.priority === 'high' ? 'Requires immediate attention' : 'Complete when convenient'}
                        </p>
                      </div>
                    </div>
                  </div>
                </UXGuard>
              ))}
            </div>
          </section>

          {/* Discovery Sections - Horizontal Layout */}
          <section style={{ marginBottom: designTokens.spacing['3xl'] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                margin: 0,
              }}>
                ⏰ Ending Soon
              </h2>
              
              <Button
                variant="text"
                onClick={() => window.location.href = '/catalog?filter=ending-soon'}
              >
                View All →
              </Button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: designTokens.spacing.lg,
              overflowX: 'auto',
              paddingBottom: designTokens.spacing.md,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {dashboardData.endingSoon.map((item) => (
                <UXGuard key={item.id} role={canBid ? 'demo_buyer' : 'guest'}>
                  <div
                    style={{
                      backgroundColor: designTokens.colors.neutral[0],
                      border: `1px solid ${designTokens.colors.neutral[200]}`,
                      borderRadius: designTokens.borderRadius.xl,
                      overflow: 'hidden',
                      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
                      cursor: 'pointer',
                      minWidth: '280px',
                      flexShrink: 0,
                    }}
                    onClick={() => window.location.href = `/product/${item.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.sm;
                    }}
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      aspectRatio="square"
                    />
                    
                    <div style={{
                      padding: designTokens.spacing.lg,
                    }}>
                      <h3 style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.neutral[900],
                        margin: `0 0 ${designTokens.spacing.sm} 0`,
                        lineHeight: designTokens.typography.lineHeight.tight,
                      }}>
                        {item.name}
                      </h3>
                      
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
                            marginBottom: designTokens.spacing.xs,
                          }}>
                            Current Bid
                          </div>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.xl,
                            fontWeight: designTokens.typography.fontWeight.bold,
                            color: designTokens.colors.primary[600],
                          }}>
                            ₹{item.currentBid.toLocaleString()}
                          </div>
                        </div>
                        
                        <div style={{
                          textAlign: 'right',
                        }}>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.xs,
                            color: designTokens.colors.neutral[500],
                            marginBottom: designTokens.spacing.xs,
                          }}>
                            Time Left
                          </div>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.base,
                            fontWeight: designTokens.typography.fontWeight.medium,
                            color: designTokens.colors.warning[600],
                          }}>
                            {item.timeLeft}
                          </div>
                        </div>
                      </div>
                      
                      {canBid ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => window.location.href = `/product/${item.id}#bid`}
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
                            size="sm"
                            fullWidth
                            disabled
                          >
                            Place Bid
                          </Button>
                        </DisabledAction>
                      )}
                    </div>
                  </div>                </UXGuard>
              ))}
            </div>
          </section>

          {/* Recommended Section */}
          <section style={{ marginBottom: designTokens.spacing['3xl'] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                margin: 0,
              }}>
                ⭐ Recommended for You
              </h2>
              
              <Button
                variant="text"
                onClick={() => window.location.href = '/catalog?filter=recommended'}
              >
                View All →
              </Button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: designTokens.spacing.lg,
              overflowX: 'auto',
              paddingBottom: designTokens.spacing.md,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {dashboardData.recommendations.map((item) => (
                <UXGuard key={item.id} role={canBid ? 'demo_buyer' : 'guest'}>
                  <div
                    style={{
                      backgroundColor: designTokens.colors.neutral[0],
                      border: `1px solid ${designTokens.colors.neutral[200]}`,
                      borderRadius: designTokens.borderRadius.xl,
                      overflow: 'hidden',
                      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
                      cursor: 'pointer',
                      minWidth: '280px',
                      flexShrink: 0,
                    }}
                    onClick={() => window.location.href = `/product/${item.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.sm;
                    }}
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      aspectRatio="square"
                    />
                    
                    <div style={{
                      padding: designTokens.spacing.lg,
                    }}>
                      <h3 style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.neutral[900],
                        margin: `0 0 ${designTokens.spacing.sm} 0`,
                        lineHeight: designTokens.typography.lineHeight.tight,
                      }}>
                        {item.name}
                      </h3>
                      
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
                            marginBottom: designTokens.spacing.xs,
                          }}>
                            Starting Bid
                          </div>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.xl,
                            fontWeight: designTokens.typography.fontWeight.bold,
                            color: designTokens.colors.primary[600],
                          }}>
                            ₹{item.price.toLocaleString()}
                          </div>
                        </div>
                        
                        {item.timeLeft && (
                          <div style={{
                            textAlign: 'right',
                          }}>
                            <div style={{
                              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                              fontSize: designTokens.typography.fontSize.xs,
                              color: designTokens.colors.neutral[500],
                              marginBottom: designTokens.spacing.xs,
                            }}>
                              Time Left
                            </div>
                            <div style={{
                              fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                              fontSize: designTokens.typography.fontSize.base,
                              fontWeight: designTokens.typography.fontWeight.medium,
                              color: designTokens.colors.warning[600],
                            }}>
                              {item.timeLeft}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {canBid ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => window.location.href = `/product/${item.id}#bid`}
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
                            size="sm"
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
          </section>

          {/* New Items Section */}
          <section>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                margin: 0,
              }}>
                ✨ New Items
              </h2>
              
              <Button
                variant="text"
                onClick={() => window.location.href = '/catalog?filter=new'}
              >
                View All →
              </Button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: designTokens.spacing.lg,
              overflowX: 'auto',
              paddingBottom: designTokens.spacing.md,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {dashboardData.newItems.map((item) => (
                <UXGuard key={item.id} role={canBid ? 'demo_buyer' : 'guest'}>
                  <div
                    style={{
                      backgroundColor: designTokens.colors.neutral[0],
                      border: `1px solid ${designTokens.colors.neutral[200]}`,
                      borderRadius: designTokens.borderRadius.xl,
                      overflow: 'hidden',
                      transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
                      cursor: 'pointer',
                      minWidth: '280px',
                      flexShrink: 0,
                    }}
                    onClick={() => window.location.href = `/product/${item.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = designTokens.elevation.sm;
                    }}
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      aspectRatio="square"
                    />
                    
                    <div style={{
                      padding: designTokens.spacing.lg,
                    }}>
                      <h3 style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        color: designTokens.colors.neutral[900],
                        margin: `0 0 ${designTokens.spacing.sm} 0`,
                        lineHeight: designTokens.typography.lineHeight.tight,
                      }}>
                        {item.name}
                      </h3>
                      
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
                            marginBottom: designTokens.spacing.xs,
                          }}>
                            Starting Bid
                          </div>
                          <div style={{
                            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                            fontSize: designTokens.typography.fontSize.xl,
                            fontWeight: designTokens.typography.fontWeight.bold,
                            color: designTokens.colors.primary[600],
                          }}>
                            ₹{item.price.toLocaleString()}
                          </div>
                        </div>
                        
                        <div style={{
                          backgroundColor: designTokens.colors.success[100],
                          color: designTokens.colors.success[800],
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                          borderRadius: designTokens.borderRadius.full,
                          fontSize: designTokens.typography.fontSize.xs,
                          fontWeight: designTokens.typography.fontWeight.medium,
                        }}>
                          New
                        </div>
                      </div>
                      
                      {canBid ? (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => window.location.href = `/product/${item.id}#bid`}
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
                            size="sm"
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
          </section>
        </main>
      )}
    </div>
  );
};

export default ModernBuyerDashboard;
