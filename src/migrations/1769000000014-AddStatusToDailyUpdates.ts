import type { MigrationInterface, QueryRunner } from "typeorm";

class AddStatusToDailyUpdates1769000000014 implements MigrationInterface {
    name = 'AddStatusToDailyUpdates1769000000014';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for daily updates status (if it doesn't exist)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."daily_updates_status_enum" AS ENUM('pending', 'approved', 'rejected');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Add status column to daily_updates table with default value 'pending'
        await queryRunner.query(`
            ALTER TABLE "daily_updates" 
            ADD COLUMN IF NOT EXISTS "status" "public"."daily_updates_status_enum" NOT NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop status column
        await queryRunner.query(`
            ALTER TABLE "daily_updates" 
            DROP COLUMN IF EXISTS "status"
        `);
        
        // Drop enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."daily_updates_status_enum"
        `);
    }
}

module.exports = { AddStatusToDailyUpdates1769000000014 };

