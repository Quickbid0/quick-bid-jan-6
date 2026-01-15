import express from 'express';
import request from 'supertest';

// Mock auth middleware to always treat the caller as an admin
jest.mock('../quickbid-backend/src/middleware/authMiddleware', () => {
  return {
    requireAuth: (_req: any, _res: any, next: any) => {
      // Attach a fake admin user so requireAdminOrSuperAdmin passes
      (_req as any).user = { id: 'admin-1', role: 'admin' };
      next();
    },
  };
});

// Stub commission helper so we can assert the values passed through the API
jest.mock('../quickbid-backend/src/modules/auctions/services/computeQuickMelaCommissions', () => {
  return {
    computeQuickMelaCommissions: jest.fn(async () => ({
      buyerCommission: 10_000,
      sellerCommission: 3_000,
      totalCommission: 18_000,
      netToSeller: 87_000,
      platformFlatCents: 5_000,
    })),
  };
});

// Mock supabaseAdmin used by the settlement route
const fromMock = jest.fn();

jest.mock('../quickbid-backend/src/supabaseAdmin', () => {
  return {
    supabaseAdmin: {
      from: fromMock,
    },
  };
});

import { adminSettlementRouter } from '../quickbid-backend/src/modules/auctions/routes/adminSettlement.routes';
import { computeQuickMelaCommissions } from '../quickbid-backend/src/modules/auctions/services/computeQuickMelaCommissions';

// Cast mocked helper for type-safe assertions
const mockedCompute = computeQuickMelaCommissions as jest.Mock;

describe('adminSettlementRouter /auctions/:auctionId/settle', () => {
  beforeEach(() => {
    fromMock.mockReset();
    mockedCompute.mockClear();
  });

  it('returns commissions and marks auction awaiting_funds when escrow not funded', async () => {
    const auctionId = 'auction-1';

    // Shape returned by the route when escrow is missing / not FUNDED
    const auctionRow = {
      id: auctionId,
      status: 'ended',
      winner_id: 'buyer-1',
      final_price: 1000, // rupees
      seller_id: 'seller-1',
      product_id: 'product-1',
    };

    // Configure supabaseAdmin.from() behavior per table
    fromMock.mockImplementation((table: string) => {
      if (table === 'auctions') {
        const builder: any = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: auctionRow, error: null }),
          update: jest.fn().mockReturnThis(),
        };
        return builder;
      }

      if (table === 'payouts') {
        const builder: any = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'payout-1' }, error: null }),
          update: jest.fn().mockReturnThis(),
        };
        return builder;
      }

      if (table === 'escrow_accounts') {
        const builder: any = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
        return builder;
      }

      if (table === 'products') {
        const builder: any = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
        return builder;
      }

      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const app = express();
    app.use(express.json());
    app.use('/api/admin', adminSettlementRouter);

    const res = await request(app)
      .post(`/api/admin/auctions/${auctionId}/settle`)
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    // Escrow not funded path sets ok=false and includes commissions
    expect(res.body).toEqual({
      ok: false,
      message: 'escrow not funded; marked auction awaiting_funds',
      commissions: {
        buyerCommission: 10_000,
        sellerCommission: 3_000,
        platformFlatCents: 5_000,
        totalCommission: 18_000,
      },
    });

    // Ensure commission helper was called with final price converted to cents
    expect(mockedCompute).toHaveBeenCalledWith(1000 * 100);
  });
});
