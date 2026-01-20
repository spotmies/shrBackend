import type { MigrationInterface, QueryRunner } from "typeorm";

class AddProjectIdToSupervisors1769000000002 implements MigrationInterface {
    name = 'AddProjectIdToSupervisors1769000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add projectId column to supervisors table
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            ADD COLUMN "projectId" uuid
        `);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            ADD CONSTRAINT "FK_supervisors_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "projects"("projectId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            DROP CONSTRAINT IF EXISTS "FK_supervisors_project"
        `);
        
        // Drop projectId column
        await queryRunner.query(`
            ALTER TABLE "supervisors" 
            DROP COLUMN IF EXISTS "projectId"
        `);
    }
}

module.exports = { AddProjectIdToSupervisors1769000000002 };








