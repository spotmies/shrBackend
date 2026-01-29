import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "users" })
export class UserEntity {

  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  userName!: string;

  @Column({ type: "enum", enum: ["admin", "user", "supervisor"] })
  role!: string;

  @Column({ type: "varchar", length: 100 })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password!: string | null;

  @Column({ type: "varchar", length: 15 })
  contact!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  estimatedInvestment!: number | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  companyName!: string | null;

  @Column({ type: "uuid", nullable: true })
  supervisorId!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true, default: "UTC" })
  timezone!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true, default: "USD" })
  currency!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true, default: "English" })
  language!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

}

