import { MigrationInterface, QueryRunner } from "typeorm";

export class WarningUpdateInfo1739649795519 implements MigrationInterface {
    name = 'WarningUpdateInfo1739649795519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warning" ADD "lastUpdatedTimestamp" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "warning" ADD "lastUpdatedBy" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warning" DROP COLUMN "lastUpdatedBy"`);
        await queryRunner.query(`ALTER TABLE "warning" DROP COLUMN "lastUpdatedTimestamp"`);
    }

}
