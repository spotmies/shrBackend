import type { MigrationInterface, QueryRunner } from "typeorm";

class AddStatusToExpenses1769000000013 implements MigrationInterface {
    name = 'AddStatusToExpenses1769000000013';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for expense status (if it doesn't exist)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."expenses_status_enum" AS ENUM('pending', 'approved', 'rejected');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Add status column to expenses table with default value 'pending'
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            ADD COLUMN IF NOT EXISTS "status" "public"."expenses_status_enum" NOT NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop status column
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            DROP COLUMN IF EXISTS "status"
        `);
        
        // Drop enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."expenses_status_enum"
        `);
    }
}

module.exports = { AddStatusToExpenses1769000000013 };





