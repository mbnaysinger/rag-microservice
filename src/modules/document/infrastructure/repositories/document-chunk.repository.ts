import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunkEntity } from '../entities/document-chunk.entity';
import { IDocumentChunkRepositoryPort } from '../../domain/port/document-chunk-repository.port';
import { DocumentChunk } from '../../domain/model/document-chunk.model';
import { DocumentChunkConverter } from '../converter/document-chunk.converter';

@Injectable()
export class DocumentChunkRepository implements IDocumentChunkRepositoryPort {
  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly documentChunkTypeOrmRepository: Repository<DocumentChunkEntity>,
  ) {}

  async saveMany(documentChunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const entitiesToSave = DocumentChunkConverter.toEntityList(documentChunks);
    const savedEntities = await this.documentChunkTypeOrmRepository.save(entitiesToSave);
    return DocumentChunkConverter.toDomainList(savedEntities);
  }
}
