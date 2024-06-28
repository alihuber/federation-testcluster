import { Field, ObjectType, Directive, ID } from 'type-graphql';

// stub entity definition from another subgraph
// define only the fields needed for resolution
@Directive(`@key(fields: "id", resolvable: false)`)
@ObjectType()
export default class User {
  @Field((_type) => ID)
  id!: number;
}
