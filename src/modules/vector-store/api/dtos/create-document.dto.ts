import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The text content of the document. Required.',
    example: 'This is the content of the document to be vectorized.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional metadata to associate with the document.',
    example: { source: 'manual_input.txt', author: 'John Doe' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
