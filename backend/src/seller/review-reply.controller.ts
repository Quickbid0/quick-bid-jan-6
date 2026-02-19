import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DTO for creating review reply
class CreateReviewReplyDto {
  sellerId: string;
  comment: string;
  isPublic: boolean = true;
}

@Controller('api/review')
export class ReviewReplyController {
  @Post(':reviewId/reply')
  async createReply(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReviewReplyDto,
  ) {
    // Validate input
    if (!dto.comment || dto.comment.trim().length === 0) {
      throw new BadRequestException('Reply comment cannot be empty');
    }

    if (dto.comment.length > 500) {
      throw new BadRequestException('Reply must be 500 characters or less');
    }

    try {
      // Get the review
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }

      // Verify seller is allowed to reply
      if (review.productId) {
        const product = await prisma.product.findUnique({
          where: { id: review.productId },
        });

        if (!product || product.sellerId !== dto.sellerId) {
          throw new ForbiddenException(
            'You are not the seller of this product',
          );
        }
      }

      // Check if reply already exists
      const existingReply = await prisma.reviewReply.findFirst({
        where: {
          reviewId,
          sellerId: dto.sellerId,
        },
      });

      if (existingReply) {
        // Update existing reply
        const updated = await prisma.reviewReply.update({
          where: { id: existingReply.id },
          data: {
            comment: dto.comment,
            isPublic: dto.isPublic,
          },
        });
        return { success: true, reply: updated, isUpdate: true };
      }

      // Create new reply
      const reply = await prisma.reviewReply.create({
        data: {
          reviewId,
          sellerId: dto.sellerId,
          comment: dto.comment,
          isPublic: dto.isPublic,
        },
      });

      return { success: true, reply, isUpdate: false };
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error creating review reply:', error);
      throw new HttpException(
        'Failed to create reply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':reviewId/replies')
  async getReplies(@Param('reviewId') reviewId: string) {
    try {
      const replies = await prisma.reviewReply.findMany({
        where: {
          reviewId,
          isPublic: true,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return replies;
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw new HttpException(
        'Failed to fetch replies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':reviewId/my-reply')
  async getMyReply(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ) {
    try {
      const sellerId = req.user?.id;

      if (!sellerId) {
        throw new ForbiddenException('Requires authentication');
      }

      const reply = await prisma.reviewReply.findFirst({
        where: {
          reviewId,
          sellerId,
        },
      });

      return reply || null;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error('Error fetching reply:', error);
      throw new HttpException(
        'Failed to fetch reply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
