import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLog1754064350614 implements MigrationInterface {
    name = 'AuditLog1754064350614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "sourceUserId" character varying NOT NULL, "sourceUsername" character varying NOT NULL, "targetUserId" character varying, "targetUsername" character varying, "eventId" integer, "warningId" integer, "roleId" character varying, "gw2AccountName" character varying, "nick" character varying, "action" integer NOT NULL, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
