import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveWarningTypeDefault1739623700549 implements MigrationInterface {
    name = 'RemoveWarningTypeDefault1739623700549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warning" ALTER COLUMN "type" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warning" ALTER COLUMN "type" SET DEFAULT 'official'`);
    }

}
