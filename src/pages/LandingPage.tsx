import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Wallet, Star, ArrowRight, Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const proxy = (u: string) => `/api/images/proxy?url=${encodeURIComponent(u)}`;

const features = [
  {
    icon: <Building2 className="h-12 w-12 text-primary-500 dark:text-primary-400 mx-auto mb-4" />,
    title: 'Bank-seized stock',
    desc: 'Access vehicles directly from banks, NBFCs and fleet owners with clear recovery documentation.',
  },
  {
    icon: <Shield className="h-12 w-12 text-secondary-500 dark:text-secondary-400 mx-auto mb-4" />,
    title: 'Verified condition & docs',
    desc: 'Each listing carries disclosures, service history (where available) and document checks so you know what you\'re bidding on.',
  },
  {
    icon: <Wallet className="h-12 w-12 text-accent-500 dark:text-accent-400 mx-auto mb-4" />,
    title: 'Guided bidding & deposits',
    desc: 'Smart deposit calculations, wallet holds and step-by-step bidding flow make high-value auctions safer and simpler.',
  },
];

const bannerSlogans = [
  'Buy Better. Sell Smarter on QuickMela.',
  'Best Deals Every Day on QuickMela.',
  'Sell Your Vehicle in Minutes with QuickMela.',
];

const bannerImages = [
  {
    src: encodeURI('/banners/✅ 1. HOME HERO BANNER (1440 × 360 px)_Theme_ QuickMela – Buy & Sell Vehicles Fast_Style_ Wide, clean, premium_AI Banner Prompt (Copy & Use)__Prompt__“Wide website hero banner, ratio 4_1, size 1440x360. Theme_ QuickMela – India’s .jpg'),
    alt: 'Buy Better Sell Smarter on QuickMela',
  },
  {
    src: encodeURI('/banners/✅ 2. HOME INLINE BANNER (1200 × 300 px)_Theme_ Popular Brands _ Best Deals_AI Banner Prompt__Prompt__“Ultra-wide promotional banner, size 1200x300, aspect 4_1. QuickMela branding. Show row of popular vehicles_ Swift, Creta, Bolero pick.jpg'),
    alt: 'Best Deals Every Day on QuickMela',
  },
  {
    src: encodeURI('/banners/✅ 4. SQUARE BANNER (600 × 600 px)_Theme_ Sell Your Vehicle Fast_AI Banner Prompt__Prompt__“Square banner 600x600 for QuickMela. Simple background with parked car + bike. Big text_ ‘Sell Your Vehicle in Minutes’. Phone mockup wi (1).jpg'),
    alt: 'Sell Your Vehicle in Minutes on QuickMela',
  },
];

const heroSlides = [
  {
    title: 'Bank-seized & pre-owned vehicles',
    subtitle: 'Bid on cars, SUVs and commercial vehicles from banks, NBFCs and fleets.',
    image: proxy('https://source.unsplash.com/1200x500/?car,auction'),
    tag: 'Vehicles'
  },
  {
    title: 'Original art with artist stories',
    subtitle: 'Discover paintings and illustrations with making-of videos and artist bios.',
    image: proxy('https://source.unsplash.com/1200x500/?painting,canvas'),
    tag: 'Art'
  },
  {
    title: 'Handcrafted decor & collectibles',
    subtitle: 'One-of-one ceramics, textiles and crafts from independent makers.',
    image: proxy('https://source.unsplash.com/1200x500/?handmade,craft'),
    tag: 'Crafts'
  },
  {
    title: 'Antique watches & vintage finds',
    subtitle: 'Curated lots of old coins, timepieces and nostalgic items.',
    image: proxy('https://source.unsplash.com/1200x500/?antique,watch'),
    tag: 'Antiques'
  },
];

