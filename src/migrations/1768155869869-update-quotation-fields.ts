import type { MigrationInterface, QueryRunner } from "typeorm";

class UpdateQuotationFields1768155869869 implements MigrationInterface {
    name = 'UpdateQuotationFields1768155869869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" ADD "fileData" bytea`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "fileName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "fileType" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "fileType"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "fileName"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "fileData"`);
    }

}

module.exports = { UpdateQuotationFields1768155869869 };
