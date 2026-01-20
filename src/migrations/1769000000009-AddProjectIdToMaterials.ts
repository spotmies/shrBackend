import type { MigrationInterface, QueryRunner } from "typeorm";

class AddProjectIdToMaterials1769000000009 implements MigrationInterface {
    name = 'AddProjectIdToMaterials1769000000009';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add projectId column to materials table
        await queryRunner.query(`
            ALTER TABLE "materials" 
            ADD COLUMN IF NOT EXISTS "projectId" uuid
        `);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "materials" 
            ADD CONSTRAINT "FK_materials_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "projects"("projectId") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "materials" 
            DROP CONSTRAINT IF EXISTS "FK_materials_project"
        `);
        
        // Drop projectId column
        await queryRunner.query(`
            ALTER TABLE "materials" 
            DROP COLUMN IF EXISTS "projectId"
        `);
    }
}

module.exports = { AddProjectIdToMaterials1769000000009 };



