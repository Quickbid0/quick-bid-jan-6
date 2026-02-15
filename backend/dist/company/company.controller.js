"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const auth_guard_1 = require("../auth/auth.guard");
const company_service_1 = require("./company.service");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const csv = __importStar(require("csv-parser"));
const xlsx = __importStar(require("xlsx"));
const stream_1 = require("stream");
let CompanyController = class CompanyController {
    constructor(companyService, prisma, auditService) {
        this.companyService = companyService;
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async registerCompany(companyData, req) {
        const adminId = req.user?.id;
        if (!adminId) {
            throw new common_1.BadRequestException('Admin authentication required');
        }
        return this.companyService.createCompany({
            companyName: companyData.companyName,
            companyType: companyData.companyType,
            registrationNumber: companyData.registrationNumber,
            gstNumber: companyData.gstNumber,
            createdByAdminId: adminId,
        });
    }
    async requestCompanyRegistration(requestData) {
        const { companyName, companyType, registrationNumber, gstNumber, contactPerson, contactEmail, contactPhone, businessAddress, } = requestData;
        const registrationRequest = {
            id: `req_${Date.now()}`,
            companyName,
            companyType,
            registrationNumber,
            gstNumber,
            contactPerson,
            contactEmail,
            contactPhone,
            businessAddress,
            status: 'pending',
            submittedAt: new Date(),
        };
        return {
            message: 'Company registration request submitted successfully',
            requestId: registrationRequest.id,
            status: 'pending',
            nextSteps: [
                'Super Admin will review your request within 24-48 hours',
                'You will receive an email confirmation once approved',
                'Account creation will be handled by our admin team',
            ],
        };
    }
    async approveRegistration(requestId, approvalData, req) {
        const adminId = req.user?.id;
        if (!adminId) {
            throw new common_1.BadRequestException('Admin authentication required');
        }
        const { companyName, companyType, registrationNumber, gstNumber, branchAllocation, securityLevel, ownerEmail, ownerName, } = approvalData;
        const company = await this.companyService.createCompany({
            companyName,
            companyType,
            registrationNumber,
            gstNumber,
            createdByAdminId: adminId,
        });
        const ownerUser = await this.companyService.createCompanyOwnerUser(company.id, {
            email: ownerEmail,
            name: ownerName,
            passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only',
        });
        await this.prisma.user.update({
            where: { id: ownerUser.id },
            data: {},
        });
        await this.auditService.logActivity({
            userId: adminId,
            action: 'COMPANY_OWNER_ACCOUNT_CREATED',
            resource: 'company',
            resourceId: company.id,
            category: 'admin',
            severity: 'high',
            method: 'POST',
            metadata: {
                companyId: company.id,
                ownerId: ownerUser.id,
                branchAllocation,
                securityLevel,
            },
        });
        return {
            message: 'Company registration approved and account created',
            company: {
                id: company.id,
                companyName: company.companyName,
                companyType: company.companyType,
                isVerified: company.isVerified,
                createdAt: company.createdAt,
            },
            ownerAccount: {
                id: ownerUser.id,
                email: ownerUser.email,
                name: ownerUser.name,
                role: ownerUser.role,
                companyId: ownerUser.companyId,
                temporaryPassword: 'TempPass123!',
            },
            branchAllocation,
            securityLevel,
        };
    }
    async createCompanyOwnerAccount(companyId, accountData, req) {
        const adminId = req.user?.id;
        if (!adminId) {
            throw new common_1.BadRequestException('Admin authentication required');
        }
        const { email, name, branchAllocation, securityLevel } = accountData;
        const company = await this.companyService.getCompanyById(companyId);
        if (!company) {
            throw new common_1.BadRequestException('Company not found');
        }
        const ownerUser = await this.companyService.createCompanyOwnerUser(companyId, {
            email,
            name,
            passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only',
        });
        await this.auditService.logActivity({
            userId: adminId,
            action: 'COMPANY_OWNER_ACCOUNT_CREATED',
            resource: 'company',
            resourceId: companyId,
            category: 'admin',
            severity: 'high',
            method: 'POST',
            metadata: {
                companyId,
                ownerId: ownerUser.id,
                branchAllocation,
                securityLevel,
            },
        });
        return {
            message: 'Company owner account created successfully',
            company: {
                id: company.id,
                companyName: company.companyName,
            },
            ownerAccount: {
                id: ownerUser.id,
                email: ownerUser.email,
                name: ownerUser.name,
                role: ownerUser.role,
                companyId: ownerUser.companyId,
                temporaryPassword: 'TempPass123!',
            },
            branchAllocation,
            securityLevel,
        };
    }
    async bulkUploadVehicles(file, req) {
        const userId = req.user?.id;
        const companyId = req.user?.companyId;
        if (!userId || !companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        let products = [];
        try {
            if (file.originalname.endsWith('.csv')) {
                products = await this.parseCSV(file.buffer);
            }
            else if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
                products = this.parseExcel(file.buffer);
            }
            else {
                throw new common_1.BadRequestException('Unsupported file format. Use CSV or Excel');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`File parsing error: ${error.message}`);
        }
        if (products.length === 0) {
            throw new common_1.BadRequestException('No valid products found in file');
        }
        return this.companyService.bulkUploadProducts(companyId, userId, products);
    }
    async parseCSV(buffer) {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = stream_1.Readable.from(buffer);
            stream
                .pipe(csv())
                .on('data', (data) => {
                try {
                    const product = {
                        vehicle_type: data.vehicle_type?.toLowerCase(),
                        brand: data.brand?.trim(),
                        model: data.model?.trim(),
                        registration_year: parseInt(data.registration_year),
                        base_price: parseFloat(data.base_price),
                        location: data.location?.trim(),
                        repo_status: data.repo_status?.trim(),
                        inspection_report: data.inspection_report?.trim(),
                        images: data.images ? data.images.split(',').map(img => img.trim()) : [],
                    };
                    results.push(product);
                }
                catch (error) {
                }
            })
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }
    parseExcel(buffer) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        return jsonData.map((row) => ({
            vehicle_type: row.vehicle_type?.toLowerCase(),
            brand: row.brand?.trim(),
            model: row.model?.trim(),
            registration_year: parseInt(row.registration_year),
            base_price: parseFloat(row.base_price),
            location: row.location?.trim(),
            repo_status: row.repo_status?.trim(),
            inspection_report: row.inspection_report?.trim(),
            images: row.images ? row.images.split(',').map(img => img.trim()) : [],
        }));
    }
    async approveBulkUpload(batchId, req) {
        const adminId = req.user?.id;
        if (!adminId) {
            throw new common_1.BadRequestException('Admin authentication required');
        }
        await this.companyService.approveBulkUpload(batchId, adminId);
        return { message: 'Bulk upload approved successfully' };
    }
    async getDashboard(req) {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        return {
            overview: {
                totalListings: 45,
                activeListings: 12,
                soldVehicles: 28,
                pendingApprovals: 5,
                totalRevenue: 2850000,
                monthlyRevenue: 450000
            },
            recentActivity: [
                { type: 'upload', title: 'Bulk upload processed', time: '2 hours ago' },
                { type: 'approval', title: 'Vehicles approved by admin', time: '4 hours ago' },
                { type: 'sale', title: 'Toyota Innova sold', time: '1 day ago' }
            ],
            analytics: {
                listingsByCategory: { car: 35, bike: 10 },
                salesByMonth: [320000, 380000, 420000, 450000],
                topPerformingListings: [
                    { title: 'Honda City 2020', views: 1250, bids: 45 },
                    { title: 'Maruti Swift 2019', views: 980, bids: 32 }
                ]
            }
        };
    }
    async getBulkUploadHistory(req) {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        return this.companyService.getBulkUploadHistory(companyId);
    }
    async getAnalytics(period = 'monthly', req) {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
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
                { category: 'bike', count: 10, revenue: 650000 }
            ]
        };
    }
    async getCompanies() {
        return this.companyService.getCompanies();
    }
    async addStaffMember(staffData, req) {
        const userId = req.user?.id;
        const companyId = req.user?.companyId;
        if (!userId || !companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        const { email, name, role } = staffData;
        const validRoles = ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        const staffMember = await this.companyService.addCompanyStaff(companyId, {
            email,
            name,
            passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only',
            role,
        });
        await this.auditService.logActivity({
            userId,
            action: 'COMPANY_STAFF_ADDED',
            resource: 'company',
            resourceId: companyId,
            category: 'admin',
            severity: 'medium',
            method: 'POST',
            metadata: {
                companyId,
                staffId: staffMember.id,
                staffEmail: staffMember.email,
                staffRole: staffMember.role,
            },
        });
        return {
            message: 'Staff member added successfully',
            staffMember: {
                id: staffMember.id,
                email: staffMember.email,
                name: staffMember.name,
                role: staffMember.role,
                companyId: staffMember.companyId,
                temporaryPassword: 'TempPass123!',
            },
        };
    }
    async getCompanyStaff(req) {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        const staffMembers = await this.prisma.user.findMany({
            where: {
                companyId,
                role: {
                    in: ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST', 'COMPANY_OWNER'],
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            staffMembers,
            totalCount: staffMembers.length,
        };
    }
    async updateStaffMember(staffId, updateData, req) {
        const userId = req.user?.id;
        const companyId = req.user?.companyId;
        if (!userId || !companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        const { role } = updateData;
        const validRoles = ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        const staffMember = await this.prisma.user.findFirst({
            where: {
                id: staffId,
                companyId,
            },
        });
        if (!staffMember) {
            throw new common_1.BadRequestException('Staff member not found in your company');
        }
        const updatedStaff = await this.prisma.user.update({
            where: { id: staffId },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                updatedAt: true,
            },
        });
        await this.auditService.logActivity({
            userId,
            action: 'COMPANY_STAFF_UPDATED',
            resource: 'company',
            resourceId: companyId,
            category: 'admin',
            severity: 'medium',
            method: 'PUT',
            metadata: {
                companyId,
                staffId,
                oldRole: staffMember.role,
                newRole: role,
            },
        });
        return {
            message: 'Staff member updated successfully',
            staffMember: updatedStaff,
        };
    }
    async removeStaffMember(staffId, req) {
        const userId = req.user?.id;
        const companyId = req.user?.companyId;
        if (!userId || !companyId) {
            throw new common_1.BadRequestException('Company authentication required');
        }
        const staffMember = await this.prisma.user.findFirst({
            where: {
                id: staffId,
                companyId,
            },
        });
        if (!staffMember) {
            throw new common_1.BadRequestException('Staff member not found in your company');
        }
        if (staffMember.role === 'COMPANY_OWNER') {
            throw new common_1.BadRequestException('Cannot remove company owner');
        }
        await this.prisma.user.update({
            where: { id: staffId },
            data: { status: 'DELETED' },
        });
        await this.auditService.logActivity({
            userId,
            action: 'COMPANY_STAFF_REMOVED',
            resource: 'company',
            resourceId: companyId,
            category: 'admin',
            severity: 'high',
            method: 'DELETE',
            metadata: {
                companyId,
                staffId,
                staffEmail: staffMember.email,
                staffRole: staffMember.role,
            },
        });
        return {
            message: 'Staff member removed successfully',
        };
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Company registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "registerCompany", null);
__decorate([
    (0, common_1.Post)('request-registration'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit company registration request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration request submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "requestCompanyRegistration", null);
__decorate([
    (0, common_1.Post)('approve-registration/:requestId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve company registration request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration approved and account created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "approveRegistration", null);
__decorate([
    (0, common_1.Post)('create-owner-account/:companyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create COMPANY_OWNER account for existing company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Owner account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "createCompanyOwnerAccount", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upload vehicles for company' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'CSV or Excel file containing vehicle data',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk upload processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or data format' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "bulkUploadVehicles", null);
__decorate([
    (0, common_1.Post)('approve-bulk-upload/:batchId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve bulk upload batch' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk upload approved' }),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "approveBulkUpload", null);
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
    (0, common_1.Get)('bulk-upload-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bulk upload history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload history retrieved' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getBulkUploadHistory", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics data retrieved' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all companies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Companies retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Post)('staff'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add staff member to company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Staff member added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "addStaffMember", null);
__decorate([
    (0, common_1.Get)('staff'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company staff members' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staff members retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyStaff", null);
__decorate([
    (0, common_1.Put)('staff/:staffId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update staff member role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staff member updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('staffId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "updateStaffMember", null);
__decorate([
    (0, common_1.Delete)('staff/:staffId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove staff member from company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staff member removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Param)('staffId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "removeStaffMember", null);
exports.CompanyController = CompanyController = __decorate([
    (0, swagger_1.ApiTags)('company'),
    (0, common_1.Controller)('company'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [company_service_1.CompanyService,
        prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map