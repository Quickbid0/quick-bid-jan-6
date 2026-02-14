import { PrismaService } from '../prisma/prisma.service';
import { ObservabilityService } from '../observability/observability.service';
type Role = 'ADMIN' | 'SELLER' | 'BUYER';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'REJECTED' | 'DELETED';
type Account = {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    status: UserStatus;
    isActive: boolean;
    emailVerified: string;
    createdAt: Date;
    updatedAt: Date;
};
export interface CreateUserDto {
    email: string;
    name: string;
    role: 'SELLER' | 'BUYER';
    status?: UserStatus;
    sendInvite?: boolean;
}
export interface UpdateUserDto {
    status?: UserStatus;
    isActive?: boolean;
}
export interface UserListDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
    isActive?: boolean;
}
export declare class AdminUserService {
    private prismaService;
    private observabilityService;
    constructor(prismaService: PrismaService, observabilityService: ObservabilityService);
    createUser(createUserDto: CreateUserDto, adminId: string): Promise<Account>;
    listUsers(userListDto: UserListDto, adminId: string): Promise<{
        users: Account[];
        total: number;
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, adminId: string): Promise<Account>;
    getUserById(userId: string, adminId: string): Promise<Account>;
    getUserStats(adminId: string): Promise<{
        total: number;
        byRole: Record<Role, number>;
        byStatus: Record<UserStatus, number>;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
    }>;
    private generateVerificationToken;
    private generateSecurePassword;
}
export {};
