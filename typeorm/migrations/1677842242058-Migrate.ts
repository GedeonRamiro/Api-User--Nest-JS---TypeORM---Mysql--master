import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migrate1677842242058 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '45',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '123',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'int',
            default: '1',
          },
          {
            name: 'createAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'updateAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
