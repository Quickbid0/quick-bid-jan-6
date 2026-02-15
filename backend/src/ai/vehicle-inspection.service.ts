import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  InspectionGrade,
  VehicleCondition,
  DamageSeverity,
  Prisma
} from '@prisma/client';

export interface InspectionResult {
  grade: InspectionGrade;
  overallScore: number;
  estimatedResaleValue: number;
  marketValue: number;
  depreciationPercent: number;
  condition: VehicleCondition;
  componentScores: {
    engine: number;
    transmission: number;
    suspension: number;
    brakes: number;
    electrical: number;
    bodyExterior: number;
    interior: number;
  };
  damageAssessment: {
    detected: boolean;
    severity?: DamageSeverity;
    locations: string[];
    description?: string;
  };
  aiAnalysis: {
    confidenceScore: number;
    detectedIssues: string[];
    recommendations: string[];
  };
}

export interface InspectionUploadData {
  productId: string;
  images360: string[];
  mileage?: number;
  serviceHistory?: string;
  accidentHistory?: string;
  ownershipHistory?: string;
  inspectionNotes?: string;
}

@Injectable()
export class VehicleInspectionService {
  private readonly logger = new Logger(VehicleInspectionService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createInspection(
    productId: string,
    uploadData: InspectionUploadData,
    inspectorId?: string
  ): Promise<VehicleInspection> {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Check if inspection already exists
    const existingInspection = await this.prisma.vehicleInspection.findUnique({
      where: { productId },
    });

    if (existingInspection) {
      throw new BadRequestException('Inspection already exists for this product');
    }

    // Perform AI damage detection
    const damageAssessment = await this.performAIDamageDetection(uploadData.images360);

    // Calculate inspection scores
    const inspectionResult = await this.calculateInspectionResult(product, uploadData, damageAssessment);

    // Create inspection record
    const inspection = await this.prisma.vehicleInspection.create({
      data: {
        productId,
        inspectionDate: new Date(),
        inspectorId,
        inspectionGrade: inspectionResult.grade,
        overallScore: inspectionResult.overallScore,
        estimatedResaleValue: inspectionResult.estimatedResaleValue,
        marketValue: inspectionResult.marketValue,
        depreciationPercent: inspectionResult.depreciationPercent,
        condition: inspectionResult.condition,
        images360: uploadData.images360,
        damageDetected: damageAssessment.detected,
        damageSeverity: damageAssessment.severity,
        damageLocations: damageAssessment.locations,
        damageDescription: damageAssessment.description,
        engineScore: inspectionResult.componentScores.engine,
        transmissionScore: inspectionResult.componentScores.transmission,
        suspensionScore: inspectionResult.componentScores.suspension,
        brakesScore: inspectionResult.componentScores.brakes,
        electricalScore: inspectionResult.componentScores.electrical,
        bodyExteriorScore: inspectionResult.componentScores.bodyExterior,
        interiorScore: inspectionResult.componentScores.interior,
        aiConfidenceScore: inspectionResult.aiAnalysis.confidenceScore,
        aiDetectedIssues: inspectionResult.aiAnalysis.detectedIssues,
        aiRecommendations: inspectionResult.aiAnalysis.recommendations,
        mileage: uploadData.mileage,
        serviceHistory: uploadData.serviceHistory,
        accidentHistory: uploadData.accidentHistory,
        ownershipHistory: uploadData.ownershipHistory,
        inspectionNotes: uploadData.inspectionNotes,
      },
    });

    // Log the inspection creation
    await this.auditService.logActivity({
      userId: inspectorId,
      action: 'VEHICLE_INSPECTION_CREATED',
      resource: 'inspection',
      resourceId: inspection.id,
      category: 'system',
      severity: 'medium',
      metadata: {
        productId,
        inspectionGrade: inspectionResult.grade,
        overallScore: inspectionResult.overallScore,
      },
    });

    this.logger.log(`Vehicle inspection created for product ${productId} with grade ${inspectionResult.grade}`);

    return inspection;
  }

  async getInspection(productId: string): Promise<VehicleInspection | null> {
    return this.prisma.vehicleInspection.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          },
        },
      },
    });
  }

  async updateInspection(
    inspectionId: string,
    updateData: Partial<InspectionUploadData>,
    inspectorId?: string
  ): Promise<VehicleInspection> {
    const inspection = await this.prisma.vehicleInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new BadRequestException('Inspection not found');
    }

    // If new images are provided, re-run AI analysis
    let damageAssessment = inspection.damageDetected ? {
      detected: inspection.damageDetected,
      severity: inspection.damageSeverity,
      locations: inspection.damageLocations,
      description: inspection.damageDescription,
    } : undefined;

    if (updateData.images360 && updateData.images360.length > 0) {
      damageAssessment = await this.performAIDamageDetection(updateData.images360);
    }

    // Recalculate if significant data changed
    const needsRecalculation = updateData.images360 || updateData.mileage !== undefined;

    let inspectionResult: InspectionResult | undefined;
    if (needsRecalculation) {
      const product = await this.prisma.product.findUnique({
        where: { id: inspection.productId },
      });

      if (product) {
        const fullData = { ...inspection, ...updateData };
        inspectionResult = await this.calculateInspectionResult(product, fullData, damageAssessment);
      }
    }

    // Update inspection
    const updatedInspection = await this.prisma.vehicleInspection.update({
      where: { id: inspectionId },
      data: {
        ...(inspectionResult && {
          inspectionGrade: inspectionResult.grade,
          overallScore: inspectionResult.overallScore,
          estimatedResaleValue: inspectionResult.estimatedResaleValue,
          marketValue: inspectionResult.marketValue,
          depreciationPercent: inspectionResult.depreciationPercent,
          condition: inspectionResult.condition,
          ...(updateData.images360 && { images360: updateData.images360 }),
          ...(damageAssessment && {
            damageDetected: damageAssessment.detected,
            damageSeverity: damageAssessment.severity,
            damageLocations: damageAssessment.locations,
            damageDescription: damageAssessment.description,
          }),
          ...(inspectionResult && {
            engineScore: inspectionResult.componentScores.engine,
            transmissionScore: inspectionResult.componentScores.transmission,
            suspensionScore: inspectionResult.componentScores.suspension,
            brakesScore: inspectionResult.componentScores.brakes,
            electricalScore: inspectionResult.componentScores.electrical,
            bodyExteriorScore: inspectionResult.componentScores.bodyExterior,
            interiorScore: inspectionResult.componentScores.interior,
            aiConfidenceScore: inspectionResult.aiAnalysis.confidenceScore,
            aiDetectedIssues: inspectionResult.aiAnalysis.detectedIssues,
            aiRecommendations: inspectionResult.aiAnalysis.recommendations,
          }),
        }),
        ...(updateData.mileage !== undefined && { mileage: updateData.mileage }),
        ...(updateData.serviceHistory && { serviceHistory: updateData.serviceHistory }),
        ...(updateData.accidentHistory && { accidentHistory: updateData.accidentHistory }),
        ...(updateData.ownershipHistory && { ownershipHistory: updateData.ownershipHistory }),
        ...(updateData.inspectionNotes && { inspectionNotes: updateData.inspectionNotes }),
        updatedAt: new Date(),
      },
    });

    // Log the update
    await this.auditService.logActivity({
      userId: inspectorId,
      action: 'VEHICLE_INSPECTION_UPDATED',
      resource: 'inspection',
      resourceId: inspectionId,
      category: 'system',
      severity: 'medium',
      metadata: {
        productId: inspection.productId,
        changes: Object.keys(updateData),
      },
    });

    return updatedInspection;
  }

  private async performAIDamageDetection(images360: string[]): Promise<{
    detected: boolean;
    severity?: DamageSeverity;
    locations: string[];
    description?: string;
  }> {
    // Simulated AI damage detection
    // In production, this would call an actual AI service

    // Random damage detection (20% chance)
    const hasDamage = Math.random() < 0.2;

    if (!hasDamage) {
      return {
        detected: false,
        locations: [],
      };
    }

    // Simulate damage assessment
    const damageLocations = this.generateRandomDamageLocations();
    const severity = this.assessDamageSeverity(damageLocations);

    return {
      detected: true,
      severity,
      locations: damageLocations,
      description: this.generateDamageDescription(damageLocations, severity),
    };
  }

  private async calculateInspectionResult(
    product: any,
    data: any,
    damageAssessment?: any
  ): Promise<InspectionResult> {
    // Calculate component scores (simulated)
    const componentScores = {
      engine: this.calculateEngineScore(product, data),
      transmission: this.calculateTransmissionScore(product, data),
      suspension: this.calculateSuspensionScore(product, data),
      brakes: this.calculateBrakesScore(product, data),
      electrical: this.calculateElectricalScore(product, data),
      bodyExterior: this.calculateBodyExteriorScore(product, data, damageAssessment),
      interior: this.calculateInteriorScore(product, data),
    };

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(componentScores).reduce((sum, score) => sum + score, 0) / 7
    );

    // Determine grade
    const grade = this.calculateGrade(overallScore);

    // Determine condition
    const condition = this.determineCondition(overallScore, damageAssessment);

    // Calculate market value and resale value
    const marketValue = this.calculateMarketValue(product, overallScore);
    const estimatedResaleValue = this.calculateResaleValue(marketValue, overallScore, damageAssessment);
    const depreciationPercent = ((marketValue - estimatedResaleValue) / marketValue) * 100;

    // AI analysis results
    const aiAnalysis = {
      confidenceScore: 0.85 + Math.random() * 0.1, // 85-95% confidence
      detectedIssues: this.generateAIDetectedIssues(componentScores, damageAssessment),
      recommendations: this.generateAIRecommendations(componentScores, damageAssessment),
    };

    return {
      grade,
      overallScore,
      estimatedResaleValue,
      marketValue,
      depreciationPercent,
      condition,
      componentScores,
      damageAssessment: damageAssessment || { detected: false, locations: [] },
      aiAnalysis,
    };
  }

  private calculateGrade(score: number): InspectionGrade {
    if (score >= 95) return InspectionGrade.A_PLUS;
    if (score >= 85) return InspectionGrade.A;
    if (score >= 75) return InspectionGrade.B_PLUS;
    if (score >= 65) return InspectionGrade.B;
    if (score >= 55) return InspectionGrade.C_PLUS;
    if (score >= 45) return InspectionGrade.C;
    return InspectionGrade.D;
  }

  private determineCondition(score: number, damageAssessment?: any): VehicleCondition {
    if (damageAssessment?.detected && damageAssessment.severity === DamageSeverity.TOTAL_LOSS) {
      return VehicleCondition.DAMAGED;
    }

    if (score >= 90) return VehicleCondition.EXCELLENT;
    if (score >= 80) return VehicleCondition.VERY_GOOD;
    if (score >= 70) return VehicleCondition.GOOD;
    if (score >= 60) return VehicleCondition.FAIR;
    if (score >= 50) return VehicleCondition.POOR;
    return VehicleCondition.DAMAGED;
  }

  // Component scoring methods (simplified)
  private calculateEngineScore(product: any, data: any): number {
    let score = 85; // Base score

    // Adjust based on mileage
    if (data.mileage) {
      if (data.mileage < 50000) score += 10;
      else if (data.mileage > 150000) score -= 15;
    }

    // Adjust based on service history
    if (data.serviceHistory && data.serviceHistory.toLowerCase().includes('regular')) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateTransmissionScore(product: any, data: any): number {
    // Similar logic for transmission
    return 80 + Math.random() * 20;
  }

  private calculateSuspensionScore(product: any, data: any): number {
    return 75 + Math.random() * 25;
  }

  private calculateBrakesScore(product: any, data: any): number {
    return 85 + Math.random() * 15;
  }

  private calculateElectricalScore(product: any, data: any): number {
    return 80 + Math.random() * 20;
  }

  private calculateBodyExteriorScore(product: any, data: any, damageAssessment?: any): number {
    let score = 80;

    if (damageAssessment?.detected) {
      score -= damageAssessment.locations.length * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateInteriorScore(product: any, data: any): number {
    return 85 + Math.random() * 15;
  }

  private calculateMarketValue(product: any, overallScore: number): number {
    // Base market value calculation
    let baseValue = product.price * 1.2; // Assume current price is 80% of market

    // Adjust based on condition
    const conditionMultiplier = overallScore / 100;
    baseValue *= conditionMultiplier;

    return baseValue;
  }

  private calculateResaleValue(marketValue: number, overallScore: number, damageAssessment?: any): number {
    let resaleValue = marketValue;

    // Apply depreciation based on condition
    const depreciationRate = (100 - overallScore) / 100;
    resaleValue *= (1 - depreciationRate * 0.3); // 30% max depreciation

    // Additional depreciation for damage
    if (damageAssessment?.detected) {
      const damageMultiplier = damageAssessment.severity === DamageSeverity.TOTAL_LOSS ? 0.1 :
                             damageAssessment.severity === DamageSeverity.MAJOR ? 0.3 :
                             damageAssessment.severity === DamageSeverity.MODERATE ? 0.6 : 0.8;
      resaleValue *= damageMultiplier;
    }

    return resaleValue;
  }

  private generateRandomDamageLocations(): string[] {
    const possibleLocations = [
      'Front Bumper', 'Rear Bumper', 'Driver Door', 'Passenger Door',
      'Hood', 'Trunk', 'Roof', 'Windshield', 'Headlights', 'Taillights'
    ];

    const numDamages = Math.floor(Math.random() * 3) + 1; // 1-3 damages
    const shuffled = possibleLocations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numDamages);
  }

  private assessDamageSeverity(locations: string[]): DamageSeverity {
    if (locations.length >= 3) return DamageSeverity.MAJOR;
    if (locations.some(loc => ['Windshield', 'Hood', 'Trunk'].includes(loc))) {
      return Math.random() < 0.5 ? DamageSeverity.MAJOR : DamageSeverity.MODERATE;
    }
    return DamageSeverity.MINOR;
  }

  private generateDamageDescription(locations: string[], severity: DamageSeverity): string {
    const severityText = {
      [DamageSeverity.MINOR]: 'Minor cosmetic damage',
      [DamageSeverity.MODERATE]: 'Moderate structural damage requiring repair',
      [DamageSeverity.MAJOR]: 'Major structural damage',
      [DamageSeverity.TOTAL_LOSS]: 'Severe damage, potentially total loss',
    };

    return `${severityText[severity]} detected in: ${locations.join(', ')}`;
  }

  private generateAIDetectedIssues(componentScores: any, damageAssessment?: any): string[] {
    const issues: string[] = [];

    Object.entries(componentScores).forEach(([component, score]) => {
      if (score < 70) {
        issues.push(`${component} condition below acceptable threshold (${score}/100)`);
      }
    });

    if (damageAssessment?.detected) {
      issues.push(`Physical damage detected: ${damageAssessment.description}`);
    }

    return issues.length > 0 ? issues : ['No significant issues detected'];
  }

  private generateAIRecommendations(componentScores: any, damageAssessment?: any): string[] {
    const recommendations: string[] = [];

    if (componentScores.engine < 80) {
      recommendations.push('Consider professional engine inspection and maintenance');
    }

    if (componentScores.brakes < 80) {
      recommendations.push('Brake system inspection recommended');
    }

    if (damageAssessment?.detected) {
      recommendations.push('Professional repair assessment recommended before purchase');
    }

    if (Object.values(componentScores).some(score => score < 60)) {
      recommendations.push('Comprehensive vehicle inspection recommended');
    }

    return recommendations.length > 0 ? recommendations : ['Vehicle appears to be in acceptable condition'];
  }
}
