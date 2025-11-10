import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class SimilaritySearchDto {
  @ApiProperty({
    description: 'The query text to search for.',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: 'The number of top results to return.',
    example: 5,
    default: 10,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  topK?: number = 10;
}
