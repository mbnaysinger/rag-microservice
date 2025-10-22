import { Injectable } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { IDocumentRepositoryPort } from '../../domain/port/document-repository.port';
import { Document } from '../../domain/model/document.model';
import { DocumentModel, DocumentModelHelper } from '../models/document.model';
import { DocumentConverter } from '../converter/document.converter';
import { MongoDBConnectionService } from '../../../database/mongodb-connection.service';

@Injectable()
export class DocumentRepository implements IDocumentRepositoryPort {
  private collection: Collection<DocumentModel>;

  constructor(
    private readonly mongoService: MongoDBConnectionService,
  ) {
    this.collection = this.mongoService.getCollection<DocumentModel>(
      DocumentModelHelper.getCollectionName()
    );
  }

  async save(document: Document): Promise<Document> {
    const model = DocumentConverter.toModel(document);
    
    if (model._id) {
      // Update existing document
      const { _id, ...updateData } = model;
      updateData.updatedAt = new Date();
      
      const result = await this.collection.findOneAndUpdate(
        { _id },
        { $set: updateData },
        { returnDocument: 'after', upsert: false }
      );
      
      return DocumentConverter.toDomain(result);
    } else {
      // Create new document
      const result = await this.collection.insertOne(model);
      const savedModel = await this.collection.findOne({ _id: result.insertedId });
      return DocumentConverter.toDomain(savedModel);
    }
  }

  async findById(id: string): Promise<Document | undefined> {
    const objectId = new ObjectId(id);
    const model = await this.collection.findOne({ _id: objectId });
    return model ? DocumentConverter.toDomain(model) : undefined;
  }

  async findByFileNameAndFileSize(
    fileName: string,
    fileSize: number,
  ): Promise<Document | undefined> {
    const model = await this.collection.findOne({ fileName, fileSize });
    return model ? DocumentConverter.toDomain(model) : undefined;
  }

  async update(document: Document): Promise<Document> {
    return this.save(document); // Reuse save method for updates
  }
}