const popularCarBrandLogos = [
  // Mass-market & Indian
  { name: 'Tata', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/1/1f/Tata_logo.svg') },
  { name: 'Maruti Suzuki', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/9/99/Maruti_Suzuki_Logo.svg') },
  { name: 'Mahindra', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/2/2e/Mahindra_new_logo.svg') },
  { name: 'Hyundai', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/45/Hyundai_logo.svg') },
  { name: 'Toyota', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_logo.svg') },
  { name: 'Kia', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/34/Kia-logo.png') },
  { name: 'Honda', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda-logo.svg') },
  { name: 'Renault', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5e/Renault_2021_Text.svg') },
  { name: 'MG', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5e/MG_Motor_Logo.svg') },
  { name: 'Skoda', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/1/1f/%C5%A0koda_Auto_logo.svg') },
  { name: 'Volkswagen', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5d/VW_Logo.svg') },
  { name: 'Nissan', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/6/6e/Nissan_2020.svg') },
  { name: 'Jeep', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/3e/Jeep_logo.svg') },
  { name: 'Citroën', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5e/Citroen_logo.svg') },

  // Premium & luxury
  { name: 'BMW', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg') },
  { name: 'Mercedes-Benz', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg') },
  { name: 'Audi', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/8/8b/Audi_Logo_2016.svg') },
  { name: 'Lexus', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/6/6a/Lexus_division_emblem.svg') },
  { name: 'Volvo', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/55/Volvo_Group_Logo.svg') },
  { name: 'Porsche', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/2/2d/Porsche_logo.svg') },
  { name: 'Ferrari', logo: proxy('https://upload.wikimedia.org/wikipedia/en/9/9d/Ferrari-Logo.svg') },
  { name: 'Lamborghini', logo: proxy('https://upload.wikimedia.org/wikipedia/en/8/8f/Lamborghini_Logo.svg') },
  { name: 'Aston Martin', logo: proxy('https://upload.wikimedia.org/wikipedia/en/3/3b/Aston_Martin_Lagonda_brand_logo.svg') },
  { name: 'Jaguar', logo: proxy('https://upload.wikimedia.org/wikipedia/en/4/4e/Jaguar_Cars_logo.svg') },
  { name: 'Land Rover', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/02/Land_Rover_logo_black.svg') },
  { name: 'Rolls-Royce', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/9/9f/Rolls-Royce_Motor_Cars_logo.svg') },
  { name: 'Bentley', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7e/Bentley_Motors_Logo.svg') },
  { name: 'Maserati', logo: proxy('https://upload.wikimedia.org/wikipedia/en/3/3e/Maserati_logo.svg') },
  { name: 'McLaren', logo: proxy('https://upload.wikimedia.org/wikipedia/en/5/5c/McLaren_Automotive_logo.svg') },

  // New energy / EV & emerging
  { name: 'Tesla', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg') },
  { name: 'BYD', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5e/BYD_Company_Logo.svg') },
  { name: 'VinFast', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/2/2f/VinFast_logo_2021.svg') },
  { name: 'Pravaig', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/c/c1/Pravaig_Dynamics_logo.svg') },
  { name: 'Fisker', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/45/Fisker_logo.svg') },

  // Misc / others from references
  { name: 'Force Motors', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/8/8a/Force_Motors_logo.svg') },
  { name: 'Isuzu', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/0d/Isuzu_logo.svg') },
  { name: 'Lotus', logo: proxy('https://upload.wikimedia.org/wikipedia/en/0/02/Lotus_Cars_Logo.svg') },
];

const popularBikeBrandLogos = [
  // Main Indian & global
  { name: 'Royal Enfield', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/74/Royal_Enfield_Logo.svg') },
  { name: 'Yamaha', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/1/17/Yamaha_Motor_Logo.svg') },
  { name: 'TVS', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/0a/TVS_Motor_Company_Logo.svg') },
  { name: 'Bajaj', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7b/Bajaj_auto_logo.svg') },
  { name: 'Hero', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5a/Hero_MotoCorp_Logo.svg') },
  { name: 'Honda', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7a/Honda_Motorcycle_and_Scooter_India_logo.svg') },
  { name: 'Suzuki', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/3a/Suzuki_logo_2.svg') },
  { name: 'Kawasaki', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/06/Kawasaki-logo.svg') },
  { name: 'KTM', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/8/8e/KTM-Logo.svg') },
  { name: 'Ducati', logo: proxy('https://upload.wikimedia.org/wikipedia/en/0/06/Ducati_red_logo.svg') },
  { name: 'Harley-Davidson', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/0f/Harley-Davidson_logo.svg') },
  { name: 'Triumph', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/8/84/Triumph_Motorcycles_logo.svg') },
  { name: 'BMW Motorrad', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg') },
  { name: 'Aprilia', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/79/Aprilia_logo.svg') },
  { name: 'Benelli', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/4c/Benelli_Armi_logo.svg') },

  // EV & new-age
  { name: 'Ather', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/1/1c/Ather_Energy_Logo.svg') },
  { name: 'Ola Electric', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/9/9d/Ola_Electric_logo.svg') },
  { name: 'PURE EV', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/73/Pure_EV_logo.svg') },
  { name: 'Revolt', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/4d/Revolt_Motors_logo.svg') },
  { name: 'River', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/54/River_Electric_Scooters_logo.svg') },
  { name: 'Simple Energy', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/f/f6/Simple_Energy_logo.svg') },
  { name: 'VIDA', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/30/Vida_by_Hero_logo.svg') },
  { name: 'Ampere', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7b/Ampere_Electric_Vehicles_logo.svg') },
  { name: 'BGauss', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/2/27/Bgauss_logo.svg') },
  { name: 'Bounce Infinity', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/b/bc/Bounce_Infinity_logo.svg') },

  // Retro / niche brands
  { name: 'Jawa', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/52/Jawa_logo.svg') },
  { name: 'Yezdi', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/3d/Yezdi_logo.svg') },
  { name: 'Husqvarna', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/3e/Husqvarna_Motorcycles_logo.svg') },
  { name: 'Indian Motorcycle', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/57/Indian_Motorcycle_logo.svg') },
  { name: 'Moto Guzzi', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/0/0d/Moto_Guzzi_logo.svg') },
  { name: 'BSA', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/4/47/BSA_Company_logo.svg') },

  // Other electric / city brands from screenshots
  { name: 'Hop Electric', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/d/d3/HOP_Electric_logo.svg') },
  { name: 'Lectrix', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/e/e5/Lectrix_EV_logo.svg') },
  { name: 'Oben Electric', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/f/fc/Oben_Electric_logo.svg') },
  { name: 'Odysse', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/f/fd/Odysse_Electric_logo.svg') },
  { name: 'Okinawa', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/d/d6/Okinawa_Autotech_logo.svg') },
  { name: 'Gemopai', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/7/7f/Gemopai_logo.svg') },
  { name: 'CFMoto', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/3/38/Cfmoto_logo.svg') },
  { name: 'Evolet', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/5/5f/Evolet_Electric_Scooters_logo.svg') },

  // Classic scooter brand
  { name: 'Vespa', logo: proxy('https://upload.wikimedia.org/wikipedia/commons/1/1b/Vespa_logo.svg') },
];

const testimonials = [
  {
    name: 'Aarav Mehta',
    quote: '“I snagged a rare coin for 70% less than market price. QuickMela is incredible!”',
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Neha Sharma',
    quote: '“The live auction thrill is unmatched! I check QuickMela every day now.”',
    img: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    name: 'Ravi Kumar',
    quote: '“Bought a retro Walkman from 1985 in mint condition. Love this platform!”',
    img: 'https://randomuser.me/api/portraits/men/52.jpg',
  },
];

const LandingPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerSlogans.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Basic SEO: set page title and meta description for the main landing page
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.title = 'QuickMela – Bank-seized Vehicles, Art & Handcrafted Auctions in India';

    const description = 'QuickMela is an online auction marketplace for bank-seized vehicles, original art and handcrafted decor. Discover verified listings, transparent deposits and guided bidding across India.';

    const ensureMeta = (name: string, attr: 'name' | 'property' = 'name') => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      return tag;
    };

    ensureMeta('description').setAttribute('content', description);
    ensureMeta('og:title', 'property').setAttribute('content', 'QuickMela – Bank-seized Vehicles, Art & Handcrafted Auctions in India');
    ensureMeta('og:description', 'property').setAttribute('content', description);
    ensureMeta('og:type', 'property').setAttribute('content', 'website');
  }, []);

  // JSON-LD structured data for Organization / WebSite
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const scriptId = 'ld-json-quickbid-org';
    const existing = document.getElementById(scriptId);
    if (existing && existing.parentElement) {
      existing.parentElement.removeChild(existing);
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickbid.in';

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'QuickMela',
      url: origin,
      logo: origin + '/logo192.png',
      sameAs: [
        'https://www.facebook.com/',
        'https://www.instagram.com/',
        'https://www.linkedin.com/'
      ],
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-inter bg-white dark:bg-gray-900 transition-all">
      
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 text-white py-12 sm:py-16 md:py-24 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold drop-shadow-xl mb-4 sm:mb-6 tracking-tight">
            Win Big. Pay Less. <br className="hidden sm:block" /> Own History.
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10">
            Discover rare gems, antiques, and modern marvels—at prices only auctions can offer.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <Link
              to="/register"
              className="btn btn-white btn-lg shadow-xl text-center"
            >
              Start Bidding
            </Link>
            <Link
              to="/catalog"
              className="btn btn-primary btn-lg shadow-xl text-center"
            >
              Browse Catalog
            </Link>
            <a
              href="#become-seller"
              className="btn btn-outline-invert btn-lg text-center"
            >
              Become a Seller
            </a>
          </div>
          {/* Sliding banner under hero CTAs */}
          <div className="mt-6 sm:mt-8">
            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl bg-gray-900/40 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-40 sm:h-52 md:h-full">
                  <img
                    src={heroSlides[activeSlide].image}
                    alt={heroSlides[activeSlide].title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-black/70 text-white/90 uppercase tracking-wide">
                    {heroSlides[activeSlide].tag}
                  </div>
                </div>
                <div className="p-4 sm:p-6 text-left flex flex-col justify-center bg-black/10">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">
                    {heroSlides[activeSlide].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/85 mb-3">
                    {heroSlides[activeSlide].subtitle}
                  </p>
                  <div className="flex gap-2 items-center">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.tag}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          idx === activeSlide ? 'bg-white' : 'bg-white/30'
                        }`}
                        aria-label={slide.tag}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary-200/60 to-secondary-200/60 dark:from-primary-400/10 dark:to-secondary-400/10 rounded-2xl p-6 border dark:border-gray-800"
            >
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-gray-900/40 rounded-xl p-4 border dark:border-gray-800">
                    {feature.icon}
                    <div className="font-semibold text-gray-900 dark:text-white">{feature.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Trust badges under CTAs for social proof */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Trusted by 10,000+ bidders</span>
              </div>
              <span className="hidden sm:block opacity-60">•</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Bank-grade security</span>
              </div>
              <span className="hidden sm:block opacity-60">•</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>4.9/5 satisfaction</span>
              </div>
            </div>
            <div className="mt-6 max-w-4xl mx-auto">
              <div className="w-full h-40 md:h-52 rounded-2xl shadow-xl border border-white/10 overflow-hidden relative">
                <img
                  src={bannerImages[activeBanner]?.src}
                  alt={bannerImages[activeBanner]?.alt || bannerSlogans[activeBanner]}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = proxy('https://source.unsplash.com/1200x300/?car,auction');
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40" />
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow-lg">
                    {bannerSlogans[activeBanner]}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {bannerSlogans.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBanner(idx)}
                    className={`h-1.5 w-5 rounded-full transition-colors ${
                      idx === activeBanner ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`Banner ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Visual Showcase: Vehicles & Art */}
      <section className="py-8 sm:py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden shadow-xl">
            <img
              src={proxy('https://source.unsplash.com/1200x700/?car,auction')}
              alt="Vehicle auction yard"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-xs uppercase tracking-wide text-white/80">Live & timed auctions</div>
              <div className="text-lg sm:text-xl font-semibold">Bank-seized & pre-owned vehicles</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-32 sm:h-40 md:h-44">
              <img
                src={proxy('https://source.unsplash.com/600x400/?painting,art')}
                alt="Original painting"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs sm:text-sm font-medium">
                Original paintings with artist stories
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-32 sm:h-40 md:h-44">
              <img
                src={proxy('https://source.unsplash.com/600x400/?handmade,craft')}
                alt="Handcrafted pieces"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-xs sm:text-sm font-medium">
                Handcrafted decor, pottery & more
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Finance & Insurance value prop */}
      <section className="py-6 bg-primary-50 dark:bg-gray-900/60 border-y border-primary-100/60 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              One-stop car ownership
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1 max-w-2xl">
              Win the auction, apply for a bank loan and get insurance in a single flow with our partner banks and insurers.
              QuickMela may earn a referral fee on each approved loan or policy, at no extra cost to you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="px-3 py-1 rounded-full bg-white text-primary-700 border border-primary-100 shadow-sm">
              Faster loan journeys on auctioned vehicles
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-primary-700 border border-primary-100 shadow-sm">
              Insurance quotes after you win
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why QuickMela is Trusted by Thousands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {feature.icon}
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight Banner */}
      <section className="py-12 bg-primary-50 text-center text-primary-800 font-semibold text-lg tracking-wide shadow-inner">
        <p>✨ Bid on rare art, ancient currency, quirky collectibles & futuristic tech. Your treasure hunt starts now.</p>
      </section>

      {/* Live Auction Promo */}
      <section className="py-12 bg-black">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1 text-white space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Live Auction Now</h2>
            <p className="text-sm sm:text-base text-gray-200">
              Join real-time bidding with a scoreboard-style view, live highlights and instant updates on every bid.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/live-auction" className="btn btn-primary inline-flex items-center gap-2">
                Go to Live Auction
              </Link>
              <Link to="/products" className="btn btn-outline-invert inline-flex items-center gap-2">
                View all live lots
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src="/banners/quickmela-live-auction-now.jpg"
              alt="Live auction now on QuickMela"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* As featured in - press logos */}
      <section className="py-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">As featured in</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center justify-items-center opacity-80">
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/economic-times.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/1/1b/The_Economic_Times_logo.png')}} alt="Economic Times" className="h-5 sm:h-7 object-contain grayscale" />
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/yourstory.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/5/5a/YourStory_Logo.png')}} alt="YourStory" className="h-5 sm:h-7 object-contain grayscale" />
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/inc42.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/b/b8/Inc42_Logo.png')}} alt="Inc42" className="h-5 sm:h-7 object-contain grayscale" />
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/forbes.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/9/9d/Forbes_logo.svg')}} alt="Forbes" className="h-5 sm:h-7 object-contain grayscale" />
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/mint.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/5/5f/Mint_Logo.png')}} alt="Mint" className="h-5 sm:h-7 object-contain grayscale" />
            <img loading="lazy" decoding="async" width="120" height="28" src="/logos/press/times-of-india.png" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/8/87/The_Times_of_India_logo.png')}} alt="Times of India" className="h-5 sm:h-7 object-contain grayscale" />
          </div>
        </div>
      </section>

      {/* Social Proof Metrics Bar */}
      <section className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">10k+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Active Bidders</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">₹100Cr+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">GMV Transacted</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">User Satisfaction</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">500+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Verified Sellers</div>
            </div>
          </div>
          {/* Partner logos */}
          <div className="mt-8 sm:mt-10">
            <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by leading partners</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center justify-items-center opacity-80">
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/sbi.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/5/55/State_Bank_of_India_logo.svg')}} alt="SBI" className="h-6 sm:h-8 object-contain grayscale" />
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/hdfc.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/6/6a/HDFC_Bank_Logo.svg')}} alt="HDFC" className="h-6 sm:h-8 object-contain grayscale" />
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/icici.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/3/30/ICICI_Bank_Logo.svg')}} alt="ICICI" className="h-6 sm:h-8 object-contain grayscale" />
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/axis.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/5/5b/Axis_Bank_logo.svg')}} alt="Axis Bank" className="h-6 sm:h-8 object-contain grayscale" />
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/mahindra-finance.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/0/0e/Mahindra_Finance_logo.svg')}} alt="Mahindra Finance" className="h-6 sm:h-8 object-contain grayscale" />
              <img loading="lazy" decoding="async" width="140" height="36" src="/logos/partners/bajaj-finserv.svg" onError={(e)=>{(e.currentTarget as HTMLImageElement).src=proxy('https://upload.wikimedia.org/wikipedia/commons/a/a6/Bajaj_Finserv_Logo.svg')}} alt="Bajaj Finserv" className="h-6 sm:h-8 object-contain grayscale" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Teaser */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900/70 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Trust, Safety & Compliance
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              QuickMela is built for serious buyers, sellers and bank partners who need a safe, transparent and
              compliant auction experience. Every auction is backed by strict KYC, fraud checks, secure payments and
              clear rules for behaviour, disputes and cross-border trade.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/trust-safety"
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
            >
              View Trust &amp; Safety
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link
              to="/legal"
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Legal, Compliance &amp; Trust Center
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Seller Type Choice */}
      <section id="become-seller" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Become a Seller
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Anyone can list on QuickMela. Choose the path that fits you today – whether you are an individual selling a few items or a business with regular or bulk auctions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-800 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-300 text-lg font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">I&apos;m an Individual</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Sell a car, artwork, collectibles or a few items as a single person.</p>
                </div>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4 list-disc list-inside">
                <li>Ideal if you list occasionally or have a small personal collection.</li>
                <li>Simple onboarding with PAN and basic KYC as per Indian regulations.</li>
                <li>Transparent fees shown before you publish your listing.</li>
              </ul>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-primary btn-sm">
                  Create individual account
                </Link>
                <Link to="/add-product" className="btn btn-outline btn-sm">
                  List your first item
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-800 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center">
                  <span className="text-secondary-600 dark:text-secondary-300 text-lg font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">I&apos;m a Company / Bulk Seller</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Banks, NBFCs, fleets, dealers or marketplaces listing stock regularly.</p>
                </div>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4 list-disc list-inside">
                <li>Designed for recurring or bulk auctions and asset recovery.</li>
                <li>Company KYC with GST, PAN and documents for compliance and audit trails.</li>
                <li>Multi-user access, wallets and dashboards for your operations team.</li>
              </ul>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link to="/company/register" className="btn btn-primary btn-sm">
                  Start company registration
                </Link>
                <Link to="/business-solutions" className="btn btn-outline btn-sm">
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10 sm:mb-14">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-800">
              <div className="text-primary-600 text-sm font-semibold mb-2">Step 1</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Browse & Verify</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Explore curated lots across categories. Every listing goes through verification and compliance checks.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-800">
              <div className="text-primary-600 text-sm font-semibold mb-2">Step 2</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bid in Real-Time</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Join live, timed, or tender auctions. Transparent prices, instant updates, and fair competition.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border dark:border-gray-800">
              <div className="text-primary-600 text-sm font-semibold mb-2">Step 3</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Win & Collect</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Secure checkout, documents, and pickup/delivery options. Own treasures at unbeatable prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Popular Brands</h2>
          <div className="mb-6">
            <div className="w-full h-32 md:h-40 rounded-2xl shadow-lg border dark:border-gray-700 overflow-hidden relative">
                <img
                  src={bannerImages[2]?.src}
                  alt={bannerImages[2]?.alt || bannerSlogans[2]}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = proxy('https://source.unsplash.com/1200x300/?car,auction');
                  }}
                />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <p className="text-base sm:text-lg md:text-xl font-semibold text-white drop-shadow">
                  {bannerSlogans[2]}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center md:text-left">Popular Car Brands</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {popularCarBrandLogos.map((b) => (
                  <div
                    key={b.name}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg flex items-center justify-center"
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      loading="lazy"
                      className="h-6 sm:h-8 object-contain"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent) parent.textContent = b.name;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center md:text-left">Popular Bike Brands</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {popularBikeBrandLogos.map((b) => (
                  <div
                    key={b.name}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg flex items-center justify-center"
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      loading="lazy"
                      className="h-6 sm:h-8 object-contain"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.style.display = 'none';
                        const parent = el.parentElement;
                        if (parent) parent.textContent = b.name;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Art & Handcrafted Auctions */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Collect Original Art & Handcrafted Stories
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Bid on original paintings, handmade crafts and one-of-one pieces – each with artist stories, making-of videos and verified ownership.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Original art with artist bios and making-of videos</li>
                <li>• Limited-run handcrafted products, not mass-market</li>
                <li>• Reserve prices and disclosures clearly mentioned</li>
              </ul>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  to="/products"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  Browse art & crafts
                </Link>
                <Link
                  to="/add-product"
                  className="btn btn-outline inline-flex items-center gap-2"
                >
                  Sell your artwork
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="row-span-2 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={proxy('https://source.unsplash.com/600x800/?painting,art')}
                  alt="Original painting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={proxy('https://source.unsplash.com/600x400/?handmade,craft')}
                  alt="Handmade craft"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={proxy('https://source.unsplash.com/600x400/?sculpture,art')}
                  alt="Sculpture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Real Stories, Real Wins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.7 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{t.quote}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              QuickBid in Your Pocket
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bid from anywhere with our blazing-fast, elegant mobile app. Download now for iOS & Android.
            </p>
            <div className="flex gap-4">
              <button className="btn btn-lg bg-black text-white hover:bg-gray-800">
                <Download className="h-6 w-6" />
                <span>App Store</span>
              </button>
              <button className="btn btn-lg bg-black text-white hover:bg-gray-800">
                <Download className="h-6 w-6" />
                <span>Play Store</span>
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="md:w-1/2"
          >
            <img
              src={proxy('https://source.unsplash.com/600x400/?auction,mobile')}
              alt="QuickBid Mobile App"
              className="rounded-xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="bg-primary-600 text-white py-20 text-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6"
        >
          <h2 className="text-4xl font-bold mb-4">Your Next Win Is Waiting 🎯</h2>
          <p className="text-xl mb-8">Join the fastest-growing auction community. Real deals. Real thrills.</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="btn btn-white btn-lg inline-flex items-center"
            >
              Start Bidding Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/business-solutions"
              className="btn btn-outline-invert btn-lg inline-flex items-center"
            >
              Business Solutions
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
