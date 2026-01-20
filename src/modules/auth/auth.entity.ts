const {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } = require("typeorm");

  @Entity({name:"auth_login"})
  class authLoginEntity{

    @PrimaryGeneratedColumn("uuid")
    authLoginId!:string;

    @Column({type:"varchar",length:255})
    email!:string;

    @Column({type:"varchar",length:255})
    password!:string;
  }
  module.exports = authLoginEntity;
    