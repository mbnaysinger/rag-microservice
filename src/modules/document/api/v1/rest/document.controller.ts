import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBody, ApiConsumes, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DocumentUploadRequestDto } from '../dto/document-upload.dto';
import { DocumentSearchResponseDto } from '../dto/document-search-response.dto';
import { DocumentSearchMapper } from '../mapper/document-search.mapper';
import { DocumentOrchestratorService } from '../../../domain/service/document-orchestrator.service';
import { VectorSearchService } from '../../../domain/service/vector-search.service';
import { SearchResult } from '../../../domain/service/vector-search.service';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentController {
  constructor(
    private readonly documentOrchestratorService: DocumentOrchestratorService,
    private readonly vectorSearchService: VectorSearchService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DocumentUploadRequestDto })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.documentOrchestratorService.processAndStoreDocument(file);
  }

  @Get('search')
  @ApiQuery({ name: 'query', description: 'Search query text', required: true })
  @ApiQuery({ name: 'limit', description: 'Maximum number of results', required: false, type: Number })
  @ApiQuery({ name: 'documentId', description: 'Filter by specific document ID', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results without embeddings',
    type: [DocumentSearchResponseDto]
  })
  async searchSimilarContent(
    @Query('query') query: string,
    @Query('limit') limit?: number,
    @Query('documentId') documentId?: string,
  ): Promise<DocumentSearchResponseDto[]> {
    const results: SearchResult[] = await this.vectorSearchService.searchSimilarContent(
      query,
      limit ? parseInt(limit.toString()) : 10,
      documentId
    );
    
    return DocumentSearchMapper.toResponseDtoList(results);
  }

  @Get(':documentId/chunks')
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  async getDocumentChunks(@Param('documentId') documentId: string) {
    return this.vectorSearchService.searchByDocumentId(documentId);
  }

  @Delete(':documentId/chunks')
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  async deleteDocumentChunks(@Param('documentId') documentId: string) {
    await this.vectorSearchService.deleteDocumentChunks(documentId);
    return { message: 'Document chunks deleted successfully' };
  }
}
