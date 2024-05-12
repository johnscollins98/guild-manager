import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreation1715521769631 implements MigrationInterface {
    name = 'InitialCreation1715521769631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warning" ("id" SERIAL NOT NULL, "reason" character varying NOT NULL, "givenBy" character varying NOT NULL, "givenTo" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54ddc381cc95ffd6909e427b093" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recruitment_post" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_b3988ab0c39746cb12647a4a1fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "member_left" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "nickname" character varying, "displayName" character varying NOT NULL, "userDisplayName" character varying NOT NULL, "globalName" character varying, "time" TIMESTAMP NOT NULL, CONSTRAINT "PK_be17d212fffec8c41de6bc13cfd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_post_settings" ("id" SERIAL NOT NULL, "guildId" character varying NOT NULL, "channelId" character varying, "editMessages" boolean NOT NULL DEFAULT false, "Monday" character varying, "Tuesday" character varying, "Wednesday" character varying, "Thursday" character varying, "Friday" character varying, "Saturday" character varying, "Sunday" character varying, "Dynamic" character varying, CONSTRAINT "PK_2aef33548938ea83295d0e17feb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "day" character varying NOT NULL, "startTime" character varying NOT NULL, "duration" character varying NOT NULL, "leaderId" character varying NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "event_post_settings"`);
        await queryRunner.query(`DROP TABLE "member_left"`);
        await queryRunner.query(`DROP TABLE "recruitment_post"`);
        await queryRunner.query(`DROP TABLE "warning"`);
    }

}
