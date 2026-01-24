import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { UserEntity } from "../user/user.entity";
import { SupervisorEntity } from "../supervisor/supervisor.entity";

@Entity({ name: "projects" })
export class ProjectEntity {

  @PrimaryGeneratedColumn("uuid")
  projectId!: string;

  @Column({ type: "varchar", length: 255 })
  projectName!: string;

  @Column({ type: "enum", enum: ["villa", "apartment", "building"] })
  projectType!: string;

  @Column({ type: "varchar", length: 255 })
  location!: string;

  @Column({ type: "enum", enum: ["Planning", "Inprogress", "OnHold"] })
  initialStatus!: string;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  expectedCompletion!: Date;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  totalBudget!: number;

  @Column({ type: "varchar", length: 255 })
  materialName!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "text" })
  notes!: string;

  // user , supervisor can handle many projects

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column({ type: "uuid", nullable: true })
  supervisorId!: string | null;

  @ManyToOne(() => SupervisorEntity, { nullable: true })
  @JoinColumn({ name: "supervisorId" })
  supervisor!: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

}

