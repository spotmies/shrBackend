import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDailyUpdatesMediaFields1769164977768 implements MigrationInterface {
    name = 'UpdateDailyUpdatesMediaFields1769164977768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP COLUMN "imageData"`);
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD "imageUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD "videoUrl" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD "imageData" bytea`);
    }

}
