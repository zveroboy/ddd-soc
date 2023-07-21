import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserConfirmed1689705119010 implements MigrationInterface {
  name = 'AddUserConfirmed1689705119010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "test"."users" ADD "confirmed" boolean NOT NULL`);
    await queryRunner.query(`ALTER TABLE "test"."users" ADD "confirmation_token" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "test"."users" DROP COLUMN "confirmation_token"`);
    await queryRunner.query(`ALTER TABLE "test"."users" DROP COLUMN "confirmed"`);
  }
}
