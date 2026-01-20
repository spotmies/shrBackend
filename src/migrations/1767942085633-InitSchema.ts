import type { MigrationInterface, QueryRunner } from "typeorm";

class InitSchema1767942085633 implements MigrationInterface {
    name = 'InitSchema1767942085633';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user', 'supervisor')`);
        await queryRunner.query(`CREATE TABLE "users" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userName" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "email" character varying(100) NOT NULL, "contact" character varying(15) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TYPE "public"."projects_projecttype_enum" AS ENUM('villa', 'apartment', 'building')`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('planning', 'in_progress', 'completed', 'on_hold')`);
        await queryRunner.query(`CREATE TABLE "projects" ("projectId" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectName" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "projectType" "public"."projects_projecttype_enum" NOT NULL, "location" character varying(255) NOT NULL, "progress" integer NOT NULL, "status" "public"."projects_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_c9b85785128f44b7d13f87ce7d0" PRIMARY KEY ("projectId"))`);
        await queryRunner.query(`CREATE TYPE "public"."quotations_status_enum" AS ENUM('pending', 'approved', 'rejected', 'locked')`);
        await queryRunner.query(`CREATE TABLE "quotations" ("quotationId" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" numeric(12,2) NOT NULL, "status" "public"."quotations_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "lockedBy" uuid, "projectId" uuid, CONSTRAINT "PK_ef50e1be78f88a3ceabbe1eb46c" PRIMARY KEY ("quotationId"))`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD CONSTRAINT "FK_dc9c191d1d6de1ee792f991a26d" FOREIGN KEY ("lockedBy") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD CONSTRAINT "FK_061d9b84d72482cd18e83d78fd0" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_061d9b84d72482cd18e83d78fd0"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_dc9c191d1d6de1ee792f991a26d"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f"`);
        await queryRunner.query(`DROP TABLE "quotations"`);
        await queryRunner.query(`DROP TYPE "public"."quotations_status_enum"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."projects_projecttype_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}

module.exports = { InitSchema1767942085633 };
