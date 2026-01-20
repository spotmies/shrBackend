const {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} = require("typeorm");

@Entity({ name: "supervisors" })
class SupervisorEntity {
    @PrimaryGeneratedColumn("uuid")
    supervisorId!: string;

    @Column({ type: "varchar", length: 255 })
    fullName!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 15 })
    phoneNumber!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    password!: string | null;

    @Column({ type: "enum", enum: ["Active", "Inactive"], default: "Active" })
    status!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

module.exports = SupervisorEntity;

