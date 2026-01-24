import type { MigrationInterface, QueryRunner } from "typeorm";

class CreateExpensesTable1769000000010 implements MigrationInterface {
    name = 'CreateExpensesTable1769000000010';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for expense category (if it doesn't exist)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."expenses_category_enum" AS ENUM('Labor', 'Equipment', 'Permits', 'Materials');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Create expenses table (if it doesn't exist)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "expenses" (
                "expenseId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "projectId" uuid NOT NULL,
                "category" "public"."expenses_category_enum" NOT NULL,
                "amount" numeric(12,2) NOT NULL,
                "date" date NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_expenses" PRIMARY KEY ("expenseId")
            )
        `);
        
        // Add foreign key constraint to projects table (if it doesn't exist)
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "expenses" 
                ADD CONSTRAINT "FK_expenses_project" 
                FOREIGN KEY ("projectId") 
                REFERENCES "projects"("projectId") 
                ON DELETE CASCADE 
                ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            DROP CONSTRAINT IF EXISTS "FK_expenses_project"
        `);
        
        // Drop expenses table
        await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."expenses_category_enum"`);
    }
}

module.exports = { CreateExpensesTable1769000000010 };

