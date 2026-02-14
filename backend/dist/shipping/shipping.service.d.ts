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
export declare class ShippingService {
    private providers;
    private mockRates;
    getShippingRates(pickupPincode: string, deliveryPincode: string, weight: number, dimensions?: {
        length: number;
        width: number;
        height: number;
    }): Promise<ShippingRate[]>;
    createShipment(orderDetails: {
        pickupAddress: any;
        deliveryAddress: any;
        packageDetails: any;
        selectedRate: ShippingRate;
    }): Promise<ShippingLabel>;
    trackShipment(trackingNumber: string): Promise<any>;
    cancelShipment(trackingNumber: string): Promise<boolean>;
    getAvailableProviders(): ShippingProvider[];
}
export {};
