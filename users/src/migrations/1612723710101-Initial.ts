import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1612723710101 implements MigrationInterface {
  name = 'Initial1612723710101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" INTEGER NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
      "username" character varying NOT NULL,
      "email" character varying NOT NULL,
      CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
      CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
      CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user"');
  }
}
