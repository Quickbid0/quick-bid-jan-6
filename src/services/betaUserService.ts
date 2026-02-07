// Beta User Management Service
export interface BetaUser {
  id: string;
  email: string;
  name: string;
  betaAccess: boolean;
  betaRole: 'buyer' | 'seller' | 'admin';
  isVerified: boolean;
  approvedBy: string;
  approvedAt: Date;
  lastActive: Date;
  permissions: ('bid' | 'sell' | 'admin')[];
}

export interface BetaUserRequest {
  id: string;
  email: string;
  name: string;
  requestedRole: 'buyer' | 'seller';
  requestReason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewReason?: string;
}

export class BetaUserService {
  private static readonly MAX_BETA_USERS = 10000; // Increased for full launch
  private static betaUsers: BetaUser[] = [];
  private static betaRequests: BetaUserRequest[] = [];

  static async requestBetaAccess(
    email: string,
    name: string,
    requestedRole: 'buyer' | 'seller',
    requestReason: string
  ): Promise<BetaUserRequest> {
    const request: BetaUserRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      requestedRole,
      requestReason,
      status: 'pending',
      requestedAt: new Date()
    };

    this.betaRequests.push(request);
    return request;
  }

  static async approveBetaUser(
    requestId: string,
    adminId: string,
    permissions: ('bid' | 'sell' | 'admin')[]
  ): Promise<BetaUser> {
    const request = this.betaRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Beta request not found');
    }

    // Check if we've reached max beta users
    if (this.betaUsers.length >= this.MAX_BETA_USERS) {
      throw new Error('Beta user limit reached');
    }

    const betaUser: BetaUser = {
      id: `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: request.email,
      name: request.name,
      betaAccess: true,
      betaRole: request.requestedRole,
      isVerified: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      lastActive: new Date(),
      permissions
    };

    this.betaUsers.push(betaUser);
    
    // Update request status
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    return betaUser;
  }

  static async rejectBetaUser(
    requestId: string,
    adminId: string,
    reviewReason: string
  ): Promise<void> {
    const request = this.betaRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Beta request not found');
    }

    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.reviewReason = reviewReason;
  }

  static async revokeBetaAccess(userId: string, adminId: string): Promise<void> {
    const userIndex = this.betaUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Beta user not found');
    }

    this.betaUsers.splice(userIndex, 1);
  }

  static async getBetaUser(userId: string): Promise<BetaUser | null> {
    return this.betaUsers.find(u => u.id === userId) || null;
  }

  static async getBetaUserByEmail(email: string): Promise<BetaUser | null> {
    return this.betaUsers.find(u => u.email === email) || null;
  }

  static async getAllBetaUsers(): Promise<BetaUser[]> {
    return [...this.betaUsers];
  }

  static async getPendingBetaRequests(): Promise<BetaUserRequest[]> {
    return this.betaRequests.filter(r => r.status === 'pending');
  }

  static async canUserBid(userId: string): Promise<boolean> {
    const user = await this.getBetaUser(userId);
    if (!user || !user.betaAccess) {
      return false;
    }

    return user.permissions.includes('bid');
  }

  static async canUserSell(userId: string): Promise<boolean> {
    const user = await this.getBetaUser(userId);
    if (!user || !user.betaAccess) {
      return false;
    }

    return user.permissions.includes('sell');
  }

  static async isBetaUser(userId: string): Promise<boolean> {
    const user = await this.getBetaUser(userId);
    return user?.betaAccess || false;
  }

  static async getUserRole(userId: string): Promise<'guest' | 'beta_buyer' | 'beta_seller' | 'admin'> {
    const user = await this.getBetaUser(userId);
    
    if (!user || !user.betaAccess) {
      return 'guest';
    }

    if (user.betaRole === 'admin') {
      return 'admin';
    }

    return user.betaRole === 'buyer' ? 'beta_buyer' : 'beta_seller';
  }

  static async updateUserLastActive(userId: string): Promise<void> {
    const user = await this.getBetaUser(userId);
    if (user) {
      user.lastActive = new Date();
    }
  }

  static getBetaUserStats(): {
    total: number;
    buyers: number;
    sellers: number;
    admins: number;
    active: number;
  } {
    const stats = {
      total: this.betaUsers.length,
      buyers: this.betaUsers.filter(u => u.betaRole === 'buyer').length,
      sellers: this.betaUsers.filter(u => u.betaRole === 'seller').length,
      admins: this.betaUsers.filter(u => u.betaRole === 'admin').length,
      active: this.betaUsers.filter(u => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return u.lastActive > oneWeekAgo;
      }).length
    };

    return stats;
  }
}
