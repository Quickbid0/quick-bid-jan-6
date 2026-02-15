import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface BulkUploadProduct {
  vehicle_type: string;
  brand: string;
  model: string;
  registration_year: number;
  base_price: number;
  location: string;
  repo_status: string;
  inspection_report?: string;
  images?: string[];
}

export interface BulkUploadResult {
  successCount: number;
  failedCount: number;
  errors: string[];
  batchId: string;
}

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private prisma: PrismaService) {}

  async createCompany(data: {
    companyName: string;
    companyType: string;
    registrationNumber: string;
    gstNumber: string;
    createdByAdminId: string;
  }) {
    return this.prisma.company.create({
      data: {
        companyName: data.companyName,
        companyType: data.companyType,
        registrationNumber: data.registrationNumber,
        gstNumber: data.gstNumber,
        createdByAdminId: data.createdByAdminId,
      },
    });
  }

  async getCompanyById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        products: true,
      },
    });
  }

  async getCompanies() {
    return this.prisma.company.findMany({
      include: {
        users: true,
        products: true,
      },
    });
  }

  async bulkUploadProducts(
    companyId: string,
    userId: string,
    products: BulkUploadProduct[]
  ): Promise<BulkUploadResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        // Validate product data
        this.validateProductData(product);

        // Check for duplicates (basic check)
        await this.checkForDuplicates(product);

        // Create product
        await this.prisma.product.create({
          data: {
            title: `${product.brand} ${product.model} ${product.registration_year}`,
            description: `Repository vehicle: ${product.repo_status}`,
            category: product.vehicle_type,
            price: product.base_price,
            images: product.images || [],
            sellerId: userId,
            companyId: companyId,
            bulkUploadBatchId: batchId,
            uploadSource: 'bulk',
            status: 'pending_approval', // Not visible until admin approval
          },
        });

        successCount++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk upload completed: ${successCount} success, ${errors.length} failed`);

    return {
      successCount,
      failedCount: errors.length,
      errors,
      batchId,
    };
  }

  private validateProductData(product: BulkUploadProduct) {
    if (!product.vehicle_type || !['car', 'bike'].includes(product.vehicle_type)) {
      throw new BadRequestException('Invalid vehicle_type. Must be "car" or "bike"');
    }

    if (!product.brand || product.brand.trim().length === 0) {
      throw new BadRequestException('Brand is required');
    }

    if (!product.model || product.model.trim().length === 0) {
      throw new BadRequestException('Model is required');
    }

    if (!product.registration_year || product.registration_year < 1900 || product.registration_year > new Date().getFullYear() + 1) {
      throw new BadRequestException('Invalid registration year');
    }

    if (!product.base_price || product.base_price <= 0) {
      throw new BadRequestException('Invalid base price');
    }

    if (!product.location || product.location.trim().length === 0) {
      throw new BadRequestException('Location is required');
    }

    if (!product.repo_status || product.repo_status.trim().length === 0) {
      throw new BadRequestException('Repository status is required');
    }
  }

  private async checkForDuplicates(product: BulkUploadProduct) {
    // Basic duplicate check based on brand, model, year, and price
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        title: `${product.brand} ${product.model} ${product.registration_year}`,
        price: product.base_price,
      },
    });

    if (existingProduct) {
      throw new BadRequestException('Duplicate product detected');
    }
  }

  async approveBulkUpload(batchId: string, adminId: string) {
    // Update all products in the batch to 'active' status
    await this.prisma.product.updateMany({
      where: {
        bulkUploadBatchId: batchId,
        status: 'pending_approval',
      },
      data: {
        status: 'active',
      },
    });

    this.logger.log(`Bulk upload batch ${batchId} approved by admin ${adminId}`);
  }

  async getBulkUploadHistory(companyId: string) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        uploadSource: 'bulk',
      },
      select: {
        id: true,
        title: true,
        status: true,
        bulkUploadBatchId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createCompanyOwnerUser(companyId: string, userData: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash,
        name: userData.name,
        role: Role.COMPANY_OWNER,
        companyId,
        status: 'ACTIVE',
        emailVerified: 'VERIFIED',
      },
    });
  }

  async addCompanyStaff(companyId: string, userData: {
    email: string;
    name: string;
    passwordHash: string;
    role: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash,
        name: userData.name,
        role: userData.role as Role,
        companyId,
        status: 'ACTIVE',
        emailVerified: 'VERIFIED',
      },
    });
  }
}
