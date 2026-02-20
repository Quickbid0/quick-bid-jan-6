import api from '../services/api';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

/**
 * FIX 8: Delete Active Auction Warning (F-04)
 * Deleting an auction with live bids shows confirmation + refunds bidders
 */

export const useAuctionDelete = () => {
  const { confirm } = useConfirmDialog();

  const deleteAuction = async (auctionId: string, auction: {
    id: string;
    title: string;
    status: string;
    bidsCount?: number;
  }) => {
    // Check if auction has bids or is still active
    if ((auction.bidsCount || 0) > 0 || auction.status === 'active') {
      const confirmed = await confirm({
        title: 'Delete Active Auction?',
        message: `This auction has ${auction.bidsCount || 0} bids. All bids will be cancelled and bidders refunded. This cannot be undone.`,
        confirmLabel: 'Delete & Refund',
        cancelLabel: 'Cancel',
        variant: 'danger',
      });

      if (!confirmed) {
        return { success: false, cancelled: true };
      }
    }

    try {
      const response = await api.delete(`/api/auctions/${auctionId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: `Auction deleted. ${response.data.refundedCount || 0} bidders have been refunded.`,
          refundedCount: response.data.refundedCount,
        };
      }
    } catch (err: any) {
      const error = err.response?.data?.error || 'Failed to delete auction';
      
      // Check for non-deletable state
      if (err.response?.status === 400) {
        return {
          success: false,
          error: `Cannot delete: ${error}`,
        };
      }

      return { success: false, error };
    }

    return { success: false, error: 'Unknown error' };
  };

  return { deleteAuction };
};
