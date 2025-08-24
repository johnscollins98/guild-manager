import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToMemberLeft1756044843925 implements MigrationInterface {
    name = 'AddUserIdToMemberLeft1756044843925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_left" ADD "userId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_left" DROP COLUMN "userId"`);
    }

}
