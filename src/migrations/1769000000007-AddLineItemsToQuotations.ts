import type { MigrationInterface, QueryRunner } from "typeorm";

class AddLineItemsToQuotations1769000000007 implements MigrationInterface {
    name = 'AddLineItemsToQuotations1769000000007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Add lineItems column as JSONB (nullable initially)
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD COLUMN IF NOT EXISTS "lineItems" jsonb DEFAULT '[]'::jsonb
        `);
        
        // Step 2: Migrate existing description data to lineItems format
        // Convert single description to array format: [{ description: "...", amount: totalAmount }]
        // Only migrate if description exists and is not null
        await queryRunner.query(`
            UPDATE "quotations" 
            SET "lineItems" = CASE 
                WHEN "description" IS NOT NULL AND "description" != '' THEN
                    jsonb_build_array(
                        jsonb_build_object(
                            'description', "description",
                            'amount', COALESCE("totalAmount", 0)
                        )
                    )
                ELSE
                    '[]'::jsonb
            END
            WHERE "lineItems" IS NULL OR "lineItems" = '[]'::jsonb
        `);
        
        // Step 3: Set NOT NULL constraint after migration
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ALTER COLUMN "lineItems" SET NOT NULL,
            ALTER COLUMN "lineItems" SET DEFAULT '[]'::jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop lineItems column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            DROP COLUMN IF EXISTS "lineItems"
        `);
    }
}

module.exports = { AddLineItemsToQuotations1769000000007 };



