import { Document } from '../../domain/model/document.model';
import { DocumentModel, DocumentModelHelper } from '../models/document.model';
import { ObjectId } from 'mongodb';

export class DocumentConverter {
  public static toDomain(model: DocumentModel): Document {
    if (!model) return null;
    
    return {
      id: model._id?.toString() || model.id,
      fileName: model.fileName,
      fileSize: model.fileSize,
      fileExtension: model.fileExtension,
      author: model.author,
      creationDate: model.creationDate,
      uploadDate: model.uploadDate,
      storagePath: model.storagePath,
      processingStatus: model.processingStatus,
      version: model.version,
      updatedAt: model.updatedAt,
    } as Document;
  }

  public static toModel(domain: Document): DocumentModel {
    if (!domain) return null;
    
    const model: DocumentModel = {
      fileName: domain.fileName,
      fileSize: domain.fileSize,
      fileExtension: domain.fileExtension,
      author: domain.author,
      creationDate: domain.creationDate,
      uploadDate: domain.uploadDate,
      storagePath: domain.storagePath,
      processingStatus: domain.processingStatus,
      version: domain.version,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (domain.id) {
      model._id = new ObjectId(domain.id);
    }

    return model;
  }

  public static toDomainList(models: DocumentModel[]): Document[] {
    return models.map((model) => DocumentConverter.toDomain(model));
  }

  public static toModelList(domains: Document[]): DocumentModel[] {
    return domains.map((domain) => DocumentConverter.toModel(domain));
  }
}