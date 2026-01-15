// Product Detail - Enterprise Design System (UX Consistent)
import React, { useState, useEffect } from 'react';
import { designTokens } from '../design-system/tokens-fixed';
import { Button, SmartImage, UXGuard, EmptyState, LoadingState, DisabledAction } from '../integration/component-map';
import { UserRole } from '../design-system/types';

const ModernProductDetail: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentBid, setCurrentBid] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    // Determine user role
    const demoSession = localStorage.getItem('demo-session');
    if (demoSession) {
      const demoData = JSON.parse(demoSession);
      setUserRole(`demo_${demoData.user?.user_metadata?.role || 'guest'}` as UserRole);
    }

    // Load product data
    setTimeout(() => {
      setProduct({
        id: 1,
        name: 'Premium Vintage Camera',
        description: 'Professional-grade vintage camera in excellent condition. Fully tested and verified for authenticity. Perfect for collectors and photography enthusiasts.',
        price: 25000,
        images: [
          'https://picsum.photos/600/400?random=1',
          'https://picsum.photos/600/400?random=2',
          'https://picsum.photos/600/400?random=3',
          'https://picsum.photos/600/400?random=4'
        ],
        category: 'Electronics',
        condition: 'Excellent',
        seller: {
          name: 'Premium Seller',
          avatar: 'https://ui-avatars.com/api/?name=Premium+Seller&background=random',
          rating: 4.8,
          totalSales: 156,
          verified: true
        },
        specifications: {
          brand: 'Vintage Camera Co',
          model: 'Pro-X100',
          year: '1985',
          condition: 'Excellent',
          includes: ['Original Box', 'Manual', 'Certificate of Authenticity']
        },
        bids: [
          { id: 1, user: 'John D.', amount: 18000, time: '2 hours ago' },
          { id: 2, user: 'Sarah M.', amount: 17500, time: '3 hours ago' },
          { id: 3, user: 'Mike R.', amount: 17000, time: '5 hours ago' }
        ],
        timeLeft: '2h 15m'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const canBrowse = userRole !== 'guest';
  const canBid = ['demo_buyer', 'beta_buyer'].includes(userRole);
  const canSell = ['demo_seller', 'beta_seller'].includes(userRole);

  const handleBid = () => {
    if (!canBid) return;
    
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) return;
    
    // In demo mode, just show success message
    if (userRole.startsWith('demo')) {
      alert(`Demo bid of ₹${bidValue.toLocaleString()} placed successfully!`);
      setBidAmount('');
      setCurrentBid(`₹${bidValue.toLocaleString()}`);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: designTokens.colors.neutral[50],
      }}>
        <LoadingState message="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: designTokens.colors.neutral[50],
      }}>
        <EmptyState
          title="Product Not Found"
          description="The product you're looking for doesn't exist or has been removed."
          action={{
            text: "Browse Products",
            onClick: () => window.location.href = '/catalog'
          }}
        />
      </div>
    );
  }

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
          <Button
            variant="text"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
          
          <h1 style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.neutral[900],
            margin: 0,
          }}>
            {product.name}
          </h1>
        </div>
      </header>

      {/* Main Content - 2-3 Column Layout */}
      <main style={{
        maxWidth: designTokens.container.xl,
        margin: '0 auto',
        padding: `${designTokens.spacing.xl} ${designTokens.spacing.lg}`,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: designTokens.spacing.xl,
        }}>
          {/* Left Column - Product Images */}
          <div>
            <div style={{
              backgroundColor: designTokens.colors.neutral[0],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.xl,
              overflow: 'hidden',
              marginBottom: designTokens.spacing.lg,
            }}>
              {/* Main Image - No broken images */}
              <SmartImage
                src={product.images}
                alt={product.name}
                aspectRatio="square"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: designTokens.spacing.sm,
            }}>
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  style={{
                    cursor: 'pointer',
                    borderRadius: designTokens.borderRadius.md,
                    overflow: 'hidden',
                    border: index === 0 ? `2px solid ${designTokens.colors.primary[500]}` : '1px solid transparent',
                  }}
                  onClick={() => {
                    // In a real app, this would change the main image
                    console.log(`Selected image ${index + 1}`);
                  }}
                >
                  <SmartImage
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    aspectRatio="square"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Price & Bidding Section */}
            <UXGuard role={canBid ? 'demo_buyer' : 'guest'}>
              <div style={{
                background: `linear-gradient(135deg, ${designTokens.colors.primary[50]} 0%, ${designTokens.colors.primary[100]} 100%)`,
                border: `1px solid ${designTokens.colors.primary[200]}`,
                borderRadius: designTokens.borderRadius.xl,
                padding: designTokens.spacing.xl,
                marginBottom: designTokens.spacing.lg,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: designTokens.spacing.md,
                }}>
                  <div>
                    <div style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.primary[700],
                      marginBottom: designTokens.spacing.xs,
                    }}>
                      Current Bid
                    </div>
                    <div style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize['3xl'],
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.primary[600],
                    }}>
                      {currentBid || `₹${product.price.toLocaleString()}`}
                    </div>
                  </div>
                  
                  {product.timeLeft && (
                    <div style={{
                      textAlign: 'right',
                    }}>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.sm,
                        color: designTokens.colors.primary[700],
                      }}>
                        Time Left
                      </div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.medium,
                        color: designTokens.colors.warning[600],
                      }}>
                        {product.timeLeft}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bid Input */}
                {canBid ? (
                  <div style={{
                    display: 'flex',
                    gap: designTokens.spacing.md,
                  }}>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      style={{
                        flex: 1,
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.base,
                        padding: designTokens.spacing.md,
                        border: `1px solid ${designTokens.colors.neutral[300]}`,
                        borderRadius: designTokens.borderRadius.lg,
                        backgroundColor: designTokens.colors.neutral[0],
                      }}
                    />
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleBid}
                    >
                      Place Bid
                    </Button>
                  </div>
                ) : (
                  <DisabledAction
                    reason="Sign up to place bids"
                    tooltip="Create a free account to start bidding on this item"
                  >
                    <div style={{
                      display: 'flex',
                      gap: designTokens.spacing.md,
                    }}>
                      <input
                        type="number"
                        placeholder="Enter bid amount"
                        disabled
                        style={{
                          flex: 1,
                          fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                          fontSize: designTokens.typography.fontSize.base,
                          padding: designTokens.spacing.md,
                          border: `1px solid ${designTokens.colors.neutral[300]}`,
                          borderRadius: designTokens.borderRadius.lg,
                          backgroundColor: designTokens.colors.neutral[100],
                          opacity: 0.5,
                        }}
                      />
                      <Button
                        variant="primary"
                        size="lg"
                        disabled
                      >
                        Place Bid
                      </Button>
                    </div>
                  </DisabledAction>
                )}
              </div>
            </UXGuard>

            {/* Product Information */}
            <div style={{
              backgroundColor: designTokens.colors.neutral[0],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.xl,
              padding: designTokens.spacing.xl,
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.md,
              }}>
                Product Information
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: designTokens.spacing.lg,
                marginBottom: designTokens.spacing.lg,
              }}>
                <div>
                  <div style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[500],
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    Category
                  </div>
                  <div style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.base,
                    fontWeight: designTokens.typography.fontWeight.medium,
                    color: designTokens.colors.neutral[900],
                  }}>
                    {product.category}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[500],
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    Condition
                  </div>
                  <div style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.base,
                    fontWeight: designTokens.typography.fontWeight.medium,
                    color: designTokens.colors.neutral[900],
                  }}>
                    {product.condition}
                  </div>
                </div>
              </div>

              <p style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.base,
                color: designTokens.colors.neutral[700],
                lineHeight: designTokens.typography.lineHeight.normal,
                marginBottom: designTokens.spacing.md,
              }}>
                {product.description}
              </p>
            </div>

            {/* Seller Information */}
            <div style={{
              backgroundColor: designTokens.colors.neutral[0],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.xl,
              padding: designTokens.spacing.xl,
              marginBottom: designTokens.spacing.lg,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.md,
              }}>
                Seller Information
              </h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.lg,
                marginBottom: designTokens.spacing.md,
              }}>
                <SmartImage
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  aspectRatio="square"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                  }}
                />
                
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designTokens.spacing.sm,
                    marginBottom: designTokens.spacing.xs,
                  }}>
                    <h3 style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize.lg,
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.neutral[900],
                      margin: 0,
                    }}>
                      {product.seller.name}
                    </h3>
                    
                    {product.seller.verified && (
                      <div style={{
                        backgroundColor: designTokens.colors.success[100],
                        color: designTokens.colors.success[800],
                        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                        borderRadius: designTokens.borderRadius.full,
                        fontSize: designTokens.typography.fontSize.xs,
                        fontWeight: designTokens.typography.fontWeight.medium,
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokens.spacing.xs,
                      }}>
                        <svg style={{ width: '14px', height: '14px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-3.293-1.293a1 1 0 011.414 0l5.586 5.586a1 1 0 011.414 1.414l-5.586 5.586a1 1 0 01-1.414 1.414L8.586 10.414a1 1 0 01-1.414-1.414L6.586 8.414A1 1 0 018.586 7l5.586 5.586a1 1 0 011.414-1.414L15.414 13.586a1 1 0 01-1.414-1.414L10.586 11.586z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[600],
                  }}>
                    {product.seller.totalSales} sales
                  </div>
                </div>
                
                <div style={{
                  fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                  fontSize: designTokens.typography.fontSize.sm,
                  color: designTokens.colors.neutral[500],
                }}>
                  Rating: {product.seller.rating}/5.0 ⭐
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div style={{
              backgroundColor: designTokens.colors.neutral[0],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.xl,
              padding: designTokens.spacing.xl,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.md,
              }}>
                Specifications
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: designTokens.spacing.lg,
              }}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <div style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[500],
                      marginBottom: designTokens.spacing.xs,
                      textTransform: 'capitalize',
                    }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{
                      fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                      fontSize: designTokens.typography.fontSize.base,
                      fontWeight: designTokens.typography.fontWeight.medium,
                      color: designTokens.colors.neutral[900],
                    }}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bidding History */}
            <div style={{
              backgroundColor: designTokens.colors.neutral[0],
              border: `1px solid ${designTokens.colors.neutral[200]}`,
              borderRadius: designTokens.borderRadius.xl,
              padding: designTokens.spacing.xl,
            }}>
              <h2 style={{
                fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                fontSize: designTokens.typography.fontSize.xl,
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[900],
                marginBottom: designTokens.spacing.md,
              }}>
                Bidding History
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: designTokens.spacing.md,
              }}>
                {product.bids.map((bid: any) => (
                  <div
                    key={bid.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: designTokens.spacing.md,
                      backgroundColor: designTokens.colors.neutral[50],
                      borderRadius: designTokens.borderRadius.lg,
                      border: `1px solid ${designTokens.colors.neutral[200]}`,
                    }}
                  >
                    <div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.sm,
                        color: designTokens.colors.neutral[500],
                      }}>
                        {bid.user}
                      </div>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.xs,
                        color: designTokens.colors.neutral[400],
                      }}>
                        {bid.time}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'right',
                    }}>
                      <div style={{
                        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
                        fontSize: designTokens.typography.fontSize.lg,
                        fontWeight: designTokens.typography.fontWeight.bold,
                        color: designTokens.colors.primary[600],
                      }}>
                        ₹{bid.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernProductDetail;
