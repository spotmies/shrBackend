import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileUrlToQuotations1769219000000 implements MigrationInterface {
    name = 'AddFileUrlToQuotations1769219000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" ADD "fileUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "fileUrl"`);
    }
}
