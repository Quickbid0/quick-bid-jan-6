"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.products = [
            {
                id: 1,
                title: 'Vintage Watch Collection - Reserve Auction',
                description: 'A beautiful collection of vintage watches from 1960s',
                auctionType: {
                    type: 'reserve',
                    startingPrice: 10000,
                    reservePrice: 18000,
                    bidIncrement: 1000,
                    duration: 24 * 60 * 60 * 1000,
                },
                currentBid: 15000,
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                images: ['https://picsum.photos/seed/watch1/400/300.jpg'],
                category: 'Watches',
                condition: 'Excellent',
                seller: { id: 'seller1', name: 'John Doe', email: 'john@example.com' },
                highestBid: { amount: 15000, bidder: { id: 'bidder1', name: 'Jane Smith' } },
                bidCount: 5,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                title: 'Rare Book Collection - Dutch Auction',
                description: 'First edition books from renowned authors - Dutch auction starting at ₹10,000',
                auctionType: {
                    type: 'dutch',
                    startingPrice: 10000,
                    bidIncrement: 500,
                    duration: 2 * 60 * 60 * 1000,
                    dutchDecrement: 100,
                    dutchInterval: 5 * 60 * 1000,
                },
                currentBid: 10000,
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                images: ['https://picsum.photos/seed/books1/400/300.jpg'],
                category: 'Books',
                condition: 'Good',
                seller: { id: 'seller2', name: 'Jane Smith', email: 'jane@example.com' },
                highestBid: null,
                bidCount: 0,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                title: 'Bulk Electronics Purchase - Tender Auction',
                description: 'Tender for bulk purchase of electronics - minimum order 50 units',
                auctionType: {
                    type: 'tender',
                    startingPrice: 50000,
                    minimumBid: 45000,
                    bidIncrement: 1000,
                    duration: 7 * 24 * 60 * 60 * 1000,
                },
                currentBid: 50000,
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                images: ['https://picsum.photos/seed/electronics/400/300.jpg'],
                category: 'Electronics',
                condition: 'New',
                seller: { id: 'seller3', name: 'Tech Corp', email: 'sales@techcorp.com' },
                highestBid: null,
                bidCount: 0,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        this.userProfiles = [
            { id: 'seller1', user_type: 'seller', is_verified: true, verification_status: 'approved' },
            { id: 'seller2', user_type: 'seller', is_verified: false, verification_status: 'pending' },
            { id: 'buyer1', user_type: 'buyer', is_verified: true, verification_status: 'approved' },
        ];
        this.bids = [
            { id: 1, productId: 1, amount: 15000, bidderId: 'bidder1', bidderName: 'Jane Smith', createdAt: new Date() },
            { id: 2, productId: 1, amount: 12000, bidderId: 'bidder2', bidderName: 'Bob Johnson', createdAt: new Date() },
            { id: 3, productId: 2, amount: 7500, bidderId: 'bidder2', bidderName: 'Bob Johnson', createdAt: new Date() }
        ];
        this.wallets = [
            { userId: 'buyer1', balance: 50000, currency: 'INR' },
            { userId: 'buyer2', balance: 25000, currency: 'INR' },
            { userId: 'seller1', balance: 100000, currency: 'INR' },
            { userId: 'seller2', balance: 75000, currency: 'INR' },
            { userId: 'bidder1', balance: 30000, currency: 'INR' },
            { userId: 'bidder2', balance: 20000, currency: 'INR' }
        ];
    }
    async findAll() {
        return this.prisma.product.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
    }
    async findOne(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) {
            return null;
        }
        const productBids = this.bids
            .filter(bid => bid.productId === id)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);
        return {
            ...product,
            bids: productBids,
            status: product.endTime > new Date() ? 'ACTIVE' : 'CLOSED'
        };
    }
    async create(createProductDto, sellerId) {
        const newProduct = {
            id: this.products.length + 1,
            ...createProductDto,
            auctionType: createProductDto.auctionType || { type: 'standard', startingPrice: createProductDto.startingPrice, bidIncrement: 1000, duration: 7 * 24 * 60 * 60 * 1000 },
            sellerId,
            currentBid: createProductDto.startingPrice,
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            seller: { id: sellerId, name: 'Demo Seller', email: 'seller@example.com' },
            bidCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.products.push(newProduct);
        return newProduct;
    }
    async placeBid(productId, bidAmount, bidderId, bidderName) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.endTime <= new Date()) {
            throw new Error('Auction has ended');
        }
        const auctionType = product.auctionType || { type: 'standard', startingPrice: product.currentBid || 0, bidIncrement: 1000 };
        switch (auctionType.type) {
            case 'reserve':
                if ('reservePrice' in auctionType && auctionType.reservePrice && bidAmount < auctionType.reservePrice) {
                    throw new Error(`Bid must be at least ₹${auctionType.reservePrice}. This is a reserve auction.`);
                }
                break;
            case 'dutch':
                const currentDutchPrice = this.calculateDutchPrice(product);
                if (bidAmount < currentDutchPrice) {
                    throw new Error(`Dutch auction bid must be at least the current price of ₹${currentDutchPrice}`);
                }
                bidAmount = currentDutchPrice;
                break;
            case 'tender':
                if ('minimumBid' in auctionType && auctionType.minimumBid && bidAmount > auctionType.minimumBid) {
                    throw new Error(`Tender bid must be ₹${auctionType.minimumBid} or lower`);
                }
                if (product.highestBid && bidAmount >= product.highestBid.amount) {
                    throw new Error('Tender bid must be lower than current lowest bid');
                }
                break;
            case 'standard':
            default:
                if (bidAmount <= product.currentBid) {
                    throw new Error('Bid must be higher than current bid');
                }
                break;
        }
        const wallet = this.wallets.find(w => w.userId === bidderId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        if (wallet.balance < bidAmount) {
            throw new Error('Insufficient wallet balance');
        }
        const shouldUpdateBid = auctionType.type !== 'reserve' || ('reservePrice' in auctionType && bidAmount >= (auctionType.reservePrice || 0));
        if (shouldUpdateBid) {
            wallet.balance -= bidAmount;
            if (product.highestBid && product.highestBid.bidder.id !== bidderId) {
                const previousBidderWallet = this.wallets.find(w => w.userId === product.highestBid.bidder.id);
                if (previousBidderWallet) {
                    previousBidderWallet.balance += product.currentBid;
                }
            }
            product.currentBid = bidAmount;
            product.highestBid = { amount: bidAmount, bidder: { id: bidderId, name: bidderName } };
        }
        const newBid = {
            id: this.bids.length + 1,
            productId,
            amount: bidAmount,
            bidderId,
            bidderName,
            createdAt: new Date()
        };
        this.bids.push(newBid);
        product.bidCount = this.bids.filter(b => b.productId === productId).length;
        product.updatedAt = new Date();
        return newBid;
    }
    calculateDutchPrice(product) {
        const auctionType = product.auctionType;
        if (auctionType.type !== 'dutch' || !auctionType.dutchDecrement || !auctionType.dutchInterval)
            return product.currentBid;
        const elapsed = Date.now() - product.createdAt.getTime();
        const intervalsPassed = Math.floor(elapsed / auctionType.dutchInterval);
        const priceDecrease = intervalsPassed * auctionType.dutchDecrement;
        const currentPrice = Math.max(auctionType.startingPrice - priceDecrease, 1000);
        return currentPrice;
    }
    async getWalletBalance(userId) {
        const wallet = this.wallets.find(w => w.userId === userId);
        return wallet ? wallet.balance : 0;
    }
    async addWalletFunds(userId, amount) {
        const wallet = this.wallets.find(w => w.userId === userId);
        if (!wallet) {
            this.wallets.push({ userId, balance: amount, currency: 'INR' });
            return { success: true, newBalance: amount };
        }
        wallet.balance += amount;
        return { success: true, newBalance: wallet.balance };
    }
    async bulkCreate(bulkProductDto, sellerId) {
        const { quantity = 1, ...productData } = bulkProductDto;
        const createdProducts = [];
        for (let i = 0; i < quantity; i++) {
            const newProduct = {
                id: this.products.length + 1,
                title: `${productData.title} #${i + 1}`,
                description: productData.description,
                startingPrice: productData.startingBid || productData.startingPrice,
                currentBid: productData.startingBid || productData.startingPrice,
                buyNowPrice: productData.buyNowPrice,
                auctionType: { type: 'standard', startingPrice: productData.startingPrice, bidIncrement: 1000, duration: 7 * 24 * 60 * 60 * 1000 },
                endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                images: productData.images || ['https://picsum.photos/seed/product/400/300.jpg'],
                category: productData.category || 'Other',
                condition: productData.condition || 'Good',
                fuel: productData.fuel,
                transmission: productData.transmission,
                year: productData.year,
                mileage: productData.mileage,
                seller: {
                    id: sellerId,
                    name: 'Company Seller',
                    email: 'company@quickmela.com'
                },
                highestBid: null,
                bidCount: 0,
                status: 'ACTIVE',
                isBulkListing: true,
                bulkQuantity: quantity,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.products.push(newProduct);
            createdProducts.push(newProduct);
        }
        return {
            message: `Successfully created ${quantity} products`,
            products: createdProducts
        };
    }
    async getMyProducts(sellerId) {
        const sellerProducts = this.products.filter(product => product.seller.id === sellerId);
        return {
            products: sellerProducts,
            total: sellerProducts.length,
            active: sellerProducts.filter(p => p.status === 'ACTIVE').length,
            sold: sellerProducts.filter(p => p.status === 'SOLD').length
        };
    }
    async verifySeller(sellerId) {
        const profile = this.userProfiles.find(p => p.id === sellerId);
        if (!profile) {
            throw new Error('User not found');
        }
        if (profile.user_type !== 'seller') {
            throw new Error('Only sellers can create product listings');
        }
        if (!profile.is_verified || profile.verification_status !== 'approved') {
            throw new Error('Seller account must be verified before creating products. Please complete the verification process.');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map