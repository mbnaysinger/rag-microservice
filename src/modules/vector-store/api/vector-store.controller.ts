import {
  Controller,
  Post,
  Body,
  Inject,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { VectorDocumentService } from '../domain/services/vector-document.service';
import { SimilaritySearchDto } from './dtos/similarity-search.dto';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { VectorStoreConverter } from './converters/vector-store.converter';

@ApiTags('Vector Store')
@Controller('api/v1/vector-store')
export class VectorStoreController {
  constructor(
    private readonly vectorDocumentService: VectorDocumentService,
    private readonly converter: VectorStoreConverter,
  ) {}

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload and process a file',
    description:
      'Uploads a .pdf or .txt file, splits it into chunks, generates embeddings, and stores them.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        metadata: {
          type: 'object',
          example: { source: 'my-document.pdf' },
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(pdf|txt)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('metadata') metadata?: string,
  ) {
    const parsedMetadata = metadata ? JSON.parse(metadata) : {};
    await this.vectorDocumentService.createFromFile(
      file.path,
      file.mimetype === 'application/pdf' ? 'pdf' : 'txt',
      parsedMetadata,
    );
    return { message: 'File processed successfully.' };
  }

  @Post('search')
  @ApiOperation({
    summary: 'Find similar documents',
    description:
      'Receives a query and returns the most similar documents from the vector store.',
  })
  async search(@Body() searchDto: SimilaritySearchDto) {
    const { query, topK } = searchDto;
    return this.vectorDocumentService.findSimilar(query, topK);
  }
}
