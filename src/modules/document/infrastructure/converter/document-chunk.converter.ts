import { DocumentChunk } from '../../domain/model/document-chunk.model';
import { DocumentChunkEntity } from '../entities/document-chunk.entity';

export class DocumentChunkConverter {
  public static toDomain(entity: DocumentChunkEntity): DocumentChunk {
    if (!entity) return null;
    return new DocumentChunk(
      entity.content,
      JSON.parse(entity.embedding), // Convert JSON string back to number array
      entity.chunkNumber,
      entity.documentId,
      entity.id,
      entity.createdAt,
    );
  }

  public static toEntity(domain: DocumentChunk): DocumentChunkEntity {
    if (!domain) return null;
    const entity = new DocumentChunkEntity();
    entity.id = domain.id;
    entity.content = domain.content;
    entity.embedding = JSON.stringify(domain.embedding); // Convert number array to JSON string
    entity.chunkNumber = domain.chunkNumber;
    entity.createdAt = domain.createdAt;
    entity.documentId = domain.documentId;
    return entity;
  }

  public static toDomainList(entities: DocumentChunkEntity[]): DocumentChunk[] {
    return entities.map((entity) => DocumentChunkConverter.toDomain(entity));
  }

  public static toEntityList(domains: DocumentChunk[]): DocumentChunkEntity[] {
    return domains.map((domain) => DocumentChunkConverter.toEntity(domain));
  }
}
