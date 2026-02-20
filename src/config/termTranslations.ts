/**
 * TERM TRANSLATION MAP
 * 
 * Solves MED-004: "Technical jargon in UI labels"
 * 
 * Maps technical/confusing terms to user-friendly language
 * 
 * This is the SINGLE SOURCE OF TRUTH for terminology
 * Update here once, reflects everywhere
 * 
 * Example:
 * "Escrow Transactions" → "Protected Payments"
 * "KYC" → "Identity Verification"
 * "API Rate Limit" → "Request Limit"
 */

export const TERM_MAP = {
  // FINANCIAL TERMS
  'Escrow': 'Protected Payment',
  'Escrow Transaction': 'Protected Payment',
  'Escrow Transactions': 'Protected Payments',
  'escrow_protected': 'protected',
  'Ledger': 'Transaction History',
  'Settlement': 'Payment Processing',
  'Payout Schedule': 'When You Get Paid',

  // VERIFICATION & KYC
  'KYC': 'Identity Verification',
  'KYC Status': 'Verification Status',
  'kyc_verified': 'verified',
  'kyc_pending': 'verification pending',
  'kyc_rejected': 'verification rejected',
  'AML': 'Fraud Check',
  'Compliance Check': 'Security Check',

  // USER TYPES
  'superadmin': 'Platform Manager',
  'admin': 'Administrator',
  'seller': 'Seller',
  'buyer': 'Buyer',
  'dealer': 'Dealer',
  'company': 'Company',
  'user_type': 'Account Type',
  'account_role': 'Account Type',

  // AUCTION/BIDDING
  'Reserve Met': 'Starting Price Reached',
  'Reserve Not Met': 'Starting Price Not Reached',
  'Hammer Price': 'Final Bid Amount',
  'Bid Increment': 'Minimum Bid Increase',
  'Proxy Bidding': 'Automatic Bidding',
  'Lot Number': 'Item Number',
  'Lot': 'Item',
  'Auctioneer': 'Platform',

  // VEHICLE TERMS
  'VIN Inspection': 'Vehicle Inspection',
  'Inspection Grade': 'Condition Grade',
  'as-is': 'No Returns',
  'Odometer Disclosure': 'Mileage Verification',
  'Title Status': 'Ownership Status',
  'Salvage Title': 'Salvage',
  'Clean Title': 'Clear Ownership',
  'Branded Title': 'Complex History',

  // ACTIONS
  'Place Bid': 'Make a Bid',
  'Retract Bid': 'Cancel Bid',
  'Win Auction': 'Win Item',
  'Purchase': 'Buy',
  'List Item': 'Sell',
  'Unlist': 'Stop Selling',

  // STATUSES
  'pending': 'Waiting',
  'active': 'Live',
  'closed': 'Ended',
  'sold': 'Sold',
  'unsold': 'No Sale',
  'won': 'You Won',
  'lost': 'Not Won',
  'outbid': 'Someone Bid Higher',
  'in_transit': 'Being Shipped',
  'delivered': 'Arrived',

  // SUPPORT
  'Chargebacks': 'Disputed Charges',
  'GDPR Request': 'Data Request',
  'Account Suspension': 'Account Locked',
  'Appeal': 'Request Review',
  'Dispute': 'Issue Report',

  // TECHNICAL (Hide from users, but map if visible)
  'API': 'System',
  'Webhook': 'Notification System',
  'Rate Limit': 'Request Limit',
  'Cache': 'Quick Memory',
  'Log': 'Activity Record',
  'UTC': 'Coordinated Time',
  'Timezone': 'Your Time',

  // RATINGS & REPUTATION
  'DSR': 'Rating Score',
  'Feedback': 'Review',
  'Seller Ratings': 'Seller Reviews',
  'Positive': '5 Stars',
  'Negative': '1 Star',
  'Neutral': '3 Stars',
  'Defect Rate': 'Problem Rate',

  // WALLET & PAYMENTS
  'Balance': 'Available Funds',
  'Credit': 'Balance',
  'Debit': 'Charge',
  'Transaction Fee': 'Service Fee',
  'Reserve Hold': 'Temporary Hold',
  'Payment Method': 'How to Pay',
  'Direct Deposit': 'Bank Transfer',
};

/**
 * TRANSLATE A TERM
 * 
 * Converts technical term to user-friendly language
 * Falls back to original if not found
 * 
 * Usage:
 * const friendly = translate('KYC'); // Returns "Identity Verification"
 * const html = `<span>${translate(technicalLabel)}</span>`;
 */
export function translate(
  technicalTerm: string,
  fallback: string = technicalTerm
): string {
  // Case-insensitive lookup (but preserve casing of result)
  for (const [technical, friendly] of Object.entries(TERM_MAP)) {
    if (technical.toLowerCase() === technicalTerm.toLowerCase()) {
      return friendly;
    }
  }

  // Return fallback if not found
  return fallback || technicalTerm;
}

