import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyEventPost1752318883641 implements MigrationInterface {
    name = 'SimplifyEventPost1752318883641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Monday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Tuesday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Wednesday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Thursday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Friday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Saturday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Sunday"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "Dynamic"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "messageId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_post_settings" DROP COLUMN "messageId"`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Dynamic" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Sunday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Saturday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Friday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Thursday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Wednesday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Tuesday" character varying`);
        await queryRunner.query(`ALTER TABLE "event_post_settings" ADD "Monday" character varying`);
    }

}
