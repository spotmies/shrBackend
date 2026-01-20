import type { MigrationInterface, QueryRunner } from "typeorm";

class UpdateProjectEntity1768668414604 implements MigrationInterface {
    name = 'UpdateProjectEntity1768668414604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop supervisor constraint if it exists (may have been removed by later migration)
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_users_supervisor'
                ) THEN
                    ALTER TABLE "users" DROP CONSTRAINT "FK_users_supervisor";
                END IF;
            END $$;
        `);
        await queryRunner.query(`CREATE TYPE "public"."documents_documenttype_enum" AS ENUM('agreement', 'plan', 'permit')`);
        await queryRunner.query(`CREATE TABLE "documents" ("documentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentType" "public"."documents_documenttype_enum" NOT NULL DEFAULT 'agreement', "fileData" bytea NOT NULL, "fileName" character varying(255) NOT NULL, "fileType" character varying(100) NOT NULL, "description" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "uploadedBy" uuid NOT NULL, "projectId" uuid, CONSTRAINT "PK_0592c7aa6895bb9fe3dcec8b6f6" PRIMARY KEY ("documentId"))`);
        // Drop old columns
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "description"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "progress"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_status_enum"`);
        
        // Create new enum type for initialStatus
        await queryRunner.query(`CREATE TYPE "public"."projects_initialstatus_enum" AS ENUM('Planning', 'Inprogress', 'OnHold')`);
        
        // Add new columns as nullable first (to handle existing data)
        await queryRunner.query(`ALTER TABLE "projects" ADD "initialStatus" "public"."projects_initialstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "startDate" date`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "expectedCompletion" date`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "totalBudget" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "materialName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "quantity" integer`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "notes" text`);
        
        // Set default values for existing rows
        await queryRunner.query(`UPDATE "projects" SET "initialStatus" = 'Planning' WHERE "initialStatus" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "startDate" = CURRENT_DATE WHERE "startDate" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "expectedCompletion" = CURRENT_DATE + INTERVAL '1 year' WHERE "expectedCompletion" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "totalBudget" = 0 WHERE "totalBudget" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "materialName" = 'Not specified' WHERE "materialName" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "quantity" = 0 WHERE "quantity" IS NULL`);
        await queryRunner.query(`UPDATE "projects" SET "notes" = '' WHERE "notes" IS NULL`);
        
        // Now make columns NOT NULL
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "initialStatus" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "startDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "expectedCompletion" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "totalBudget" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "materialName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "quantity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "notes" SET NOT NULL`);
        // Only create supervisor constraint if supervisorId column exists
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'supervisorId'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_3dcbd55983fcd698c9134c2f24b'
                    ) THEN
                        ALTER TABLE "users" ADD CONSTRAINT "FK_3dcbd55983fcd698c9134c2f24b" 
                        FOREIGN KEY ("supervisorId") 
                        REFERENCES "users"("userId") 
                        ON DELETE NO ACTION 
                        ON UPDATE NO ACTION;
                    END IF;
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_236dfbbac76eceda26294a645de" FOREIGN KEY ("uploadedBy") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_fe6ebd6e679c0feee3a7ecc0354" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_fe6ebd6e679c0feee3a7ecc0354"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_236dfbbac76eceda26294a645de"`);
        // Drop supervisor constraint if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_3dcbd55983fcd698c9134c2f24b'
                ) THEN
                    ALTER TABLE "users" DROP CONSTRAINT "FK_3dcbd55983fcd698c9134c2f24b";
                END IF;
            END $$;
        `);
        
        // Drop new columns
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "materialName"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "totalBudget"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "expectedCompletion"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "initialStatus"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."projects_initialstatus_enum"`);
        
        // Restore old columns
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('planning', 'in_progress', 'completed', 'on_hold')`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "status" "public"."projects_status_enum" NOT NULL DEFAULT 'planning'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "progress" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "description" character varying(255) NOT NULL DEFAULT ''`);
        
        await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."documents_documenttype_enum"`);
        // Only recreate supervisor constraint if supervisorId column exists
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'supervisorId'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint 
                        WHERE conname = 'FK_users_supervisor'
                    ) THEN
                        ALTER TABLE "users" ADD CONSTRAINT "FK_users_supervisor" 
                        FOREIGN KEY ("supervisorId") 
                        REFERENCES "users"("userId") 
                        ON DELETE SET NULL 
                        ON UPDATE NO ACTION;
                    END IF;
                END IF;
            END $$;
        `);
    }

}

module.exports = { UpdateProjectEntity1768668414604 };
