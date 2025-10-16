import { Module } from '@nestjs/common';
import { DocumentController } from './api/v1/document.controller';
import { BlobStorageService } from './infrastructure/blob-storage/blob-storage.service';
import { ConfigServerModule } from '@modules/config/config.module';
import { FileProcessingService } from './domain/service/file-processing.service';
import { EmbeddingService } from './infrastructure/ai/embedding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunkEntity } from './domain/model/document-chunk.entity';
import { DocumentStorageService } from './domain/service/document-storage.service';

@Module({
  imports: [
    ConfigServerModule,
    TypeOrmModule.forFeature([DocumentChunkEntity]),
  ],
  controllers: [DocumentController],
  providers: [
    BlobStorageService,
    FileProcessingService,
    EmbeddingService,
    DocumentStorageService,
  ],
  exports: [
    BlobStorageService,
    FileProcessingService,
    EmbeddingService,
    DocumentStorageService,
  ],
})
export class DocumentModule {}
