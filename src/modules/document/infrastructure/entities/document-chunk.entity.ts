import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('document_chunks')
export class DocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'text', comment: 'Stores the vector as a JSON string' })
  embedding: string; // Armazena o vetor como JSON: '[0.1, 0.2, ...]'

  @Column()
  originalDocumentUrl: string;

  @Column('int')
  chunkNumber: number;

  @CreateDateColumn()
  createdAt: Date;
}
