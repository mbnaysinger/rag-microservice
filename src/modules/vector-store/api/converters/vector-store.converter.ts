import { Injectable } from '@nestjs/common';
import { VectorDocument } from '../../domain/models/vector-document.model';
import { CreateDocumentDto } from '../dtos/create-document.dto';

@Injectable()
export class VectorStoreConverter {
  fromCreateDtoToModel(dto: CreateDocumentDto): VectorDocument {
    // The embedding is intentionally left empty, as it will be generated
    // by the domain's embedding service. The ID is also generated later.
    return new VectorDocument(dto.content, dto.metadata || {}, []);
  }
}
