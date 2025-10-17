import { Module } from '@nestjs/common';
import { DocumentController } from './api/v1/rest/document.controller';
import { ConfigServerModule } from '@modules/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunkEntity } from './infrastructure/entities/document-chunk.entity';
import { DocumentEntity } from './infrastructure/entities/document.entity';

// Domain Services
import { DocumentOrchestratorService } from './domain/service/document-orchestrator.service';

// Ports
import { IDocumentStoragePort } from './domain/port/document-storage.port';
import { IFileProcessingPort } from './domain/port/file-processing.port';
import { IEmbeddingPort } from './domain/port/embedding.port';
import { IDocumentChunkRepositoryPort } from './domain/port/document-chunk-repository.port';
import { IDocumentRepositoryPort } from './domain/port/document-repository.port';

// Infrastructure Adapters
import { BlobStorageService } from './infrastructure/blob-storage/blob-storage.service';
import { FileProcessingService } from './domain/service/file-processing.service';
import { EmbeddingService } from './infrastructure/ai/embedding.service';
import { DocumentChunkRepository } from './infrastructure/repositories/document-chunk.repository';
import { DocumentRepository } from './infrastructure/repositories/document.repository';

@Module({
  imports: [
    ConfigServerModule,
    TypeOrmModule.forFeature([DocumentChunkEntity, DocumentEntity]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentOrchestratorService,
    {
      provide: IDocumentStoragePort,
      useClass: BlobStorageService,
    },
    {
      provide: IFileProcessingPort,
      useClass: FileProcessingService,
    },
    {
      provide: IEmbeddingPort,
      useClass: EmbeddingService,
    },
    {
      provide: IDocumentChunkRepositoryPort,
      useClass: DocumentChunkRepository,
    },
    {
      provide: IDocumentRepositoryPort,
      useClass: DocumentRepository,
    },
  ],
  exports: [
    IDocumentStoragePort,
    IFileProcessingPort,
    IEmbeddingPort,
    IDocumentChunkRepositoryPort,
    IDocumentRepositoryPort,
    DocumentOrchestratorService,
  ],
})
export class DocumentModule {}
