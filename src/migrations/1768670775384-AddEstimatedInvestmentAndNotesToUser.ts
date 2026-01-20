const { MigrationInterface, QueryRunner } = require("typeorm");

class AddEstimatedInvestmentAndNotesToUser1768670775384 {
    name = 'AddEstimatedInvestmentAndNotesToUser1768670775384'

    async up(queryRunner: any) {
        await queryRunner.query(`ALTER TABLE "users" ADD "estimatedInvestment" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "notes" text`);
    }

    async down(queryRunner: any) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "estimatedInvestment"`);
    }
}

module.exports = AddEstimatedInvestmentAndNotesToUser1768670775384;
