import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VehicleInspectionService, InspectionUploadData } from '../ai/vehicle-inspection.service';

@ApiTags('vehicle-inspection')
@Controller('vehicle-inspection')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleInspectionController {
  constructor(private readonly inspectionService: VehicleInspectionService) {}

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images360', 36)) // Allow up to 36 images for 360° view
  @ApiOperation({ summary: 'Create vehicle inspection with 360° images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images360: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: '360° inspection images (up to 36 images)',
        },
        mileage: { type: 'number', description: 'Vehicle mileage' },
        serviceHistory: { type: 'string', description: 'Service history details' },
        accidentHistory: { type: 'string', description: 'Accident history details' },
        ownershipHistory: { type: 'string', description: 'Ownership history details' },
        inspectionNotes: { type: 'string', description: 'Additional inspection notes' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Inspection created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid data' })
  async createInspection(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one 360° image is required');
    }

    if (files.length > 36) {
      throw new BadRequestException('Maximum 36 images allowed for 360° inspection');
    }

    // In a real implementation, upload images to cloud storage and get URLs
    // For now, simulate image URLs
    const images360 = files.map((file, index) =>
      `https://inspection-images.quickmela.com/${productId}/360/${index + 1}.jpg`
    );

    const uploadData: InspectionUploadData = {
      productId,
      images360,
      mileage: body.mileage ? parseInt(body.mileage) : undefined,
      serviceHistory: body.serviceHistory,
      accidentHistory: body.accidentHistory,
      ownershipHistory: body.ownershipHistory,
      inspectionNotes: body.inspectionNotes,
    };

    return this.inspectionService.createInspection(productId, uploadData, userId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get vehicle inspection details' })
  @ApiResponse({ status: 200, description: 'Inspection details retrieved' })
  @ApiResponse({ status: 404, description: 'Inspection not found' })
  async getInspection(@Param('productId') productId: string) {
    const inspection = await this.inspectionService.getInspection(productId);

    if (!inspection) {
      throw new BadRequestException('Inspection not found for this product');
    }

    return inspection;
  }

  @Put(':inspectionId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images360', 36))
  @ApiOperation({ summary: 'Update vehicle inspection' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images360: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Updated 360° inspection images',
        },
        mileage: { type: 'number', description: 'Updated vehicle mileage' },
        serviceHistory: { type: 'string', description: 'Updated service history' },
        accidentHistory: { type: 'string', description: 'Updated accident history' },
        ownershipHistory: { type: 'string', description: 'Updated ownership history' },
        inspectionNotes: { type: 'string', description: 'Updated inspection notes' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Inspection updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid data' })
  async updateInspection(
    @Param('inspectionId') inspectionId: string,
    @UploadedFiles() files?: Express.Multer.File[],
    @Body() body: any,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    const updateData: Partial<InspectionUploadData> = {
      mileage: body.mileage ? parseInt(body.mileage) : undefined,
      serviceHistory: body.serviceHistory,
      accidentHistory: body.accidentHistory,
      ownershipHistory: body.ownershipHistory,
      inspectionNotes: body.inspectionNotes,
    };

    // Handle image updates
    if (files && files.length > 0) {
      if (files.length > 36) {
        throw new BadRequestException('Maximum 36 images allowed for 360° inspection');
      }

      // Simulate image URLs
      updateData.images360 = files.map((file, index) =>
        `https://inspection-images.quickmela.com/${inspectionId}/360/${Date.now()}_${index + 1}.jpg`
      );
    }

    return this.inspectionService.updateInspection(inspectionId, updateData, userId);
  }

  @Get('grades/info')
  @ApiOperation({ summary: 'Get inspection grade information' })
  @ApiResponse({ status: 200, description: 'Grade information retrieved' })
  getGradeInfo() {
    return {
      grades: {
        A_PLUS: { range: '95-100', description: 'Exceptional condition, like new' },
        A: { range: '85-94', description: 'Excellent condition, minimal wear' },
        B_PLUS: { range: '75-84', description: 'Very good condition' },
        B: { range: '65-74', description: 'Good condition with normal wear' },
        C_PLUS: { range: '55-64', description: 'Fair condition, some repairs needed' },
        C: { range: '45-54', description: 'Poor condition, significant repairs needed' },
        D: { range: '0-44', description: 'Very poor condition, not recommended' },
      },
      conditions: {
        EXCELLENT: 'Like new, minimal wear',
        VERY_GOOD: 'Minor wear, well maintained',
        GOOD: 'Normal wear for age',
        FAIR: 'Significant wear, functional',
        POOR: 'Major issues, needs repair',
        DAMAGED: 'Accident damage, not drivable',
      },
      damageSeverity: {
        MINOR: 'Cosmetic damage only',
        MODERATE: 'Functional but needs repair',
        MAJOR: 'Significant structural damage',
        TOTAL_LOSS: 'Beyond economical repair',
      },
    };
  }

  @Get('stats/overview')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get inspection statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getInspectionStats() {
    // In a real implementation, this would aggregate data from the database
    return {
      totalInspections: 1250,
      averageScore: 78.5,
      gradeDistribution: {
        A_PLUS: 85,
        A: 245,
        B_PLUS: 320,
        B: 285,
        C_PLUS: 165,
        C: 98,
        D: 52,
      },
      conditionDistribution: {
        EXCELLENT: 330,
        VERY_GOOD: 420,
        GOOD: 285,
        FAIR: 145,
        POOR: 55,
        DAMAGED: 15,
      },
      damageDetected: 180,
      averageResaleValue: 650000,
      topIssues: [
        'Brake wear',
        'Suspension noise',
        'Electrical issues',
        'Body scratches',
      ],
    };
  }
}
