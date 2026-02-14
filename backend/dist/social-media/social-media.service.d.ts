interface SocialMediaPlatform {
    name: string;
    code: string;
    baseUrl: string;
    apiKey?: string;
    appId?: string;
    isActive: boolean;
    supportedFeatures: string[];
}
interface ShareOptions {
    platform: string;
    content: {
        title: string;
        description: string;
        imageUrl?: string;
        url: string;
        hashtags?: string[];
    };
    userId?: string;
}
interface ShareResult {
    success: boolean;
    shareId?: string;
    url?: string;
    message: string;
}
export declare class SocialMediaService {
    private platforms;
    private mockShares;
    shareAuction(options: ShareOptions): Promise<ShareResult>;
    getShareHistory(userId?: string): Promise<any[]>;
    getShareAnalytics(shareId: string): Promise<any>;
    getAvailablePlatforms(): SocialMediaPlatform[];
    generateShareUrl(platform: string, content: any): string;
    createAuctionShareContent(auctionData: any): Promise<ShareOptions['content']>;
    bulkShareAuction(auctionData: any, platforms: string[]): Promise<ShareResult[]>;
}
export {};
