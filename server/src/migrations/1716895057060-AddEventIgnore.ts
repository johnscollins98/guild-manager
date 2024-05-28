import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventIgnore1716895057060 implements MigrationInterface {
    name = 'AddEventIgnore1716895057060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "ignore" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "ignore"`);
    }

}
