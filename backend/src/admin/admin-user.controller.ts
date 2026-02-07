import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Param, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Body 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminUserService } from './admin-user.service';
import { CreateUserDto, UpdateUserDto, UserListDto } from './admin-user.service';

@ApiTags('Admin User Management')
@Controller('admin/users')
@UseGuards(RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user (seller or buyer only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Body('adminId') adminId: string,
  ) {
    return await this.adminUserService.createUser(createUserDto, adminId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async listUsers(
    @Query() userListDto: UserListDto,
    @Query('adminId') adminId: string,
  ) {
    return await this.adminUserService.listUsers(userListDto, adminId);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getUserStats(@Query('adminId') adminId: string) {
    return await this.adminUserService.getUserStats(adminId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('id') userId: string,
    @Query('adminId') adminId: string,
  ) {
    return await this.adminUserService.getUserById(userId, adminId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (activate/deactivate)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Body('adminId') adminId: string,
  ) {
    return await this.adminUserService.updateUser(userId, updateUserDto, adminId);
  }
}
