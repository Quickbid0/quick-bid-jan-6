import { Router, Request, Response } from 'express';
import { StaffProfile } from '../models/StaffProfile';
import { UserRole } from '../../rbac/models/UserRole';
import { requireAuth } from '../../../middleware/authMiddleware';
import { requirePermission } from '../../rbac/middleware/requirePermission';

export const staffRouter = Router();

// List staff with basic filters
staffRouter.get('/staff', requireAuth, requirePermission('staff.view'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const query: any = {};
    if (status) query.status = status;

    const items = await StaffProfile.find(query).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err: any) {
    console.error('list staff error', err);
    res.status(500).json({ message: 'Failed to list staff', error: err.message });
  }
});

// Create or upsert a staff profile and (optionally) assign a role
staffRouter.post('/staff', requireAuth, requirePermission('staff.manage'), async (req: Request, res: Response) => {
  try {
    const { supabaseUserId, fullName, phone, email, primaryBranchId, primaryDepartmentId, roleId, isPrimary } = req.body || {};

    if (!supabaseUserId) {
      return res.status(400).json({ message: 'supabaseUserId is required' });
    }

    const profile = await StaffProfile.findOneAndUpdate(
      { supabaseUserId },
      {
        $set: {
          fullName,
          phone,
          email,
          primaryBranchId,
          primaryDepartmentId,
          status: 'active',
        },
      },
      { upsert: true, new: true }
    ).lean();

    // Optional: assign a role for this staff member
    if (roleId) {
      await UserRole.findOneAndUpdate(
        {
          supabaseUserId,
          roleId,
          branchId: primaryBranchId,
          departmentId: primaryDepartmentId,
        },
        {
          $setOnInsert: {
            isPrimary: !!isPrimary,
            assignedBy: (req as any).user?.id || 'system',
          },
        },
        { upsert: true, new: true }
      ).lean();
    }

    res.status(201).json(profile);
  } catch (err: any) {
    console.error('create staff error', err);
    res.status(400).json({ message: 'Failed to create staff', error: err.message });
  }
});

// Update staff profile (and optionally status)
staffRouter.patch('/staff/:id', requireAuth, requirePermission('staff.manage'), async (req: Request, res: Response) => {
  try {
    const updates = req.body || {};
    const profile = await StaffProfile.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean();
    if (!profile) return res.status(404).json({ message: 'Staff not found' });
    res.json(profile);
  } catch (err: any) {
    console.error('update staff error', err);
    res.status(400).json({ message: 'Failed to update staff', error: err.message });
  }
});

// Disable staff account (soft)
staffRouter.post('/staff/:id/disable', requireAuth, requirePermission('staff.manage'), async (req: Request, res: Response) => {
  try {
    const profile = await StaffProfile.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'disabled' } },
      { new: true }
    ).lean();
    if (!profile) return res.status(404).json({ message: 'Staff not found' });
    res.json(profile);
  } catch (err: any) {
    console.error('disable staff error', err);
    res.status(400).json({ message: 'Failed to disable staff', error: err.message });
  }
});

// Approve staff role assignments in future (placeholder for staff.approve)
// Currently, staff.approve can be used when we add pending UserRole flows.

