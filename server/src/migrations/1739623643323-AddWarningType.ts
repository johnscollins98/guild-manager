import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWarningType1739623643323 implements MigrationInterface {
    name = 'AddWarningType1739623643323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."warning_type_enum" AS ENUM('official', 'informal', 'event')`);
        await queryRunner.query(`ALTER TABLE "warning" ADD "type" "public"."warning_type_enum" NOT NULL DEFAULT 'official'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warning" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."warning_type_enum"`);
    }

}
