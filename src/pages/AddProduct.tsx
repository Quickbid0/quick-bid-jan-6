import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Package, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Tag,
  FileText,
  Camera,
  Loader2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  X,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import CategorySpecificFields from '../components/CategorySpecificFields';
import { categoryTree } from '../data/categoryTree';
import { aiService } from '../services/aiService';
import { listingService } from '../services/listingService';
import { CaptureStep } from '../components/CaptureStep';
import { getModelsForBrand } from '../config/ModelConfig';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSellerVerified, setIsSellerVerified] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: 'excellent',
    starting_price: '',
    reserve_price: '',
    location: '',
    tags: [],
    images: [],
    documents: [],
    auction_type: 'timed',
    auction_duration: '7',
    auto_extend: true,
    increment_amount: '100',
    
    // Category specific fields
    brand: '',
    model: '',
    year: '',
    variant: '',
    vin: '',
    registration_city: '',
    fuel_type: '',
    transmission: '',
    km_driven: '',
    rc_available: '',
    owners_count: '',
    body_type: '',
    body_type_auto: false,
    
    // Creative fields
    art_medium: '',
    art_style: '',
    artist_signature: false,
    authenticity_certificate: false,
    
    // Additional fields
    how_old: '',
    materials_used: '',
    dimensions: '',
    weight: '',
    warranty: '',
    accessories_included: '',
    
    // Artist / making-of fields
    making_video_url: '',
    artist_name: '',
    artist_bio: '',
    artist_rating: '',

    // Car-specific documents & declarations
    rc_doc: null as File | null,
    insurance_doc: null as File | null,
    puc_doc: null as File | null,
    service_history_docs: [] as File[],
    disclosures: {
      accidents: false,
      major_repairs: false,
      flood_damage: false
    },
    seller_declaration: false
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [priceSuggesting, setPriceSuggesting] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<{ starting?: number; reserve?: number; reason?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatingBio, setGeneratingBio] = useState(false);
  const [aiMediaStats, setAiMediaStats] = useState<{ approved: number; total: number }>({ approved: 0, total: 0 });
  const [showVerification, setShowVerification] = useState(false);

  const inferBodyType = (
    title: string,
    brand: string,
    category: string,
    subcategory: string
  ): string | null => {
    const t = (title || '').toLowerCase();
    const b = (brand || '').toLowerCase();
    const isAuto = category === 'Automobiles';

    if (!isAuto) return null;

    if (subcategory === 'Cars') {
      if (/dzire|ciaz|verna|city|vento|rapid|aura|amaze|slavia|tigor|zest/.test(t)) return 'Sedan';
      if (/creta|xuv\s*\d|hector|harrier|seltos|fortuner|innova|scorpio|thar|ecosport|venue|sonet|kushaq|tiguan|compass|bolero/.test(t)) return 'SUV';
      if (/ertiga|xl6|carens|triber|marazzo|alza|innova crysta/.test(t)) return 'MUV';
      if (/swift|alto|wagon r|i10|i20|baleno|glanza|polo|kwid|tiago|ignis|altroz|c3/.test(t)) return 'Hatchback';
      if (/coupe|gt( |-)line/.test(t)) return 'Coupe';
      if (/convertible|cabriolet|roadster/.test(t)) return 'Convertible';
      if (b === 'tata' || b === 'maruti suzuki' || b === 'hyundai' || b === 'kia') return 'Hatchback';
      return null;
    }

    if (subcategory === 'Bikes') {
      if (/classic 350|bullet|meteor|thunderbird|hunter 350/.test(t)) return 'Cruiser';
      if (/duke|rc ?\d|r15|mt-15|dominar|pulsar ns|pulsar rs|apache rr|ninja|cbr|hayabusa/.test(t)) return 'Sports Bike';
      if (/splendor|shine|unicorn|cbz|platina|ct ?100|passion|glamour|star city|victor/.test(t)) return 'Commuter';
      if (/himalayan|xpulse|adventure|adv ?390|xplorer/.test(t)) return 'Adventure Tourer';
      if (/ather|ola electric|iq|chetak electric|revolt|ultraviolet|obenn/.test(t)) return 'Electric Bike';
      return null;
    }

    if (subcategory === 'Scooters') {
      if (/ather|ola electric|iq|chetak electric|bounce infinity|okaya|simple one/.test(t)) return 'Electric Scooter';
      if (/activa|dio|jupiter|ntorq|access 125|maestro|pleasure|rayzr|fascino|burgman|aviator|wego|destini/.test(t)) return 'Scooter';
      return null;
    }

    return null;
  };

  const suggestPrices = async () => {
    setPriceSuggesting(true);
    setPriceSuggestion(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error('Please login again to get AI price suggestions');
        return;
      }

      if (!formData.category) {
        toast.error('Select a category before asking AI for pricing');
        return;
      }

      const km = parseInt(String(formData.km_driven || '0')) || 0;

      const resp = await fetch('/api/ai/auction-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          brand: formData.brand || null,
          model: formData.model || null,
          year: formData.year ? parseInt(formData.year, 10) : null,
          kmDriven: km || null,
          condition: formData.condition,
        }),
      });

      if (!resp.ok) {
        toast.error('AI could not generate price suggestions right now');
        return;
      }

      const body = await resp.json();
      const starting = typeof body.startingPrice === 'number' ? body.startingPrice : undefined;
      const reserve = typeof body.reservePrice === 'number' ? body.reservePrice : undefined;

      if (!starting) {
        toast.error('AI did not return a valid starting price');
        return;
      }

      setPriceSuggestion({
        starting,
        reserve,
        reason: typeof body.reason === 'string'
          ? body.reason
          : `AI suggestion based on similar items and condition ${formData.condition}`,
      });
    } catch (e) {
      toast.error('Could not generate suggestions');
    } finally {
      setPriceSuggesting(false);
    }
  };

  const auctionTypes = [
    { value: 'timed', label: 'Timed Auction', description: 'Extended bidding period (1-30 days)' },
    { value: 'live', label: 'Live Auction', description: 'Real-time streaming auction' },
    { value: 'tender', label: 'Tender Auction', description: 'Sealed bid submission' }
  ];

  const conditions = [
    { value: 'new', label: 'New', description: 'Brand new, unused item' },
    { value: 'excellent', label: 'Excellent', description: 'Like new, minimal wear' },
    { value: 'good', label: 'Good', description: 'Some wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear, works well' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repair' }
  ];

  const locations = [
    'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
    'Kolkata, West Bengal', 'Hyderabad, Telangana', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh', 'Nagpur, Maharashtra'
  ];

  const carBrands = [
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
    'Ferrari',
    'Lamborghini',
    'Aston Martin',
    'Jaguar',
    'Land Rover',
  ];

  const bikeBrands = [
    'Royal Enfield',
    'Yamaha',
    'TVS',
    'Bajaj',
    'Hero',
    'Honda',
    'Suzuki',
    'KTM',
    'Ducati',
    'Harley-Davidson',
    'Triumph',
    'BMW Motorrad',
    'Ather',
    'Ola Electric',
    'Jawa',
    'Yezdi',
    'Husqvarna',
    'Vespa',
  ];

  useEffect(() => {
    const checkAuthAndVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // Fetch seller verification status
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_verified, verification_status, user_type')
          .eq('id', user.id)
          .single();
        setIsSellerVerified(!!profile?.is_verified);
      } catch {
        setIsSellerVerified(false);
      }

      setLoading(false);
    };
    checkAuthAndVerification();
  }, []);

  useEffect(() => {
    let mounted = true;

    const evaluateSession = async () => {
      const demoSession = localStorage.getItem('demo-session');
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        setCurrentUserId(session.user.id);
        setNeedsLogin(false);
        return;
      }

      if (demoSession) {
        setNeedsLogin(false);
        return;
      }

      setNeedsLogin(true);
      toast.error('Please login to add products');
    };

    evaluateSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setCurrentUserId(session.user.id);
        setNeedsLogin(false);
        return;
      }

      const demoSession = localStorage.getItem('demo-session');
      setNeedsLogin(!demoSession);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Auto-save draft logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('addProduct_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // We can't restore File objects from localStorage, so we only restore text fields
        // and reset file fields to null/empty arrays
        setFormData(prev => ({
          ...prev,
          ...parsed.formData,
          // Reset file fields
          images: [],
          documents: [],
          rc_doc: null,
          insurance_doc: null,
          puc_doc: null,
          service_history_docs: []
        }));
        setStep(parsed.step || 1);
        toast('Draft restored from your last session', { icon: '📝' });
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save draft on every change, excluding file objects
    const timeoutId = setTimeout(() => {
      const draftData = {
        step,
        formData: {
          ...formData,
          // Exclude file objects
          images: [],
          documents: [],
          rc_doc: null,
          insurance_doc: null,
          puc_doc: null,
          service_history_docs: []
        }
      };
      localStorage.setItem('addProduct_draft', JSON.stringify(draftData));
    }, 1000); // Debounce by 1s

    return () => clearTimeout(timeoutId);
  }, [formData, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.currentTarget as HTMLInputElement;

    setFormData(prev => {
      const next: any = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      const isTitleOrBrandOrSubcat = name === 'title' || name === 'brand' || name === 'subcategory';
      const isAuto = (next.category === 'Automobiles');
      const isVehicleSubcat = next.subcategory === 'Cars' || next.subcategory === 'Bikes' || next.subcategory === 'Scooters';

      if (isTitleOrBrandOrSubcat && isAuto && isVehicleSubcat && !next.body_type) {
        const suggestion = inferBodyType(next.title, next.brand, next.category, next.subcategory);
        if (suggestion) {
          next.body_type = suggestion;
          next.body_type_auto = true;
        }
      }

      return next;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    const files = fileList ? Array.from(fileList) : [];
    if (files.length + formData.images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    files.forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB');
        return;
      }
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create preview URLs
    const newPreviewUrls = files.map((file: File) => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSingleDocUpload = (name: 'rc_doc' | 'insurance_doc' | 'puc_doc') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null;
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleServiceHistoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
    setFormData(prev => ({ ...prev, service_history_docs: list }));
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors: Record<string, string> = {};

    switch (stepNumber) {
      case 1:
        if (!formData.title) newErrors.title = 'Product title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (
          formData.category === 'Automobiles' &&
          (formData.subcategory === 'Cars' || formData.subcategory === 'Bikes') &&
          !formData.brand
        ) {
          newErrors.brand = 'Brand is required for vehicle listings';
        }
        break;
      case 2:
        if (!formData.starting_price) newErrors.starting_price = 'Starting price is required';
        if (!formData.condition) newErrors.condition = 'Condition is required';
        if (!formData.location) newErrors.location = 'Location is required';
        break;
      case 3:
        if (!formData.images || formData.images.length === 0) newErrors.images = 'At least one image is required';
        break;
      case 4:
        // Verification photos & videos (recommended but not mandatory) – no hard validation
        break;
      case 5:
        if (!formData.auction_type) newErrors.auction_type = 'Auction type is required';
        if (!formData.auction_duration) newErrors.auction_duration = 'Auction duration is required';
        break;
      case 6:
        if (!formData.seller_declaration) newErrors.seller_declaration = 'You must accept the seller declaration to proceed';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepValid = validateStep(6) && validateStep(5) && validateStep(4) && validateStep(3) && validateStep(2) && validateStep(1);
    const declErrors: Record<string, string> = {};
    if (!formData.seller_declaration) {
      declErrors.seller_declaration = 'You must accept the seller declaration to proceed';
    }
    if (Object.keys(declErrors).length > 0 || !stepValid) {
      setErrors(prev => ({ ...prev, ...declErrors }));
      toast.error('Please complete all required fields');
      return;
    }

    // AI moderation on description
    try {
      const moderation = await aiService.moderateContent(formData.description || '', 'text');
      if (!moderation.isAppropriate) {
        setErrors(prev => ({
          ...prev,
          description: 'Description may contain inappropriate or risky content. Please edit and try again.',
        }));
        const reasons = moderation.flags && moderation.flags.length
          ? ` Flags: ${moderation.flags.join(', ')}`
          : '';
        toast.error('Please revise your description before listing.' + reasons);
        return;
      }
    } catch (err) {
      console.warn('AI moderation failed, allowing submission by default', err);
    }

    setLoading(true);
    try {
      const demoSession = localStorage.getItem('demo-session');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !demoSession) throw new Error('Not authenticated');

      if (demoSession) {
        await new Promise(r => setTimeout(r, 600));
        const demo = JSON.parse(demoSession);
        const demoUserId = demo?.user?.id || 'demo-user';
        const snapshotId = `demo-${Date.now()}`;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(formData.auction_duration));
        const demoProduct = {
          id: snapshotId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          sub_category: formData.subcategory,
          condition: formData.condition,
          starting_price: parseFloat(formData.starting_price),
          current_price: parseFloat(formData.starting_price),
          reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
          location: formData.location,
          tags: formData.tags,
          image_url: '',
          image_urls: [],
          end_date: endDate.toISOString(),
          seller_id: demoUserId,
          status: 'active',
          verification_status: 'pending',
          seller: { name: demo?.user?.user_metadata?.name || 'Demo Seller', is_verified: true },
        };
        try {
          const raw = localStorage.getItem('demo-added-products');
          const existing = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(existing) ? [demoProduct, ...existing] : [demoProduct];
          localStorage.setItem('demo-added-products', JSON.stringify(next));
        } catch {}
        toast.success('Product listed successfully (demo)!');
        navigate('/seller/dashboard');
        return;
      }

      // Seller restriction guard (cooldown / blocks)
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token && session?.user?.id) {
          const resp = await fetch(`/api/risk/sellers/${session.user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resp.ok) {
            const body = await resp.json();
            const status = (body.status || 'normal') as 'normal' | 'limited' | 'blocked' | 'flagged';
            const cooldownActive = !!(body.cooldownActive ?? body.cooldown_active);
            if (status === 'blocked' || (status === 'limited' && cooldownActive)) {
              toast.error(
                body.message ||
                  'Your seller account is currently restricted from creating new listings. Please contact support.',
              );
              setLoading(false);
              return;
            }
          }
        }
      } catch (guardErr) {
        console.warn('AddProduct: failed to check seller restriction', guardErr);
      }

      // Upload images
      const imageUrls = await Promise.all(
        formData.images.map(async (file, index) => {
          const fileName = `${session.user.id}/${Date.now()}_${index}_${file.name}`;
          const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (error) throw error;

          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          return data.publicUrl;
        })
      );

      // Upload vehicle documents (if provided)
      const uploadVehicleDoc = async (file: File | null, label: string): Promise<string | null> => {
        if (!file) return null;
        const docPath = `${session.user.id}/vehicle-docs/${Date.now()}_${label}_${file.name}`;
        const { error: upErr } = await supabase.storage
          .from('vehicle-docs')
          .upload(docPath, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('vehicle-docs').getPublicUrl(docPath);
        return pub.publicUrl || null;
      };

      const [rcUrl, insuranceUrl, pucUrl] = await Promise.all([
        uploadVehicleDoc(formData.rc_doc as File | null, 'rc'),
        uploadVehicleDoc(formData.insurance_doc as File | null, 'insurance'),
        uploadVehicleDoc(formData.puc_doc as File | null, 'puc')
      ]);

      const serviceHistoryUrls: (string | null)[] = await Promise.all(
        (formData.service_history_docs || []).map(async (file, i) => {
          return uploadVehicleDoc(file, `service_${i}`);
        })
      );

      // Calculate end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(formData.auction_duration));

      // Create product first to get the ID
      const { data: productRows, error: productError } = await supabase
        .from('products')
        .insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category,
          sub_category: formData.subcategory,
          condition: formData.condition,
          starting_price: parseFloat(formData.starting_price),
          current_price: parseFloat(formData.starting_price),
          reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
          location: formData.location,
          tags: formData.tags,
          image_url: imageUrls[0],
          image_urls: imageUrls,
          end_date: endDate.toISOString(),
          seller_id: session.user.id,
          status: 'pending',
          verification_status: 'pending',
          
          // Category specific fields
          make: formData.brand,
          model: formData.model,
          year_of_purchase: formData.year ? parseInt(formData.year) : null,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          km_driven: formData.km_driven ? parseInt(formData.km_driven) : null,
          valid_rc: formData.rc_available === 'yes',
          variant: formData.variant,
          vin: formData.vin,
          registration_city: formData.registration_city,
          owners_count: formData.owners_count,
          body_type: formData.body_type || null,
          disclosures: formData.disclosures,
          rc_url: rcUrl,
          insurance_url: insuranceUrl,
          puc_url: pucUrl,
          service_history_urls: serviceHistoryUrls.filter(Boolean),
          how_old: formData.how_old,
          art_medium: formData.art_medium,
          art_style: formData.art_style,
          artist_signature: formData.artist_signature,
          authenticity_certificate: formData.authenticity_certificate,
          making_video_url: formData.making_video_url || null,
          artist_name: formData.artist_name || null,
          artist_bio: formData.artist_bio || null,
          artist_rating: formData.artist_rating ? parseFloat(formData.artist_rating) : null
        }])
        .select('id')
        .returns<{ id: string }[]>();

      if (productError || !productRows || !productRows[0]?.id) throw productError || new Error('Product insert failed');

      const productId = productRows[0].id;

      // Auto-create a pending inspection for this product (best-effort)
      try {
        await supabase
          .from('inspections')
          .insert({
            product_id: productId,
            product_type: formData.category || null,
            requested_by: session.user.id,
            status: 'pending',
          });
      } catch (inspErr) {
        console.warn('Failed to auto-create inspection for product', inspErr);
      }

      // Best-effort auto-assignment of an inspector for this inspection
      try {
        fetch('/.netlify/functions/auto-assign-inspector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        }).catch((e) => {
          console.warn('auto-assign-inspector request failed', e);
        });
      } catch (assignErr) {
        console.warn('Failed to trigger auto-assign-inspector', assignErr);
      }

      const listingResult = await listingService.createMonetizedListing({
        productId,
        sellerId: session.user.id,
      });

      if (!listingResult.success) {
        toast.error(listingResult.error || 'Listing created but monetization setup failed');
      } else if (listingResult.feeDue && listingResult.listingFee > 0) {
        toast.success(`Product listed. Listing fee of ₹${listingResult.listingFee.toLocaleString()} may be payable as per your plan.`);
      } else {
        toast.success('Product listed successfully under your current QuickMela plan.');
      }

      // Clear draft after successful submission
      localStorage.removeItem('addProduct_draft');

      if (isSellerVerified === false) {
        toast.custom((t) => (
          <div
            className={`bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-sm w-full ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              Product listed! Verify to boost visibility.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Complete seller verification to appear in top results and gain buyer trust.
            </p>
            <button
              className="mt-3 px-3 py-1 rounded-md bg-amber-600 text-white text-sm hover:bg-amber-700"
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/verify-seller');
              }}
            >
              Verify Now
            </button>
          </div>
        ), { duration: 5000 });
        navigate('/seller/dashboard');
      } else {
        toast.custom((t) => (
          <div
            className={`bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-sm w-full ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              Product listed successfully!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Track views, bids, and performance in your analytics.
            </p>
            <button
              className="mt-3 px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/seller/analytics');
              }}
            >
              View Analytics
            </button>
          </div>
        ), { duration: 5000 });
        navigate('/seller/analytics');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return needsLogin ? (
          <div className="max-w-2xl mx-auto text-center space-y-4 py-12">
            <CheckCircle className="mx-auto h-10 w-10 text-indigo-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Seller login required</h2>
            <p className="text-gray-600">
              You must be signed in as a seller to access the listing form. Use the button below to login or try our demo seller account to explore the experience.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                Login as Seller
              </button>
              <button
                onClick={() => navigate('/demo?seller=true')}
                className="px-5 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50"
              >
                Try Demo Seller
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Product Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                data-testid="product-name"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter a descriptive title for your product"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                data-testid="product-description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Provide detailed description including condition, history, and any special features"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectedCategory(categoryTree.find(cat => cat.label === e.target.value));
                    setFormData(prev => ({ ...prev, subcategory: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.category ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Category</option>
                  {categoryTree.map(category => (
                    <option key={category.label} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {selectedCategory?.children && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subcategory</option>
                    {selectedCategory.children.map(subcat => (
                      <option key={subcat.label} value={subcat.label}>
                        {subcat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Category Specific Fields */}
            <CategorySpecificFields 
              category={formData.category}
              subcategory={formData.subcategory}
              formData={formData}
              setFormData={setFormData}
            />

            {/* Car Details (Make/Model/Year/Variant/VIN/Reg City) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Make (Brand)</label>
                {formData.category === 'Automobiles' && formData.subcategory === 'Cars' && (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Car Brand</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                )}
                {formData.category === 'Automobiles' && formData.subcategory === 'Bikes' && (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Bike Brand</option>
                    {bikeBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                )}
                {(!(formData.category === 'Automobiles' && (formData.subcategory === 'Cars' || formData.subcategory === 'Bikes'))) && (
                  <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {errors.brand && (
                  <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
                {formData.category === 'Automobiles' &&
                 (formData.subcategory === 'Cars' || formData.subcategory === 'Bikes' || formData.subcategory === 'Scooters') ? (
                  (() => {
                    const models = getModelsForBrand(formData.category, formData.subcategory, formData.brand);
                    if (!models || models.length === 0) {
                      return (
                        <input
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter model"
                        />
                      );
                    }
                    return (
                      <select
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Model</option>
                        {models.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        <option value="__other">Other (type manually)</option>
                      </select>
                    );
                  })()
                 ) : (
                  <input
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter model"
                  />
                 )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                <input name="year" type="number" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Variant</label>
                <input name="variant" value={formData.variant} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">VIN / Chassis No (optional)</label>
                <input name="vin" value={formData.vin} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registration City</label>
                <input name="registration_city" value={formData.registration_city} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Story, artist & making-of (optional for all categories) */}
            <div className="space-y-4 mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Story, creator & making-of (optional)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a short creator story and an optional YouTube or Vimeo link. On the product page this appears as an
                extra video section so buyers can see a walkthrough or how the item was made.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Creator / artist name (optional)
                  </label>
                  <input
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Maya Patel or bank/NBFC walk-through host"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Creator rating (0–5, optional)
                  </label>
                  <input
                    type="number"
                    name="artist_rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.artist_rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Optional reputation score"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Story / creator bio
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.artist_bio && !formData.description && !formData.artist_name) {
                        toast.error('Add a short note or description first so AI has context.');
                        return;
                      }
                      try {
                        setGeneratingBio(true);
                        const res = await fetch('/api/ai/artist-bio', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            prompt: formData.artist_bio || formData.description,
                            artistName: formData.artist_name,
                          }),
                        });
                        if (!res.ok) {
                          toast.error('AI could not generate a bio right now. Please try again later.');
                          return;
                        }
                        const data = await res.json();
                        if (data?.bio) {
                          setFormData(prev => ({ ...prev, artist_bio: data.bio }));
                          toast.success('Story/bio generated. You can edit it before listing.');
                        }
                      } catch (e) {
                        console.error('AI artist bio error', e);
                        toast.error('Something went wrong while generating the bio.');
                      } finally {
                        setGeneratingBio(false);
                      }
                    }}
                    disabled={generatingBio}
                    className="text-xs px-3 py-1 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {generatingBio ? 'Generating…' : 'Generate with AI'}
                  </button>
                </div>
                <textarea
                  name="artist_bio"
                  value={formData.artist_bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell bidders about the creator, vehicle background, or concept behind this item"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Making-of or walkthrough video URL (YouTube/Vimeo)
                </label>
                <input
                  name="making_video_url"
                  value={formData.making_video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional. Add a public video link (e.g. car walkaround, workshop process). It will show as a video section on the
                  product detail page.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Pricing & Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opening Bid (minimum amount required to enter the auction) (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="starting_price"
                    data-testid="product-price"
                    value={formData.starting_price}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.starting_price ? 'border-red-500' : ''}`}
                    placeholder="Enter starting price"
                    min="1"
                    required
                  />
                </div>
                {errors.starting_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.starting_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reserve Price (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="reserve_price"
                    value={formData.reserve_price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Minimum acceptable price (optional)"
                    min="1"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={suggestPrices}
                  disabled={priceSuggesting || !formData.category}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {priceSuggesting ? 'Analyzing…' : 'Get AI Suggestions'}
                </button>
                {priceSuggestion && (
                  <div className="mt-4 border rounded-lg p-4 bg-emerald-50 text-sm text-emerald-900 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold mb-1">Suggested pricing</p>
                      <p>
                        Starting: <span className="font-bold">₹{priceSuggestion.starting?.toLocaleString()}</span> · Reserve: <span className="font-bold">₹{priceSuggestion.reserve?.toLocaleString()}</span>
                      </p>
                      {priceSuggestion.reason && (
                        <p className="text-xs mt-1 text-emerald-800">{priceSuggestion.reason}</p>
                      )}
                      {aiMediaStats.total > 0 && aiMediaStats.approved / aiMediaStats.total < 0.5 && (
                        <p className="mt-2 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                          AI detected that many verification shots may need improvement. Please double-check photos and pricing before proceeding.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        starting_price: String(priceSuggestion.starting || ''),
                        reserve_price: String(priceSuggestion.reserve || ''),
                      }))}
                      className="btn btn-outline btn-sm self-start md:self-auto"
                    >
                      Apply suggestion
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.condition ? 'border-red-500' : ''}`}
                  required
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label} - {condition.description}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.location ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Odometer (km)</label>
                <input type="number" name="km_driven" value={formData.km_driven} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuel Type</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owners</label>
                <select name="owners_count" value={formData.owners_count} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tags (e.g., vintage, luxury, collectible)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      handleTagAdd(input.value.trim());
                      input.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement | null);
                    if (input) {
                      handleTagAdd(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Disclosures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disclosures</label>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.disclosures.accidents} onChange={(e) => setFormData(prev => ({ ...prev, disclosures: { ...prev.disclosures, accidents: e.currentTarget.checked } }))} />
                  Past accident(s)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.disclosures.major_repairs} onChange={(e) => setFormData(prev => ({ ...prev, disclosures: { ...prev.disclosures, major_repairs: e.currentTarget.checked } }))} />
                  Major repairs
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.disclosures.flood_damage} onChange={(e) => setFormData(prev => ({ ...prev, disclosures: { ...prev.disclosures, flood_damage: e.currentTarget.checked } }))} />
                  Flood damage
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Images & Documents</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images * (Max 10 images)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload high-quality images of your product
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn btn-primary cursor-pointer inline-block"
                >
                  Choose Images
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: JPG, PNG, WebP (Max 5MB each)
                </p>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600">{errors.images}</p>
              )}

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          Main Image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supporting Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Upload certificates, warranties, or other documents
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, JPG, PNG (Max 10MB each)
                </p>
              </div>
            </div>

            {/* Vehicle Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RC (Registration Certificate)</label>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={handleSingleDocUpload('rc_doc')} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance</label>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={handleSingleDocUpload('insurance_doc')} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUC</label>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={handleSingleDocUpload('puc_doc')} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service History (multiple)</label>
                  <input type="file" multiple accept=".pdf,.jpg,.png" onChange={handleServiceHistoryUpload} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-2">Verification Photos & Videos (recommended)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto">
              Capture a few guided photos so our AI can quickly pre-check your listing, similar to insurance photo
              verification. This is optional but helps reviewers approve your seized vehicles and high-value items faster.
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowVerification((prev) => !prev)}
                className="text-xs px-3 py-1.5 rounded-full border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50 dark:bg-gray-900 dark:border-indigo-700 dark:text-indigo-200"
              >
                {showVerification ? 'Hide AI verification capture' : 'Open AI verification capture (optional)'}
              </button>
            </div>

            {showVerification && (
              <div className="space-y-4 mt-2">
                <CaptureStep
                  productType={formData.category || 'general'}
                  shotType="front_or_main"
                  label="Front / main view"
                  instructions="Stand back so the full item is visible with good lighting (for vehicles: full front of the car or bike)."
                  userId={currentUserId}
                  onAnyVerification={({ status }) =>
                    setAiMediaStats((prev) => ({
                      approved: prev.approved + (status === 'approved' ? 1 : 0),
                      total: prev.total + 1,
                    }))
                  }
                />

                <CaptureStep
                  productType={formData.category || 'general'}
                  shotType="side_detail"
                  label="Side or detail view"
                  instructions="Show one side clearly, or a key detail area (for art: texture/brushwork; for vehicles: one complete side)."
                  userId={currentUserId}
                  onAnyVerification={({ status }) =>
                    setAiMediaStats((prev) => ({
                      approved: prev.approved + (status === 'approved' ? 1 : 0),
                      total: prev.total + 1,
                    }))
                  }
                />

                <CaptureStep
                  productType={formData.category || 'general'}
                  shotType="interior_or_closeup"
                  label="Interior / close-up"
                  instructions="Capture interior, controls, or close-up of important parts so buyers can see condition clearly."
                  userId={currentUserId}
                  onAnyVerification={({ status }) =>
                    setAiMediaStats((prev) => ({
                      approved: prev.approved + (status === 'approved' ? 1 : 0),
                      total: prev.total + 1,
                    }))
                  }
                />
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              You can still list without completing every verification shot. Our team may ask for extra media later if needed.
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Auction Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Auction Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {auctionTypes.map(type => (
                  <div
                    key={type.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.auction_type === type.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, auction_type: type.value }))}
                  >
                    <h3 className="font-semibold mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{type.description}</p>
                  </div>
                ))}
              </div>
              {errors.auction_type && (
                <p className="mt-2 text-sm text-red-600">{errors.auction_type}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auction Duration *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="auction_duration"
                    value={formData.auction_duration}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.auction_duration ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Bid Increment (₹)
                </label>
                <input
                  type="number"
                  name="increment_amount"
                  value={formData.increment_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="auto_extend"
                  checked={formData.auto_extend}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable auto-extension (extends auction if bid placed in final minutes)
                </span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-6">Preview & Submit</h2>
            
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
              <div className="flex items-start gap-6">
                {imagePreviewUrls[0] && (
                  <img
                    src={imagePreviewUrls[0]}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{formData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{formData.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Condition:</span>
                      <p className="font-medium capitalize">{formData.condition}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Starting Price:</span>
                      <p className="font-bold text-green-600">₹{Number(parseFloat(formData.starting_price as string || '0')).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{formData.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Make/Model/Variant:</span>
                      <p className="font-medium">{formData.brand} {formData.model} {formData.variant}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Year / Fuel / Owners:</span>
                      <p className="font-medium">{formData.year || '-'} / {formData.fuel_type || '-'} / {formData.owners_count || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reg. City / Odometer:</span>
                      <p className="font-medium">{formData.registration_city || '-'} / {formData.km_driven ? `${formData.km_driven} km` : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Before Submitting:</p>
                  <ul className="space-y-1">
                    <li>• Your product will be reviewed within 24-48 hours</li>
                    <li>• Ensure all information is accurate and complete</li>
                    <li>• High-quality images increase bid success</li>
                    <li>• You'll be notified once your listing is approved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seller Declaration */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                id="seller_declaration"
                type="checkbox"
                name="seller_declaration"
                checked={formData.seller_declaration as boolean}
                onChange={handleChange}
                className="mt-1"
              />
              <label htmlFor="seller_declaration" className="text-sm text-gray-700 dark:text-gray-300">
                I declare that the information provided is accurate, I am permitted to sell this vehicle, and I accept the platform Terms & Conditions.
              </label>
            </div>
            {errors.seller_declaration && (
              <p className="mt-2 text-sm text-red-600">{errors.seller_declaration}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Verification banner */}
      {isSellerVerified === false && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Verify your seller account</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">Verified sellers get higher visibility and buyer trust.</p>
              </div>
            </div>
            <Link
              to="/verify-seller"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700"
            >
              Verify Now
            </Link>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <Package className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          List Your Product
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Create a professional auction listing
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          This page is designed for **individual sellers** listing one-off or occasional items. If you are a **company, bank, NBFC or fleet/dealer**
          listing stock regularly, please complete the{' '}
          <a href="/company/register" className="text-primary-600 hover:text-primary-500 underline">
            Company Registration
          </a>{' '}
          so we can enable bulk and recurring auctions for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber < step ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 6 && (
                  <div className={`w-full h-1 mx-2 ${
                    stepNumber < step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Product Info</span>
            <span>Pricing</span>
            <span>Images</span>
            <span>Verification</span>
            <span>Auction</span>
            <span>Preview</span>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Listing Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Product Photos</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Use high-resolution images (minimum 800x600)</li>
                <li>• Show multiple angles and close-up details</li>
                <li>• Include any flaws or damage honestly</li>
                <li>• Use good lighting and clear backgrounds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Description Tips</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Be detailed and honest about condition</li>
                <li>• Include brand, model, and specifications</li>
                <li>• Mention any included accessories</li>
                <li>• Add historical or provenance information</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {renderStep()}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:border-gray-400"
            >
              Back
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              data-testid="submit-for-approval"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Save & Publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
;

export default AddProduct;
