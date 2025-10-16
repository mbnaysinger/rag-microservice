import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { BlobStorageService } from '../../infrastructure/blob-storage/blob-storage.service';
import { FileProcessingService } from '../../domain/service/file-processing.service';
import { EmbeddingService } from '../../infrastructure/ai/embedding.service';
import { DocumentStorageService } from '../../domain/service/document-storage.service';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentController {
  constructor(
    private readonly blobStorageService: BlobStorageService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly embeddingService: EmbeddingService,
    private readonly documentStorageService: DocumentStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para processamento e vetorização.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // 1. Salva o arquivo original no Blob Storage
    const blobName = `${Date.now()}-${file.originalname}`;
    const fileUrl = await this.blobStorageService.uploadFile(file, blobName);

    // 2. Processa e "chunkeia" o arquivo
    const chunks = await this.fileProcessingService.processFile(file);

    // 3. Gera os embeddings para os chunks
    const embeddings = await this.embeddingService.createEmbeddings(chunks);

    // 4. Salva os chunks e embeddings no banco de dados
    await this.documentStorageService.saveDocumentChunks(
      chunks,
      embeddings,
      fileUrl,
    );

    return {
      message: 'POC concluída! Arquivo processado e armazenado com sucesso.',
      url: fileUrl,
      chunksCount: chunks.length,
      embeddingsCount: embeddings.length,
    };
  }
}
