import express from 'express';
import {
  handleDashboardSummary,
  handleCreateLead,
  handleDeleteLead,
  handleListLeads,
  handleUpdateLead,
} from '../controllers/salesDashboard.controller';
import { requireSalesAuth } from '../../sales-auth/middleware/requireSalesAuth';

export const salesDashboardRouter = express.Router();

salesDashboardRouter.get('/sales/dashboard', requireSalesAuth, handleDashboardSummary);
salesDashboardRouter.get('/sales/leads', requireSalesAuth, handleListLeads);
salesDashboardRouter.post('/sales/leads', requireSalesAuth, handleCreateLead);
salesDashboardRouter.put('/sales/leads/:id', requireSalesAuth, handleUpdateLead);
salesDashboardRouter.delete('/sales/leads/:id', requireSalesAuth, handleDeleteLead);
