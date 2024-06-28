import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { buildSchema, createResolversMap, BuildSchemaOptions } from 'type-graphql';
import { lexicographicSortSchema } from 'graphql';
import fs from 'node:fs/promises';
import { UserReferenceResolver } from '../resolvers/UsersResolver.js';

export async function buildFederatedSchema(options: Omit<BuildSchemaOptions, 'skipCheck'>) {
  const schema = await buildSchema({
    ...options,
    skipCheck: true,
  });

  const extendString = `
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable", "@external"])
scalar FieldSet
directive @external on FIELD_DEFINITION | OBJECT
directive @extends on OBJECT | INTERFACE
directive @provides(fields: FieldSet!) on FIELD_DEFINITION
  `;

  const printedSchema = printSchemaWithDirectives(lexicographicSortSchema(schema));
  const printedFederatedSchema = [extendString, printedSchema].join('\n');
  const schemaFilePathOption = options.emitSchemaFile.valueOf() as { path: string };
  await emitSchemaDefinitionWithDirectivesFile(schemaFilePathOption.path, printedFederatedSchema);

  // feels wrong, is there no better way?
  let resolvers = createResolversMap(schema) as any;
  resolvers.User.__resolveReference = UserReferenceResolver.__resolveReference;

  const federatedSchema = buildSubgraphSchema({
    typeDefs: [gql(extendString), gql(printedSchema)],
    resolvers,
  });

  return federatedSchema;
}

async function emitSchemaDefinitionWithDirectivesFile(schemaFilePath: string, schemaString: string): Promise<void> {
  await fs.writeFile(schemaFilePath, schemaString);
}
