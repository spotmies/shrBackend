import type { MigrationInterface, QueryRunner } from "typeorm";

class RemoveDescriptionFromQuotations1769000000008 implements MigrationInterface {
    name = 'RemoveDescriptionFromQuotations1769000000008';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop description column from quotations table
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            DROP COLUMN IF EXISTS "description"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add description column back
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD COLUMN IF NOT EXISTS "description" text
        `);
        
        // Migrate data back from lineItems to description
        // Extract first line item's description if available
        await queryRunner.query(`
            UPDATE "quotations" 
            SET "description" = CASE 
                WHEN "lineItems" IS NOT NULL 
                     AND jsonb_array_length("lineItems") > 0 
                     AND "lineItems"->0->>'description' IS NOT NULL THEN
                    "lineItems"->0->>'description'
                ELSE
                    NULL
            END
        `);
    }
}

module.exports = { RemoveDescriptionFromQuotations1769000000008 };

