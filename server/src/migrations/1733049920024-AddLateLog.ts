import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLateLog1733049920024 implements MigrationInterface {
    name = 'AddLateLog1733049920024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "late_log" ("id" SERIAL NOT NULL, "givenBy" character varying NOT NULL, "givenTo" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "notification" character varying NOT NULL, CONSTRAINT "PK_6ea58f2ffc0e7ff7a674aec0814" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "late_log"`);
    }

}
