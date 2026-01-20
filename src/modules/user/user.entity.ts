
const {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
  } = require("typeorm");

  @Entity({name:"users"})
  class UserEntity{

    @PrimaryGeneratedColumn("uuid")
    userId!:string;

    @Column({type:"varchar",length:255})
    userName!:string;

    @Column({type:"enum",enum:["admin","user","supervisor"]})
    role!:string;

    @Column({type:"varchar",length:100})
    email!:string;

    @Column({type:"varchar",length:255, nullable: true})
    password!: string | null;

    @Column({type:"varchar",length: 15})
    contact!:string;

    @Column({type:"decimal",precision:12,scale:2, nullable: true})
    estimatedInvestment!: number | null;

    @Column({type:"text", nullable: true})
    notes!: string | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

  }

  module.exports = UserEntity;
