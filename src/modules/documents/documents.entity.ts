const {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } = require("typeorm");

  const UserEntity = require("../user/user.entity.ts");
  const ProjectEntity = require("../project/project.entity.ts");

  @Entity({name:"documents"})
  class DocumentEntity{

    @PrimaryGeneratedColumn("uuid")
    documentId!:string;

    @Column({type:"enum", enum: ["Agreement", "plans", "permit", "others"], default: "Agreement"})
    documentType!: string;

    @Column({ type: "bytea", nullable: false })
    fileData!: Buffer;
  
    @Column({ type: "varchar", length: 255, nullable: false })
    fileName!: string;
  
    @Column({ type: "varchar", length: 100, nullable: false })
    fileType!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    description!: string;

    // Admin who uploaded the document
    @ManyToOne(() => UserEntity, {nullable: false})
    @JoinColumn({ name: "uploadedBy" })
    uploadedBy!: any;

    // Optional: Link document to a project
    @ManyToOne(() => ProjectEntity, {nullable: true})
    @JoinColumn({ name: "projectId" })
    projectId!: any;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

  }

  module.exports = DocumentEntity;
  module.exports.default = DocumentEntity;
