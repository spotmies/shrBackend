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

@Entity({ name: "daily_updates" })
export class DailyUpdates {
    @PrimaryGeneratedColumn("uuid")
    dailyUpdateId!: string;

    @Column({
        type: "enum",
        enum: ["Foundation", "Framing", "Plumbing & Electrical", "Interior Walls", "Painting", "Finishing"],
        default: "Foundation"
    })
    constructionStage!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "jsonb", nullable: true, default: [] })
    rawMaterials!: Array<{
        materialName: string;
        quantity: number;
        notes?: string;
    }> | null;

    @Column({ type: "varchar", length: 500, nullable: true })
    imageUrl!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    imageName!: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    imageType!: string | null;

    @Column({ type: "varchar", length: 500, nullable: true })
    videoUrl!: string | null;

    @Column({
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    })
    status!: string;

    // Link to project
    @ManyToOne(() => ProjectEntity, { nullable: true })
    @JoinColumn({ name: "projectId" })
    projectId!: any;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

