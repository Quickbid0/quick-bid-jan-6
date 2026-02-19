import { Module } from '@nestjs/common';
import { YoutubeGalleryController } from './youtube-gallery.controller';
import { ReviewReplyController } from './review-reply.controller';
import { ToySafetyController } from './toy-safety.controller';

@Module({
  controllers: [
    YoutubeGalleryController,
    ReviewReplyController,
    ToySafetyController,
  ],
  providers: [],
  exports: [],
})
export class SellerModule {}
