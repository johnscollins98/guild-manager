import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecruitmentPostTitle1716902600844 implements MigrationInterface {
    name = 'AddRecruitmentPostTitle1716902600844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recruitment_post" ADD "title" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recruitment_post" DROP COLUMN "title"`);
    }

}
