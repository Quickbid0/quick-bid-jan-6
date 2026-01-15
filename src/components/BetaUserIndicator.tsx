// Beta User Indicator Component
import React from 'react';
import { EnvironmentBadge } from './EnvironmentBadge';
import { UserAccessLevel } from '../services/userAccessService';

interface BetaUserIndicatorProps {
  userAccessLevel: UserAccessLevel;
  className?: string;
}

export const BetaUserIndicator: React.FC<BetaUserIndicatorProps> = ({
  userAccessLevel,
  className = ''
}) => {
  if (userAccessLevel === 'public') {
    return null;
  }
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <EnvironmentBadge type="user" level={userAccessLevel} />
      {userAccessLevel === 'beta' && (
        <span className="text-sm text-blue-600">
          You have access to beta features
        </span>
      )}
      {userAccessLevel === 'internal' && (
        <span className="text-sm text-purple-600">
          Admin access enabled
        </span>
      )}
    </div>
  );
};
