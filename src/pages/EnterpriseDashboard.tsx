// Modern Dashboard - Enterprise Design System
import React from 'react';
import { designTokens } from '../design-system/tokens';
import { Button } from '../design-system/components/Button';
import { Card, CardHeader, CardBody } from '../design-system/components/Card';
import { Badge } from '../design-system/components/Badge';
import { SmartImage } from '../components/SmartImage';
import { BetaVersionBanner } from '../components/BetaVersionBanner';
import { BetaUserIndicator } from '../components/BetaUserIndicator';

const ModernDashboard: React.FC = () => {
  const [userRole, setUserRole] = React.useState('guest');

  React.useEffect(() => {
    // Determine user role from localStorage or auth
    const demoSession = localStorage.getItem('demo-session');
    if (demoSession) {
      const demoData = JSON.parse(demoSession);
      setUserRole(`demo_${demoData.user?.user_metadata?.role || 'guest'}`);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.neutral[50],
    }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[800]} 100%)`,
        color: 'white',
        padding: `${designTokens.spacing['4xl']} 0`,
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: designTokens.container.lg,
          margin: '0 auto',
          padding: `0 ${designTokens.spacing.lg}`,
        }}>
          <h1 style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize['4xl'],
            fontWeight: designTokens.typography.fontWeight.bold,
            lineHeight: designTokens.typography.lineHeight.tight,
            marginBottom: designTokens.spacing.lg,
          }}>
            Discover Amazing Items at Unbeatable Prices
          </h1>
          
          <p style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize.lg,
            lineHeight: designTokens.typography.lineHeight.relaxed,
            marginBottom: designTokens.spacing.xl,
            opacity: 0.9,
          }}>
            Join thousands of buyers and sellers in India's trusted auction platform
          </p>
          
          <div style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/catalog'}
            >
              Browse Auctions
            </Button>
            
            {userRole === 'guest' && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/demo'}
              >
                Try Demo
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Beta Banner */}
      <BetaVersionBanner />
      <BetaUserIndicator />

      {/* Main Content */}
      <main style={{
        maxWidth: designTokens.container.xl,
        margin: '0 auto',
        padding: `${designTokens.spacing['3xl']} ${designTokens.spacing.lg}`,
      }}>
        
        {/* Trending Now Section */}
        <section style={{ marginBottom: designTokens.spacing['4xl'] }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designTokens.spacing.xl,
          }}>
            <div>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize['2xl'],
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.sm,
              }}>
                🔥 Trending Now
              </h2>
              <p style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                color: designTokens.colors.neutral[600],
              }}>
                Hot items with active bidding
              </p>
            </div>
            
            <Button variant="text" onClick={() => window.location.href = '/catalog'}>
              View All →
            </Button>
          </div>

          {/* Horizontal Scrollable Cards */}
          <div style={{
            display: 'flex',
            gap: designTokens.spacing.lg,
            overflowX: 'auto',
            paddingBottom: designTokens.spacing.md,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Card
                key={item}
                variant="elevated"
                hover={true}
                style={{
                  minWidth: '280px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={() => window.location.href = `/product/${item}`}
              >
                <SmartImage
                  src={`https://picsum.photos/280/200?random=${item}`}
                  alt={`Product ${item}`}
                  aspectRatio="landscape"
                />
                
                <CardBody>
                  <h3 style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[900],
                    marginBottom: designTokens.spacing.sm,
                  }}>
                    Premium Product {item}
                  </h3>
                  
                  <p style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[600],
                    marginBottom: designTokens.spacing.md,
                  }}>
                    High-quality item with excellent condition
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                        ₹{(Math.random() * 10000 + 1000).toFixed(0)}
                      </div>
                    </div>
                    
                    <Badge variant="success">Live</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Ending Soon Section */}
        <section style={{ marginBottom: designTokens.spacing['4xl'] }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designTokens.spacing.xl,
          }}>
            <div>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize['2xl'],
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.sm,
              }}>
                ⏰ Ending Soon
              </h2>
              <p style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                color: designTokens.colors.neutral[600],
              }}>
                Last chance to bid
              </p>
            </div>
            
            <Button variant="text" onClick={() => window.location.href = '/catalog?filter=ending-soon'}>
              View All →
            </Button>
          </div>

          {/* Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: designTokens.spacing.lg,
          }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card
                key={item}
                variant="default"
                hover={true}
                style={{ cursor: 'pointer' }}
                onClick={() => window.location.href = `/product/${item}`}
              >
                <SmartImage
                  src={`https://picsum.photos/280/200?random=${item + 10}`}
                  alt={`Product ${item}`}
                  aspectRatio="landscape"
                />
                
                <CardBody>
                  <h3 style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[900],
                    marginBottom: designTokens.spacing.sm,
                  }}>
                    Ending Item {item}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.sm,
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
                        2h 15m
                      </div>
                    </div>
                    
                    <Badge variant="warning">Ending Soon</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designTokens.spacing.xl,
          }}>
            <div>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize['2xl'],
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.sm,
              }}>
                ✨ New Arrivals
              </h2>
              <p style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                color: designTokens.colors.neutral[600],
              }}>
                Fresh listings this week
              </p>
            </div>
            
            <Button variant="text" onClick={() => window.location.href = '/catalog?filter=new'}>
              View All →
            </Button>
          </div>

          {/* Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: designTokens.spacing.lg,
          }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card
                key={item}
                variant="default"
                hover={true}
                style={{ cursor: 'pointer' }}
                onClick={() => window.location.href = `/product/${item}`}
              >
                <SmartImage
                  src={`https://picsum.photos/280/200?random=${item + 20}`}
                  alt={`Product ${item}`}
                  aspectRatio="landscape"
                />
                
                <CardBody>
                  <h3 style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[900],
                    marginBottom: designTokens.spacing.sm,
                  }}>
                    New Item {item}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.sm,
                        color: designTokens.colors.neutral[500],
                      }}>
                        Starting Bid
                      </div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.xl,
                        fontWeight: designTokens.typography.fontWeight.bold,
                        color: designTokens.colors.primary[600],
                      }}>
                        ₹{(Math.random() * 5000 + 500).toFixed(0)}
                      </div>
                    </div>
                    
                    <Badge variant="primary">New</Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ModernDashboard;
