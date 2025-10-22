import { DocumentChunk } from '../../../domain/model/document-chunk.model';
import { DocumentSearchResponseDto } from '../dto/document-search-response.dto';

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

export class DocumentSearchMapper {
  static toResponseDto(searchResult: SearchResult): DocumentSearchResponseDto {
    return {
      id: searchResult.chunk.id,
      content: searchResult.chunk.content,
      chunkNumber: searchResult.chunk.chunkNumber,
      documentId: searchResult.chunk.documentId,
      score: searchResult.score,
      createdAt: searchResult.chunk.createdAt,
    };
  }

  static toResponseDtoList(searchResults: SearchResult[]): DocumentSearchResponseDto[] {
    return searchResults.map(result => DocumentSearchMapper.toResponseDto(result));
  }
}