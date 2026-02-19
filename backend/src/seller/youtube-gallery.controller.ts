import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';

const prisma = new PrismaClient();

// DTO for adding YouTube video
class AddYoutubeVideoDto {
  youtubeUrl: string;
  videoId: string;
  title?: string;
  description?: string;
}

// Helper to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Helper to sanitize YouTube URL (XSS protection)
function sanitizeYoutubeUrl(url: string): string | null {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  // Validate video ID format (alphanumeric, hyphen, underscore only)
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}

@Controller('api/seller/youtube')
export class YoutubeGalleryController {
  @Post('add')
  async addVideo(
    @Body() dto: AddYoutubeVideoDto,
    @Param('sellerId') sellerId: string,
  ) {
    // Validate URL
    const sanitized = sanitizeYoutubeUrl(dto.youtubeUrl);
    if (!sanitized) {
      throw new BadRequestException('Invalid YouTube URL');
    }

    try {
      // Check for duplicates
      const existing = await prisma.youtubeEmbed.findFirst({
        where: {
          sellerId,
          videoId: sanitized.split('/').pop(),
        },
      });

      if (existing) {
        throw new BadRequestException('This video is already in your gallery');
      }

      // Create new embed
      const video = await prisma.youtubeEmbed.create({
        data: {
          sellerId,
          youtubeUrl: dto.youtubeUrl,
          videoId: dto.videoId,
          title: dto.title || 'Untitled Video',
          description: dto.description,
          thumbnail: `https://img.youtube.com/vi/${dto.videoId}/maxresdefault.jpg`,
          displayOrder: 0,
        },
      });

      return { success: true, video };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to add video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':sellerId')
  async getGallery(@Param('sellerId') sellerId: string) {
    try {
      const videos = await prisma.youtubeEmbed.findMany({
        where: {
          sellerId,
          isActive: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      });

      return videos;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch gallery',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':videoId')
  async deleteVideo(@Param('videoId') videoId: string) {
    try {
      await prisma.youtubeEmbed.update({
        where: { id: videoId },
        data: { isActive: false },
      });

      return { success: true, message: 'Video removed' };
    } catch (error) {
      throw new HttpException(
        'Failed to remove video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
