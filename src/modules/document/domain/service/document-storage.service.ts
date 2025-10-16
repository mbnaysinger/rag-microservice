import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunkEntity } from '../model/document-chunk.entity';

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);

  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly chunkRepository: Repository<DocumentChunkEntity>,
  ) {}

  async saveDocumentChunks(
    chunks: string[],
    embeddings: number[][],
    originalDocumentUrl: string,
  ): Promise<void> {
    if (chunks.length !== embeddings.length) {
      throw new Error('The number of chunks and embeddings must be equal.');
    }

    this.logger.log(`Saving ${chunks.length} chunks to the database...`);

    const entities = chunks.map((chunk, index) => {
      const entity = new DocumentChunkEntity();
      entity.chunkText = chunk;
      entity.embedding = JSON.stringify(embeddings[index]); // Serializa o vetor para JSON
      entity.originalDocumentUrl = originalDocumentUrl;
      entity.chunkNumber = index;
      return entity;
    });

    await this.chunkRepository.save(entities);

    this.logger.log('Successfully saved all document chunks.');
  }
}
