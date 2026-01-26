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

@Entity({ name: "materials" })
class MaterialEntity {
    @PrimaryGeneratedColumn("uuid")
    materialId!: string;

    @Column({ type: "uuid" })
    projectId!: string;

    @ManyToOne(() => {
        const { ProjectEntity } = require("../project/project.entity");
        return ProjectEntity;
    })
    @JoinColumn({ name: "projectId" })
    project!: any;

    @Column({ type: "varchar", length: 255 })
    materialName!: string;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "date" })
    date!: Date;

    @Column({ type: "text", nullable: true })
    notes!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

module.exports = MaterialEntity;
module.exports.default = MaterialEntity;



