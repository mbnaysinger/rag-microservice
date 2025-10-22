import { Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { IDocumentChunkRepositoryPort } from '../../domain/port/document-chunk-repository.port';
import { DocumentChunk } from '../../domain/model/document-chunk.model';
import { DocumentChunkConverter } from '../converter/document-chunk.converter';
import { DocumentChunkModel, DocumentChunkModelHelper } from '../models/document-chunk.model';
import { MongoDBConnectionService } from '../../../database/mongodb-connection.service';

@Injectable()
export class DocumentChunkRepository implements IDocumentChunkRepositoryPort {
  private collection: Collection<DocumentChunkModel>;

  constructor(
    private readonly mongoService: MongoDBConnectionService,
  ) {
    this.collection = this.mongoService.getCollection<DocumentChunkModel>(
      DocumentChunkModelHelper.getCollectionName()
    );
  }

  async saveMany(documentChunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const modelsToSave = DocumentChunkConverter.toModelList(documentChunks);

    if (modelsToSave.length === 0) {
      return [];
    }

    // Use MongoDB's insertMany for bulk operations
    const result = await this.collection.insertMany(modelsToSave);
    
    // Fetch the saved documents
    const savedModels = await this.collection
      .find({ _id: { $in: Object.values(result.insertedIds) } })
      .toArray();

    return DocumentChunkConverter.toDomainList(savedModels);
  }

  async findByDocumentId(documentId: string): Promise<DocumentChunk[]> {
    const models = await this.collection
      .find({ documentId })
      .sort({ chunkNumber: 1 })
      .toArray();
    
    return DocumentChunkConverter.toDomainList(models);
  }

  async findSimilarChunks(
    embedding: number[], 
    limit: number = 10,
    documentId?: string
  ): Promise<DocumentChunk[]> {
    // MongoDB Vector Search using $vectorSearch aggregation
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: limit * 10, // Search more candidates for better results
          limit: limit,
        }
      }
    ];

    // Add document filter if specified
    if (documentId) {
      pipeline.push({
        $match: { documentId }
      });
    }

    // Add score to results
    pipeline.push({
      $addFields: {
        score: { $meta: 'vectorSearchScore' }
      }
    });

    const models = await this.collection.aggregate(pipeline).toArray() as DocumentChunkModel[];
    return DocumentChunkConverter.toDomainList(models);
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.collection.deleteMany({ documentId });
  }
}