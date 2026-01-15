import { Request, Response } from 'express';
import {
  createSalesLead,
  deleteSalesLead,
  getDashboardSummary,
  listSalesLeads,
  updateSalesLead,
} from '../services/salesDashboard.service';

export const handleDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await getDashboardSummary();
    return res.status(200).json(summary);
  } catch (err) {
    console.error('dashboard summary error', err);
    return res.status(500).json({ message: 'Unable to fetch dashboard summary' });
  }
};

export const handleListLeads = async (req: Request, res: Response) => {
  const { limit, offset, status } = req.query;
  try {
    const leads = await listSalesLeads({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      status: status ? String(status) : undefined,
    });
    return res.status(200).json(leads);
  } catch (err) {
    console.error('list leads error', err);
    return res.status(500).json({ message: 'Unable to fetch leads' });
  }
};

export const handleCreateLead = async (req: Request, res: Response) => {
  try {
    const lead = await createSalesLead(req.body);
    return res.status(201).json(lead);
  } catch (err) {
    console.error('create lead error', err);
    return res.status(500).json({ message: 'Unable to create lead' });
  }
};

export const handleUpdateLead = async (req: Request, res: Response) => {
  try {
    const lead = await updateSalesLead(req.params.id, req.body);
    return res.status(200).json(lead);
  } catch (err) {
    console.error('update lead error', err);
    return res.status(500).json({ message: 'Unable to update lead' });
  }
};

export const handleDeleteLead = async (req: Request, res: Response) => {
  try {
    await deleteSalesLead(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error('delete lead error', err);
    return res.status(500).json({ message: 'Unable to delete lead' });
  }
};
