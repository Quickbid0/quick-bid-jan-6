import { AdminUserService } from './admin-user.service';
import { CreateUserDto, UpdateUserDto, UserListDto } from './admin-user.service';
export declare class AdminUserController {
    private readonly adminUserService;
    constructor(adminUserService: AdminUserService);
    createUser(createUserDto: CreateUserDto, adminId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: "ADMIN" | "SELLER" | "BUYER";
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "REJECTED" | "DELETED";
        isActive: boolean;
        emailVerified: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listUsers(userListDto: UserListDto, adminId: string): Promise<{
        users: {
            id: string;
            email: string;
            name: string | null;
            role: "ADMIN" | "SELLER" | "BUYER";
            status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "REJECTED" | "DELETED";
            isActive: boolean;
            emailVerified: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    getUserStats(adminId: string): Promise<{
        total: number;
        byRole: Record<"ADMIN" | "SELLER" | "BUYER", number>;
        byStatus: Record<"ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "REJECTED" | "DELETED", number>;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
    }>;
    getUserById(userId: string, adminId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: "ADMIN" | "SELLER" | "BUYER";
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "REJECTED" | "DELETED";
        isActive: boolean;
        emailVerified: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, adminId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: "ADMIN" | "SELLER" | "BUYER";
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "REJECTED" | "DELETED";
        isActive: boolean;
        emailVerified: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
