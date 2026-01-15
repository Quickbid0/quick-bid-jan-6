export const mockProfiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@quickbid.com',
    name: 'Admin User',
    phone: '+919876543210',
    user_type: 'both',
    role: 'admin',
    is_verified: true,
    verification_status: 'approved',
    avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 5.0,
    total_sales: 0
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'john.buyer@example.com',
    name: 'John Smith',
    phone: '+919876543211',
    user_type: 'buyer',
    role: 'user',
    is_verified: true,
    verification_status: 'approved',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 0,
    total_sales: 0
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'seller1@example.com',
    name: 'Neha Sharma',
    phone: '+919876543212',
    user_type: 'seller',
    role: 'user',
    is_verified: true,
    verification_status: 'approved',
    avatar_url: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 4.8,
    total_sales: 150
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'company@nbfc.com',
    name: 'NBFC Finance Corp',
    phone: '+919876543213',
    user_type: 'company',
    role: 'user',
    is_verified: true,
    verification_status: 'approved',
    avatar_url: 'https://ui-avatars.com/api/?name=NBFC&background=4A90E2&color=fff&size=200',
    business_name: 'NBFC Finance Corp',
    company_type: 'nbfc',
    rating: 4.9,
    total_sales: 500
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'seller2@example.com',
    name: 'Ravi Kumar',
    phone: '+919876543214',
    user_type: 'seller',
    role: 'user',
    is_verified: true,
    verification_status: 'approved',
    avatar_url: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: 4.6,
    total_sales: 85
  }
];

