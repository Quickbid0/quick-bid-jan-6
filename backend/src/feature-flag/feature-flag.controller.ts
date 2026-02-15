import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlagService } from './feature-flag.service';

@ApiTags('Feature Flags')
@Controller('feature-flags')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponse({ status: 200, description: 'Feature flags retrieved successfully' })
  async getAllFlags() {
    return await this.featureFlagService.getAllFlags();
  }

  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get feature flags by category' })
  @ApiParam({ name: 'category', description: 'Feature flag category' })
  @ApiResponse({ status: 200, description: 'Feature flags retrieved successfully' })
  async getFlagsByCategory(@Param('category') category: string) {
    return await this.featureFlagService.getFlagsByCategory(category);
  }

  @Get('launch-status')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get launch mode status summary' })
  @ApiResponse({ status: 200, description: 'Launch status retrieved successfully' })
  async getLaunchStatus() {
    return await this.featureFlagService.getLaunchModeStatus();
  }

  @Put(':key')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update feature flag value' })
  @ApiParam({ name: 'key', description: 'Feature flag key' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'boolean', description: 'New flag value' },
        description: { type: 'string', description: 'Optional description update' }
      },
      required: ['value']
    }
  })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully' })
  async updateFlag(
    @Param('key') key: string,
    @Body() body: { value: boolean; description?: string },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.featureFlagService.setFlag(key, body.value, adminId);

    return {
      success: true,
      message: `Feature flag ${key} updated to ${body.value}`,
      updatedBy: adminId,
    };
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk update multiple feature flags' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        flags: {
          type: 'object',
          additionalProperties: { type: 'boolean' },
          description: 'Object with flag keys and their new values'
        }
      },
      required: ['flags']
    }
  })
  @ApiResponse({ status: 200, description: 'Feature flags updated successfully' })
  async bulkUpdateFlags(
    @Body() body: { flags: Record<string, boolean> },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const updates = Object.entries(body.flags);
    const results = [];

    for (const [key, value] of updates) {
      try {
        await this.featureFlagService.setFlag(key, value, adminId);
        results.push({ key, success: true, value });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: failed === 0,
      message: `Updated ${successful} flags successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
      updatedBy: adminId,
    };
  }

  @Post('launch-mode/toggle')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Toggle launch mode on/off' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enable: { type: 'boolean', description: 'Enable or disable launch mode' }
      },
      required: ['enable']
    }
  })
  @ApiResponse({ status: 200, description: 'Launch mode toggled successfully' })
  async toggleLaunchMode(
    @Body() body: { enable: boolean },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.featureFlagService.setFlag('launch_mode_active', body.enable, adminId);

    return {
      success: true,
      message: `Launch mode ${body.enable ? 'ENABLED' : 'DISABLED'}`,
      launchModeActive: body.enable,
      updatedBy: adminId,
    };
  }

  @Post('emergency-pause/toggle')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Toggle emergency pause mode' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enable: { type: 'boolean', description: 'Enable or disable emergency pause' }
      },
      required: ['enable']
    }
  })
  @ApiResponse({ status: 200, description: 'Emergency pause toggled successfully' })
  async toggleEmergencyPause(
    @Body() body: { enable: boolean },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.featureFlagService.setFlag('system_emergency_pause', body.enable, adminId);

    return {
      success: true,
      message: `Emergency pause ${body.enable ? 'ENABLED' : 'DISABLED'}`,
      emergencyPaused: body.enable,
      updatedBy: adminId,
      warning: body.enable ? 'CRITICAL: All marketplace activity paused!' : 'Marketplace activity resumed',
    };
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Clear feature flag cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    this.featureFlagService.clearCache();

    return {
      success: true,
      message: 'Feature flag cache cleared',
    };
  }

  @Get('check/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a feature flag is enabled' })
  @ApiParam({ name: 'key', description: 'Feature flag key' })
  @ApiResponse({ status: 200, description: 'Flag status retrieved successfully' })
  async checkFlag(@Param('key') key: string) {
    const enabled = await this.featureFlagService.isEnabled(key);

    return {
      key,
      enabled,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('check-multiple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check multiple feature flags at once' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of feature flag keys to check'
        }
      },
      required: ['keys']
    }
  })
  @ApiResponse({ status: 200, description: 'Flag statuses retrieved successfully' })
  async checkMultipleFlags(@Body() body: { keys: string[] }) {
    const flags = await this.featureFlagService.getMultipleFlags(body.keys);

    return {
      flags,
      timestamp: new Date().toISOString(),
    };
  }
}
