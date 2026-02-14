import { PenaltyService } from './penalty.service';
export declare class PenaltyController {
    private readonly penaltyService;
    constructor(penaltyService: PenaltyService);
    getSellerPenalties(sellerId: string): Promise<{
        success: boolean;
        data: {
            penalties: import("./penalty.service").Penalty[];
            cooldowns: import("./penalty.service").Cooldown[];
            sellerScore: number;
            canListProduct: boolean;
            canParticipateInAuction: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    addPenalty(body: {
        sellerId: string;
        type: string;
        description: string;
        amount: number;
    }): Promise<{
        success: boolean;
        data: import("./penalty.service").Penalty;
        message: string;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    liftCooldown(sellerId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSellerScore(sellerId: string): Promise<{
        success: boolean;
        data: {
            score: number;
            grade: string;
            status: string;
            riskLevel: "low" | "medium" | "high" | "critical";
            componentScores: {
                delivery: number;
                quality: number;
                behavior: number;
                compliance: number;
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    private getScoreGrade;
    private getScoreStatus;
}
