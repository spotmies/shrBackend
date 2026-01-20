import type { MigrationInterface, QueryRunner } from "typeorm";

class UpdateDocumentsDocumentTypeEnum1769000000004 implements MigrationInterface {
    name = 'UpdateDocumentsDocumentTypeEnum1769000000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PostgreSQL doesn't support renaming enum values directly, so we need to:
        // 1. Drop the default value first
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "documentType" 
            DROP DEFAULT
        `);
        
        // 2. Create a new enum type with the correct values
        await queryRunner.query(`
            CREATE TYPE "public"."documents_documenttype_enum_new" 
            AS ENUM('Agreement', 'plans', 'permit', 'others')
        `);
        
        // 3. Alter the column to use the new enum type, converting old values to new ones
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "documentType" 
            TYPE "public"."documents_documenttype_enum_new" 
            USING CASE 
                WHEN "documentType"::text = 'agreement' THEN 'Agreement'::"public"."documents_documenttype_enum_new"
                WHEN "documentType"::text = 'plan' THEN 'plans'::"public"."documents_documenttype_enum_new"
                WHEN "documentType"::text = 'permit' THEN 'permit'::"public"."documents_documenttype_enum_new"
                ELSE 'Agreement'::"public"."documents_documenttype_enum_new"
            END
        `);
        
        // 4. Drop the old enum type
        await queryRunner.query(`
            DROP TYPE "public"."documents_documenttype_enum"
        `);
        
        // 5. Rename the new enum type to the original name
        await queryRunner.query(`
            ALTER TYPE "public"."documents_documenttype_enum_new" 
            RENAME TO "documents_documenttype_enum"
        `);
        
        // 6. Set the new default value
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "documentType" 
            SET DEFAULT 'Agreement'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create old enum type
        await queryRunner.query(`
            CREATE TYPE "public"."documents_documenttype_enum_old" 
            AS ENUM('agreement', 'plan', 'permit')
        `);
        
        // Alter column to use old enum type, converting new values back to old ones
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "documentType" 
            TYPE "public"."documents_documenttype_enum_old" 
            USING CASE 
                WHEN "documentType"::text = 'Agreement' THEN 'agreement'::"public"."documents_documenttype_enum_old"
                WHEN "documentType"::text = 'plans' THEN 'plan'::"public"."documents_documenttype_enum_old"
                WHEN "documentType"::text = 'permit' THEN 'permit'::"public"."documents_documenttype_enum_old"
                WHEN "documentType"::text = 'others' THEN 'agreement'::"public"."documents_documenttype_enum_old"
                ELSE 'agreement'::"public"."documents_documenttype_enum_old"
            END
        `);
        
        // Drop new enum type
        await queryRunner.query(`
            DROP TYPE "public"."documents_documenttype_enum"
        `);
        
        // Rename old enum type back
        await queryRunner.query(`
            ALTER TYPE "public"."documents_documenttype_enum_old" 
            RENAME TO "documents_documenttype_enum"
        `);
        
        // Update default value
        await queryRunner.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "documentType" 
            SET DEFAULT 'agreement'
        `);
    }
}

module.exports = { UpdateDocumentsDocumentTypeEnum1769000000004 };

