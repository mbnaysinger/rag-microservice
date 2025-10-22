import { ObjectId } from 'mongodb';

export interface DocumentModel {
  _id?: ObjectId;
  id?: string;
  fileName: string;
  fileSize: number;
  fileExtension: string;
  author?: string;
  creationDate?: Date;
  uploadDate: Date;
  storagePath: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class DocumentModelHelper {
  static toDocument(model: DocumentModel): DocumentModel {
    return {
      ...model,
      id: model._id?.toString() || model.id,
    };
  }

  static fromDomain(domain: any): Omit<DocumentModel, '_id'> {
    return {
      fileName: domain.fileName,
      fileSize: domain.fileSize,
      fileExtension: domain.fileExtension,
      author: domain.author,
      creationDate: domain.creationDate,
      uploadDate: domain.uploadDate,
      storagePath: domain.storagePath,
      processingStatus: domain.processingStatus,
      version: domain.version,
      createdAt: domain.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
    };
  }

  static getCollectionName(): string {
    return 'documents';
  }
}