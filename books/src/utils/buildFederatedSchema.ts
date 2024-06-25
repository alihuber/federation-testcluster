import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { buildSchema, createResolversMap, BuildSchemaOptions } from 'type-graphql';

export async function buildFederatedSchema(options: Omit<BuildSchemaOptions, 'skipCheck'>) {
  const schema = await buildSchema({
    ...options,
    skipCheck: true,
  });

  const extendString = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable", "@external"])
    scalar FieldSet
    directive @external on FIELD_DEFINITION | OBJECT
    directive @extends on OBJECT | INTERFACE
    directive @provides(fields: FieldSet!) on FIELD_DEFINITION
  `;

  const printedSchema = printSchemaWithDirectives(schema);

  const federatedSchema = buildSubgraphSchema({
    typeDefs: [extendString, gql(printedSchema)],
    resolvers: createResolversMap(schema) as any,
  });

  return federatedSchema;
}
