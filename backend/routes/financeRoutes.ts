import { Router } from 'express';
import type { Pool } from 'pg';
import { applyLoanHandler, getLoanHandler, applyInsuranceHandler, getInsuranceHandler } from '../controllers/financeController.ts';

export function createFinanceRouter(pool: Pool, authMiddleware: any) {
  const router = Router();

  router.post('/loans/apply', authMiddleware, applyLoanHandler(pool));
  router.get('/loans/:id', authMiddleware, getLoanHandler(pool));

  router.post('/insurance/apply', authMiddleware, applyInsuranceHandler(pool));
  router.get('/insurance/:id', authMiddleware, getInsuranceHandler(pool));

  return router;
}
