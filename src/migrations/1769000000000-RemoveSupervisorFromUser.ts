import type { MigrationInterface, QueryRunner } from "typeorm";

class RemoveSupervisorFromUser1769000000000 implements MigrationInterface {
    name = 'RemoveSupervisorFromUser1769000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint if it exists (could be either name)
        // First, try to drop FK_3dcbd55983fcd698c9134c2f24b (from UpdateProjectEntity migration)
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_3dcbd55983fcd698c9134c2f24b'
                ) THEN
                    ALTER TABLE "users" DROP CONSTRAINT "FK_3dcbd55983fcd698c9134c2f24b";
                END IF;
            END $$;
        `);
        
        // Then, try to drop FK_users_supervisor (from AddSupervisorToUser migration)
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
        
        // Drop the supervisorId column if it exists
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "supervisorId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the supervisorId column
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "supervisorId" uuid
        `);
        
        // Re-add the foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_supervisor" 
            FOREIGN KEY ("supervisorId") 
            REFERENCES "users"("userId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }
}

module.exports = { RemoveSupervisorFromUser1769000000000 };








