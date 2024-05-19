import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMemberAssociation1715979071660 implements MigrationInterface {
    name = 'AddMemberAssociation1715979071660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "member_association" ("gw2AccountName" character varying NOT NULL, "discordAccountId" character varying NOT NULL, CONSTRAINT "PK_a9fb0207258f43c8bab3b380e65" PRIMARY KEY ("gw2AccountName"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "member_association"`);
    }

}
