import { Router } from 'express';
import {
  createSponsor,
  listSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
} from '../services/sponsor.service';

export const sponsorRouter = Router();

sponsorRouter.post('/sponsors', async (req, res, next) => {
  try {
    const sponsor = await createSponsor(req.body);
    res.status(201).json(sponsor);
  } catch (err) {
    next(err);
  }
});

sponsorRouter.get('/sponsors', async (_req, res, next) => {
  try {
    const sponsors = await listSponsors();
    res.json(sponsors);
  } catch (err) {
    next(err);
  }
});

sponsorRouter.get('/sponsors/:id', async (req, res, next) => {
  try {
    const sponsor = await getSponsorById(req.params.id);
    if (!sponsor) {
      res.status(404).json({ message: 'Sponsor not found' });
      return;
    }
    res.json(sponsor);
  } catch (err) {
    next(err);
  }
});

sponsorRouter.patch('/sponsors/:id', async (req, res, next) => {
  try {
    const sponsor = await updateSponsor(req.params.id, req.body);
    if (!sponsor) {
      res.status(404).json({ message: 'Sponsor not found' });
      return;
    }
    res.json(sponsor);
  } catch (err) {
    next(err);
  }
});

sponsorRouter.delete('/sponsors/:id', async (req, res, next) => {
  try {
    await deleteSponsor(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
