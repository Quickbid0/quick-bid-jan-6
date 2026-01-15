import { NextFunction, Response } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { UserRole } from '../models/UserRole';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { RolePermission } from '../models/RolePermission';

export const requirePermission = (permissionKey: string) => {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const supabaseUserId = req.user.id;

    try {
      const userRoles = await UserRole.find({
        supabaseUserId,
        status: 'active',
      }).lean();

      if (!userRoles.length) {
        return res.status(403).json({ message: 'Forbidden: no active roles' });
      }

      const roleIds = userRoles.map((r) => r.roleId);
      const roles = await Role.find({ _id: { $in: roleIds } }).lean();

      const isSuperAdmin = roles.some((r) => r.key === 'super_admin');
      if (isSuperAdmin) {
        return next();
      }

      const permission = await Permission.findOne({ key: permissionKey }).lean();
      if (!permission) {
        return res.status(500).json({ message: 'Permission not configured', permissionKey });
      }

      const rolePermission = await RolePermission.findOne({
        roleId: { $in: roleIds },
        permissionId: permission._id,
        allowed: true,
      }).lean();

      if (!rolePermission) {
        return res.status(403).json({ message: 'Forbidden: missing permission', permissionKey });
      }

      // TODO: enforce branch/state/mandal/department scope constraints here using userRoles + rolePermission.constraints

      return next();
    } catch (err) {
      console.error('requirePermission error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
