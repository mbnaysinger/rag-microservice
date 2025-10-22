import { ApiProperty } from '@nestjs/swagger';

export class DocumentSearchResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document chunk',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Content of the document chunk',
    example: 'Este é um trecho do documento que contém informações relevantes sobre o sistema de pagamento.'
  })
  content: string;

  @ApiProperty({
    description: 'Chunk number within the document',
    example: 1
  })
  chunkNumber: number;

  @ApiProperty({
    description: 'Document ID that this chunk belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  documentId: string;

  @ApiProperty({
    description: 'Vector search similarity score (0-1, higher is more similar)',
    example: 0.8542
  })
  score: number;

  @ApiProperty({
    description: 'Creation timestamp of the chunk',
    example: '2025-10-22T03:54:31.917Z'
  })
  createdAt: Date;
}