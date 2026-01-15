import React from 'react';
import { Check, X, Shield, Info } from 'lucide-react';

interface PermissionModule {
  name: string;
  description: string;
  permissions: {
    superadmin: boolean;
    admin: boolean;
    demoadmin: boolean;
    staff: boolean;
    moderator: boolean;
  };
}

const modules: PermissionModule[] = [
  {
    name: 'User Management',
    description: 'View, edit, suspend, and delete users',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: false, moderator: false }
  },
  {
    name: 'Staff Management',
    description: 'Manage internal staff and assignments',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: false, moderator: false }
  },
  {
    name: 'Financials',
    description: 'View revenue, payouts, and fees',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: false, moderator: false }
  },
  {
    name: 'System Settings',
    description: 'Configure platform settings and global variables',
    permissions: { superadmin: true, admin: false, demoadmin: true, staff: false, moderator: false }
  },
  {
    name: 'Content Moderation',
    description: 'Review and approve listings/comments',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: true, moderator: true }
  },
  {
    name: 'Product Management',
    description: 'Manage categories, products, and inventory',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: true, moderator: false }
  },
  {
    name: 'Auctions',
    description: 'Manage live and timed auctions',
    permissions: { superadmin: true, admin: true, demoadmin: true, staff: true, moderator: false }
  },
  {
    name: 'Data Export',
    description: 'Export user and transaction data',
    permissions: { superadmin: true, admin: true, demoadmin: false, staff: false, moderator: false }
  },
  {
    name: 'Role Assignment',
    description: 'Assign roles to users',
    permissions: { superadmin: true, admin: false, demoadmin: false, staff: false, moderator: false }
  },
];

const PermissionsMatrix: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          Permissions & Roles Matrix
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of role-based access control (RBAC) across the platform.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3">
                  Module / Feature
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Super Admin
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Demo Admin
                  <span className="block text-[10px] normal-case text-gray-400">(Read Only)</span>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Moderator
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {modules.map((module, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {module.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {module.description}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {module.permissions.superadmin ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {module.permissions.admin ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {module.permissions.demoadmin ? (
                      <div className="flex flex-col items-center justify-center">
                         <Check className="h-5 w-5 text-blue-500 mx-auto" />
                      </div>
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {module.permissions.staff ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {module.permissions.moderator ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Note:</strong> Demo Admin has access to view most modules but cannot perform destructive actions (create, update, delete).
              This matrix reflects visibility permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
