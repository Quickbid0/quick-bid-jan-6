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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let CompanyController = class CompanyController {
    constructor() {
        this.companies = new Map();
        this.nextCompanyId = 1;
        this.initializeSampleCompanies();
    }
    initializeSampleCompanies() {
        const sampleCompanies = [
            {
                companyName: 'AutoDeal Pvt Ltd',
                email: 'contact@autodeal.com',
                phone: '9876543210',
                gstin: 'GSTIN1234567890',
                pan: 'PANABCDE1234F',
                businessType: 'Authorized Dealer',
                subscriptionTier: 'Premium',
                status: 'verified',
                createdAt: new Date()
            },
            {
                companyName: 'CarWorld Enterprises',
                email: 'info@carworld.com',
                phone: '9876543211',
                gstin: 'GSTIN0987654321',
                pan: 'PANXYZDE5678G',
                businessType: 'Multi-brand',
                subscriptionTier: 'Standard',
                status: 'verified',
                createdAt: new Date()
            }
        ];
        sampleCompanies.forEach(company => {
            this.companies.set(company.email, {
                id: (this.nextCompanyId++).toString(),
                ...company,
                address: {
                    line1: 'Business Address',
                    line2: 'Sector 1',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India'
                },
                contactPerson: {
                    name: 'Contact Person',
                    email: company.email,
                    phone: company.phone,
                    designation: 'Director'
                },
                documents: {
                    gstinCertificate: 'gstin_cert.pdf',
                    panCertificate: 'pan_cert.pdf',
                    incorporationCertificate: 'inc_cert.pdf',
                    addressProof: 'address_proof.pdf'
                },
                subscription: {
                    tier: company.subscriptionTier,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    features: this.getFeaturesByTier(company.subscriptionTier),
                    limits: this.getLimitsByTier(company.subscriptionTier)
                }
            });
        });
    }
    getFeaturesByTier(tier) {
        const features = {
            'Basic': ['Basic listings', 'Standard support', 'Monthly reports'],
            'Standard': ['Bulk listings', 'Priority support', 'Weekly reports', 'Analytics'],
            'Premium': ['Unlimited listings', '24/7 support', 'Real-time analytics', 'API access', 'Dedicated account manager'],
            'Enterprise': ['Custom solutions', 'White-label options', 'Full API access', 'Custom integrations', 'On-premise option']
        };
        return features[tier] || features['Basic'];
    }
    getLimitsByTier(tier) {
        const limits = {
            'Basic': { listings: 10, users: 2, storage: '1GB' },
            'Standard': { listings: 100, users: 10, storage: '10GB' },
            'Premium': { listings: 1000, users: 50, storage: '100GB' },
            'Enterprise': { listings: 'Unlimited', users: 'Unlimited', storage: 'Unlimited' }
        };
        return limits[tier] || limits['Basic'];
    }
    async registerCompany(companyData) {
        const { companyName, email, phone, gstin, pan, businessType, subscriptionTier } = companyData;
        if (this.companies.has(email)) {
            throw new Error('Company already registered');
        }
        const newCompany = {
            id: (this.nextCompanyId++).toString(),
            companyName,
            email,
            phone,
            gstin,
            pan,
            businessType,
            subscriptionTier: subscriptionTier || 'Basic',
            status: 'pending',
            createdAt: new Date(),
            address: companyData.address || {},
            contactPerson: companyData.contactPerson || {},
            documents: companyData.documents || {},
            subscription: {
                tier: subscriptionTier || 'Basic',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                features: this.getFeaturesByTier(subscriptionTier || 'Basic'),
                limits: this.getLimitsByTier(subscriptionTier || 'Basic')
            }
        };
        this.companies.set(email, newCompany);
        return {
            message: 'Company registration successful',
            company: {
                id: newCompany.id,
                companyName: newCompany.companyName,
                email: newCompany.email,
                status: newCompany.status,
                subscriptionTier: newCompany.subscriptionTier
            }
        };
    }
    async bulkRegister(bulkData) {
        const { companyName, contactEmail, users } = bulkData;
        const companyResult = await this.registerCompany({
            companyName,
            email: contactEmail,
            phone: '9876543210',
            gstin: 'BULK' + Date.now(),
            pan: 'BULK' + Date.now(),
            businessType: 'Bulk Registration',
            subscriptionTier: 'Standard'
        });
        return {
            message: 'Bulk registration successful',
            company: companyResult.company,
            usersRegistered: users.length,
            userCredentials: users.map(user => ({
                email: user.email,
                name: user.name,
                role: user.role,
                temporaryPassword: 'BulkPass123!'
            }))
        };
    }
    async getDashboard(req) {
        return {
            overview: {
                totalListings: 45,
                activeListings: 12,
                soldVehicles: 28,
                pendingBids: 15,
                totalRevenue: 2850000,
                monthlyRevenue: 450000
            },
            recentActivity: [
                { type: 'listing', title: 'Honda City listed', time: '2 hours ago' },
                { type: 'bid', title: 'New bid on Maruti Swift', time: '4 hours ago' },
                { type: 'sale', title: 'Toyota Innova sold', time: '1 day ago' }
            ],
            analytics: {
                listingsByCategory: { car: 35, suv: 8, mpv: 2 },
                salesByMonth: [320000, 380000, 420000, 450000],
                topPerformingListings: [
                    { title: 'Honda City 2020', views: 1250, bids: 45 },
                    { title: 'Maruti Swift 2019', views: 980, bids: 32 }
                ]
            },
            subscription: {
                tier: 'Premium',
                usedListings: 45,
                totalListings: 1000,
                usedUsers: 8,
                totalUsers: 50,
                daysRemaining: 285
            }
        };
    }
    async getAnalytics(period = 'monthly') {
        return {
            period,
            revenue: {
                total: 2850000,
                growth: 15.5,
                byMonth: [
                    { month: 'Jan', revenue: 320000 },
                    { month: 'Feb', revenue: 380000 },
                    { month: 'Mar', revenue: 420000 },
                    { month: 'Apr', revenue: 450000 }
                ]
            },
            listings: {
                total: 45,
                active: 12,
                sold: 28,
                averageSalePrice: 95000,
                averageTimeToSale: 14
            },
            performance: {
                conversionRate: 68.5,
                averageViewsPerListing: 850,
                averageBidsPerListing: 12,
                customerSatisfaction: 4.8
            },
            topCategories: [
                { category: 'car', count: 35, revenue: 2200000 },
                { category: 'suv', count: 8, revenue: 550000 },
                { category: 'mpv', count: 2, revenue: 100000 }
            ]
        };
    }
    async getCompanies() {
        const companies = Array.from(this.companies.values()).map(company => ({
            id: company.id,
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            businessType: company.businessType,
            subscriptionTier: company.subscriptionTier,
            status: company.status,
            createdAt: company.createdAt
        }));
        return { companies };
    }
    async getCompany(req) {
        const companyId = req.params.id;
        for (const [email, company] of this.companies.entries()) {
            if (company.id === companyId) {
                return {
                    company: {
                        id: company.id,
                        companyName: company.companyName,
                        email: company.email,
                        phone: company.phone,
                        gstin: company.gstin,
                        pan: company.pan,
                        businessType: company.businessType,
                        subscriptionTier: company.subscriptionTier,
                        status: company.status,
                        address: company.address,
                        contactPerson: company.contactPerson,
                        subscription: company.subscription,
                        createdAt: company.createdAt
                    }
                };
            }
        }
        throw new Error('Company not found');
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Company registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "registerCompany", null);
__decorate([
    (0, common_1.Post)('bulk-register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk register company and users' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "bulkRegister", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics data retrieved' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all companies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Companies retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company retrieved' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompany", null);
exports.CompanyController = CompanyController = __decorate([
    (0, swagger_1.ApiTags)('company'),
    (0, common_1.Controller)('company'),
    __metadata("design:paramtypes", [])
], CompanyController);
//# sourceMappingURL=company.controller.js.map