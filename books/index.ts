import 'reflect-metadata';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { getLogger } from './src/utils/Logger.js';
import { buildFederatedSchema } from './src/utils/buildFederatedSchema.js';
import BooksResolver from './src/resolvers/BooksResolver.js';
import seedBooks from './src/utils/seedBooks.js';

const logger = getLogger('Books');

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: [process.env['GATEWAY_ORIGIN']],
    credentials: true,
  })
);

const httpServer = http.createServer(app);

const schema = await buildFederatedSchema({
  resolvers: [BooksResolver],
  emitSchemaFile: { path: './books.graphql' },
});

await mongoose.connect(process.env['MONGODB_URL'] || 'mongodb://localhost:27017/federation');

await seedBooks();

const server = new ApolloServer({
  schema,
  logger,
});

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

const port = process.env['BOOKS_PORT'] || '4002';
await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
logger.info(`books server ready at port ${port}`);
