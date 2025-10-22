import { ObjectId } from 'mongodb';

export interface DocumentChunkModel {
  _id?: ObjectId;
  id?: string;
  content: string;
  embedding: number[]; // Store as native array for MongoDB vector search
  chunkNumber: number;
  documentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentChunkModelHelper {
  static toDocumentChunk(model: DocumentChunkModel): DocumentChunkModel {
    return {
      ...model,
      id: model._id?.toString() || model.id,
    };
  }

  static fromDomain(domain: any): Omit<DocumentChunkModel, '_id'> {
    return {
      content: domain.content,
      embedding: domain.embedding,
      chunkNumber: domain.chunkNumber,
      documentId: domain.documentId,
      createdAt: domain.createdAt || new Date(),
      updatedAt: new Date(),
    };
  }

  static getCollectionName(): string {
    return 'document_chunks';
  }

  static getVectorSearchIndexDefinition() {
    return {
      name: 'vector_index',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 1536, // OpenAI ada-002 embedding dimension
            similarity: 'cosine'
          },
          {
            type: 'filter',
            path: 'documentId'
          }
        ]
      }
    };
  }
}