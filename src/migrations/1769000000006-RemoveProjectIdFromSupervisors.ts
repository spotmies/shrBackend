import type { MigrationInterface, QueryRunner } from "typeorm";

class RemoveProjectIdFromSupervisors1769000000006 implements MigrationInterface {
    name = 'RemoveProjectIdFromSupervisors1769000000006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint first
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            DROP CONSTRAINT IF EXISTS "FK_supervisors_project"
        `);
        
        // Drop projectId column from supervisors table
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            DROP COLUMN IF EXISTS "projectId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add projectId column back to supervisors table
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            ADD COLUMN IF NOT EXISTS "projectId" uuid
        `);
        
        // Migrate data back from projects.supervisorId to supervisors.projectId
        // Note: This will only set one project per supervisor (the first one found)
        await queryRunner.query(`
            UPDATE "supervisors" s
            SET "projectId" = (
                SELECT p."projectId" 
                FROM "projects" p 
                WHERE p."supervisorId" = s."supervisorId" 
                LIMIT 1
            )
        `);
        
        // Add foreign key constraint back
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            ADD CONSTRAINT "FK_supervisors_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "projects"("projectId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }
}

module.exports = { RemoveProjectIdFromSupervisors1769000000006 };



