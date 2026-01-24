const {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} = require("typeorm");

const { ProjectEntity } = require("../project/project.entity.ts");
@Entity({ name: "quotations" })
class QuotationEntity {

  @PrimaryGeneratedColumn("uuid")
  quotationId!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: "enum", enum: ["pending", "approved", "rejected", "locked"], default: "pending" })
  status!: string;

  @Column({ type: "jsonb", nullable: true, default: "[]" })
  lineItems!: Array<{ description: string; amount: number }> | null;

  @Column({ type: "date", nullable: true })
  date!: Date | null;

  @ManyToOne(() => ProjectEntity, { nullable: true })
  @JoinColumn({ name: "projectId" })
  projectId!: any;

  @Column({ type: "bytea", nullable: true })
  fileData!: Buffer;

  @Column({ type: "varchar", length: 255, nullable: true })
  fileName!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  fileType!: string;

  @Column({ type: "text", nullable: true })
  fileUrl!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

}

module.exports = QuotationEntity;
