import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env['DATABASE_URL'] || './database.sqlite',
  logging: true,
  entities: ['dist/src/models/*.js'],
  migrations: ['dist/src/migrations/*.js'],
  migrationsRun: false,
});
