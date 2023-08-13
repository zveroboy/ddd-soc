import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserConfirmationTokenOptional1689949088040 implements MigrationInterface {
  name = 'MakeUserConfirmationTokenOptional1689949088040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "test"."users" ALTER COLUMN "confirmation_token" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "test"."users" ALTER COLUMN "confirmation_token" SET NOT NULL`);
  }
}
