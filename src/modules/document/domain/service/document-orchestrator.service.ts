import { Injectable } from '@nestjs/common';
import { IFileProcessingPort } from '../port/file-processing.port';
import { IEmbeddingPort } from '../port/embedding.port';
import { IDocumentStoragePort } from '../port/document-storage.port';
import { IDocumentChunkRepositoryPort } from '../port/document-chunk-repository.port';
import { Express } from 'express'; // Added this import
import { DocumentChunk } from '../model/document-chunk.model';

@Injectable()
export class DocumentOrchestratorService {
  constructor(
    private readonly fileProcessingService: IFileProcessingPort,
    private readonly embeddingService: IEmbeddingPort,
    private readonly documentStorageService: IDocumentStoragePort,
    private readonly documentChunkRepository: IDocumentChunkRepositoryPort,
  ) {}

  async processAndStoreDocument(file: Express.Multer.File): Promise<any> {
    // 1. Salva o arquivo original no Blob Storage
    const blobName = `${file.originalname}`;
    const fileUrl = await this.documentStorageService.uploadFile(
      file,
      blobName,
    );

    // 2. Processa e realiza o "chunking" do arquivo
    const chunks = await this.fileProcessingService.processFile(file);

    // 3. Gera os embeddings para os chunks
    const embeddings = await this.embeddingService.createEmbeddings(chunks);

    // 4. Cria as entidades DocumentChunk
    const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => {
      return new DocumentChunk(
        chunk,
        embeddings[index], // Store as number array
        blobName,
        fileUrl,
        index,
      );
    });

    // 5. Salva os chunks e embeddings no banco de dados
    await this.documentChunkRepository.saveMany(documentChunks);

    return {
      message: 'POC concluída! Arquivo processado e armazenado com sucesso.',
      url: fileUrl,
      chunksCount: chunks.length,
      embeddingsCount: embeddings.length,
    };
  }
}
