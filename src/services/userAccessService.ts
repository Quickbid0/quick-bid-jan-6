// User Access Control System
export type UserAccessLevel = 'internal' | 'beta' | 'public';

export interface User {
  id: string;
  email: string;
  name: string;
  accessLevel: UserAccessLevel;
  isBetaUser: boolean;
  isVerified: boolean;
  walletBalance: number;
  createdAt: Date;
}

export interface BetaUserWhitelist {
  userId: string;
  email: string;
  approvedBy: string;
  approvedAt: Date;
  permissions: ('bid' | 'sell' | 'admin')[];
}

// User Access Service
export class UserAccessService {
  private static readonly BETA_WHITELIST: BetaUserWhitelist[] = [
    // TODO: Load from database
  ];
  
  static async getUserAccessLevel(userId: string): Promise<UserAccessLevel> {
    const user = await this.getUserById(userId);
    return user?.accessLevel || 'public';
  }
  
  static async isBetaUser(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.isBetaUser || false;
  }
  
  static async canBid(userId: string): Promise<boolean> {
    const accessLevel = await this.getUserAccessLevel(userId);
    const isBeta = await this.isBetaUser(userId);
    
    // Beta users and internal users can bid
    return accessLevel === 'internal' || (accessLevel === 'beta' && isBeta);
  }
  
  static async canSell(userId: string): Promise<boolean> {
    const accessLevel = await this.getUserAccessLevel(userId);
    const user = await this.getUserById(userId);
    
    // Internal users and verified beta sellers can sell
    return accessLevel === 'internal' || 
           (accessLevel === 'beta' && user?.isBetaUser === true && user?.isVerified === true);
  }
  
  static async addToBetaWhitelist(userId: string, email: string, approvedBy: string): Promise<void> {
    // TODO: Implement database insertion
    const whitelistEntry: BetaUserWhitelist = {
      userId,
      email,
      approvedBy,
      approvedAt: new Date(),
      permissions: ['bid', 'sell']
    };
    
    this.BETA_WHITELIST.push(whitelistEntry);
  }
  
  static async removeFromBetaWhitelist(userId: string): Promise<void> {
    // TODO: Implement database removal
    const index = this.BETA_WHITELIST.findIndex(entry => entry.userId === userId);
    if (index > -1) {
      this.BETA_WHITELIST.splice(index, 1);
    }
  }
  
  private static async getUserById(userId: string): Promise<User | null> {
    // TODO: Implement user fetching from database
    return null;
  }
}
