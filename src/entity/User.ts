import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity('users')
export class User extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column()
    address: string;

    @Field(() => Int)
    @Column()
    number: number;

    @Field()
    @Column()
    email: string;

    @Column()
    password: string;

    @Column("int", { default: 0 })
    tokenVersion: number;
}
