import type { MigrationInterface, QueryRunner } from "typeorm";

class CreateDailyUpdatesTable1769000000012 implements MigrationInterface {
    name = 'CreateDailyUpdatesTable1769000000012';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for construction stage
        await queryRunner.query(`
            CREATE TYPE "public"."daily_updates_constructionstage_enum" 
            AS ENUM('Foundation', 'Framing', 'Plumbing & Electrical', 'Interior Walls', 'Painting', 'Finishing')
        `);

        // Create daily_updates table
        await queryRunner.query(`
            CREATE TABLE "daily_updates" (
                "dailyUpdateId" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "constructionStage" "public"."daily_updates_constructionstage_enum" NOT NULL DEFAULT 'Foundation',
                "description" text,
                "rawMaterials" jsonb DEFAULT '[]'::jsonb,
                "imageData" bytea,
                "imageName" character varying(255),
                "imageType" character varying(100),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_daily_updates" PRIMARY KEY ("dailyUpdateId")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the table
        await queryRunner.query(`DROP TABLE IF EXISTS "daily_updates"`);

        // Drop the enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."daily_updates_constructionstage_enum"`);
    }
}

module.exports = { CreateDailyUpdatesTable1769000000012 };








