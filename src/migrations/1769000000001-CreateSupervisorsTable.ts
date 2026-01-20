import type { MigrationInterface, QueryRunner } from "typeorm";

class CreateSupervisorsTable1769000000001 implements MigrationInterface {
    name = 'CreateSupervisorsTable1769000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."supervisors_status_enum" AS ENUM('Active', 'Inactive')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "supervisors" (
                "supervisorId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying(255) NOT NULL,
                "email" character varying(100) NOT NULL,
                "phoneNumber" character varying(15) NOT NULL,
                "status" "public"."supervisors_status_enum" NOT NULL DEFAULT 'Active',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_supervisors" PRIMARY KEY ("supervisorId"),
                CONSTRAINT "UQ_supervisors_email" UNIQUE ("email")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "supervisors"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."supervisors_status_enum"`);
    }
}

module.exports = { CreateSupervisorsTable1769000000001 };

