import express from 'express';
import { handleSalesLogin, handleSalesLogout, handleSalesMe } from '../controllers/salesAuth.controller';
import { requireSalesAuth } from '../middleware/requireSalesAuth';

export const salesAuthRouter = express.Router();

salesAuthRouter.post('/sales/auth/login', handleSalesLogin);
salesAuthRouter.post('/sales/auth/logout', requireSalesAuth, handleSalesLogout);
salesAuthRouter.get('/sales/auth/me', requireSalesAuth, handleSalesMe);
