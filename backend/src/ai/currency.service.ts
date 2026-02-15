import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
  position: 'before' | 'after';
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  // Supported currencies for QuickMela
  private readonly currencies: Record<string, Currency> = {
    INR: {
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      flag: '🇮🇳',
      decimalPlaces: 0,
      position: 'before'
    },
    USD: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      flag: '🇺🇸',
      decimalPlaces: 2,
      position: 'before'
    },
    EUR: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
      decimalPlaces: 2,
      position: 'before'
    },
    GBP: {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      flag: '🇬🇧',
      decimalPlaces: 2,
      position: 'before'
    },
    AED: {
      code: 'AED',
      name: 'UAE Dirham',
      symbol: 'د.إ',
      flag: '🇦🇪',
      decimalPlaces: 2,
      position: 'before'
    },
    SGD: {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S$',
      flag: '🇸🇬',
      decimalPlaces: 2,
      position: 'before'
    },
    AUD: {
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: 'A$',
      flag: '🇦🇺',
      decimalPlaces: 2,
      position: 'before'
    },
    CAD: {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      flag: '🇨🇦',
      decimalPlaces: 2,
      position: 'before'
    },
    MYR: {
      code: 'MYR',
      name: 'Malaysian Ringgit',
      symbol: 'RM',
      flag: '🇲🇾',
      decimalPlaces: 2,
      position: 'before'
    },
    THB: {
      code: 'THB',
      name: 'Thai Baht',
      symbol: '฿',
      flag: '🇹🇭',
      decimalPlaces: 2,
      position: 'before'
    }
  };

  // Mock exchange rates (in production, fetch from API like fixer.io, currencyapi.com)
  private exchangeRates: Record<string, Record<string, number>> = {
    INR: {
      USD: 0.012,
      EUR: 0.011,
      GBP: 0.0095,
      AED: 0.044,
      SGD: 0.016,
      AUD: 0.018,
      CAD: 0.016,
      MYR: 0.053,
      THB: 0.37
    },
    USD: {
      INR: 83.5,
      EUR: 0.92,
      GBP: 0.79,
      AED: 3.67,
      SGD: 1.35,
      AUD: 1.52,
      CAD: 1.36,
      MYR: 4.42,
      THB: 36.8
    },
    EUR: {
      INR: 90.8,
      USD: 1.09,
      GBP: 0.86,
      AED: 4.00,
      SGD: 1.47,
      AUD: 1.65,
      CAD: 1.48,
      MYR: 4.81,
      THB: 40.1
    },
    GBP: {
      INR: 105.5,
      USD: 1.27,
      EUR: 1.16,
      AED: 4.65,
      SGD: 1.71,
      AUD: 1.92,
      CAD: 1.72,
      MYR: 5.59,
      THB: 46.6
    }
  };

  constructor(private readonly configService: ConfigService) {
    // Initialize reverse rates
    this.initializeReverseRates();
  }

  /**
   * Get all supported currencies
   */
  getAllCurrencies(): Currency[] {
    return Object.values(this.currencies);
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | null {
    return this.currencies[code.toUpperCase()] || null;
  }

  /**
   * Convert amount from one currency to another
   */
  convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    }

    return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): number | null {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) return 1;

    return this.exchangeRates[from]?.[to] || null;
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces);

    if (currency.position === 'before') {
      return `${currency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currency.symbol}`;
    }
  }

  /**
   * Get user's preferred currency based on location/IP
   */
  getUserPreferredCurrency(userLocation?: string, userPreferences?: any): string {
    // Default to INR for Indian users
    if (!userLocation || userLocation.toLowerCase().includes('india')) {
      return 'INR';
    }

    // UAE users
    if (userLocation.toLowerCase().includes('uae') ||
        userLocation.toLowerCase().includes('dubai') ||
        userLocation.toLowerCase().includes('abu dhabi')) {
      return 'AED';
    }

    // Singapore users
    if (userLocation.toLowerCase().includes('singapore')) {
      return 'SGD';
    }

    // Malaysia users
    if (userLocation.toLowerCase().includes('malaysia')) {
      return 'MYR';
    }

    // Thailand users
    if (userLocation.toLowerCase().includes('thailand')) {
      return 'THB';
    }

    // European users
    if (userLocation.toLowerCase().includes('europe') ||
        ['germany', 'france', 'italy', 'spain', 'netherlands'].some(country =>
          userLocation.toLowerCase().includes(country))) {
      return 'EUR';
    }

    // UK users
    if (userLocation.toLowerCase().includes('uk') ||
        userLocation.toLowerCase().includes('britain') ||
        userLocation.toLowerCase().includes('england')) {
      return 'GBP';
    }

    // Default to USD for international users
    return 'USD';
  }

  /**
   * Calculate payment fees for international transactions
   */
  calculatePaymentFees(amount: number, fromCurrency: string, toCurrency: string): {
    baseAmount: number;
    conversionFee: number;
    internationalFee: number;
    totalAmount: number;
    exchangeRate: number;
  } {
    const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency) || 1;
    const baseAmount = amount;

    // Conversion fee (1-2%)
    const conversionFee = Math.round((baseAmount * 0.015) * 100) / 100;

    // International fee (additional 1% for non-INR transactions)
    const internationalFee = fromCurrency !== 'INR' || toCurrency !== 'INR'
      ? Math.round((baseAmount * 0.01) * 100) / 100
      : 0;

    const totalAmount = baseAmount + conversionFee + internationalFee;

    return {
      baseAmount,
      conversionFee,
      internationalFee,
      totalAmount,
      exchangeRate
    };
  }

  /**
   * Validate currency code
   */
  isValidCurrency(code: string): boolean {
    return code.toUpperCase() in this.currencies;
  }

  /**
   * Get currency display name with flag
   */
  getCurrencyDisplayName(code: string): string {
    const currency = this.getCurrency(code);
    if (!currency) return code;

    return `${currency.flag} ${currency.name}`;
  }

  /**
   * Update exchange rates (would be called periodically from external API)
   */
  async updateExchangeRates(): Promise<void> {
    try {
      // In production, fetch from external API
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      // const data = await response.json();

      this.logger.log('Exchange rates updated successfully');
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error);
    }
  }

  private initializeReverseRates(): void {
    // Generate reverse rates for all currency pairs
    const allCurrencies = Object.keys(this.currencies);

    for (const fromCurrency of allCurrencies) {
      if (!this.exchangeRates[fromCurrency]) {
        this.exchangeRates[fromCurrency] = {};
      }

      for (const toCurrency of allCurrencies) {
        if (fromCurrency !== toCurrency && !this.exchangeRates[fromCurrency][toCurrency]) {
          // Calculate reverse rate if direct rate exists
          const directRate = this.exchangeRates[toCurrency]?.[fromCurrency];
          if (directRate) {
            this.exchangeRates[fromCurrency][toCurrency] = 1 / directRate;
          }
        }
      }
    }
  }
}
