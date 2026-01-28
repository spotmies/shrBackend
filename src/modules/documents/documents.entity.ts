import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { ProjectEntity } from "../project/project.entity";

@Entity({ name: "documents" })
export class DocumentEntity {

  @PrimaryGeneratedColumn("uuid")
  documentId!: string;

  @Column({ type: "enum", enum: ["Agreement", "plans", "permit", "others"], default: "Agreement" })
  documentType!: string;

  @Column({ type: "bytea", nullable: true })
  fileData!: Buffer;

  @Column({ type: "varchar", length: 255, nullable: false })
  fileName!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  fileType!: string;

  @Column({ type: "text", nullable: true })
  fileUrl!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  // Optional: Link document to a project
  @ManyToOne(() => ProjectEntity, { nullable: true })
  @JoinColumn({ name: "projectId" })
  projectId!: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

}

