import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const DevDataSource = new DataSource({
  type: 'sqlite',
  database: process.env['DATABASE_URL'] || './database.sqlite',
  logging: true,
  entities: ['dist/src/models/*.js'],
  migrations: ['dist/src/migrations/dev/*.js'],
  migrationsRun: false,
});
