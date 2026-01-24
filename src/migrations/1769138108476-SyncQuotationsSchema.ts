import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncQuotationsSchema1769138108476 implements MigrationInterface {
    name = 'SyncQuotationsSchema1769138108476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_supervisor"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_supervisor"`);
        await queryRunner.query(`ALTER TABLE "materials" DROP CONSTRAINT "FK_materials_project"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_projectId"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_project"`);
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP CONSTRAINT "FK_daily_updates_project"`);
        await queryRunner.query(`ALTER TABLE "quotations" ALTER COLUMN "lineItems" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "materials" ALTER COLUMN "projectId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_f46741201d12b28be566211ce57" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("supervisorId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "materials" ADD CONSTRAINT "FK_057b6c7cd484c5bf327706f95ef" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_be2b82c1909df01271e1029cca0" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD CONSTRAINT "FK_f748590208a800691a04cf2d3fa" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_updates" DROP CONSTRAINT "FK_f748590208a800691a04cf2d3fa"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_be2b82c1909df01271e1029cca0"`);
        await queryRunner.query(`ALTER TABLE "materials" DROP CONSTRAINT "FK_057b6c7cd484c5bf327706f95ef"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_f46741201d12b28be566211ce57"`);
        await queryRunner.query(`ALTER TABLE "materials" ALTER COLUMN "projectId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ALTER COLUMN "lineItems" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "daily_updates" ADD CONSTRAINT "FK_daily_updates_project" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_project" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_projectId" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "materials" ADD CONSTRAINT "FK_materials_project" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_supervisor" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("supervisorId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_supervisor" FOREIGN KEY ("supervisorId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
