import path from 'path';
import { DataSource } from 'typeorm';
import { config } from './config';

export const dataSource = new DataSource({
  type: 'postgres',
  url: config.databaseUrl,
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, '**', '*.model.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')]
});
