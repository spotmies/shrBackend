import type { MigrationInterface, QueryRunner } from "typeorm";

class AddSupervisorToUser1768634849784 implements MigrationInterface {
    name = 'AddSupervisorToUser1768634849784';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "supervisorId" uuid
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_supervisor" 
            FOREIGN KEY ("supervisorId") 
            REFERENCES "users"("userId") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP CONSTRAINT "FK_users_supervisor"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "supervisorId"
        `);
    }
}

module.exports = { AddSupervisorToUser1768634849784 };

