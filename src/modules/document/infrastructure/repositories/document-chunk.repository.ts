import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DocumentChunkEntity } from '../entities/document-chunk.entity';
import { IDocumentChunkRepositoryPort } from '../../domain/port/document-chunk-repository.port';
import { DocumentChunk } from '../../domain/model/document-chunk.model';
import { DocumentChunkConverter } from '../converter/document-chunk.converter';

@Injectable()
export class DocumentChunkRepository implements IDocumentChunkRepositoryPort {
  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly documentChunkTypeOrmRepository: Repository<DocumentChunkEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async saveMany(documentChunks: DocumentChunk[]): Promise<DocumentChunk[]> {
  const entitiesToSave = DocumentChunkConverter.toEntityList(documentChunks);

  if (entitiesToSave.length === 0) {
    return [];
  }

  // 1. Inicie uma transação
  await this.entityManager.transaction(
    async (transactionalEntityManager) => {
      // 2. Itere sobre cada entidade e insira UMA de cada vez
      for (const entity of entitiesToSave) {
        
        // 3. Use o QueryBuilder do 'transactionalEntityManager'
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(DocumentChunkEntity)
          .values({
            // 4. Mapeie os campos manualmente
            id: entity.id,
            content: entity.content,
            chunkNumber: entity.chunkNumber,
            createdAt: entity.createdAt,
            documentId: entity.documentId,
            
            // 5. Use a sintaxe de função com .setParameter()
            //    (Mais limpa e segura para inserts únicos)
            embedding: () => `string_to_vector(:embeddingString)`,
          })
          .setParameter('embeddingString', entity.embedding) // <-- Passe a string JSON
          .execute();
      }
    },
  );

  // 6. Após a transação, busque as entidades salvas
  const savedIds = entitiesToSave.map((e) => e.id);
  const savedEntities = await this.documentChunkTypeOrmRepository.findByIds(
    savedIds,
  );

  return DocumentChunkConverter.toDomainList(savedEntities);
}
}