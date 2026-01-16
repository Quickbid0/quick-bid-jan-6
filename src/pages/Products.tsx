import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { getBodyTypesForMainCategoryFilter } from '../config/BodyTypeConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  IndianRupee,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Calendar,
  MapPin,
  Tag,
  Users,
  Gavel,
  Heart,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// import BidModal from '../components/BidModal';
import { aiService, AIRecommendation } from '../services/aiService';
import PageFrame from '../components/layout/PageFrame';
import AINaturalSearch from '../components/ai/AINaturalSearch';
import AIRecommendations from '../components/ai/AIRecommendations';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_urls: string[];
  current_price: number;
  starting_price: number;
  category: string;
  condition: string;
  location: string;
  end_date: string;
  status: 'pending' | 'active' | 'sold' | 'expired';
  verification_status: 'pending' | 'verified' | 'rejected';
  view_count: number;
  bid_count: number;
  seller_id: string;
  tags: string[];
  is_premium: boolean;
  is_trending: boolean;
  auction_type?: 'timed' | 'live' | 'tender' | null;
}

const brandLogos: Record<string, string> = {
  'Tata': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Tata_logo.svg',
  'Maruti Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Maruti_Suzuki_Logo.svg',
  'Mahindra': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Mahindra_new_logo.svg',
  'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Hyundai_logo.svg',
  'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_logo.svg',
  'Kia': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Kia-logo.png',
  'Honda': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda-logo.svg',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Audi_Logo_2016.svg',
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/VW_Logo.svg',
  'Skoda': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/%C5%A0koda_Auto_logo.svg',
  'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Royal_Enfield_Logo.svg',
  'Yamaha': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Yamaha_Motor_Logo.svg',
  'TVS': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/TVS_Motor_Company_Logo.svg',
  'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Bajaj_auto_logo.svg',
  'Hero': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Hero_MotoCorp_Logo.svg',
  'Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Suzuki_logo_2.svg',
  'KTM': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/KTM-Logo.svg',
  'Ducati': 'https://upload.wikimedia.org/wikipedia/en/0/06/Ducati_red_logo.svg',
  'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Harley-Davidson_logo.svg',
};

