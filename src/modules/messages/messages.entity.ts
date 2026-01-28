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

@Entity({ name: "messages" })
export class MessageEntity {

    @PrimaryGeneratedColumn("uuid")
    messageId!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    subject!: string | null;

    @Column({ type: "text", nullable: false })
    message!: string;

    @Column({ type: "uuid", nullable: false })
    senderId!: string;

    @Column({ type: "uuid", nullable: false })
    receiverId!: string;

    @ManyToOne(() => ProjectEntity, { nullable: true })
    @JoinColumn({ name: "projectId" })
    projectId!: string | null;

    @Column({ type: "boolean", default: false })
    isRead!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

}
