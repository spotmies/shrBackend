import type { MigrationInterface, QueryRunner } from "typeorm";

class AddPasswordToSupervisors1768819434824 implements MigrationInterface {
    name = 'AddPasswordToSupervisors1768819434824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supervisors" ADD "password" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supervisors" DROP COLUMN "password"`);
    }
}

module.exports = { AddPasswordToSupervisors1768819434824 };



