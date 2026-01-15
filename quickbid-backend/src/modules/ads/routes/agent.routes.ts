import { Router } from 'express';
import {
  createAgentBonus,
  listAgentBonuses,
  listAllReferralBonuses,
  updateAgentBonusStatus,
} from '../services/agentReferral.service';

export const agentRouter = Router();

agentRouter.get('/agents/referrals', async (_req, res, next) => {
  try {
    const all = await listAllReferralBonuses();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

agentRouter.post('/agents/:id/bonus', async (req, res, next) => {
  try {
    const agentId = req.params.id;
    const { sponsorId, bonusAmount, invoiceId } = req.body;
    const bonus = await createAgentBonus({ agentId, sponsorId, bonusAmount, invoiceId });
    res.status(201).json(bonus);
  } catch (err) {
    next(err);
  }
});

agentRouter.get('/agents/:id/bonus/history', async (req, res, next) => {
  try {
    const bonuses = await listAgentBonuses(req.params.id);
    res.json(bonuses);
  } catch (err) {
    next(err);
  }
});

agentRouter.patch('/agents/bonus/:referralId', async (req, res, next) => {
  try {
    const { status } = req.body as { status: 'pending' | 'approved' | 'paid' };
    const updated = await updateAgentBonusStatus(req.params.referralId, status);
    if (!updated) {
      res.status(404).json({ message: 'Referral bonus not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
