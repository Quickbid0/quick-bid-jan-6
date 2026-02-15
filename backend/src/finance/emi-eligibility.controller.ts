import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EMIEligibilityService, EMIEligibilityCheck } from '../finance/emi-eligibility.service';

@ApiTags('emi-eligibility')
@Controller('emi-eligibility')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EMIEligibilityController {
  constructor(private readonly emiService: EMIEligibilityService) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check EMI eligibility for vehicle purchase' })
  @ApiResponse({ status: 200, description: 'Eligibility checked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async checkEligibility(
    @Body() body: {
      vehiclePrice: number;
      downPayment?: number;
    },
    @Req() req: Request
  ): Promise<EMIEligibilityCheck[]> {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const { vehiclePrice, downPayment = 0 } = body;

    if (vehiclePrice <= 0) {
      throw new BadRequestException('Vehicle price must be greater than 0');
    }

    if (downPayment < 0) {
      throw new BadRequestException('Down payment cannot be negative');
    }

    if (downPayment >= vehiclePrice) {
      throw new BadRequestException('Down payment cannot be greater than or equal to vehicle price');
    }

    return this.emiService.checkEMIEligibility(userId, vehiclePrice, downPayment);
  }

  @Get('badge')
  @ApiOperation({ summary: 'Get user pre-approved finance badge status' })
  @ApiResponse({ status: 200, description: 'Badge status retrieved' })
  async getPreApprovedBadge(@Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.emiService.getPreApprovedBadge(userId);
  }

  @Post('calculate-emi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate EMI options for loan amount' })
  @ApiResponse({ status: 200, description: 'EMI calculated successfully' })
  async calculateEMI(
    @Body() body: {
      loanAmount: number;
      tenureMonths: number;
      interestRate: number;
    }
  ) {
    const { loanAmount, tenureMonths, interestRate } = body;

    if (loanAmount <= 0) {
      throw new BadRequestException('Loan amount must be greater than 0');
    }

    if (tenureMonths < 6 || tenureMonths > 84) {
      throw new BadRequestException('Tenure must be between 6 and 84 months');
    }

    if (interestRate < 5 || interestRate > 30) {
      throw new BadRequestException('Interest rate must be between 5% and 30%');
    }

    return this.emiService.calculateEMIOptions(loanAmount, tenureMonths, interestRate);
  }

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for loan through NBFC partner' })
  @ApiResponse({ status: 201, description: 'Loan application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Application failed' })
  async applyForLoan(
    @Body() body: {
      partnerId: string;
      loanAmount: number;
      vehicleId: string;
      tenureMonths: number;
    },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const { partnerId, loanAmount, vehicleId, tenureMonths } = body;

    if (loanAmount <= 0) {
      throw new BadRequestException('Loan amount must be greater than 0');
    }

    if (tenureMonths < 6 || tenureMonths > 84) {
      throw new BadRequestException('Tenure must be between 6 and 84 months');
    }

    return this.emiService.applyForLoan(userId, partnerId, loanAmount, vehicleId, tenureMonths);
  }

  @Get('partners')
  @ApiOperation({ summary: 'Get available NBFC partners' })
  @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
  async getNBFCPartners() {
    return this.emiService.getNBFCPartners();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get EMI eligibility statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  getEMIStats() {
    // In a real implementation, this would aggregate from database
    return {
      totalApplications: 1250,
      approvedApplications: 890,
      averageLoanAmount: 850000,
      averageTenure: 58, // months
      popularPartners: [
        { name: 'ICICI Bank', applications: 425, approvalRate: 89 },
        { name: 'HDFC Bank', applications: 380, approvalRate: 87 },
        { name: 'Bajaj Finance', applications: 295, approvalRate: 82 },
        { name: 'Shriram Finance', applications: 150, approvalRate: 76 },
      ],
      conversionByBadge: {
        bronze: 15,
        silver: 28,
        gold: 45,
        platinum: 68,
      },
      averageProcessingTime: '2.3 days',
    };
  }
}
