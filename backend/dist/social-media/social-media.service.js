"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaService = void 0;
const common_1 = require("@nestjs/common");
let SocialMediaService = class SocialMediaService {
    constructor() {
        this.platforms = [
            {
                name: 'Facebook',
                code: 'facebook',
                baseUrl: 'https://graph.facebook.com',
                appId: process.env.FACEBOOK_APP_ID,
                apiKey: process.env.FACEBOOK_APP_SECRET,
                isActive: true,
                supportedFeatures: ['share', 'post', 'page']
            },
            {
                name: 'Twitter/X',
                code: 'twitter',
                baseUrl: 'https://api.twitter.com/2',
                apiKey: process.env.TWITTER_BEARER_TOKEN,
                isActive: true,
                supportedFeatures: ['tweet', 'share']
            },
            {
                name: 'Instagram',
                code: 'instagram',
                baseUrl: 'https://graph.instagram.com',
                apiKey: process.env.INSTAGRAM_ACCESS_TOKEN,
                isActive: true,
                supportedFeatures: ['story', 'post']
            },
            {
                name: 'WhatsApp',
                code: 'whatsapp',
                baseUrl: 'https://api.whatsapp.com',
                isActive: true,
                supportedFeatures: ['share', 'message']
            },
            {
                name: 'LinkedIn',
                code: 'linkedin',
                baseUrl: 'https://api.linkedin.com/v2',
                apiKey: process.env.LINKEDIN_ACCESS_TOKEN,
                isActive: true,
                supportedFeatures: ['share', 'post']
            },
            {
                name: 'Telegram',
                code: 'telegram',
                baseUrl: 'https://api.telegram.org',
                apiKey: process.env.TELEGRAM_BOT_TOKEN,
                isActive: true,
                supportedFeatures: ['share', 'channel']
            }
        ];
        this.mockShares = [];
    }
    async shareAuction(options) {
        const platform = this.platforms.find(p => p.code === options.platform);
        if (!platform) {
            return {
                success: false,
                message: 'Platform not supported'
            };
        }
        if (!platform.isActive) {
            return {
                success: false,
                message: 'Platform is currently disabled'
            };
        }
        try {
            const shareId = `SHARE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.mockShares.push({
                id: shareId,
                platform: options.platform,
                content: options.content,
                userId: options.userId,
                timestamp: new Date(),
                status: 'posted'
            });
            return {
                success: true,
                shareId,
                url: this.generateShareUrl(options.platform, shareId),
                message: `Successfully shared on ${platform.name}!`
            };
        }
        catch (error) {
            console.error(`Error sharing to ${options.platform}:`, error);
            return {
                success: false,
                message: `Failed to share on ${platform.name}. Please try again.`
            };
        }
    }
    async getShareHistory(userId) {
        if (userId) {
            return this.mockShares.filter(share => share.userId === userId);
        }
        return this.mockShares;
    }
    async getShareAnalytics(shareId) {
        const share = this.mockShares.find(s => s.id === shareId);
        if (!share) {
            throw new Error('Share not found');
        }
        return {
            shareId,
            platform: share.platform,
            views: Math.floor(Math.random() * 1000) + 100,
            clicks: Math.floor(Math.random() * 100) + 10,
            shares: Math.floor(Math.random() * 50) + 5,
            likes: Math.floor(Math.random() * 200) + 20,
            timestamp: share.timestamp
        };
    }
    getAvailablePlatforms() {
        return this.platforms.filter(platform => platform.isActive);
    }
    generateShareUrl(platform, content) {
        const baseUrl = content.url;
        const title = encodeURIComponent(content.title);
        const description = encodeURIComponent(content.description || '');
        const hashtags = content.hashtags ? content.hashtags.join(',') : '';
        switch (platform) {
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${title}`;
            case 'twitter':
                const twitterText = `${title} ${hashtags ? '#' + hashtags.split(',').join(' #') : ''} ${baseUrl}`;
                return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
            case 'whatsapp':
                return `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${baseUrl}`)}`;
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
            case 'telegram':
                return `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(title)}`;
            default:
                return baseUrl;
        }
    }
    async createAuctionShareContent(auctionData) {
        const { id, title, description, current_price, image_url } = auctionData;
        const auctionUrl = `${process.env.FRONTEND_URL || 'https://quickmela.com'}/product/${id}`;
        return {
            title: `🔥 ${title} - Only ₹${current_price.toLocaleString()}!`,
            description: `${description}\n\nBid now on QuickMela - India's trusted auction platform!\n\n#QuickMela #Auctions #Bidding #${title.replace(/\s+/g, '')}`,
            imageUrl: image_url,
            url: auctionUrl,
            hashtags: ['QuickMela', 'Auctions', 'Bidding', 'OnlineAuction', 'Deal']
        };
    }
    async bulkShareAuction(auctionData, platforms) {
        const content = await this.createAuctionShareContent(auctionData);
        const results = [];
        for (const platform of platforms) {
            const result = await this.shareAuction({
                platform,
                content,
                userId: auctionData.sellerId
            });
            results.push(result);
        }
        return results;
    }
};
exports.SocialMediaService = SocialMediaService;
exports.SocialMediaService = SocialMediaService = __decorate([
    (0, common_1.Injectable)()
], SocialMediaService);
//# sourceMappingURL=social-media.service.js.map