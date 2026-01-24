import type { MigrationInterface, QueryRunner } from "typeorm";

class RemoveUploadedByFromDocuments1769000000011 implements MigrationInterface {
    name = 'RemoveUploadedByFromDocuments1769000000011';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Make the column nullable first (drop NOT NULL constraint)
        // This is necessary before dropping the foreign key and column
        // PostgreSQL will handle this gracefully if column is already nullable
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "uploadedBy" DROP NOT NULL
        `);

        // Step 2: Find and drop the foreign key constraint for uploadedBy
        // Query to find foreign key constraints on the uploadedBy column
        const fkResult = await queryRunner.query(`
            SELECT tc.constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.table_name = 'documents'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'uploadedBy'
            AND tc.table_schema = 'public'
        `);

        // Drop all foreign key constraints found
        if (fkResult && fkResult.length > 0) {
            for (const row of fkResult) {
                await queryRunner.query(`
                    ALTER TABLE "documents" 
                    DROP CONSTRAINT IF EXISTS "${row.constraint_name}"
                `);
            }
        }

        // Step 3: Drop the uploadedBy column
        await queryRunner.query(`
            ALTER TABLE "documents" 
            DROP COLUMN IF EXISTS "uploadedBy"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add the uploadedBy column back
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ADD COLUMN IF NOT EXISTS "uploadedBy" uuid
        `);

        // Recreate the foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ADD CONSTRAINT "FK_documents_uploadedBy" 
            FOREIGN KEY ("uploadedBy") 
            REFERENCES "users"("userId") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }
}

module.exports = { RemoveUploadedByFromDocuments1769000000011 };

