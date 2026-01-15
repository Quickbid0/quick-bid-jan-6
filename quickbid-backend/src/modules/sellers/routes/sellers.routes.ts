import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getSellerInfo } from '../services/getSellerInfo.service';

export const sellersRouter = express.Router();

sellersRouter.get('/sellers/:sellerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) {
      return res.status(400).json({ error: 'sellerId is required' });
    }

    const info = await getSellerInfo(sellerId);
    if (!info) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json(info);
  } catch (err) {
    next(err);
  }
});
