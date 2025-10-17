import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DocumentChunkEntity } from './document-chunk.entity';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column('bigint')
  fileSize: number;

  @Column()
  fileExtension: string;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'timestamp', nullable: true })
  creationDate: Date;

  @CreateDateColumn()
  uploadDate: Date;

  @Column()
  storagePath: string;

  @Column({ default: 'PENDING' })
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => DocumentChunkEntity, (chunk) => chunk.document)
  chunks: DocumentChunkEntity[];

  @UpdateDateColumn()
  updatedAt: Date;
}
