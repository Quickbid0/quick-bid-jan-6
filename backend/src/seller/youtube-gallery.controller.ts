import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
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

// DTO intentionally does not include sellerId because the route carries it


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

@Controller('api/seller/:sellerId/youtube')
export class YoutubeGalleryController {
  @Post('add')
  async addVideo(
    @Param('sellerId') sellerId: string,
    @Body() dto: AddYoutubeVideoDto,
  ) {
    // sanitize and validate URL
    const sanitizedUrl = sanitizeYoutubeUrl(dto.youtubeUrl);
    if (!sanitizedUrl) {
      throw new BadRequestException('Invalid YouTube URL');
    }

    const videoId = sanitizedUrl.split('/').pop();
    if (!videoId) {
      throw new BadRequestException('Unable to extract video ID');
    }

    // sanitize title/description (XSS protection)
    const safeTitle = dto.title ? DOMPurify.sanitize(dto.title) : 'Untitled Video';
    const safeDescription = dto.description ? DOMPurify.sanitize(dto.description) : undefined;

    try {
      // Check for duplicates using canonical id
      const existing = await prisma.youtubeEmbed.findFirst({
        where: { sellerId, videoId },
      });

      if (existing) {
        throw new BadRequestException('This video is already in your gallery');
      }

      // create record with sanitized url and canonical id
      const video = await prisma.youtubeEmbed.create({
        data: {
          sellerId,
          youtubeUrl: sanitizedUrl,
          videoId,
          title: safeTitle,
          description: safeDescription,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          displayOrder: 0,
        },
      });

      return { success: true, video };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Failed to add video', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
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
  async deleteVideo(
    @Param('sellerId') sellerId: string,
    @Param('videoId') videoId: string,
  ) {
    try {
      // verify ownership while marking inactive
      await prisma.youtubeEmbed.updateMany({
        where: { id: videoId, sellerId },
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
