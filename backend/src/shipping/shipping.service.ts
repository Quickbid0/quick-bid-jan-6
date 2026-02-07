import { Injectable } from '@nestjs/common';

interface ShippingProvider {
  name: string;
  code: string;
  baseUrl: string;
  apiKey: string;
  supportedServices: string[];
  trackingUrl: string;
}

interface ShippingRate {
  provider: string;
  service: string;
  cost: number;
  estimatedDays: number;
  description: string;
}

interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  provider: string;
  service: string;
  cost: number;
}

@Injectable()
export class ShippingService {
  private providers: ShippingProvider[] = [
    {
      name: 'Delhivery',
      code: 'delhivery',
      baseUrl: 'https://track.delhivery.com/api',
      apiKey: process.env.DELHIVERY_API_KEY || 'demo_key',
      supportedServices: ['standard', 'express', 'premium'],
      trackingUrl: 'https://www.delhivery.com/tracking'
    },
    {
      name: 'Shiprocket',
      code: 'shiprocket',
      baseUrl: 'https://apiv2.shiprocket.in/v1',
      apiKey: process.env.SHIPROCKET_API_KEY || 'demo_key',
      supportedServices: ['standard', 'express', 'surface'],
      trackingUrl: 'https://shiprocket.in/tracking'
    },
    {
      name: 'FedEx',
      code: 'fedex',
      baseUrl: 'https://apis.fedex.com',
      apiKey: process.env.FEDEX_API_KEY || 'demo_key',
      supportedServices: ['ground', 'express', 'priority'],
      trackingUrl: 'https://www.fedex.com/en-in/tracking.html'
    }
  ];

  // Mock shipping rates for demo
  private mockRates: Record<string, ShippingRate[]> = {
    'standard': [
      { provider: 'delhivery', service: 'Standard Delivery', cost: 150, estimatedDays: 3, description: '3-5 business days' },
      { provider: 'shiprocket', service: 'Economy', cost: 120, estimatedDays: 4, description: '4-6 business days' },
      { provider: 'fedex', service: 'Ground', cost: 200, estimatedDays: 2, description: '2-3 business days' }
    ],
    'express': [
      { provider: 'delhivery', service: 'Express Delivery', cost: 300, estimatedDays: 1, description: 'Next business day' },
      { provider: 'shiprocket', service: 'Express', cost: 280, estimatedDays: 1, description: '1-2 business days' },
      { provider: 'fedex', service: 'Express Saver', cost: 350, estimatedDays: 1, description: 'Next business day' }
    ],
    'premium': [
      { provider: 'delhivery', service: 'Premium Delivery', cost: 500, estimatedDays: 1, description: 'Same day delivery' },
      { provider: 'shiprocket', service: 'Premium', cost: 480, estimatedDays: 1, description: 'Same day delivery' },
      { provider: 'fedex', service: 'Priority Overnight', cost: 600, estimatedDays: 1, description: 'Overnight delivery' }
    ]
  };

  async getShippingRates(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number,
    dimensions?: { length: number; width: number; height: number }
  ): Promise<ShippingRate[]> {
    // In production, this would call actual shipping provider APIs
    // For demo, return mock rates based on service type
    const allRates: ShippingRate[] = [];

    Object.values(this.mockRates).forEach(rates => {
      allRates.push(...rates);
    });

    // Sort by cost
    return allRates.sort((a, b) => a.cost - b.cost);
  }

  async createShipment(
    orderDetails: {
      pickupAddress: any;
      deliveryAddress: any;
      packageDetails: any;
      selectedRate: ShippingRate;
    }
  ): Promise<ShippingLabel> {
    const provider = this.providers.find(p => p.code === orderDetails.selectedRate.provider);

    if (!provider) {
      throw new Error('Shipping provider not found');
    }

    // In production, this would create actual shipment with the provider
    // For demo, return mock shipping label
    const mockTrackingNumber = `QM${Date.now().toString().slice(-8)}`;

    return {
      trackingNumber: mockTrackingNumber,
      labelUrl: `https://api.quickmela.com/shipping/labels/${mockTrackingNumber}.pdf`,
      provider: provider.name,
      service: orderDetails.selectedRate.service,
      cost: orderDetails.selectedRate.cost
    };
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    // In production, this would call the actual provider's tracking API
    // For demo, return mock tracking data
    return {
      trackingNumber,
      status: 'In Transit',
      location: 'Mumbai, Maharashtra',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      updates: [
        {
          status: 'Order Placed',
          location: 'QuickMela Warehouse',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          status: 'Picked Up',
          location: 'Mumbai Hub',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          status: 'In Transit',
          location: 'Mumbai, Maharashtra',
          timestamp: new Date()
        }
      ]
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    // In production, this would cancel the shipment with the provider
    // For demo, always return success
    return true;
  }

  getAvailableProviders(): ShippingProvider[] {
    return this.providers;
  }
}
