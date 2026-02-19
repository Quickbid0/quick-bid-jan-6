import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DTO for toy safety metadata
class ToyMetadataDto {
  productId: string;
  ageMin: number;
  ageMax?: number;
  material?: string;
  hasSmallParts: boolean = false;
  hasChokingHazard: boolean = false;
  warningLabel?: string;
  safetyCompliances: string[] = [];
  isRecalledByManufacturer?: boolean = false;
}

// Safety certification validator
const VALID_CERTIFICATIONS = [
  'CE',
  'ASTM',
  'ISO',
  'EN71',
  'CPSIA',
  'INDIAN_BUREAU_OF_STANDARDS',
];

const VALID_MATERIALS = [
  'plastic',
  'wood',
  'metal',
  'fabric',
  'rubber',
  'foam',
  'mixed',
];

@Controller('api/toys')
export class ToySafetyController {
  @Post('metadata')
  async createMetadata(
    @Body() dto: ToyMetadataDto,
    @Request() req: any,
  ) {
    // Validate seller ownership
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (product.sellerId !== req.user?.id) {
      throw new ForbiddenException('You do not own this product');
    }

    // Validate category
    if (product.category !== 'TOYS') {
      throw new BadRequestException('This product is not in the Toys category');
    }

    // Validate age range
    if (dto.ageMin < 0 || dto.ageMin > 240) {
      throw new BadRequestException('Minimum age must be between 0 and 240 months');
    }

    if (dto.ageMax && (dto.ageMax < dto.ageMin || dto.ageMax > 240)) {
      throw new BadRequestException('Maximum age must be between minimum age and 240 months');
    }

    // Validate material
    if (dto.material && !VALID_MATERIALS.includes(dto.material)) {
      throw new BadRequestException('Invalid material type');
    }

    // Validate certifications
    const invalidCerts = dto.safetyCompliances.filter(
      (c) => !VALID_CERTIFICATIONS.includes(c),
    );
    if (invalidCerts.length > 0) {
      throw new BadRequestException(
        `Invalid certifications: ${invalidCerts.join(', ')}`,
      );
    }

    // Check for recalls (ideally integrated with real recall database)
    if (dto.isRecalledByManufacturer) {
      throw new BadRequestException(
        'Recalled products cannot be listed. Please remove this item.',
      );
    }

    try {
      // Delete existing metadata if any
      await prisma.toyMetadata.deleteMany({
        where: { productId: dto.productId },
      });

      // Create new metadata
      const metadata = await prisma.toyMetadata.create({
        data: {
          productId: dto.productId,
          ageMin: dto.ageMin,
          ageMax: dto.ageMax,
          material: dto.material,
          hasSmallParts: dto.hasSmallParts,
          hasChokingHazard: dto.hasChokingHazard,
          warningLabel: dto.warningLabel,
          safetyCompliances: dto.safetyCompliances,
          isRecalledByManufacturer: false,
        },
      });

      return { success: true, metadata };
    } catch (error) {
      console.error('Error creating toy metadata:', error);
      throw new HttpException(
        'Failed to save toy safety information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':productId')
  async getMetadata(@Param('productId') productId: string) {
    try {
      const metadata = await prisma.toyMetadata.findUnique({
        where: { productId },
      });

      if (!metadata) {
        return { data: null, message: 'No safety metadata found' };
      }

      return metadata;
    } catch (error) {
      console.error('Error fetching toy metadata:', error);
      throw new HttpException(
        'Failed to fetch safety information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':productId')
  async updateMetadata(
    @Param('productId') productId: string,
    @Body() dto: Partial<ToyMetadataDto>,
    @Request() req: any,
  ) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (product.sellerId !== req.user?.id) {
      throw new ForbiddenException('You do not own this product');
    }

    try {
      const metadata = await prisma.toyMetadata.update({
        where: { productId },
        data: {
          ...(dto.ageMin !== undefined && { ageMin: dto.ageMin }),
          ...(dto.ageMax !== undefined && { ageMax: dto.ageMax }),
          ...(dto.material !== undefined && { material: dto.material }),
          ...(dto.hasSmallParts !== undefined && { hasSmallParts: dto.hasSmallParts }),
          ...(dto.hasChokingHazard !== undefined && { hasChokingHazard: dto.hasChokingHazard }),
          ...(dto.warningLabel !== undefined && { warningLabel: dto.warningLabel }),
          ...(dto.safetyCompliances && { safetyCompliances: dto.safetyCompliances }),
        },
      });

      return { success: true, metadata };
    } catch (error) {
      console.error('Error updating toy metadata:', error);
      throw new HttpException(
        'Failed to update safety information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':productId/validate')
  async validateToyProduct(@Param('productId') productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (product.category !== 'TOYS') {
        return { isValid: true, violations: [] };
      }

      const metadata = await prisma.toyMetadata.findUnique({
        where: { productId },
      });

      const violations: string[] = [];

      // Validation checks
      if (!metadata) {
        violations.push('Toy safety metadata is required');
      } else {
        if (metadata.isRecalledByManufacturer) {
          violations.push('Product has been recalled');
        }

        if (metadata.safetyCompliances.length === 0) {
          violations.push('At least one safety certification is required');
        }

        if (metadata.hasSmallParts && metadata.ageMin < 36) {
          violations.push('Products with small parts must have minimum age of 36 months');
        }

        if (metadata.hasChokingHazard && metadata.ageMin < 36) {
          violations.push('Products with choking hazards must have minimum age of 36 months');
        }

        if (!metadata.warningLabel && (metadata.hasSmallParts || metadata.hasChokingHazard)) {
          violations.push('Warning label required for products with hazards');
        }
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error validating toy product:', error);
      throw new HttpException(
        'Validation error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
