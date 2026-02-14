"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
let ShippingService = class ShippingService {
    constructor() {
        this.providers = [
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
        this.mockRates = {
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
    }
    async getShippingRates(pickupPincode, deliveryPincode, weight, dimensions) {
        const allRates = [];
        Object.values(this.mockRates).forEach(rates => {
            allRates.push(...rates);
        });
        return allRates.sort((a, b) => a.cost - b.cost);
    }
    async createShipment(orderDetails) {
        const provider = this.providers.find(p => p.code === orderDetails.selectedRate.provider);
        if (!provider) {
            throw new Error('Shipping provider not found');
        }
        const mockTrackingNumber = `QM${Date.now().toString().slice(-8)}`;
        return {
            trackingNumber: mockTrackingNumber,
            labelUrl: `https://api.quickmela.com/shipping/labels/${mockTrackingNumber}.pdf`,
            provider: provider.name,
            service: orderDetails.selectedRate.service,
            cost: orderDetails.selectedRate.cost
        };
    }
    async trackShipment(trackingNumber) {
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
    async cancelShipment(trackingNumber) {
        return true;
    }
    getAvailableProviders() {
        return this.providers;
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)()
], ShippingService);
//# sourceMappingURL=shipping.service.js.map