interface InspectionRow {
  id: string;
  product_id: string;
  status: string | null;
  final_status: string | null;
  final_decision: string | null;
  final_grade?: string | null;
  created_at: string | null;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState('user');
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [boostStatusByProduct, setBoostStatusByProduct] = useState<Record<string, { endsAt: string }>>({});
  const [verificationByProduct, setVerificationByProduct] = useState<Record<string, { status: string; ownershipStatus: string }>>({});
  const [inspectionByProductId, setInspectionByProductId] = useState<Record<string, InspectionRow | null>>({});

  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    fuelType: '',
    bodyType: '',
    yearRange: '',
    kmRange: '',
    condition: '',
    priceRange: '',
    location: '',
    status: '',
    auctionType: '',
    sortBy: 'ending_soon'
  });
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [lastFilterSnapshot, setLastFilterSnapshot] = useState<{ filters: Record<string, any>; search: string } | null>(null);

  const vehicleBrands = [
    'Tata',
    'Maruti Suzuki',
    'Mahindra',
    'Hyundai',
    'Toyota',
    'Kia',
    'Honda',
    'Renault',
    'MG',
    'Skoda',
    'Volkswagen',
    'Nissan',
    'Jeep',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Lexus',
    'Volvo',
    'Porsche',
    'Royal Enfield',
    'Yamaha',
    'TVS',
    'Bajaj',
    'Hero',
    'Suzuki',
    'KTM',
    'Ducati',
    'Harley-Davidson',
  ];

  const bodyTypes = getBodyTypesForMainCategoryFilter(filters.category || 'Automobiles');

  const fuelTypes = [
    'Petrol',
    'Diesel',
    'CNG',
    'LPG',
    'Hybrid',
    'Electric',
    'Others',
  ];

  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
    checkUserRole();
  }, []);

  // Load saved & recent searches, and last filters snapshot
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      setSavedSearches(Array.isArray(saved) ? saved : []);
    } catch {}
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(Array.isArray(recent) ? recent.slice(0, 5) : []);
    } catch {}
    try {
      const last = JSON.parse(localStorage.getItem('lastFilters') || 'null');
      if (last && last.filters) setLastFilterSnapshot(last);
    } catch {}
  }, []);

  // Persist last filters and search term for quick resume
  useEffect(() => {
    const snapshot = { filters, search: searchTerm };
    localStorage.setItem('lastFilters', JSON.stringify(snapshot));
  }, [filters, searchTerm]);

  const saveCurrentSearch = () => {
    const entry = {
      id: Date.now().toString(),
      name: searchTerm || 'All items',
      query: searchTerm,
      filters,
      ts: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const updated = [entry, ...existing.filter((s: any) => s.query !== entry.query || JSON.stringify(s.filters) !== JSON.stringify(entry.filters))].slice(0, 20);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    setSavedSearches(updated);
    toast.success('Search saved');
  };

  const applySavedSearch = (entry: any) => {
    setSearchTerm(entry.query || '');
    setFilters(entry.filters || filters);
  };

  const resumeLastFilter = () => {
    if (!lastFilterSnapshot) return;
    setSearchTerm(lastFilterSnapshot.search || '');
    setFilters((lastFilterSnapshot.filters as any) || filters);
  };

  // Realtime: listen for product inserts/updates to keep catalog live
  useEffect(() => {
    const channel = supabase
      .channel('products-catalog-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        const row: any = payload.new;
        setProducts((prev) => [row, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        const row: any = payload.new;
        setProducts((prev) => prev.map((p: any) => (p.id === row.id ? { ...p, ...row } : p)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, products]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, user_type')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.user_type || 'buyer');
      }
    }
  };

  // Load personalized recommendations for logged-in users
  useEffect(() => {
    const loadRecs = async () => {
      if (!userId) return;
      try {
        const recs = await aiService.getPersonalizedRecommendations(userId);
        setRecommendations(recs.slice(0, 6));
      } catch (e) {
        console.warn('Failed to load product recommendations', e);
      }
    };
    loadRecs();
  }, [userId]);

  // Load active boosts and verification state for seller-owned products (Phase 3 chips)
  useEffect(() => {
    const loadSellerStatus = async () => {
      if (!userId || !(userRole === 'seller' || userRole === 'company')) return;
      const sellerProducts = products.filter((p) => p.seller_id === userId);
      if (sellerProducts.length === 0) {
        setBoostStatusByProduct({});
        setVerificationByProduct({});
        return;
      }

      const productIds = sellerProducts.map((p) => p.id);

      try {
        // Map product -> listing
        const { data: listings } = await supabase
          .from('listings')
          .select('id, product_id')
          .in('product_id', productIds)
          .eq('seller_id', userId);

        const productToListing: Record<string, string> = {};
        const listingIds: string[] = [];
        (listings || []).forEach((l: any) => {
          if (!l.product_id || !l.id) return;
          productToListing[l.product_id] = l.id;
          listingIds.push(l.id);
        });

        const now = new Date();
        const boostMap: Record<string, { endsAt: string }> = {};
        if (listingIds.length > 0) {
          const { data: boosts } = await supabase
            .from('boosts')
            .select('listing_id, starts_at, ends_at, status')
            .in('listing_id', listingIds);

          (boosts || []).forEach((b: any) => {
            if (!b.listing_id || !b.ends_at || b.status !== 'active') return;
            const start = b.starts_at ? new Date(b.starts_at) : null;
            const end = new Date(b.ends_at);
            if (start && start > now) return;
            if (end < now) return;
            const productId = Object.keys(productToListing).find((pid) => productToListing[pid] === b.listing_id);
            if (productId) {
              boostMap[productId] = { endsAt: b.ends_at as string };
            }
          });
        }

        const { data: verifications } = await supabase
          .from('verification')
          .select('product_id, status, ownership_status, requested_at')
          .in('product_id', productIds)
          .eq('seller_id', userId);

        const latestVerification: Record<string, { status: string; ownershipStatus: string; requestedAt: string | null }> = {};
        (verifications || []).forEach((v: any) => {
          if (!v.product_id) return;
          const prev = latestVerification[v.product_id];
          const prevTs = prev?.requestedAt ? new Date(prev.requestedAt).getTime() : 0;
          const curTs = v.requested_at ? new Date(v.requested_at).getTime() : 0;
          if (!prev || curTs >= prevTs) {
            latestVerification[v.product_id] = {
              status: v.status || 'pending_payment',
              ownershipStatus: v.ownership_status || 'unverified',
              requestedAt: v.requested_at || null,
            };
          }
        });

        const verificationMap: Record<string, { status: string; ownershipStatus: string }> = {};
        Object.keys(latestVerification).forEach((pid) => {
          const entry = latestVerification[pid];
          verificationMap[pid] = {
            status: entry.status,
            ownershipStatus: entry.ownershipStatus,
          };
        });

        setBoostStatusByProduct(boostMap);
        setVerificationByProduct(verificationMap);
      } catch (e) {
        console.warn('Failed to load seller boost/verification state', e);
      }
    };

    loadSellerStatus();
  }, [userId, userRole, products]);

  const fetchProducts = async () => {
    try {
      setLoadError(null);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(name, is_verified)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      let productsData: any[] = [];

      if (error) {
        setLoadError('Failed to load products from server');
        toast.error('Failed to load products');
      } else if (!data || data.length === 0) {
        toast('No active products found.');
      } else {
        const activeProducts = data.filter(product => {
          const endDate = new Date(product.end_date);
          return endDate > new Date();
        });
        const productIds = activeProducts.map((p: any) => p.id);

        const auctionMap: Record<string, any> = {};
        if (productIds.length > 0) {
          const { data: auctions } = await supabase
            .from('auctions')
            .select('product_id, auction_type, status')
            .in('product_id', productIds);

          (auctions || []).forEach((a: any) => {
            if (!auctionMap[a.product_id]) {
              auctionMap[a.product_id] = a;
            }
          });
        }

        productsData = activeProducts.map((p: any) => ({
          ...p,
          auction_type: auctionMap[p.id]?.auction_type || null,
        }));
      }

      const normalized = productsData.map((p: any) => ({
        ...p,
        image_url: p.image_url || (p.images?.[0] ?? ''),
        image_urls: p.image_urls || p.images || (p.image_url ? [p.image_url] : []),
        verification_status: p.verification_status || 'pending',
        tags: p.tags || [],
        is_premium: p.is_premium ?? false,
        bid_count: p.bid_count ?? 0,
        view_count: p.view_count ?? 0,
        auction_type: p.auction_type ?? null,
      }));

      try {
        const ids = normalized.map((p: any) => p.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: inspRows, error: inspErr } = await supabase
            .from('inspections')
            .select('id,product_id,status,final_status,final_decision,final_grade,created_at')
            .in('product_id', ids);

          if (!inspErr && inspRows) {
            const map: Record<string, InspectionRow | null> = {};
            (inspRows || []).forEach((row: any) => {
              const r = row as InspectionRow;
              const existing = map[r.product_id];
              if (!existing) {
                map[r.product_id] = r;
                return;
              }
              const a = existing.created_at ? new Date(existing.created_at).getTime() : 0;
              const b = r.created_at ? new Date(r.created_at).getTime() : 0;
              if (b > a) map[r.product_id] = r;
            });
            setInspectionByProductId(map);
          } else {
            setInspectionByProductId({});
          }
        } else {
          setInspectionByProductId({});
        }
      } catch (inspError) {
        console.warn('Products: failed to load inspections for catalog', inspError);
        setInspectionByProductId({});
      }

      let merged = normalized;
      try {
        const rawDemo = localStorage.getItem('demo-added-products');
        const demoList = rawDemo ? JSON.parse(rawDemo) : [];
        if (Array.isArray(demoList) && demoList.length > 0) {
          const demoNormalized = demoList.map((p: any) => ({
            ...p,
            image_url: p.image_url || '',
            image_urls: Array.isArray(p.image_urls) ? p.image_urls : (p.image_url ? [p.image_url] : []),
            verification_status: p.verification_status || 'pending',
            tags: p.tags || [],
            is_premium: p.is_premium ?? false,
            bid_count: p.bid_count ?? 0,
            view_count: p.view_count ?? 0,
            auction_type: p.auction_type ?? null,
          }));
          merged = [...demoNormalized, ...normalized];
        }
      } catch {}
      setProducts(merged);
      setFilteredProducts(merged);
    } catch (error) {
      setLoadError('Something went wrong while loading products');
      toast.error('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
      setInspectionByProductId({});
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Local helper: compute ranking score based on boosts and popularity
    const computeScore = (p: Product): number => {
      let boostWeight = 0;
      const boost = boostStatusByProduct[p.id];
      if (boost) {
        // Any active boost gets a visibility lift
        boostWeight = 1.5;
      }

      const views = p.view_count || 0;
      const viewWeight = Math.log(1 + views) * 0.1;

      return boostWeight + viewWeight;
    };

    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Vehicle brand filter (applies when make is present)
    if (filters.brand) {
      filtered = filtered.filter(product => (product as any).make === filters.brand);
    }

    // Fuel type filter (only where fuel_type is present)
    if (filters.fuelType) {
      filtered = filtered.filter(product => (product as any).fuel_type === filters.fuelType);
    }

    // Body type filter (only where body_type is present)
    if (filters.bodyType) {
      filtered = filtered.filter(product => (product as any).body_type === filters.bodyType);
    }

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter(product => product.condition === filters.condition);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) return product.current_price >= min && product.current_price <= max;
        return product.current_price >= min;
      });
    }

    // Year of purchase filter (for vehicle listings with year_of_purchase)
    if (filters.yearRange) {
      filtered = filtered.filter((product: any) => {
        const year = product.year_of_purchase as number | null | undefined;
        if (!year) return false;

        switch (filters.yearRange) {
          case '2020_2025':
            return year >= 2020 && year <= 2025;
          case '2015_2019':
            return year >= 2015 && year <= 2019;
          case '2010_2014':
            return year >= 2010 && year <= 2014;
          case 'BEFORE_2010':
            return year < 2010;
          default:
            return true;
        }
      });
    }

    // KM driven filter (for vehicle listings with km_driven)
    if (filters.kmRange) {
      filtered = filtered.filter((product: any) => {
        const km = product.km_driven as number | null | undefined;
        if (km == null) return false;

        switch (filters.kmRange) {
          case 'LT_10000':
            return km < 10000;
          case '10K_50K':
            return km >= 10000 && km <= 50000;
          case '50K_100K':
            return km >= 50000 && km <= 100000;
          case 'GT_100K':
            return km > 100000;
          default:
            return true;
        }
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        product.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Auction type filter
    if (filters.auctionType) {
      if (filters.auctionType === 'none') {
        filtered = filtered.filter(product => !product.auction_type);
      } else {
        filtered = filtered.filter(product => product.auction_type === filters.auctionType);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'ending_soon':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'price_low':
          return a.current_price - b.current_price;
        case 'price_high':
          return b.current_price - a.current_price;
        case 'most_viewed':
          return b.view_count - a.view_count;
        case 'most_bids':
          return b.bid_count - a.bid_count;
        case 'newest':
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
        default:
          return 0;
      }
    });

    // Monetization-aware re-ranking: for time-based sorts, apply a secondary sort by score
    if (filters.sortBy === 'ending_soon' || filters.sortBy === 'newest') {
      filtered.sort((a, b) => computeScore(b) - computeScore(a));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBidClick = (product: Product) => {
    // setSelectedProduct(product);
    // setShowBidModal(true);
    // Navigate to product page for bidding until BidModal is restored
    navigate(`/product/${product.id}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/product/${id}`);
  };

  const getBrandForProduct = (product: any): string | null => {
    const make = (product as any)?.make || (product as any)?.brand || '';
    if (make && brandLogos[make]) return make as string;
    const title: string = product?.title || '';
    const lower = title.toLowerCase();
    for (const brand of Object.keys(brandLogos)) {
      if (lower.includes(brand.toLowerCase())) return brand;
    }
    return null;
  };

  const renderInspectionBadge = (productId: string) => {
    const insp = inspectionByProductId[productId];
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ';

    if (!insp) {
      return <span className={base + 'bg-gray-100 text-gray-600'}>No inspection</span>;
    }

    const finalStatus = (insp.final_status || '').toLowerCase();
    const finalDecision = (insp.final_decision || '').toLowerCase();
    const status = (insp.status || '').toLowerCase();

    if (finalDecision === 'pass' || finalStatus === 'approved') {
      return <span className={base + 'bg-emerald-100 text-emerald-800'}>Inspection Approved</span>;
    }
    if (finalStatus === 'rejected' || finalDecision === 'fail') {
      return <span className={base + 'bg-rose-100 text-rose-800'}>Inspection Rejected</span>;
    }
    if (status === 'pending' || status === 'in_progress' || !status) {
      return <span className={base + 'bg-yellow-100 text-yellow-800'}>Inspection Pending</span>;
    }

    return <span className={base + 'bg-gray-100 text-gray-700'}>Inspection: {insp.status}</span>;
  };

  const renderGradeBadge = (productId: string) => {
    const insp = inspectionByProductId[productId];
    if (!insp || !insp.final_grade) return null;
    const g = insp.final_grade.toUpperCase();
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ';

    if (g === 'A+' && (insp.final_decision?.toLowerCase() === 'pass' || insp.final_status?.toLowerCase() === 'approved')) {
      return <span className={base + 'bg-emerald-50 text-emerald-700 border border-emerald-200'}>Certified A+</span>;
    }
    if (g === 'A' && (insp.final_decision?.toLowerCase() === 'pass' || insp.final_status?.toLowerCase() === 'approved')) {
      return <span className={base + 'bg-blue-50 text-blue-700 border border-blue-200'}>Verified A</span>;
    }
    if (g === 'B' || g === 'C') {
      return <span className={base + 'bg-gray-50 text-gray-700 border border-gray-200'}>AI Grade {g}</span>;
    }
    return null;
  };

  const detectMonetizationCategory = (category: string): 'vehicles' | 'handmade_crafts' | 'paintings_artwork' | 'antique_items' | null => {
    const c = category.toLowerCase();
    if (/vehicle|car|bike|scooter|truck|tractor|bus|commercial|two wheeler|four wheeler/.test(c)) return 'vehicles';
    if (/craft|handmade/.test(c)) return 'handmade_crafts';
    if (/painting|artwork|art/.test(c)) return 'paintings_artwork';
    if (/antique|heritage|tribal/.test(c)) return 'antique_items';
    return null;
  };

  const createBoostOrder = async (product: Product, boostType: 'day_1' | 'day_3' | 'day_7' | 'day_15') => {
    if (!userId) {
      toast.error('Please login as a seller to boost listings.');
      return;
    }

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id')
        .eq('product_id', product.id)
        .eq('seller_id', userId)
        .maybeSingle();

      if (listingError || !listing) {
        toast.error('We could not locate the listing for this product. Please refresh this page and try again. If the issue continues, contact support with this product ID.');
        return;
      }

      let amount = 29;
      if (boostType === 'day_3') amount = 69;
      else if (boostType === 'day_7') amount = 149;
      else if (boostType === 'day_15') amount = 299;

      const body = {
        amount: amount * 100,
        currency: 'INR',
        notes: {
          type: 'boost',
          listing_id: listing.id,
          seller_id: userId,
          boost_type: boostType,
          duration_days: boostType === 'day_3' ? 3 : boostType === 'day_7' ? 7 : boostType === 'day_15' ? 15 : 1,
          amount,
        },
      };

      const res = await fetch('/.netlify/functions/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'We could not start the boost payment. Please wait a moment and try again.');
      }

      const { order, key_id } = await res.json();

      if (!(window as any).Razorpay) {
        toast.error('Payment window could not be opened. Please disable any popup blockers, refresh, and try again.');
        return;
      }

      const options: any = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickMela Boost',
        description: `Boost for ${product.title}`,
        order_id: order.id,
        notes: order.notes,
        handler: () => {
          toast.success('Boost payment initiated. Boost will activate once payment is confirmed.');
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Error creating boost order', e);
      toast.error(e?.message || 'Boost could not be started. Please try again or contact support if this keeps happening.');
    }
  };

  const createVerificationOrder = async (product: Product) => {
    if (!userId) {
      toast.error('Please login as a seller to buy verification.');
      return;
    }

    const monetizationCategory = detectMonetizationCategory(product.category || '');

    let verificationType: string = 'craft_basic';
    let amount = 99;

    if (monetizationCategory === 'vehicles') {
      verificationType = 'vehicle_basic';
      amount = 199;
    } else if (monetizationCategory === 'antique_items') {
      verificationType = 'antique_basic';
      amount = 149;
    } else if (monetizationCategory === 'paintings_artwork') {
      verificationType = 'craft_basic';
      amount = 99;
    } else {
      verificationType = 'craft_basic';
      amount = 99;
    }

    try {
      const body = {
        amount: amount * 100,
        currency: 'INR',
        notes: {
          type: 'verification',
          product_id: product.id,
          seller_id: userId,
          verification_type: verificationType,
          category: monetizationCategory || product.category,
          amount,
        },
      };

      const res = await fetch('/.netlify/functions/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'We could not start the verification payment. Please wait a moment and try again.');
      }

      const { order, key_id } = await res.json();

      if (!(window as any).Razorpay) {
        toast.error('Payment SDK not loaded. Please refresh and try again.');
        return;
      }

      const options: any = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickMela Verification',
        description: `Verification for ${product.title}`,
        order_id: order.id,
        notes: order.notes,
        handler: () => {
          toast.success('Verification payment initiated.');
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Error creating verification order', e);
      toast.error(e?.message || 'Verification could not be started.');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', userId);

    if (error) throw error;
    toast.success('Product deleted successfully');
    fetchProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    toast.error('Failed to delete product');
  }
};

const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentProducts = filteredProducts.slice(startIndex, endIndex);

if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

return (
  <PageFrame
    title={''}
    description={''}
    className="space-y-10"
    contentClassName="space-y-10"
  >
    {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {userRole === 'seller' || userRole === 'company' ? 'My Products' : 'Browse Products'}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">{filteredProducts.length} products available</p>
        {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/advanced-search" className="border border-indigo-300 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 text-sm">
          <Search className="h-4 w-4" /> Advanced Search
        </Link>
        {(userRole === 'seller' || userRole === 'company') && (
          <Link to="/add-product" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm">
            <Plus className="h-5 w-5" /> Add Product
          </Link>
        )}
      </div>
    </div>

    {/* AI-Powered Search and Filters */}
    <section className="space-y-6">
      {/* AI Natural Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI-Powered Search
          </h3>
        </div>
        <AINaturalSearch
          onResults={(results) => {
            // Handle AI search results
            console.log('AI Search Results:', results);
          }}
          placeholder="Describe what you're looking for... (e.g., 'luxury car under 5 lakhs')"
          showVoice={true}
        />
      </div>

      {/* Traditional Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
          >
            <option value="ending_soon">Ending Soon</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="most_bids">Most Bids</option>
            <option value="newest">Newest First</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={saveCurrentSearch}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            aria-label="Save this search"
          >
            Save this search
          </button>
          {lastFilterSnapshot && (
            <button
              type="button"
              onClick={resumeLastFilter}
              className="px-3 py-2 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Resume last filter
            </button>
          )}
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <select
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">All Categories</option>
          <option value="Automobiles">Automobiles</option>
          <option value="Home & Lifestyle">Home & Lifestyle</option>
          <option value="Handmade & Creative Products">Handmade & Creative Products</option>
          <option value="Antiques & Rare Collectibles">Antiques & Rare Collectibles</option>
          <option value="Industrial Equipment">Industrial Equipment</option>
        </select>
        <select
          value={filters.brand}
          onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">All Brands</option>
          {vehicleBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <select
          value={filters.bodyType}
          onChange={(e) => setFilters((prev) => ({ ...prev, bodyType: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">Any Body Type</option>
          {bodyTypes.map((bodyType) => (
            <option key={bodyType} value={bodyType}>
              {bodyType}
            </option>
          ))}
        </select>
        <select
          value={filters.fuelType}
          onChange={(e) => setFilters((prev) => ({ ...prev, fuelType: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">Any Fuel</option>
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={filters.auctionType}
          onChange={(e) => setFilters((prev) => ({ ...prev, auctionType: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">All Auction Types</option>
          <option value="timed">Timed</option>
          <option value="live">Live</option>
          <option value="tender">Tender</option>
          <option value="none">No Auction</option>
        </select>
        <select
          value={filters.condition}
          onChange={(e) => setFilters((prev) => ({ ...prev, condition: e.target.value }))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900"
        >
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="certified">Certified Pre-Owned</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            setFilters({
              category: '',
              brand: '',
              fuelType: '',
              bodyType: '',
              yearRange: '',
              kmRange: '',
              condition: '',
              priceRange: '',
              location: '',
              status: '',
              auctionType: '',
              sortBy: 'ending_soon'
            })
          }
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          Clear Filters
        </button>
      </div>
    </section>

    {/* Relevance & Recent searches */}
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Why these results: 
          {filters.location && <span className="ml-1">Location “{filters.location}”</span>}
          {filters.sortBy && <span className="ml-2">• Sorted by “{filters.sortBy.replace('_', ' ')}”</span>}
          {searchTerm && <span className="ml-2">• Keyword “{searchTerm}”</span>}
          {savedSearches.some(s => s.query === searchTerm) && <span className="ml-2">• Matches a saved search</span>}
        </p>
        {savedSearches.length > 0 && (
          <button
            type="button"
            onClick={() => applySavedSearch(savedSearches[0])}
            className="text-xs text-indigo-700 hover:text-indigo-900"
          >
            Apply last saved
          </button>
        )}
      </div>
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {recentSearches.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSearchTerm(q)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              <Tag className="h-3 w-3" /> {q}
            </button>
          ))}
        </div>
      )}
    </section>

    {/* Recommendations */}
    {userId && recommendations.length > 0 && (
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended for you</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Based on your bidding and browsing activity</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-4">
          {recommendations.map((rec) => (
            <Link
              key={rec.productId}
              to={`/product/${rec.productId}`}
              className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-indigo-500 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{rec.type}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">#{rec.productId.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Match score</p>
                  <p className="text-sm font-semibold text-indigo-600">{Math.round(rec.score)}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{rec.reason}</p>
              <div className="flex items-center justify-between text-xs text-indigo-600 group-hover:text-indigo-700">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> View details
                </span>
                <Eye className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    )}

    {/* Product grid/list */}
    {currentProducts.length === 0 ? (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
        <Link to="/advanced-search" className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900 mb-4">
          <Search className="h-4 w-4" /> No results? Try Advanced Search
        </Link>
        {(userRole === 'seller' || userRole === 'company') && (
          <Link to="/add-product" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Your First Product
          </Link>
        )}
      </div>
    ) : (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
        : "flex flex-col gap-4"
      }>
        {currentProducts.map((product) => (
          <div key={product.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition duration-300 group ${viewMode === 'list' ? 'flex flex-row' : 'flex-col'}`}>
            <div className={`relative ${viewMode === 'list' ? 'w-48 h-auto' : 'aspect-[4/3]'}`}>
               <img 
                 src={product.image_url || product.image_urls?.[0] || 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=800'} 
                 alt={product.title}
                 className="w-full h-full object-cover"
               />
               <div className="absolute top-2 right-2 flex flex-col gap-2">
                 <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-600 hover:text-red-500 transition">
                   <Heart className="h-4 w-4" />
                 </button>
               </div>
               <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                  {renderInspectionBadge(product.id)}
                  {renderGradeBadge(product.id)}
               </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-2">
                <div className="flex justify-between items-start">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition">
                     <Link to={`/product/${product.id}`}>{product.title}</Link>
                   </h3>
                   {getBrandForProduct(product) && (
                     <img src={brandLogos[getBrandForProduct(product)!] || ''} alt="Brand" className="h-6 w-auto object-contain" />
                   )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-3 w-3" /> {product.location || 'Location N/A'}
                </div>
              </div>
              
              <div className="mt-auto space-y-3">
                 <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                   <div>
                     <p className="text-xs text-gray-500 uppercase">Current Price</p>
                     <p className="text-lg font-bold text-indigo-600">
                       ₹{(product.current_price || product.starting_price).toLocaleString()}
                     </p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Ends In</p>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(product.end_date)}
                      </div>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => handleBidClick(product)}
                     className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                   >
                     <Gavel className="h-4 w-4" /> Place Bid
                   </button>
                   <Link
                     to={`/product/${product.id}`}
                     className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                   >
                     View Details
                   </Link>
                 </div>

                 {(userRole === 'seller' || userRole === 'admin') && userId === product.seller_id && (
                   <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button onClick={() => createBoostOrder(product, 'day_3')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md" title="Boost">
                          <TrendingUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => createVerificationOrder(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Verify">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
           <button
             key={page}
             onClick={() => setCurrentPage(page)}
             className={`w-10 h-10 rounded-lg border ${
               currentPage === page 
                 ? 'bg-indigo-600 text-white border-indigo-600' 
                 : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
             }`}
           >
             {page}
           </button>
        ))}
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Next
        </button>
      </div>
    )}

  </PageFrame>
);
};

export default Products;
