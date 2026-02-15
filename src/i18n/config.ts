import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.products": "Products",
      "nav.auctions": "Auctions",
      "nav.sell": "Sell",
      "nav.dashboard": "Dashboard",
      "nav.profile": "Profile",
      "nav.logout": "Logout",

      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.sort": "Sort",
      "common.price": "Price",
      "common.currency": "₹",

      // Product Catalog
      "catalog.title": "Product Catalog",
      "catalog.search.placeholder": "Search auctions, brands, categories...",
      "catalog.filters": "Filters",
      "catalog.sort.newest": "Newest First",
      "catalog.sort.priceLow": "Price: Low to High",
      "catalog.sort.priceHigh": "Price: High to Low",
      "catalog.sort.endingSoon": "Ending Soon",
      "catalog.sort.mostViewed": "Most Viewed",
      "catalog.category.vehicles": "Vehicles",
      "catalog.category.electronics": "Electronics",
      "catalog.category.jewelry": "Jewelry & Watches",
      "catalog.category.art": "Art & Paintings",

      // Auction
      "auction.currentBid": "Current Bid",
      "auction.startingPrice": "Starting Price",
      "auction.bidIncrement": "Bid Increment",
      "auction.timeLeft": "Time Left",
      "auction.bidders": "Bidders",
      "auction.placeBid": "Place Bid",
      "auction.bidAmount": "Bid Amount",
      "auction.minimumBid": "Minimum bid",
      "auction.ended": "Auction Ended",

      // AI Features
      "ai.recommendations": "AI Recommendations",
      "ai.biddingStrategy": "AI Bidding Strategy",
      "ai.voiceBidding": "Voice Bidding Assistant",
      "ai.fraudAlert": "Fraud Alert",
      "ai.marketAnalysis": "Market Analysis",

      // Voice Commands
      "voice.listen": "Listening...",
      "voice.processing": "Processing...",
      "voice.ready": "Ready to listen",
      "voice.sayBid": "Say 'bid [amount]' to place a bid",
      "voice.sayStatus": "Say 'status' for current auction info",

      // User
      "user.welcome": "Welcome",
      "user.balance": "Wallet Balance",
      "user.bids": "Your Bids",
      "user.settings": "Settings",

      // Languages
      "lang.english": "English",
      "lang.hindi": "हिंदी",
      "lang.telugu": "తెలుగు",
      "lang.tamil": "தமிழ்",
      "lang.kannada": "ಕನ್ನಡ",
      "lang.malayalam": "മലയാളം",
      "lang.marathi": "मराठी",
      "lang.gujarati": "ગુજરાતી",
      "lang.bengali": "বাংলা",
      "lang.punjabi": "ਪੰਜਾਬੀ"
    }
  },
  hi: {
    translation: {
      // Navigation
      "nav.home": "होम",
      "nav.products": "उत्पाद",
      "nav.auctions": "नीलामी",
      "nav.sell": "बेचें",
      "nav.dashboard": "डैशबोर्ड",
      "nav.profile": "प्रोफ़ाइल",
      "nav.logout": "लॉगआउट",

      // Common
      "common.loading": "लोड हो रहा है...",
      "common.error": "त्रुटि",
      "common.success": "सफलता",
      "common.save": "सहेजें",
      "common.cancel": "रद्द करें",
      "common.confirm": "पुष्टि करें",
      "common.search": "खोजें",
      "common.filter": "फ़िल्टर",
      "common.sort": "क्रमबद्ध",
      "common.price": "कीमत",
      "common.currency": "₹",

      // Product Catalog
      "catalog.title": "उत्पाद कैटलॉग",
      "catalog.search.placeholder": "नीलामी, ब्रांड, श्रेणियाँ खोजें...",
      "catalog.filters": "फ़िल्टर",
      "catalog.sort.newest": "नवीनतम पहले",
      "catalog.sort.priceLow": "कीमत: कम से उच्च",
      "catalog.sort.priceHigh": "कीमत: उच्च से कम",
      "catalog.sort.endingSoon": "जल्दी समाप्त",
      "catalog.sort.mostViewed": "सबसे ज्यादा देखा गया",
      "catalog.category.vehicles": "वाहन",
      "catalog.category.electronics": "इलेक्ट्रॉनिक्स",
      "catalog.category.jewelry": "गहने और घड़ियाँ",
      "catalog.category.art": "कला और पेंटिंग",

      // Auction
      "auction.currentBid": "वर्तमान बोली",
      "auction.startingPrice": "प्रारंभिक कीमत",
      "auction.bidIncrement": "बोली वृद्धि",
      "auction.timeLeft": "शेष समय",
      "auction.bidders": "बोलियां देने वाले",
      "auction.placeBid": "बोली लगाएँ",
      "auction.bidAmount": "बोली राशि",
      "auction.minimumBid": "न्यूनतम बोली",
      "auction.ended": "नीलामी समाप्त",

      // AI Features
      "ai.recommendations": "AI सिफारिशें",
      "ai.biddingStrategy": "AI बोली रणनीति",
      "ai.voiceBidding": "वॉइस बोली सहायक",
      "ai.fraudAlert": "धोखाधड़ी अलर्ट",
      "ai.marketAnalysis": "बाजार विश्लेषण",

      // Voice Commands
      "voice.listen": "सुन रहा हूँ...",
      "voice.processing": "प्रोसेस हो रहा है...",
      "voice.ready": "सुनने के लिए तैयार",
      "voice.sayBid": "'bid [राशि]' बोलकर बोली लगाएँ",
      "voice.sayStatus": "'status' बोलकर वर्तमान नीलामी जानकारी पाएँ",

      // User
      "user.welcome": "स्वागत है",
      "user.balance": "वॉलेट बैलेंस",
      "user.bids": "आपकी बोलियाँ",
      "user.settings": "सेटिंग्स",

      // Languages
      "lang.english": "English",
      "lang.hindi": "हिंदी",
      "lang.telugu": "తెలుగు",
      "lang.tamil": "தமிழ்",
      "lang.kannada": "ಕನ್ನಡ",
      "lang.malayalam": "മലയാളം",
      "lang.marathi": "मराठी",
      "lang.gujarati": "ગુજરાતી",
      "lang.bengali": "বাংলা",
      "lang.punjabi": "ਪੰਜਾਬੀ"
    }
  },
  te: {
    translation: {
      // Navigation
      "nav.home": "హోమ్",
      "nav.products": "ఉత్పత్తులు",
      "nav.auctions": "వేలం",
      "nav.sell": "అమ్ము",
      "nav.dashboard": "డ్యాష్బోర్డ్",
      "nav.profile": "ప్రొఫైల్",
      "nav.logout": "లాగ్ అవుట్",

      // Common
      "common.loading": "లోడ్ అవుతోంది...",
      "common.error": "లోపం",
      "common.success": "విజయం",
      "common.save": "సేవ్ చేయి",
      "common.cancel": "రద్దు చేయి",
      "common.confirm": "నిర్ధారించు",
      "common.search": "వెతుకు",
      "common.filter": "ఫిల్టర్",
      "common.sort": "క్రమబద్ధీకరించు",
      "common.price": "ధర",
      "common.currency": "₹",

      // Product Catalog
      "catalog.title": "ఉత్పత్తుల క్యాటలాగ్",
      "catalog.search.placeholder": "వేలం, బ్రాండ్‌లు, వర్గాలను వెతకండి...",
      "catalog.filters": "ఫిల్టర్‌లు",
      "catalog.sort.newest": "కొత్తవి ముందు",
      "catalog.sort.priceLow": "ధర: తక్కువ నుండి ఎక్కువ",
      "catalog.sort.priceHigh": "ధర: ఎక్కువ నుండి తక్కువ",
      "catalog.sort.endingSoon": "త్వరలో ముగుస్తాయి",
      "catalog.sort.mostViewed": "ఎక్కువ చూసినవి",
      "catalog.category.vehicles": "వాహనాలు",
      "catalog.category.electronics": "ఎలక్ట్రానిక్స్",
      "catalog.category.jewelry": "నగలు మరియు గడియారాలు",
      "catalog.category.art": "కళ మరియు చిత్రలేఖనం",

      // Auction
      "auction.currentBid": "ప్రస్తుత బిడ్",
      "auction.startingPrice": "ప్రారంభ ధర",
      "auction.bidIncrement": "బిడ్ పెంపు",
      "auction.timeLeft": "మిగిలిన సమయం",
      "auction.bidders": "బిడ్ చేసినవారు",
      "auction.placeBid": "బిడ్ చేయి",
      "auction.bidAmount": "బిడ్ మొత్తం",
      "auction.minimumBid": "కనీస బిడ్",
      "auction.ended": "వేలం ముగిసింది",

      // AI Features
      "ai.recommendations": "AI సిఫార్సులు",
      "ai.biddingStrategy": "AI బిడ్ వ్యూహం",
      "ai.voiceBidding": "వాయిస్ బిడ్ సహాయకుడు",
      "ai.fraudAlert": "మోసపూరిత హెచ్చరిక",
      "ai.marketAnalysis": "మార్కెట్ విశ్లేషణ",

      // Voice Commands
      "voice.listen": "వింటున్నాను...",
      "voice.processing": "ప్రాసెస్ అవుతోంది...",
      "voice.ready": "వినడానికి సిద్ధంగా ఉన్నాను",
      "voice.sayBid": "'bid [మొత్తం]' అని చెప్పి బిడ్ చేయండి",
      "voice.sayStatus": "'status' అని చెప్పి ప్రస్తుత వేలం సమాచారం పొందండి",

      // User
      "user.welcome": "స్వాగతం",
      "user.balance": "వాలెట్ బ్యాలెన్స్",
      "user.bids": "మీ బిడ్‌లు",
      "user.settings": "సెట్టింగులు",

      // Languages
      "lang.english": "English",
      "lang.hindi": "हिंदी",
      "lang.telugu": "తెలుగు",
      "lang.tamil": "தமிழ்",
      "lang.kannada": "ಕನ್ನಡ",
      "lang.malayalam": "മലയാളം",
      "lang.marathi": "मराठी",
      "lang.gujarati": "ગુજરાતી",
      "lang.bengali": "বাংলা",
      "lang.punjabi": "ਪੰਜਾਬੀ"
    }
  },
  ta: {
    translation: {
      // Navigation
      "nav.home": "முகப்பு",
      "nav.products": "தயாரிப்புகள்",
      "nav.auctions": "ஏலம்",
      "nav.sell": "விற்க",
      "nav.dashboard": "டாஷ்போர்டு",
      "nav.profile": "சுயவிவரம்",
      "nav.logout": "வெளியேறு",

      // Common
      "common.loading": "ஏற்றப்படுகிறது...",
      "common.error": "பிழை",
      "common.success": "வெற்றி",
      "common.save": "சேமி",
      "common.cancel": "ரத்து செய்",
      "common.confirm": "உறுதிப்படுத்து",
      "common.search": "தேடு",
      "common.filter": "வடிகட்டி",
      "common.sort": "வரிசைப்படுத்து",
      "common.price": "விலை",
      "common.currency": "₹",

      // Product Catalog
      "catalog.title": "தயாரிப்பு பட்டியல்",
      "catalog.search.placeholder": "ஏலம், பிராண்டுகள், வகைகளை தேடு...",
      "catalog.filters": "வடிகட்டிகள்",
      "catalog.sort.newest": "புதியது முதலில்",
      "catalog.sort.priceLow": "விலை: குறைவு முதல் அதிகம்",
      "catalog.sort.priceHigh": "விலை: அதிகம் முதல் குறைவு",
      "catalog.sort.endingSoon": "விரைவில் முடியும்",
      "catalog.sort.mostViewed": "அதிகம் பார்க்கப்பட்டது",
      "catalog.category.vehicles": "வாகனங்கள்",
      "catalog.category.electronics": "மின்னணுவியல்",
      "catalog.category.jewelry": "நகைகள் மற்றும் கடிகாரங்கள்",
      "catalog.category.art": "கலை மற்றும் ஓவியங்கள்",

      // Auction
      "auction.currentBid": "தற்போதைய ஏலம்",
      "auction.startingPrice": "தொடக்க விலை",
      "auction.bidIncrement": "ஏல அதிகரிப்பு",
      "auction.timeLeft": "மீதமுள்ள நேரம்",
      "auction.bidders": "ஏலம் செய்பவர்கள்",
      "auction.placeBid": "ஏலம் செய்",
      "auction.bidAmount": "ஏல தொகை",
      "auction.minimumBid": "குறைந்தபட்ச ஏலம்",
      "auction.ended": "ஏலம் முடிந்தது",

      // AI Features
      "ai.recommendations": "AI பரிந்துரைகள்",
      "ai.biddingStrategy": "AI ஏல உத்தி",
      "ai.voiceBidding": "குரல் ஏல உதவியாளர்",
      "ai.fraudAlert": "ஏமாற்ற எச்சரிக்கை",
      "ai.marketAnalysis": "சந்தை பகுப்பாய்வு",

      // Voice Commands
      "voice.listen": "கேட்கிறேன்...",
      "voice.processing": "செயலாக்கப்படுகிறது...",
      "voice.ready": "கேட்க தயாராக உள்ளேன்",
      "voice.sayBid": "'bid [தொகை]' என்று சொல்லி ஏலம் செய்யுங்கள்",
      "voice.sayStatus": "'status' என்று சொல்லி தற்போதைய ஏலம் தகவலை பெறுங்கள்",

      // User
      "user.welcome": "வரவேற்கிறோம்",
      "user.balance": "வாலட் இருப்பு",
      "user.bids": "உங்கள் ஏலங்கள்",
      "user.settings": "அமைப்புகள்",

      // Languages
      "lang.english": "English",
      "lang.hindi": "हिंदी",
      "lang.telugu": "తెలుగు",
      "lang.tamil": "தமிழ்",
      "lang.kannada": "ಕನ್ನಡ",
      "lang.malayalam": "മലയാളം",
      "lang.marathi": "मराठी",
      "lang.gujarati": "ગુજરાતી",
      "lang.bengali": "বাংলা",
      "lang.punjabi": "ਪੰਜਾਬੀ"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
