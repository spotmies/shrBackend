const { MigrationInterface, QueryRunner } = require("typeorm");

class UpdatePaymentsEntityRenamePaymentToAmountAndAddRemarks1768715062619 {
    name = 'UpdatePaymentsEntityRenamePaymentToAmountAndAddRemarks1768715062619'

    async up(queryRunner: any) {
        // Rename column to preserve existing data
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "payment" TO "amount"`);
        // Add remarks column (nullable)
        await queryRunner.query(`ALTER TABLE "payments" ADD "remarks" text`);
    }

    async down(queryRunner: any) {
        // Remove remarks column
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "remarks"`);
        // Rename column back
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "amount" TO "payment"`);
    }
}

module.exports = UpdatePaymentsEntityRenamePaymentToAmountAndAddRemarks1768715062619;
