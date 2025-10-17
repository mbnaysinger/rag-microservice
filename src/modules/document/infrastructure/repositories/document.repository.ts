import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { IDocumentRepositoryPort } from '../../domain/port/document-repository.port';
import { Document } from '../../domain/model/document.model';
// Assuming a DocumentConverter will be created later
// import { DocumentConverter } from '../converter/document.converter';

@Injectable()
export class DocumentRepository implements IDocumentRepositoryPort {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentTypeOrmRepository: Repository<DocumentEntity>,
  ) {}

  async save(document: Document): Promise<Document> {
    // For now, directly save the domain model if it matches entity structure
    // A converter would be used here if domain and entity models diverge significantly
    const savedEntity = await this.documentTypeOrmRepository.save(
      document as DocumentEntity,
    );
    return savedEntity as Document; // Cast back to domain model
  }

  async findById(id: string): Promise<Document | undefined> {
    const foundEntity = await this.documentTypeOrmRepository.findOne({
      where: { id },
    });
    return foundEntity as Document | undefined;
  }

  async findByFileNameAndFileSize(
    fileName: string,
    fileSize: number,
  ): Promise<Document | undefined> {
    const foundEntity = await this.documentTypeOrmRepository.findOne({
      where: { fileName, fileSize },
    });
    return foundEntity as Document | undefined;
  }

  async update(document: Document): Promise<Document> {
    const updatedEntity = await this.documentTypeOrmRepository.save(
      document as DocumentEntity,
    );
    return updatedEntity as Document;
  }
}
