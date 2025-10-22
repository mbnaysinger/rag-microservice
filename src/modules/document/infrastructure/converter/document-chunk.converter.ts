import { DocumentChunk } from '../../domain/model/document-chunk.model';
import { DocumentChunkModel } from '../models/document-chunk.model';
import { ObjectId } from 'mongodb';

export class DocumentChunkConverter {
  public static toDomain(model: DocumentChunkModel): DocumentChunk {
    if (!model) return null;
    return new DocumentChunk(
      model.content,
      model.embedding, // Direct number array, no JSON parsing needed
      model.chunkNumber,
      model.documentId,
      model._id?.toString() || model.id,
      model.createdAt,
    );
  }

  public static toModel(domain: DocumentChunk): DocumentChunkModel {
    if (!domain) return null;
    
    const model: DocumentChunkModel = {
      content: domain.content,
      embedding: domain.embedding, // Direct number array for MongoDB vector search
      chunkNumber: domain.chunkNumber,
      documentId: domain.documentId,
      createdAt: domain.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (domain.id) {
      model._id = new ObjectId(domain.id);
    }

    return model;
  }

  public static toDomainList(models: DocumentChunkModel[]): DocumentChunk[] {
    return models.map((model) => DocumentChunkConverter.toDomain(model));
  }

  public static toModelList(domains: DocumentChunk[]): DocumentChunkModel[] {
    return domains.map((domain) => DocumentChunkConverter.toModel(domain));
  }
}
