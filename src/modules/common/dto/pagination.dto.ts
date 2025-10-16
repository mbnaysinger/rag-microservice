// src/modules/common/dto/pagination.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({ description: 'Page number', example: 1 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @ApiProperty({ description: 'Sorting field', example: 'createdAt' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({ description: 'Sort order (asc/desc)', example: 'desc' })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order must be either "asc" or "desc"' })
  order?: string;
}