/**
 * BATCH TRANSLATE OBJECT
 * 
 * Translates all string values in an object
 * Useful for API responses
 * 
 * Usage:
 * const userData = { kyc_status: 'pending', account_role: 'seller' };
 * const friendly = translateObject(userData);
 * // { kyc_status: 'Verification pending', account_role: 'Seller' }
 */
export function translateObject(obj: Record<string, any>): Record<string, any> {
  const result = { ...obj };

  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = translate(result[key]);
    }
  }

  return result;
}

/**
 * CONTEXT-AWARE TRANSLATION
 * 
 * Some terms mean different things in different contexts
 * 
 * Usage:
 * const text = translateWithContext('Settlement', 'seller'); 
 * // Returns "When Sellers Get Paid"
 */
export function translateWithContext(
  term: string,
  context: 'buyer' | 'seller' | 'admin' | 'general' = 'general'
): string {
  const contextMap: Record<string, Record<string, string>> = {
    buyer: {
      'Settlement': 'Purchase Confirmation',
      'Reserve': 'Minimum Bid',
      'Retract Bid': 'Cancel Your Bid',
    },
    seller: {
      'Settlement': 'When You Get Paid',
      'Reserve': 'Minimum Price Required',
      'Retract Bid': 'Seller Can\'t Retract Bids',
    },
    admin: {
      'Settlement': 'Payment Processing Period',
      'Reserve': 'Reserve Price',
      'Retract Bid': 'Bid Retraction Record',
    },
  };

  const contextedTerm = contextMap[context]?.[term];
  if (contextedTerm) {
    return contextedTerm;
  }

  // Fall back to general translation
  return translate(term);
}

/**
 * TRANSLATE ERROR MESSAGES
 * 
 * Makes error messages user-friendly
 * 
 * Usage:
 * try {
 *   await submitBid();
 * } catch (error) {
 *   const message = translateError(error.code);
 *   showToast(message);
 * }
 */
export function translateError(errorCode: string): string {
  const errorMap: Record<string, string> = {
    'AUTH_REQUIRED': 'Please log in to continue',
    'INSUFFICIENT_BALANCE': 'You don\'t have enough funds',
    'BID_TOO_LOW': 'Your bid is too low. Place a higher bid.',
    'AUCTION_CLOSED': 'This auction has ended',
    'INVALID_EMAIL': 'Please enter a valid email address',
    'PASSWORD_WEAK': 'Use a stronger password (8+ characters)',
    'ACCOUNT_LOCKED': 'Your account is locked. Contact support.',
    'VERIFICATION_REQUIRED': 'Please verify your identity first',
    'RATE_LIMITED': 'You\'re making requests too fast. Wait a moment.',
    'SERVER_ERROR': 'Something went wrong. Please try again.',
    'NETWORK_ERROR': 'No internet connection',
  };

  return errorMap[errorCode] || errorCode;
}

/**
 * PLACEHOLDER TEXT TRANSLATIONS
 * 
 * User-friendly placeholder text
 */
export const PLACEHOLDERS = {
  email: 'your@email.com',
  password: '••••••••',
  vehicleSearch: 'Search by make, model, or item number...',
  bidAmount: 'Enter your bid amount',
  message: 'Type your message here...',
  searchUsers: 'Search by name or email...',
  filterResults: 'Filter results...',
};

/**
 * LABEL TRANSLATIONS
 * 
 * Common form labels
 */
export const LABELS = {
  email: 'Email Address',
  password: 'Password',
  fullName: 'Full Name',
  phone: 'Phone Number',
  address: 'Street Address',
  city: 'City',
  state: 'State',
  zipCode: 'ZIP Code',
  country: 'Country',
  avatar: 'Profile Photo',
  bio: 'About You',
  language: 'Language Preference',
  currency: 'Currency',
};

/**
 * BUTTON TEXT TRANSLATIONS
 */
export const BUTTONS = {
  logIn: 'Log In',
  signUp: 'Create Account',
  logOut: 'Log Out',
  save: 'Save Changes',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  submit: 'Submit',
  tryAgain: 'Try Again',
  learnMore: 'Learn More',
  goBack: 'Go Back',
  continue: 'Continue',
};

/**
 * CONFIRMATION TEXT
 */
export const CONFIRMATIONS = {
  deleteAccount: 'Are you sure? This cannot be undone.',
  logOut: 'Are you sure you want to log out?',
  unsavedChanges: 'You have unsaved changes. Leave anyway?',
};

export default {
  TERM_MAP,
  PLACEHOLDERS,
  LABELS,
  BUTTONS,
  CONFIRMATIONS,
  translate,
  translateObject,
  translateWithContext,
  translateError,
};
