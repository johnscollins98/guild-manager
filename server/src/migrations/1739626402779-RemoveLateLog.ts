import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLateLog1739626402779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "late_log"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "late_log" ("id" SERIAL NOT NULL, "givenBy" character varying NOT NULL, "givenTo" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "notification" character varying NOT NULL, CONSTRAINT "PK_6ea58f2ffc0e7ff7a674aec0814" PRIMARY KEY ("id"))`);
    }

}
