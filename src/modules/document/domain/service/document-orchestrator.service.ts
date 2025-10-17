import { ConflictException, Injectable } from '@nestjs/common';
import { IFileProcessingPort } from '../port/file-processing.port';
import { IEmbeddingPort } from '../port/embedding.port';
import { IDocumentStoragePort } from '../port/document-storage.port';
import { IDocumentChunkRepositoryPort } from '../port/document-chunk-repository.port';
import { IDocumentRepositoryPort } from '../port/document-repository.port';
import { DocumentChunk } from '../model/document-chunk.model';
import { Document } from '../model/document.model';

@Injectable()
export class DocumentOrchestratorService {
  constructor(
    private readonly fileProcessingService: IFileProcessingPort,
    private readonly embeddingService: IEmbeddingPort,
    private readonly documentStorageService: IDocumentStoragePort,
    private readonly documentChunkRepository: IDocumentChunkRepositoryPort,
    private readonly documentRepository: IDocumentRepositoryPort,
  ) {}

  async processAndStoreDocument(file: Express.Multer.File): Promise<any> {
    let document: Document;
    try {
      const existingDocument =
        await this.documentRepository.findByFileNameAndFileSize(
          file.originalname,
          file.size,
        );
      if (existingDocument) {
        throw new ConflictException('Documento já existe');
      }
      // 1. Cria o registro do Documento com status PENDING
      document = await this.documentRepository.save({
        fileName: file.originalname,
        fileSize: file.size,
        fileExtension: file.originalname.split('.').pop() || '',
        uploadDate: new Date(),
        storagePath: '', // Will be updated after upload
        processingStatus: 'PENDING',
        version: 1, // Initial version
      } as Document);

      // 2. Salva o arquivo original no Blob Storage
      const blobName = `${document.id}/${file.originalname}`;
      const fileUrl = await this.documentStorageService.uploadFile(
        file,
        blobName,
      );
      document.storagePath = fileUrl;
      document.processingStatus = 'PROCESSING';
      await this.documentRepository.update(document);

      // 3. Processa e realiza o "chunking" do arquivo
      const chunks = await this.fileProcessingService.processFile(
        file,
        document.id,
      );

      // 4. Gera os embeddings para os chunks
      const embeddings = await this.embeddingService.createEmbeddings(chunks);

      // 5. Cria as entidades DocumentChunk
      const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => {
        return new DocumentChunk(
          chunk,
          embeddings[index], // Store as number array
          index,
          document.id, // Link to the parent document
        );
      });

      // 6. Salva os chunks e embeddings no banco de dados
      await this.documentChunkRepository.saveMany(documentChunks);

      // 7. Atualiza o status do Documento para COMPLETED
      document.processingStatus = 'COMPLETED';
      await this.documentRepository.update(document);

      return {
        message: 'Documento processado e armazenado com sucesso.',
        documentId: document.id,
        url: fileUrl,
        chunksCount: chunks.length,
        embeddingsCount: embeddings.length,
      };
    } catch (error) {
      if (document) {
        document.processingStatus = 'FAILED';
        await this.documentRepository.update(document);
      }
      throw error;
    }
  }
}
