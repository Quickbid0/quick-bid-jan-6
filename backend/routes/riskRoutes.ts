import { Router } from 'express';
import { Pool } from 'pg';

export function createRiskRouter(pool: Pool): Router {
  const router = Router();

  // Get seller risk assessment
  router.get('/sellers/:sellerId', async (req, res) => {
    try {
      const { sellerId } = req.params;
      
      // Get seller profile and calculate risk score
      const sellerResult = await pool.query(
        `SELECT 
          s.*,
          u.email,
          u.created_at as user_created_at,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT a.id) as total_auctions,
          COALESCE(AVG(CASE WHEN a.status = 'completed' THEN a.final_price ELSE NULL END), 0) as avg_auction_price,
          COALESCE(SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_auctions
        FROM sellers s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN products p ON p.seller_id = s.id
        LEFT JOIN auctions a ON a.product_id = p.id
        WHERE s.id = $1
        GROUP BY s.id, u.email, u.created_at`,
        [sellerId]
      );

      if (sellerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Seller not found' });
      }

      const seller = sellerResult.rows[0];
      
      // Calculate risk factors
      const riskFactors = {
        accountAge: calculateAccountAgeRisk(seller.user_created_at),
        verificationStatus: seller.is_verified ? 'low' : 'medium',
        salesVolume: calculateSalesVolumeRisk(seller.completed_auctions, seller.avg_auction_price),
        productCount: calculateProductCountRisk(seller.total_products),
        reputation: calculateReputationRisk(seller.rating || 0)
      };

      // Calculate overall risk score (0-100)
      const riskScore = calculateRiskScore(riskFactors);
      
      // Determine risk level
      let riskLevel = 'low';
      if (riskScore >= 70) riskLevel = 'high';
      else if (riskScore >= 40) riskLevel = 'medium';

      res.json({
        sellerId,
        riskScore,
        riskLevel,
        riskFactors,
        recommendations: generateRecommendations(riskFactors, riskLevel),
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error calculating seller risk:', error);
      res.status(500).json({ error: 'Failed to calculate seller risk' });
    }
  });

  // Update seller risk assessment (manual override)
  router.post('/sellers/:sellerId/assessment', async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { riskLevel, notes, assessedBy } = req.body;
      
      if (!['low', 'medium', 'high'].includes(riskLevel)) {
        return res.status(400).json({ error: 'Invalid risk level' });
      }

      // Store assessment in risk_assessments table
      const result = await pool.query(
        `INSERT INTO risk_assessments 
         (entity_type, entity_id, risk_level, notes, assessed_by, created_at)
         VALUES ('seller', $1, $2, $3, $4, NOW())
         RETURNING *`,
        [sellerId, riskLevel, notes, assessedBy]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating risk assessment:', error);
      res.status(500).json({ error: 'Failed to create risk assessment' });
    }
  });

  return router;
}

// Helper functions
function calculateAccountAgeRisk(createdAt: string): 'low' | 'medium' | 'high' {
  const age = Date.now() - new Date(createdAt).getTime();
  const days = age / (1000 * 60 * 60 * 24);
  
  if (days >= 365) return 'low';
  if (days >= 30) return 'medium';
  return 'high';
}

function calculateSalesVolumeRisk(completedAuctions: number, avgPrice: number): 'low' | 'medium' | 'high' {
  const totalVolume = completedAuctions * avgPrice;
  
  if (totalVolume >= 1000000) return 'low'; // > 10L
  if (totalVolume >= 100000) return 'medium'; // > 1L
  return 'high'; // < 1L
}

function calculateProductCountRisk(productCount: number): 'low' | 'medium' | 'high' {
  if (productCount >= 50) return 'low';
  if (productCount >= 10) return 'medium';
  return 'high';
}

function calculateReputationRisk(rating: number): 'low' | 'medium' | 'high' {
  if (rating >= 4.5) return 'low';
  if (rating >= 3.5) return 'medium';
  return 'high';
}

function calculateRiskScore(factors: any): number {
  const scores = {
    accountAge: factors.accountAge === 'low' ? 10 : factors.accountAge === 'medium' ? 20 : 30,
    verificationStatus: factors.verificationStatus === 'low' ? 10 : factors.verificationStatus === 'medium' ? 20 : 30,
    salesVolume: factors.salesVolume === 'low' ? 10 : factors.salesVolume === 'medium' ? 20 : 30,
    productCount: factors.productCount === 'low' ? 10 : factors.productCount === 'medium' ? 20 : 30,
    reputation: factors.reputation === 'low' ? 10 : factors.reputation === 'medium' ? 20 : 30
  };
  
  return Math.max(0, 100 - Object.values(scores).reduce((a, b) => a + b, 0));
}

function generateRecommendations(factors: any, riskLevel: string): string[] {
  const recommendations = [];
  
  if (factors.accountAge === 'high') {
    recommendations.push('Account is new. Monitor closely for first 30 days.');
  }
  
  if (factors.verificationStatus === 'medium') {
    recommendations.push('Complete verification process to reduce risk.');
  }
  
  if (factors.salesVolume === 'high') {
    recommendations.push('Low sales volume. Consider providing sales support.');
  }
  
  if (factors.productCount === 'high') {
    recommendations.push('Few products listed. Encourage more listings.');
  }
  
  if (factors.reputation === 'high') {
    recommendations.push('Low rating. Address customer complaints promptly.');
  }
  
  if (riskLevel === 'high') {
    recommendations.push('High risk seller. Consider manual review of transactions.');
  }
  
  return recommendations;
}
