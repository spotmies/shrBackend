import type { MigrationInterface, QueryRunner } from "typeorm";

class AddSupervisorIdToProjects1769000000005 implements MigrationInterface {
    name = 'AddSupervisorIdToProjects1769000000005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Add supervisorId column to projects table (nullable initially)
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD COLUMN IF NOT EXISTS "supervisorId" uuid
        `);
        
        // Step 2: Migrate existing data from supervisors.projectId to projects.supervisorId
        // This migrates the one-to-one relationship data
        await queryRunner.query(`
            UPDATE "projects" p
            SET "supervisorId" = s."supervisorId"
            FROM "supervisors" s
            WHERE s."projectId" = p."projectId"
            AND s."projectId" IS NOT NULL
        `);
        
        // Step 3: Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "projects" 
            ADD CONSTRAINT "FK_projects_supervisor" 
            FOREIGN KEY ("supervisorId") 
            REFERENCES "supervisors"("supervisorId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "projects" 
            DROP CONSTRAINT IF EXISTS "FK_projects_supervisor"
        `);
        
        // Drop supervisorId column
        await queryRunner.query(`
            ALTER TABLE "projects" 
            DROP COLUMN IF EXISTS "supervisorId"
        `);
    }
}

module.exports = { AddSupervisorIdToProjects1769000000005 };



