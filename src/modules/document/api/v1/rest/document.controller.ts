import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { DocumentUploadRequestDto } from '../dto/document-upload.dto';
import { DocumentOrchestratorService } from '../../../domain/service/document-orchestrator.service';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentController {
  constructor(
    private readonly documentOrchestratorService: DocumentOrchestratorService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DocumentUploadRequestDto })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.documentOrchestratorService.processAndStoreDocument(file);
  }
}
