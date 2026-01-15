import { Router, Request, Response } from 'express';
import { AutomationModel } from '../models/automation.model';

export const automationsRouter = Router();

// TODO: plug in real auth/RBAC when ready

automationsRouter.post('/api/v1/automations', async (req: Request, res: Response) => {
  try {
    const automation = await AutomationModel.create(req.body);
    res.status(201).json(automation);
  } catch (err: any) {
    console.error('create automation error', err);
    res.status(500).json({ message: 'Failed to create automation', error: err.message });
  }
});

automationsRouter.get('/api/v1/automations', async (_req: Request, res: Response) => {
  try {
    const items = await AutomationModel.find().sort({ created_at: -1 }).lean();
    res.json(items);
  } catch (err: any) {
    console.error('list automations error', err);
    res.status(500).json({ message: 'Failed to list automations', error: err.message });
  }
});

automationsRouter.get('/api/v1/automations/:id', async (req: Request, res: Response) => {
  try {
    const item = await AutomationModel.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Automation not found' });
    res.json(item);
  } catch (err: any) {
    console.error('get automation error', err);
    res.status(500).json({ message: 'Failed to fetch automation', error: err.message });
  }
});

automationsRouter.patch('/api/v1/automations/:id', async (req: Request, res: Response) => {
  try {
    const item = await AutomationModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!item) return res.status(404).json({ message: 'Automation not found' });
    res.json(item);
  } catch (err: any) {
    console.error('update automation error', err);
    res.status(500).json({ message: 'Failed to update automation', error: err.message });
  }
});

automationsRouter.delete('/api/v1/automations/:id', async (req: Request, res: Response) => {
  try {
    const item = await AutomationModel.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Automation not found' });
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('delete automation error', err);
    res.status(500).json({ message: 'Failed to delete automation', error: err.message });
  }
});
