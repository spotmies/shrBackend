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

@Entity({ name: "payments" })
class PaymentsEntity {
  @PrimaryGeneratedColumn("uuid")
  paymentId!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: number;

  @ManyToOne(() => ProjectEntity, { nullable: true })
  @JoinColumn({ name: "projectId" })
  projectId!: any;

  @Column({ type: "enum", enum: ["pending", "completed", "failed", "refunded"], default: "pending" })
  paymentStatus!: string;

  @Column({ type: "enum", enum: ["cash", "card", "bank_transfer", "cheque", "online"], default: "cash" })
  paymentMethod!: string;

  @Column({ type: "date" })
  paymentDate!: Date;

  @Column({ type: "text", nullable: true })
  remarks!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}

module.exports = PaymentsEntity;
module.exports.default = PaymentsEntity;

