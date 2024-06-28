import { ObjectId } from 'mongodb';
import { Field, ObjectType, Directive, ID } from 'type-graphql';
import User from '../entities/User.js';

@Directive(`@key(fields: "_id")`)
@ObjectType()
export default class Book {
  @Field((_type) => ID)
  _id: ObjectId;

  @Field(() => String)
  createdAt!: Date;

  @Field(() => String)
  updatedAt!: Date;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  content!: string;

  @Field(() => User)
  author!: User;
}
