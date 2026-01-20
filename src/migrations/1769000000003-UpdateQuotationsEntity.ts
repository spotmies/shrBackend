import type { MigrationInterface, QueryRunner } from "typeorm";

class UpdateQuotationsEntity1769000000003 implements MigrationInterface {
    name = 'UpdateQuotationsEntity1769000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint for lockedBy if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_quotations_lockedBy'
                ) THEN
                    ALTER TABLE "quotations" DROP CONSTRAINT "FK_quotations_lockedBy";
                END IF;
            END $$;
        `);
        
        // Drop lockedBy column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            DROP COLUMN IF EXISTS "lockedBy"
        `);
        
        // Add description column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD COLUMN "description" text
        `);
        
        // Add date column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD COLUMN "date" date
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove date column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            DROP COLUMN IF EXISTS "date"
        `);
        
        // Remove description column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            DROP COLUMN IF EXISTS "description"
        `);
        
        // Re-add lockedBy column
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD COLUMN "lockedBy" uuid
        `);
        
        // Re-add foreign key constraint for lockedBy
        await queryRunner.query(`
            ALTER TABLE "quotations" 
            ADD CONSTRAINT "FK_quotations_lockedBy" 
            FOREIGN KEY ("lockedBy") 
            REFERENCES "users"("userId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }
}

module.exports = { UpdateQuotationsEntity1769000000003 };








