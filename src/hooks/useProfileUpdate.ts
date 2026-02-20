import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

/**
 * FIX 19: Profile Name Not Updating in Sidebar (ST-04)
 * After profile update API succeeds, update auth store immediately so sidebar reflects change
 */

export const useProfileUpdate = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  const updateProfile = async (data: {
    displayName?: string;
    email?: string;
    phone?: string;
    bio?: string;
  }) => {
    try {
      const response = await api.put('/api/profile', data);

      // ✅ FIX 19: Update auth store immediately for instant sidebar update
      if (response.data.success && response.data.user) {
        updateUser(response.data.user);
        
        // If displayName changed, notify parent components
        return {
          success: true,
          user: response.data.user,
        };
      }

      return { success: false };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  return { updateProfile };
};

/**
 * Hook to sync user profile updates across components
 */
export const useSyncProfileUpdates = () => {
  const { user, updateUser } = useAuthStore((state) => ({
    user: state.user,
    updateUser: state.updateUser,
  }));

  const syncProfile = async () => {
    try {
      const response = await api.get('/api/profile');
      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to sync profile:', err);
    }
  };

  return { syncProfile, user };
};
