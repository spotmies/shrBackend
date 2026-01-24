import type { MigrationInterface, QueryRunner } from "typeorm";

class AddSupervisorIdToUsersAndUpdateSupervisors1769000000015 implements MigrationInterface {
    name = 'AddSupervisorIdToUsersAndUpdateSupervisors1769000000015';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add supervisorId column to users table if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'supervisorId'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "supervisorId" uuid;
                END IF;
            END $$;
        `);

        // Add foreign key constraint if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_users_supervisor'
                ) THEN
                    ALTER TABLE "users" 
                    ADD CONSTRAINT "FK_users_supervisor" 
                    FOREIGN KEY ("supervisorId") 
                    REFERENCES "users"("userId") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

        // Update supervisors_status_enum to include 'reject'
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum 
                    WHERE enumlabel = 'reject' 
                    AND enumtypid = (
                        SELECT oid FROM pg_type WHERE typname = 'supervisors_status_enum'
                    )
                ) THEN
                    ALTER TYPE "public"."supervisors_status_enum" ADD VALUE 'reject';
                END IF;
            END $$;
        `);

        // Add approve column to supervisors table if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'supervisors' AND column_name = 'approve'
                ) THEN
                    ALTER TABLE "supervisors" ADD COLUMN "approve" character varying(50);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove approve column from supervisors table
        await queryRunner.query(`ALTER TABLE "supervisors" DROP COLUMN IF EXISTS "approve"`);

        // Note: We cannot easily remove 'reject' from the enum without recreating it
        // This is a limitation of PostgreSQL enums
        // If needed, you would need to:
        // 1. Create a new enum without 'reject'
        // 2. Update all rows
        // 3. Drop old enum and rename new one
        
        // Drop foreign key constraint
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_users_supervisor'
                ) THEN
                    ALTER TABLE "users" DROP CONSTRAINT "FK_users_supervisor";
                END IF;
            END $$;
        `);

        // Drop supervisorId column from users table
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "supervisorId"`);
    }
}

module.exports = { AddSupervisorIdToUsersAndUpdateSupervisors1769000000015 };




