import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'document_chunks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'embedding',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'originalDocumentUrl',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'chunkNumber',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('document_chunks', 'IDX_DOCUMENT_ID');
    await queryRunner.dropTable('document_chunks');
  }
}