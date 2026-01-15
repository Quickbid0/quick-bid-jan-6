import { Router } from 'express';
import {
  createAdSlot,
  listAdSlots,
  getAdSlotById,
  updateAdSlot,
  deleteAdSlot,
} from '../services/slot.service';

export const adSlotRouter = Router();

adSlotRouter.post('/adslots', async (req, res, next) => {
  try {
    const slot = await createAdSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
});

adSlotRouter.get('/adslots', async (_req, res, next) => {
  try {
    const slots = await listAdSlots();
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

adSlotRouter.patch('/adslots/:id', async (req, res, next) => {
  try {
    const slot = await updateAdSlot(req.params.id, req.body);
    if (!slot) {
      res.status(404).json({ message: 'Ad slot not found' });
      return;
    }
    res.json(slot);
  } catch (err) {
    next(err);
  }
});

adSlotRouter.delete('/adslots/:id', async (req, res, next) => {
  try {
    await deleteAdSlot(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
