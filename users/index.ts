import 'reflect-metadata';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import http from 'http';
import UsersResolver from './src/resolvers/UsersResolver.js';
import { getLogger } from './src/utils/Logger.js';
import { buildFederatedSchema } from './src/utils/buildFederatedSchema.js';
import seedUsers from './src/utils/seedUsers.js';
import { ProdDataSource } from './src/ProdDataSource.js';
import { DevDataSource } from './src/DevDataSource.js';

const logger = getLogger('Users');

const isProduction = process.env['NODE_ENV'] === 'production';

let databaseConnection;

if (isProduction) {
  databaseConnection = await ProdDataSource.initialize();
} else {
  databaseConnection = await DevDataSource.initialize();
}
const app = express();
await databaseConnection.runMigrations();
app.use(bodyParser.json());

app.use(
  cors({
    origin: [process.env['GATEWAY_ORIGIN']],
    credentials: true,
  })
);

const httpServer = http.createServer(app);

const schema = await buildFederatedSchema({
  resolvers: [UsersResolver],
  emitSchemaFile: { path: './users.graphql' },
});

const server = new ApolloServer({
  schema,
  logger,
});

await seedUsers();

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      return {
        req,
        res,
      };
    },
  })
);

const port = process.env['USERS_PORT'] || '4001';
await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
logger.info(`users server ready at port ${port}`);
