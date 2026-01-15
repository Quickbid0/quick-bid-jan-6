import { Router, Request, Response } from 'express';
import { Branch } from '../models/Branch';
import { requireAuth } from '../../../middleware/authMiddleware';
import { requirePermission } from '../../rbac/middleware/requirePermission';

export const branchesRouter = Router();

// List branches
branchesRouter.get('/branches', requireAuth, requirePermission('branches.view'), async (_req: Request, res: Response) => {
  try {
    const items = await Branch.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err: any) {
    console.error('list branches error', err);
    res.status(500).json({ message: 'Failed to list branches', error: err.message });
  }
});

// Create branch
branchesRouter.post('/branches', requireAuth, requirePermission('branches.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Branch.create(req.body);
    res.status(201).json(doc);
  } catch (err: any) {
    console.error('create branch error', err);
    res.status(400).json({ message: 'Failed to create branch', error: err.message });
  }
});

// Update branch
branchesRouter.patch('/branches/:id', requireAuth, requirePermission('branches.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Branch.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Branch not found' });
    res.json(doc);
  } catch (err: any) {
    console.error('update branch error', err);
    res.status(400).json({ message: 'Failed to update branch', error: err.message });
  }
});

// Delete / soft-disable branch (mark inactive)
branchesRouter.delete('/branches/:id', requireAuth, requirePermission('branches.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Branch.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Branch not found' });
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete branch error', err);
    res.status(400).json({ message: 'Failed to delete branch', error: err.message });
  }
});
