import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentEntity } from './document.entity';

@Entity('document_chunks')
export class DocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'text', comment: 'Stores the vector as a JSON string' })
  embedding: string; // Armazena o vetor como JSON: '[0.1, 0.2, ...]'

  @Column('int')
  chunkNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => DocumentEntity, (document) => document.chunks)
  @JoinColumn({ name: 'documentId' })
  document: DocumentEntity;
}
