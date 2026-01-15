import { Router, Request, Response } from 'express';
import { requireAuth } from '../../../middleware/authMiddleware';
import { requirePermission } from '../middleware/requirePermission';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { RolePermission } from '../models/RolePermission';
import { UserRole } from '../models/UserRole';

export const rbacRouter = Router();

// -------- Roles --------

// List roles for admin UIs
rbacRouter.get('/roles', requireAuth, async (_req: Request, res: Response) => {
  try {
    const roles = await Role.find().lean();
    res.json(roles);
  } catch (err) {
    console.error('List roles error', err);
    res.status(500).json({ message: 'Failed to list roles'   }
);
  }
});

// Create role
rbacRouter.post(
  '/roles',
  requireAuth,
  requirePermission('rbac.roles.manage'),
  async (req: Request, res: Response) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err: any) {
    console.error('Create role error', err);
    res.status(400).json({ message: 'Failed to create role', error: err.message });
  }
});

// Update role
rbacRouter.put(
  '/roles/:id',
  requireAuth,
  requirePermission('rbac.roles.manage'),
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndUpdate(id, req.body, { new: true }).lean();
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err: any) {
    console.error('Update role error', err);
    res.status(400).json({ message: 'Failed to update role', error: err.message });
  }
});

// Delete role (prevent deleting system roles in future if needed)
rbacRouter.delete(
  '/roles/:id',
  requireAuth,
  requirePermission('rbac.roles.manage'),
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id).lean();
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('Delete role error', err);
    res.status(400).json({ message: 'Failed to delete role', error: err.message });
  }
});

// -------- Permissions --------

// Permission list
rbacRouter.get('/permissions', requireAuth, async (_req: Request, res: Response) => {
  try {
    const permissions = await Permission.find().lean();
    res.json(permissions);
  } catch (err) {
    console.error('List permissions error', err);
    res.status(500).json({ message: 'Failed to list permissions' });
  }
});

// Assign permissions to role
rbacRouter.post(
  '/roles/:roleId/permissions',
  requireAuth,
  requirePermission('rbac.permissions.manage'),
  async (req: Request, res: Response) => {
    try {
      const { roleId } = req.params;
      const { permissionIds, allowed = true } = req.body as {
        permissionIds: string[];
        allowed?: boolean;
      };

      if (!Array.isArray(permissionIds) || !permissionIds.length) {
        return res.status(400).json({ message: 'permissionIds array is required' });
      }

      const docs = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
        allowed,
      }));

      const created = await RolePermission.insertMany(docs, { ordered: false }).catch((err) => {
        // ignore duplicate key errors to make this idempotent-ish
        console.error('Assign permissions error', err);
        return [];
      });

      res.status(201).json(created);
    } catch (err: any) {
      console.error('Assign permissions error', err);
      res.status(400).json({ message: 'Failed to assign permissions', error: err.message });
    }
  }
);

// Remove a permission from role
rbacRouter.delete(
  '/roles/:roleId/permissions/:permissionId',
  requireAuth,
  requirePermission('rbac.permissions.manage'),
  async (req: Request, res: Response) => {
    try {
      const { roleId, permissionId } = req.params;
      await RolePermission.findOneAndDelete({ roleId, permissionId }).lean();
      res.status(204).send();
    } catch (err: any) {
      console.error('Remove role permission error', err);
      res.status(400).json({ message: 'Failed to remove permission', error: err.message });
    }
  }
);

// -------- User Roles --------

// Get roles for a user
rbacRouter.get(
  '/users/:userId/roles',
  requireAuth,
  requirePermission('rbac.user_roles.manage'),
  async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const roles = await UserRole.find({ supabaseUserId: userId }).lean();
    res.json(roles);
  } catch (err) {
    console.error('Get user roles error', err);
    res.status(500).json({ message: 'Failed to get user roles' });
  }
});

// Assign a role to a user (with optional scope)
rbacRouter.post(
  '/users/:userId/roles',
  requireAuth,
  requirePermission('rbac.user_roles.manage'),
  async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const body = req.body || {};

    const userRole = await UserRole.create({
      supabaseUserId: userId,
      roleId: body.roleId,
      stateId: body.stateId,
      branchId: body.branchId,
      mandalId: body.mandalId,
      departmentId: body.departmentId,
      isPrimary: !!body.isPrimary,
      assignedBy: (req as any).user?.id || 'system',
    });

    res.status(201).json(userRole);
  } catch (err: any) {
    console.error('Assign user role error', err);
    res.status(400).json({ message: 'Failed to assign user role', error: err.message });
  }
});

// Update a user role (e.g. status or scope)
rbacRouter.put(
  '/users/:userId/roles/:userRoleId',
  requireAuth,
  requirePermission('rbac.user_roles.manage'),
  async (req: Request, res: Response) => {
    try {
      const { userId, userRoleId } = req.params;
      const updates = req.body || {};

      const userRole = await UserRole.findOneAndUpdate(
        { _id: userRoleId, supabaseUserId: userId },
        updates,
        { new: true }
      ).lean();

      if (!userRole) {
        return res.status(404).json({ message: 'User role not found' });
      }

      res.json(userRole);
    } catch (err: any) {
      console.error('Update user role error', err);
      res.status(400).json({ message: 'Failed to update user role', error: err.message });
    }
  }
);

// Delete a user role
rbacRouter.delete(
  '/users/:userId/roles/:userRoleId',
  requireAuth,
  requirePermission('rbac.user_roles.manage'),
  async (req: Request, res: Response) => {
    try {
      const { userId, userRoleId } = req.params;
      await UserRole.findOneAndDelete({ _id: userRoleId, supabaseUserId: userId }).lean();
      res.status(204).send();
    } catch (err: any) {
      console.error('Delete user role error', err);
      res.status(400).json({ message: 'Failed to delete user role', error: err.message });
    }
  }
);

// -------- Role-permission matrix for UI --------

rbacRouter.get('/roles/matrix', requireAuth, async (_req: Request, res: Response) => {
  try {
    const [roles, permissions, rolePermissions] = await Promise.all([
      Role.find().lean(),
      Permission.find().lean(),
      RolePermission.find().lean(),
    ]);

    res.json({ roles, permissions, rolePermissions });
  } catch (err) {
    console.error('Role matrix error', err);
    res.status(500).json({ message: 'Failed to load role matrix' });
  }
});
