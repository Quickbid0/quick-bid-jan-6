import { Router } from 'express';
import type { Pool } from 'pg';
import {
  initiateDepositHandler,
  getDepositStatusHandler,
  verifyDepositHandler,
} from '../controllers/depositController.ts';

export function createDepositRouter(pool: Pool, authMiddleware: any) {
  const router = Router();

  router.post('/deposits/initiate', authMiddleware, initiateDepositHandler(pool));
  router.get('/deposits/:id/status', authMiddleware, getDepositStatusHandler(pool));
  router.post('/deposits/:id/verify', authMiddleware, verifyDepositHandler(pool));

  return router;
}
