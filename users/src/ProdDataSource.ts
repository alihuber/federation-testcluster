import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const ProdDataSource = new DataSource({
  type: 'postgres',
  url: process.env['DATABASE_URL'],
  logging: true,
  entities: ['dist/src/models/*.js'],
  migrations: ['dist/src/migrations/prod/*.js'],
  migrationsRun: false,
});
