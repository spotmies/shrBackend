import type { MigrationInterface, QueryRunner } from "typeorm";

class AddPaymentsTable1768133493305 implements MigrationInterface {
    name = 'AddPaymentsTable1768133493305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_paymentstatus_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_paymentmethod_enum" AS ENUM('cash', 'card', 'bank_transfer', 'cheque', 'online')`);
        await queryRunner.query(`CREATE TABLE "payments" ("paymentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment" numeric(12,2) NOT NULL, "paymentStatus" "public"."payments_paymentstatus_enum" NOT NULL DEFAULT 'pending', "paymentMethod" "public"."payments_paymentmethod_enum" NOT NULL DEFAULT 'cash', "paymentDate" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_ae0b0903f275c81d8a2a45ce3b5" PRIMARY KEY ("paymentId"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_497370a7f747f66f524ab3c548d" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_497370a7f747f66f524ab3c548d"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_paymentstatus_enum"`);
    }
}

module.exports = { AddPaymentsTable1768133493305 };
