const {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} = require("typeorm");

const { ProjectEntity } = require("../project/project.entity");

@Entity({ name: "expenses" })
class ExpenseEntity {
    @PrimaryGeneratedColumn("uuid")
    expenseId!: string;

    @ManyToOne(() => ProjectEntity)
    @JoinColumn({ name: "projectId" })
    project!: any;

    @Column({ type: "uuid" })
    projectId!: string;

    @Column({ type: "enum", enum: ["Labor", "Equipment", "Permits", "Materials"] })
    category!: string;

    @Column({ type: "decimal", precision: 12, scale: 2 })
    amount!: number;

    @Column({ type: "date" })
    date!: Date;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    })
    status!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

module.exports = ExpenseEntity;
module.exports.default = ExpenseEntity;