export const mockProducts = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Vintage Rolex Submariner 1960s',
    description: 'Rare vintage Rolex Submariner from 1960s in excellent condition. Original box and papers included. This iconic timepiece features automatic movement and is a true collector\'s item with documented provenance.',
    category: 'Jewelry & Watches',
    subcategory: 'Luxury Watches',
    starting_price: 250000,
    current_price: 285000,
    reserve_price: 350000,
    image_url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
    images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'excellent',
    location: 'Mumbai, Maharashtra',
    is_featured: true,
    is_trending: true,
    view_count: 856,
    bid_count: 24,
    watchers: 45
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: '2019 BMW 5 Series - Bank Seized',
    description: 'Bank seized BMW 5 Series 2019 model. Low mileage (35,000 km), excellent condition. Full service history available. White color with beige leather interiors. All features working perfectly.',
    category: 'Vehicles',
    subcategory: 'Cars',
    starting_price: 1200000,
    current_price: 1350000,
    reserve_price: 1500000,
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000004',
    status: 'active',
    auction_type: 'live',
    start_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    condition: 'excellent',
    location: 'Delhi, Delhi',
    is_featured: true,
    is_trending: true,
    view_count: 1243,
    bid_count: 38,
    watchers: 67,
    stream_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Antique Persian Carpet 1890s',
    description: 'Authentic Persian carpet from late 1890s. Hand-woven with intricate patterns. Size: 12x9 feet. Museum quality piece with certificate of authenticity. Professionally cleaned and maintained.',
    category: 'Antiques & Collectibles',
    subcategory: 'Furniture & Decor',
    starting_price: 180000,
    current_price: 195000,
    reserve_price: 250000,
    image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
    images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'good',
    location: 'Jaipur, Rajasthan',
    is_featured: true,
    is_trending: false,
    view_count: 432,
    bid_count: 15,
    watchers: 28
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Industrial CNC Machine 2020',
    description: 'High-precision CNC milling machine. Lightly used, maintained regularly. Perfect for small to medium manufacturing units. Comes with all accessories, training, and 1-year warranty.',
    category: 'Industrial Equipment',
    subcategory: 'Manufacturing',
    starting_price: 450000,
    current_price: 450000,
    reserve_price: 500000,
    image_url: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
    images: ['https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000004',
    status: 'active',
    auction_type: 'tender',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'good',
    location: 'Pune, Maharashtra',
    is_featured: false,
    is_trending: true,
    view_count: 678,
    bid_count: 8,
    watchers: 34
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Original MF Husain Painting 1985',
    description: 'Rare original painting by master artist MF Husain. Signed and dated 1985. Provenance documented. Vibrant colors depicting Indian culture. Investment-grade art piece.',
    category: 'Art & Paintings',
    subcategory: 'Modern Art',
    starting_price: 850000,
    current_price: 920000,
    reserve_price: 1200000,
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'excellent',
    location: 'Mumbai, Maharashtra',
    is_featured: true,
    is_trending: true,
    view_count: 1105,
    bid_count: 31,
    watchers: 89
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    title: 'Handcrafted Wooden Furniture Set',
    description: 'Beautiful handcrafted teak wood furniture set including dining table and 6 chairs. Intricate carvings, traditional Indian design. Perfect for luxury homes.',
    category: 'Handmade & Creative',
    subcategory: 'Furniture',
    starting_price: 125000,
    current_price: 135000,
    reserve_price: 150000,
    image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800',
    images: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000005',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'new',
    location: 'Bangalore, Karnataka',
    is_featured: false,
    is_trending: false,
    view_count: 324,
    bid_count: 12,
    watchers: 21
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    title: '2020 Royal Enfield Classic 350',
    description: 'Well-maintained Royal Enfield Classic 350. Single owner, complete service records. Black color, chrome finish. Perfect for enthusiasts. 18,000 km driven.',
    category: 'Vehicles',
    subcategory: 'Motorcycles',
    starting_price: 85000,
    current_price: 92000,
    reserve_price: 110000,
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000005',
    status: 'active',
    auction_type: 'live',
    start_date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    condition: 'good',
    location: 'Chennai, Tamil Nadu',
    is_featured: false,
    is_trending: true,
    view_count: 567,
    bid_count: 19,
    watchers: 43
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    title: 'Diamond Necklace Set 18K Gold',
    description: 'Exquisite diamond necklace set in 18K gold. Total weight: 45 grams. Diamonds: 2.5 carats. Certified by GIA. Comes with insurance valuation and original bill.',
    category: 'Jewelry & Watches',
    subcategory: 'Fine Jewelry',
    starting_price: 320000,
    current_price: 355000,
    reserve_price: 400000,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    condition: 'new',
    location: 'Surat, Gujarat',
    is_featured: true,
    is_trending: true,
    view_count: 945,
    bid_count: 27,
    watchers: 56
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    title: 'Commercial Office Equipment Lot',
    description: 'Bulk lot of office equipment including 20 computers, printers, furniture. Suitable for new office setup or resale. All items working condition.',
    category: 'Industrial Equipment',
    subcategory: 'Office Equipment',
    starting_price: 280000,
    current_price: 280000,
    reserve_price: 320000,
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000004',
    status: 'active',
    auction_type: 'tender',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'good',
    location: 'Hyderabad, Telangana',
    is_featured: false,
    is_trending: false,
    view_count: 412,
    bid_count: 6,
    watchers: 18
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    title: 'Rare Stamp Collection 1940-1960',
    description: 'Comprehensive stamp collection from 1940-1960 era. Includes rare Indian and British stamps. Mint condition, properly catalogued. Great for collectors.',
    category: 'Antiques & Collectibles',
    subcategory: 'Stamps & Coins',
    starting_price: 65000,
    current_price: 72000,
    reserve_price: 85000,
    image_url: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=800',
    images: ['https://images.unsplash.com/photo-1509803874385-db7c23652552?w=800'],
    seller_id: '00000000-0000-0000-0000-000000000005',
    status: 'active',
    auction_type: 'timed',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    condition: 'excellent',
    location: 'Kolkata, West Bengal',
    is_featured: false,
    is_trending: true,
    view_count: 289,
    bid_count: 11,
    watchers: 25
  }
];

export const getProductsWithSellers = () => {
  return mockProducts.map(product => {
    const seller = mockProfiles.find(p => p.id === product.seller_id);
    return {
      ...product,
      seller: {
        name: seller?.name || 'Unknown Seller',
        is_verified: seller?.is_verified || false,
        avatar_url: seller?.avatar_url,
        rating: seller?.rating || 0
      }
    };
  });
};

export const getProductById = (id: string) => {
  let product = mockProducts.find(p => p.id === id);

  // Fallback: support numeric ids like "/product/1" mapping to 1-based index
  if (!product && /^\d+$/.test(id)) {
    const idx = parseInt(id, 10) - 1;
    if (idx >= 0 && idx < mockProducts.length) {
      product = mockProducts[idx];
    }
  }

  if (!product) return null;

  const seller = mockProfiles.find(p => p.id === product.seller_id);
  return {
    ...product,
    seller: {
      name: seller?.name || 'Unknown Seller',
      verified: !!seller?.is_verified,
      is_verified: !!seller?.is_verified,
      avatar_url: seller?.avatar_url,
      rating: seller?.rating,
      total_sales: seller?.total_sales,
    },
  } as any;
};

export const getProfileById = (id: string) => {
  return mockProfiles.find(p => p.id === id);
};
