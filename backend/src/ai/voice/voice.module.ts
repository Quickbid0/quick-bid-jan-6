import { Module } from '@nestjs/common';
import { VoiceParserService } from './voice-parser.service';

@Module({
  providers: [VoiceParserService],
  exports: [VoiceParserService],
})
export class VoiceModule {}
