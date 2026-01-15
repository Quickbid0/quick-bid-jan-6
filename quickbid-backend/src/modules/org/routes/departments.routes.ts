import { Router, Request, Response } from 'express';
import { Department } from '../models/Department';
import { requireAuth } from '../../../middleware/authMiddleware';
import { requirePermission } from '../../rbac/middleware/requirePermission';

export const departmentsRouter = Router();

// List departments
departmentsRouter.get('/departments', requireAuth, requirePermission('departments.view'), async (_req: Request, res: Response) => {
  try {
    const items = await Department.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err: any) {
    console.error('list departments error', err);
    res.status(500).json({ message: 'Failed to list departments', error: err.message });
  }
});

// Create department
departmentsRouter.post('/departments', requireAuth, requirePermission('departments.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Department.create(req.body);
    res.status(201).json(doc);
  } catch (err: any) {
    console.error('create department error', err);
    res.status(400).json({ message: 'Failed to create department', error: err.message });
  }
});

// Update department
departmentsRouter.patch('/departments/:id', requireAuth, requirePermission('departments.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Department.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Department not found' });
    res.json(doc);
  } catch (err: any) {
    console.error('update department error', err);
    res.status(400).json({ message: 'Failed to update department', error: err.message });
  }
});

// Delete / soft-disable department (here we just mark inactive)
departmentsRouter.delete('/departments/:id', requireAuth, requirePermission('departments.manage'), async (req: Request, res: Response) => {
  try {
    const doc = await Department.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Department not found' });
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete department error', err);
    res.status(400).json({ message: 'Failed to delete department', error: err.message });
  }
});
