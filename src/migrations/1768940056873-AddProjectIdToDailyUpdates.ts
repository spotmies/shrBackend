import type { MigrationInterface, QueryRunner } from "typeorm";

class AddProjectIdToDailyUpdates1768940056873 implements MigrationInterface {
    name = 'AddProjectIdToDailyUpdates1768940056873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add projectId column to daily_updates table
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD "projectId" uuid`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD CONSTRAINT "FK_daily_updates_project" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP CONSTRAINT IF EXISTS "FK_daily_updates_project"`);

        // Drop projectId column
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP COLUMN IF EXISTS "projectId"`);
    }
}

module.exports = { AddProjectIdToDailyUpdates1768940056873 };
