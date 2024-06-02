import 'reflect-metadata';
import { readFileSync } from 'fs';
import { ApolloGateway } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { getLogger } from './createLogger.js';

const logger = getLogger('Gateway');
const PORT = process.env.PORT || '4000';

const PRODUCTION = process.env.NODE_ENV === 'production';

const originsList = [];
const HOST_IP = process.env.HOST_IP || '192.168.0.102';
if (!PRODUCTION) {
  originsList.push(HOST_IP);
}

const corsOptions = {
  origin: originsList,
  // credentials: true,
  // exposedHeaders: ['set-cookie', 'x-correlation-id'],
  methods: ['GET', 'POST'],
};
logger.info(`setup cors with corsOptions: ${JSON.stringify(corsOptions)}`);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1024kb' }));
app.use(cors(corsOptions));
app.disable('x-powered-by');
const httpServer = http.createServer(app);

const supergraphSdl = readFileSync('./supergraph.graphql').toString();

const gateway = new ApolloGateway({
  supergraphSdl,
});

const server = new ApolloServer({
  gateway,
  logger,
});
await server.start();
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      return { req, res };
    },
  })
);

await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
logger.info(`graphql gateway ready on port ${PORT}`);
