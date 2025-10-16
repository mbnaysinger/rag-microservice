import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to upload',
  })
  file: Express.Multer.File;
}
